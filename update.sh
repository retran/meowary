#!/usr/bin/env bash
# update.sh — Meowary framework update
#
# Downloads the latest (or a specified) release from GitHub and updates all
# framework files. Never touches personal directories: journal, projects,
# areas, resources, archive, inbox, context, codebases, meta, .env.
#
# Usage:
#   bash update.sh                       # update to latest release (interactive)
#   bash update.sh --version 0.1.3       # update to a specific version
#   bash update.sh --check               # check if update is available, then exit
#   bash update.sh --non-interactive     # skip all prompts (auto-confirms)
#
# Idempotent — safe to re-run.
# Preserves mise.toml optional tool selections across updates.
#
# Supported platforms: macOS, Linux (Debian/Ubuntu), WSL

set -euo pipefail

# ── Globals ───────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="retran/meowary"
REPO_URL="https://github.com/${REPO}"
NON_INTERACTIVE=false
CHECK_ONLY=false
TARGET_VERSION=""
ERRORS=()
TMPDIR_WORK=""

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --non-interactive) NON_INTERACTIVE=true ;;
    --check)           CHECK_ONLY=true ;;
    --version)         TARGET_VERSION="${2:?--version requires a value}"; shift ;;
    *) ;;
  esac
  shift
done

# Treat non-tty stdin as non-interactive (CI / piped execution)
! [ -t 0 ] && NON_INTERACTIVE=true

# ── Helpers ───────────────────────────────────────────────────────────────────

step()  { echo ""; echo "▶ $*"; }
ok()    { echo "  ✓ $*"; }
info()  { echo "  · $*"; }
warn()  { echo "  ⚠ $*"; }
error() { echo "  ✗ $*" >&2; ERRORS+=("$*"); }
die()   { echo "  ✗ $*" >&2; exit 1; }

have() { command -v "$1" &>/dev/null; }

sed_i() {
  if [[ "$OS" == macos ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

detect_os() {
  if [[ "$OSTYPE" == darwin* ]]; then
    OS=macos
  elif grep -qi microsoft /proc/version 2>/dev/null; then
    OS=wsl
  elif [[ "$OSTYPE" == linux* ]]; then
    OS=linux
  else
    OS=unknown
    warn "Unknown OS '$OSTYPE' — some steps may not work"
  fi
}

ui_confirm() {
  # Returns 0 (yes) or 1 (no). In non-interactive mode always returns 0.
  $NON_INTERACTIVE && return 0
  if have gum; then
    gum confirm "  $1" && return 0 || return 1
  else
    local reply
    read -r -p "  $1 [Y/n]: " reply
    [[ -z "$reply" || "$reply" =~ ^[Yy]$ ]]
  fi
}

# ── Version helpers ───────────────────────────────────────────────────────────

current_version() {
  local ver_file="$SCRIPT_DIR/VERSION"
  if [[ -f "$ver_file" ]]; then
    tr -d '[:space:]' < "$ver_file"
  else
    echo "unknown"
  fi
}

latest_version() {
  local tag=""
  if have curl; then
    tag=$(curl -sf "https://api.github.com/repos/${REPO}/releases/latest" \
      | grep '"tag_name"' \
      | sed 's/.*"tag_name": *"v\([^"]*\)".*/\1/' \
      || true)
  elif have wget; then
    tag=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" \
      | grep '"tag_name"' \
      | sed 's/.*"tag_name": *"v\([^"]*\)".*/\1/' \
      || true)
  fi
  echo "${tag:-}"
}

# ── Optional tool state (mirrors setup.sh logic) ─────────────────────────────

# Each entry: "name|description|mise_key|needs_atlassian"
OPTIONAL_TOOLS=(
  "gh|GitHub CLI|gh|0"
  "glab|GitLab CLI|glab|0"
  "jira-cli|Jira CLI|\"ubi:ankitpokhrel/jira-cli[exe=jira]\"|1"
  "confluence-cli|Confluence CLI|\"npm:confluence-cli\"|1"
)

declare -A TOOL_COMMENT=(
  ["gh"]="# GitHub CLI"
  ["glab"]="# GitLab CLI"
  ['"ubi:ankitpokhrel/jira-cli[exe=jira]"']="# Jira CLI"
  ['"npm:confluence-cli"']="# Confluence CLI"
)

tool_line() {
  local key="$1"
  local comment="${TOOL_COMMENT[$key]:-}"
  echo "${key} = \"latest\"   ${comment}"
}

sed_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/\[/\\[/g; s/\]/\\]/g; s/\./\\./g; s/\*/\\*/g; s/\^/\\^/g; s/\$/\\$/g; s/|/\\|/g'
}

tool_is_enabled() {
  local key="$1"
  local line
  line=$(tool_line "$key")
  grep -F "$line" "$SCRIPT_DIR/mise.toml" 2>/dev/null | grep -qv '^[[:space:]]*#'
}

# Emit one enabled key per line (empty output if none are enabled)
capture_optional_state() {
  for entry in "${OPTIONAL_TOOLS[@]}"; do
    IFS='|' read -r _ _ key _ <<< "$entry"
    tool_is_enabled "$key" && echo "$key" || true
  done
}

# $@ = enabled tool keys to restore; keys absent from the list are disabled
restore_optional_state() {
  local -a enabled_keys=("$@")
  for entry in "${OPTIONAL_TOOLS[@]}"; do
    IFS='|' read -r name _ key _ <<< "$entry"
    local line comment_line escaped_line escaped_comment
    line=$(tool_line "$key")
    comment_line="# ${line}"
    escaped_line=$(sed_escape "$line")
    escaped_comment=$(sed_escape "$comment_line")

    local should_enable=false
    for ek in "${enabled_keys[@]:-}"; do
      [[ "$ek" == "$key" ]] && should_enable=true && break
    done

    if $should_enable; then
      if ! tool_is_enabled "$key"; then
        sed_i "s|${escaped_comment}|${line}|" "$SCRIPT_DIR/mise.toml"
        ok "Re-enabled $name in mise.toml"
      else
        ok "$name already enabled in mise.toml"
      fi
    else
      if tool_is_enabled "$key"; then
        sed_i "s|${escaped_line}|${comment_line}|" "$SCRIPT_DIR/mise.toml"
        ok "Kept $name disabled in mise.toml"
      fi
    fi
  done
}

# ── Download & extract ────────────────────────────────────────────────────────

cleanup() {
  [[ -n "$TMPDIR_WORK" && -d "$TMPDIR_WORK" ]] && rm -rf "$TMPDIR_WORK"
}
trap cleanup EXIT

download_and_extract() {
  local version="$1"
  TMPDIR_WORK=$(mktemp -d)
  local tarball="$TMPDIR_WORK/meowary-${version}.tar.gz"
  local url="${REPO_URL}/archive/refs/tags/v${version}.tar.gz"

  info "Downloading v${version} from GitHub…"
  if have curl; then
    curl -sL "$url" -o "$tarball" || die "Download failed: $url"
  elif have wget; then
    wget -q "$url" -O "$tarball" || die "Download failed: $url"
  else
    die "Neither curl nor wget is available"
  fi

  info "Extracting…"
  tar -xzf "$tarball" -C "$TMPDIR_WORK"

  # GitHub tarballs extract to meowary-{version}/
  EXTRACT_DIR="$TMPDIR_WORK/meowary-${version}"
  [[ -d "$EXTRACT_DIR" ]] || die "Unexpected tarball structure — expected meowary-${version}/"
  ok "Downloaded and extracted v${version}"
}

# ── Copy framework files ──────────────────────────────────────────────────────

# Verbatim copies — mise.toml is handled separately after optional state restore
FRAMEWORK_FILES=(
  AGENTS.md
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
  README.md
  VERSION
  opencode.json
  qmd.yml
  setup.sh
  update.sh
  .env.example
  .gitignore
)

copy_framework_files() {
  local src="$1"
  step "Copying framework files"

  for f in "${FRAMEWORK_FILES[@]}"; do
    if [[ -e "$src/$f" ]]; then
      cp -f "$src/$f" "$SCRIPT_DIR/$f"
      ok "$f"
    else
      warn "$f not found in release tarball (skipping)"
    fi
  done

  # mise.toml: copy from tarball, then restore optional tool state below
  if [[ -f "$src/mise.toml" ]]; then
    cp -f "$src/mise.toml" "$SCRIPT_DIR/mise.toml"
    ok "mise.toml (optional tools will be restored)"
  fi

  # .opencode/: replace entirely, preserve node_modules and package-lock.json
  local opencode_src="$src/.opencode"
  if [[ -d "$opencode_src" ]]; then
    local nm_backup=""
    local lock_backup=""
    if [[ -d "$SCRIPT_DIR/.opencode/node_modules" ]]; then
      nm_backup="$TMPDIR_WORK/.opencode_nm_backup"
      mv "$SCRIPT_DIR/.opencode/node_modules" "$nm_backup"
    fi
    if [[ -f "$SCRIPT_DIR/.opencode/package-lock.json" ]]; then
      lock_backup="$TMPDIR_WORK/.opencode_lock_backup"
      cp "$SCRIPT_DIR/.opencode/package-lock.json" "$lock_backup"
    fi

    rm -rf "$SCRIPT_DIR/.opencode"
    cp -r "$opencode_src" "$SCRIPT_DIR/.opencode"

    [[ -n "$nm_backup"   && -d "$nm_backup"   ]] && mv "$nm_backup" "$SCRIPT_DIR/.opencode/node_modules"
    [[ -n "$lock_backup" && -f "$lock_backup" ]] && cp "$lock_backup" "$SCRIPT_DIR/.opencode/package-lock.json"
    ok ".opencode/"
  fi
}

# ── Post-update steps ─────────────────────────────────────────────────────────

run_mise_install() {
  step "Updating tools (mise install)"
  if have mise; then
    mise install --cd "$SCRIPT_DIR" 2>/dev/null || warn "mise install failed — run it manually"
    mise reshim 2>/dev/null || true
    ok "Tools up to date"
  else
    warn "mise not found — run 'bash setup.sh' to install it"
  fi
}

run_npm_install() {
  step "Updating script dependencies"
  local scripts_dir="$SCRIPT_DIR/.opencode/scripts"
  [[ -d "$scripts_dir" ]] || return
  if have npm; then
    npm install --prefix "$scripts_dir" --silent 2>/dev/null \
      || warn "npm install failed — run it manually in .opencode/scripts"
    ok "Script dependencies up to date"
  else
    warn "npm not found — script dependencies may need a manual 'npm install' in .opencode/scripts"
  fi
}

# ── CHANGELOG excerpt ─────────────────────────────────────────────────────────

show_changelog_excerpt() {
  local from="$1" to="$2"
  local cl="$SCRIPT_DIR/CHANGELOG.md"
  [[ -f "$cl" ]] || return

  # Escape dots for use in ERE pattern (version strings like 0.1.2)
  local to_pat="${to//./[.]}"
  local from_pat="${from//./[.]}"

  local printing=false found=false
  echo ""
  echo "  Release notes:"
  echo ""

  while IFS= read -r line; do
    if [[ "$line" =~ ^\#\#[[:space:]]\[${to_pat}\] ]]; then
      printing=true
      found=true
    fi
    if $printing; then
      # Stop at the previous version heading (or [Unreleased])
      if [[ "$found" == true && "$line" =~ ^\#\#[[:space:]]\[(${from_pat}|Unreleased)\] && "$line" != *"${to}"* ]]; then
        break
      fi
      echo "  $line"
    fi
  done < "$cl"

  if ! $found; then
    info "No CHANGELOG entry found for v${to}"
  fi
  echo ""
}

# ── Summary ───────────────────────────────────────────────────────────────────

print_summary() {
  local to="$1"
  echo ""
  if [[ ${#ERRORS[@]} -gt 0 ]]; then
    echo " Issues encountered:"
    for e in "${ERRORS[@]}"; do echo "  ✗ $e"; done
    echo ""
  fi

  if have gum; then
    gum style \
      --border rounded --border-foreground 212 \
      --padding "1 3" --margin "1 0" \
      "Updated to v${to}"
  else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " Updated to v${to}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi
  echo ""
  echo "  Personal directories (journal, projects, areas, etc.) were not touched."
  echo "  Open a new terminal so mise picks up any new tool versions."
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
  if have gum; then
    gum style \
      --border rounded --border-foreground 212 \
      --padding "1 3" --margin "1 0" \
      "Meowary update"
  else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " Meowary update"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi
  $NON_INTERACTIVE && info "Running in non-interactive mode"

  detect_os

  local from_version
  from_version=$(current_version)
  info "Current version: ${from_version}"

  # Resolve target version
  if [[ -z "$TARGET_VERSION" ]]; then
    step "Checking for latest release"
    TARGET_VERSION=$(latest_version)
    [[ -n "$TARGET_VERSION" ]] || die "Could not determine latest version — check your internet connection or use --version X.Y.Z"
    ok "Latest release: v${TARGET_VERSION}"
  fi

  if [[ "$from_version" == "$TARGET_VERSION" ]]; then
    echo ""
    ok "Already at v${TARGET_VERSION} — nothing to do"
    return
  fi

  if $CHECK_ONLY; then
    echo ""
    if [[ "$from_version" == "unknown" ]]; then
      info "Update available: v${TARGET_VERSION}"
    else
      info "Update available: v${from_version} → v${TARGET_VERSION}"
    fi
    info "Run 'bash update.sh' to apply"
    return
  fi

  echo ""
  info "This will update all framework files: AGENTS.md, mise.toml, .opencode/, setup.sh, and more."
  info "Personal directories (journal/, projects/, areas/, resources/, archive/,"
  info "  inbox/, context/, codebases/, meta/) and .env are never modified."
  echo ""

  if [[ "$from_version" != "unknown" ]]; then
    info "Updating: v${from_version} → v${TARGET_VERSION}"
  else
    info "Installing: v${TARGET_VERSION}"
  fi
  echo ""

  ui_confirm "Proceed?" || { info "Aborted"; exit 0; }

  # Capture optional tool state before anything changes
  local -a enabled_tools=()
  while IFS= read -r key; do
    [[ -n "$key" ]] && enabled_tools+=("$key")
  done < <(capture_optional_state)

  if [[ ${#enabled_tools[@]} -gt 0 ]]; then
    info "Preserving optional tool selections: ${enabled_tools[*]}"
  fi

  download_and_extract "$TARGET_VERSION"
  copy_framework_files "$EXTRACT_DIR"

  step "Restoring optional tool selections in mise.toml"
  restore_optional_state "${enabled_tools[@]:-}"

  run_mise_install
  run_npm_install

  show_changelog_excerpt "$from_version" "$TARGET_VERSION"
  print_summary "$TARGET_VERSION"
}

main "$@"
