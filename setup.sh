#!/usr/bin/env bash
# setup.sh — Meowary environment bootstrap
#
# Installs mise (if needed), then uses it to install all tools declared in
# mise.toml. Configures .env and gets you to the point where you can open
# OpenCode and run /bootstrap.
#
# Usage:
#   bash setup.sh                   # interactive
#   bash setup.sh --non-interactive # CI / unattended (skips all prompts)
#
# Idempotent — safe to re-run. Each step checks before acting.
#
# Supported platforms: macOS, Linux (Debian/Ubuntu), WSL

set -euo pipefail

# ── Globals ───────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NON_INTERACTIVE=false
ERRORS=()

# Detect non-interactive mode: explicit flag or stdin not a terminal
if [[ "${1:-}" == "--non-interactive" ]] || ! [ -t 0 ]; then
  NON_INTERACTIVE=true
fi

# ── Plain helpers (used before gum is available) ──────────────────────────────

step()  { echo ""; echo "▶ $*"; }
ok()    { echo "  ✓ $*"; }
info()  { echo "  · $*"; }
warn()  { echo "  ⚠ $*"; }
error() { echo "  ✗ $*" >&2; ERRORS+=("$*"); }

have() { command -v "$1" &>/dev/null; }

# sed in-place, portably
sed_i() {
  if [[ "$OS" == macos ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# ── OS detection ──────────────────────────────────────────────────────────────

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

# ── mise ──────────────────────────────────────────────────────────────────────

ensure_mise() {
  step "mise (runtime manager)"

  if ! have mise; then
    if [[ "$OS" == macos ]] && have brew; then
      info "Installing mise via Homebrew…"
      brew install mise
    else
      info "Installing mise via install script…"
      curl https://mise.run | sh
      export PATH="$HOME/.local/bin:$PATH"
    fi
    ok "mise installed"
  else
    ok "mise already installed ($(mise --version))"
  fi

  # Make mise shims available for the rest of this script
  export PATH="$HOME/.local/share/mise/shims:$PATH"
  mise reshim 2>/dev/null || true
}

# ── gum (install early, used for the rest of setup) ──────────────────────────

ensure_gum() {
  step "gum (interactive prompts)"
  if have gum; then
    ok "gum already installed ($(gum --version))"
    return
  fi
  info "Installing gum via mise…"
  mise install --cd "$SCRIPT_DIR" gum
  mise reshim 2>/dev/null || true
  if have gum; then
    ok "gum installed"
  else
    warn "gum not available — falling back to plain prompts"
  fi
}

# ── gum-aware UI helpers ──────────────────────────────────────────────────────

ui_input() {
  # ui_input <var_name> <prompt> [placeholder]
  local var="$1" prompt="$2" placeholder="${3:-}"
  if $NON_INTERACTIVE; then
    printf -v "$var" '%s' ""
    return
  fi
  local reply
  if have gum; then
    local args=(--prompt "  $prompt: ")
    [[ -n "$placeholder" ]] && args+=(--placeholder "$placeholder")
    reply=$(gum input "${args[@]}" || true)
  else
    read -r -p "  $prompt: " reply
  fi
  printf -v "$var" '%s' "$reply"
}

ui_secret() {
  # ui_secret <var_name> <prompt>
  local var="$1" prompt="$2"
  if $NON_INTERACTIVE; then
    printf -v "$var" '%s' ""
    return
  fi
  local reply
  if have gum; then
    reply=$(gum input --password --prompt "  $prompt: " || true)
  else
    read -r -s -p "  $prompt (hidden): " reply
    echo ""
  fi
  printf -v "$var" '%s' "$reply"
}

ui_confirm() {
  # ui_confirm <prompt>  → returns 0 (yes) or 1 (no)
  $NON_INTERACTIVE && return 1
  if have gum; then
    gum confirm "  $1" && return 0 || return 1
  else
    local reply
    read -r -p "  $1 [y/N]: " reply
    [[ "$reply" =~ ^[Yy]$ ]]
  fi
}

# ── Optional tool selection ───────────────────────────────────────────────────
#
# Each entry: "name|description|mise_key|needs_atlassian"
#   name:           short identifier (used in messages)
#   description:    human-readable label shown in the chooser
#   mise_key:       exact key as it appears in mise.toml (e.g. gh, "npm:confluence-cli")
#   needs_atlassian: 1 if this tool requires Atlassian credentials in .env
#
# The script builds the uncommented line as: <mise_key> = "latest"   # <comment>
# and the commented line as:               # <mise_key> = "latest"   # <comment>
# Matching is done by searching for the uncommented line on a non-comment line,
# so grep cannot confuse the commented form with the active form.

OPTIONAL_TOOLS=(
  "gh|GitHub CLI — PR lifecycle, Actions CI, code search|gh|0"
  "glab|GitLab CLI — MR lifecycle, CI pipelines, issues|glab|0"
  "jira-cli|Jira CLI — query issues, sprints, and epics|\"ubi:ankitpokhrel/jira-cli[exe=jira]\"|1"
  "confluence-cli|Confluence CLI — read pages into resource articles|\"npm:confluence-cli\"|1"
)

# Maps mise_key → the comment suffix used in mise.toml
declare -A TOOL_COMMENT=(
  ["gh"]="# GitHub CLI"
  ["glab"]="# GitLab CLI"
  ['"ubi:ankitpokhrel/jira-cli[exe=jira]"']="# Jira CLI"
  ['"npm:confluence-cli"']="# Confluence CLI"
)

# Populated by select_optional_tools; read by setup_env
NEEDS_ATLASSIAN=false

# Build the full toml line for a tool key (uncommented form)
tool_line() {
  local key="$1"
  local comment="${TOOL_COMMENT[$key]:-}"
  echo "${key} = \"latest\"   ${comment}"
}

# Escape special sed BRE characters in a literal string (for use in s|pattern|replacement|)
sed_escape() {
  # Escape backslash first, then BRE metacharacters and the | delimiter: [ ] . * ^ $ |
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/\[/\\[/g; s/\]/\\]/g; s/\./\\./g; s/\*/\\*/g; s/\^/\\^/g; s/\$/\\$/g; s/|/\\|/g'
}

tool_is_enabled() {
  # Returns 0 only if the tool line exists as an active (non-commented) line
  local key="$1"
  local line
  line=$(tool_line "$key")
  grep -F "$line" "$SCRIPT_DIR/mise.toml" 2>/dev/null | grep -qv '^[[:space:]]*#'
}

select_optional_tools() {
  $NON_INTERACTIVE && return 0

  step "Optional integrations"

  local names=() descs=() keys=() needs_atlassian_flags=()
  local choices=() preselected=()
  for entry in "${OPTIONAL_TOOLS[@]}"; do
    IFS='|' read -r name desc key needs_atl <<< "$entry"
    names+=("$name")
    descs+=("$desc")
    keys+=("$key")
    needs_atlassian_flags+=("$needs_atl")
    local label="${name} — ${desc}"
    choices+=("$label")
    # Pre-select tools that are already active in mise.toml
    if tool_is_enabled "$key"; then
      preselected+=("$label")
    fi
  done

  local selected_lines
  if have gum; then
    local gum_args=(--no-limit --header "  Optional integrations (Space to toggle, Enter to confirm):")
    if [[ ${#preselected[@]} -gt 0 ]]; then
      for ps in "${preselected[@]}"; do
        gum_args+=(--selected "$ps")
      done
    fi
    selected_lines=$(printf '%s\n' "${choices[@]}" \
      | gum choose "${gum_args[@]}" || true)
  else
    echo "  Already-enabled tools are marked with [*]."
    echo "  Enter numbers separated by spaces, 'a' for all, Enter to keep current."
    echo ""
    local i=1
    for choice in "${choices[@]}"; do
      local marker=" "
      { [[ ${#preselected[@]} -gt 0 ]] && printf '%s\n' "${preselected[@]}"; } | grep -qF "$choice" && marker="*"
      printf "    [%d][%s] %s\n" "$i" "$marker" "$choice"
      (( i++ ))
    done
    echo ""
    local reply
    read -r -p "  Your choice: " reply
    if [[ -z "$reply" ]]; then
      selected_lines=$( [[ ${#preselected[@]} -gt 0 ]] && printf '%s\n' "${preselected[@]}" || true )
    elif [[ "$reply" =~ ^[Aa]$ ]]; then
      selected_lines=$(printf '%s\n' "${choices[@]}")
    else
      selected_lines=""
      for token in $reply; do
        if [[ "$token" =~ ^[0-9]+$ ]] && (( token >= 1 && token <= ${#choices[@]} )); then
          selected_lines+="${choices[$(( token - 1 ))]}"$'\n'
        fi
      done
    fi
  fi

  # Process each tool: enable selected, disable deselected (comment out only — no global uninstall)
  local i=0
  for choice in "${choices[@]}"; do
    local key="${keys[$i]}"
    local needs="${needs_atlassian_flags[$i]}"
    local tool_name="${names[$i]}"
    local is_selected=false
    echo "${selected_lines:-}" | grep -qF "$choice" && is_selected=true

    local line comment_line escaped_line escaped_comment
    line=$(tool_line "$key")
    comment_line="# ${line}"
    escaped_line=$(sed_escape "$line")
    escaped_comment=$(sed_escape "$comment_line")

    if $is_selected; then
      if tool_is_enabled "$key"; then
        ok "$tool_name already enabled"
      else
        sed_i "s|${escaped_comment}|${line}|" "$SCRIPT_DIR/mise.toml"
        ok "Enabled $tool_name in mise.toml"
      fi
      [[ "$needs" == "1" ]] && NEEDS_ATLASSIAN=true
    else
      if tool_is_enabled "$key"; then
        sed_i "s|${escaped_line}|${comment_line}|" "$SCRIPT_DIR/mise.toml"
        ok "Disabled $tool_name in mise.toml"
      fi
    fi
    (( i++ ))
  done

  # Also flag NEEDS_ATLASSIAN if a previously-enabled Atlassian tool remains active
  if ! $NEEDS_ATLASSIAN; then
    for entry in "${OPTIONAL_TOOLS[@]}"; do
      IFS='|' read -r _ _ key needs_atl <<< "$entry"
      if [[ "$needs_atl" == "1" ]] && tool_is_enabled "$key"; then
        NEEDS_ATLASSIAN=true
        break
      fi
    done
  fi
}

# ── Install and upgrade all tools via mise ────────────────────────────────────

mise_install() {
  step "Tools (via mise install + upgrade)"
  if have gum; then
    MISE_DIR="$SCRIPT_DIR" gum spin --spinner dot --title "Installing/upgrading tools…" -- \
      bash -c 'mise install --cd "$MISE_DIR" && mise upgrade --cd "$MISE_DIR"'
  else
    mise install --cd "$SCRIPT_DIR"
    mise upgrade --cd "$SCRIPT_DIR"
  fi
  mise reshim 2>/dev/null || true
  ok "All tools installed and up to date"
}

# ── Script dependencies ───────────────────────────────────────────────────────

ensure_script_deps() {
  step ".opencode/scripts dependencies"
  local scripts_dir="$SCRIPT_DIR/.opencode/scripts"
  if [[ ! -d "$scripts_dir" ]]; then
    warn ".opencode/scripts not found — skipping"
    return
  fi
  if [[ -d "$scripts_dir/node_modules" ]]; then
    ok "node_modules already present"
    return
  fi
  if have gum; then
    gum spin --spinner dot --title "npm install in .opencode/scripts…" -- \
      npm install --prefix "$scripts_dir"
  else
    info "npm install in .opencode/scripts…"
    npm install --prefix "$scripts_dir"
  fi
  ok "script dependencies installed"
}

# ── mise trust ────────────────────────────────────────────────────────────────

ensure_mise_trust() {
  step "mise trust (enables .env auto-load)"
  mise trust "$SCRIPT_DIR" 2>/dev/null && ok "mise trusted $SCRIPT_DIR" \
    || ok "mise trust already set"
}

# ── .env setup ────────────────────────────────────────────────────────────────

# Read a value from an existing .env file (returns empty string if not set/placeholder)
env_get() {
  local key="$1" file="$SCRIPT_DIR/.env"
  [[ -f "$file" ]] || return 0
  local val
  val=$(grep -E "^${key}=" "$file" | cut -d= -f2- | tr -d '"' || true)
  # Treat placeholder values as unset
  case "$val" in
    ""|"your-"*|"you@"*|"mycompany."*)
      echo "" ;;
    *)
      echo "$val" ;;
  esac
}

setup_env() {
  step ".env configuration"
  local env_file="$SCRIPT_DIR/.env"
  local example_file="$SCRIPT_DIR/.env.example"

  if [[ ! -f "$env_file" ]]; then
    cp "$example_file" "$env_file"
    info "Created .env from .env.example"
  else
    ok ".env already exists"
  fi

  if $NON_INTERACTIVE; then
    warn "Non-interactive mode: edit .env manually before running OpenCode"
    return
  fi

  # Only collect Atlassian credentials if jira-cli or confluence-cli is enabled
  if $NEEDS_ATLASSIAN; then
    echo ""
    info "jira-cli / confluence-cli require your Atlassian email, API token, and instance."
    echo ""

    local instance
    instance=$(env_get "ATLASSIAN_INSTANCE")
    if [[ -z "$instance" ]]; then
      ui_input instance "Atlassian instance hostname" "mycompany.atlassian.net"
      if [[ -n "$instance" ]]; then
        sed_i "s|^ATLASSIAN_INSTANCE=.*|ATLASSIAN_INSTANCE=${instance}|" "$env_file"
      fi
    else
      ok "ATLASSIAN_INSTANCE already set ($instance)"
    fi

    local email
    email=$(env_get "ATLASSIAN_EMAIL")
    if [[ -z "$email" ]]; then
      ui_input email "Atlassian email" "you@example.com"
      if [[ -n "$email" ]]; then
        sed_i "s|^ATLASSIAN_EMAIL=.*|ATLASSIAN_EMAIL=${email}|" "$env_file"
      fi
    else
      ok "ATLASSIAN_EMAIL already set ($email)"
    fi

    local token
    token=$(env_get "ATLASSIAN_API_TOKEN")
    if [[ -z "$token" ]]; then
      ui_secret token "Atlassian API token (from id.atlassian.net)"
      if [[ -n "$token" ]]; then
        sed_i "s|^ATLASSIAN_API_TOKEN=.*|ATLASSIAN_API_TOKEN=${token}|" "$env_file"
      fi
    else
      ok "ATLASSIAN_API_TOKEN already set"
    fi
  fi

  ok ".env configured — review $env_file to confirm values"
}

# ── Auth ──────────────────────────────────────────────────────────────────────

run_auth() {
  $NON_INTERACTIVE && return 0

  step "Authentication"

  if have gh; then
    if gh auth status &>/dev/null 2>&1; then
      ok "gh already authenticated"
    elif ui_confirm "Authenticate GitHub CLI now (opens browser)?"; then
      gh auth login
    fi
  fi

  if have glab; then
    if glab auth status &>/dev/null 2>&1; then
      ok "glab already authenticated"
    elif ui_confirm "Authenticate GitLab CLI now?"; then
      glab auth login
    fi
  fi

  if have jira; then
    local jira_config="$HOME/.config/.jira/.config.yml"
    if [[ -f "$jira_config" ]]; then
      ok "jira already configured"
    elif ui_confirm "Run 'jira init' now? (.env will be sourced so JIRA_API_TOKEN is available)"; then
      # shellcheck disable=SC1091
      if [[ -f "$SCRIPT_DIR/.env" ]]; then
        set -a
        source "$SCRIPT_DIR/.env"
        set +a
      fi
      jira init
    fi
  fi
}

# ── Shell rc hint ─────────────────────────────────────────────────────────────

print_shell_hint() {
  local rc_file shell_name
  shell_name="${SHELL##*/}"
  case "$shell_name" in
    zsh)  rc_file="$HOME/.zshrc" ;;
    bash) rc_file="$HOME/.bashrc" ;;
    *)    return ;;
  esac

  if grep -q 'mise activate' "$rc_file" 2>/dev/null; then
    return  # already configured
  fi

  local activate_line='eval "$(mise activate '"$shell_name"')"'

  echo ""
  warn "mise is not activated in your shell. Required for .env auto-load."

  if ui_confirm "Add mise activation to $rc_file automatically?"; then
    printf '\n# mise — runtime manager\n%s\n' "$activate_line" >> "$rc_file"
    ok "Added mise activation to $rc_file"
    info "Run 'source $rc_file' or open a new terminal to apply"
  else
    echo ""
    echo "  Add this line to $rc_file:"
    echo ""
    echo "    $activate_line"
    echo ""
    info "Then open a new terminal or run: source $rc_file"
  fi
}

# ── Summary ───────────────────────────────────────────────────────────────────

print_summary() {
  echo ""
  if have gum; then
    gum style \
      --border rounded --border-foreground 212 \
      --padding "1 3" --margin "1 0" \
      "Setup complete"
  else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " Setup complete"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi
  echo ""

  if [[ ${#ERRORS[@]} -gt 0 ]]; then
    echo " Issues encountered:"
    for e in "${ERRORS[@]}"; do
      error "$e"
    done
    echo ""
  fi

  echo " Next steps:"
  echo ""
  echo "   1. Review .env — confirm your credentials are correct"
  echo "   2. Open a new terminal so mise activates and .env loads"
  echo "   3. cd into this directory and run: opencode"
  echo "   4. Inside OpenCode, run:  /bootstrap"
  echo "   5. Then run:              /morning"
  echo ""
  echo " To add more optional tools later: re-run setup.sh or edit mise.toml"
  echo " and run 'mise install'."
  echo ""
  echo " To update Meowary to a newer release later:"
  echo "   bash update.sh"
  echo ""
  echo " /bootstrap sets up your identity, context file, and QMD search"
  echo " collections. Run it once. After that, /morning starts every day."
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
  if have gum; then
    gum style \
      --border rounded --border-foreground 212 \
      --padding "1 3" --margin "1 0" \
      "Meowary setup"
  else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " Meowary setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi
  $NON_INTERACTIVE && info "Running in non-interactive mode"

  detect_os
  info "Detected OS: $OS"

  ensure_mise
  ensure_gum
  select_optional_tools
  mise_install
  ensure_script_deps
  ensure_mise_trust
  setup_env
  run_auth
  print_shell_hint
  print_summary
}

main "$@"
