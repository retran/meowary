#!/usr/bin/env bash
# generate.sh — Generate agent configuration directories from .shared/ canonical source.
#
# Usage:
#   bash generate.sh opencode        # Generate OpenCode config only
#   bash generate.sh claude          # Generate Claude Code config only
#   bash generate.sh opencode claude # Generate both
#
# Idempotent — safe to re-run. Removes previous generated dirs before regenerating.
# Stores selection in .agent-config for use by `update` task.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_DIR="$SCRIPT_DIR/.shared"

# ── Helpers ───────────────────────────────────────────────────────────────────

info()  { echo "  · $*"; }
ok()    { echo "  ✓ $*"; }
warn()  { echo "  ⚠ $*" >&2; }
error() { echo "  ✗ $*" >&2; exit 1; }
have()  { command -v "$1" &>/dev/null; }

# Replace {{AGENT_DIR}} placeholder with the actual agent directory name.
# Template files in .shared/ can use {{AGENT_DIR}} to reference the agent
# directory (.opencode or .claude) in paths. This function resolves it during
# generation so each agent gets the correct path.
resolve_templates() {
  local dir="$1" agent_dir="$2"
  if [[ "$OSTYPE" == darwin* ]]; then
    find "$dir" -name '*.md' -exec sed -i '' "s|{{AGENT_DIR}}|${agent_dir}|g" {} +
  else
    find "$dir" -name '*.md' -exec sed -i "s|{{AGENT_DIR}}|${agent_dir}|g" {} +
  fi
}

# ── Validation ────────────────────────────────────────────────────────────────

if [[ $# -eq 0 ]]; then
  echo "Usage: generate.sh <opencode|claude> [opencode|claude]"
  echo ""
  echo "Generate agent configuration from .shared/ canonical source."
  exit 1
fi

if [[ ! -d "$SHARED_DIR" ]]; then
  error ".shared/ directory not found. Cannot generate."
fi

# ── Generate OpenCode ─────────────────────────────────────────────────────────

generate_opencode() {
  local target="$SCRIPT_DIR/.opencode"

  info "Generating .opencode/ ..."

  # Clean previous
  rm -rf "$target"
  mkdir -p "$target" || error "Failed to create target directory $target"

  # Copy shared content
  cp -R "$SHARED_DIR/workflows" "$target/workflows" || error "Failed to copy workflows"
  cp -R "$SHARED_DIR/scripts" "$target/scripts" || error "Failed to copy scripts"
  cp -R "$SHARED_DIR/reference" "$target/reference" || error "Failed to copy reference"
  cp -R "$SHARED_DIR/skills" "$target/skills" || error "Failed to copy skills"
  cp -R "$SHARED_DIR/commands" "$target/commands" || error "Failed to copy commands"
  cp -R "$SHARED_DIR/agents" "$target/agents" || error "Failed to copy agents"

  # Copy templates if they exist
  if [[ -d "$SHARED_DIR/context-templates" ]]; then
    cp -R "$SHARED_DIR/context-templates" "$target/context-templates" || warn "Failed to copy context-templates"
  fi
  if [[ -d "$SHARED_DIR/meta-templates" ]]; then
    cp -R "$SHARED_DIR/meta-templates" "$target/meta-templates" || warn "Failed to copy meta-templates"
  fi

  # Resolve {{AGENT_DIR}} → .opencode in all copied markdown
  resolve_templates "$target" ".opencode"

  # Copy OpenCode-specific config (package.json, opencode.json)
  if [[ -d "$SHARED_DIR/opencode" ]]; then
    for f in "$SHARED_DIR/opencode"/*; do
      [[ -e "$f" ]] || continue
      local base
      base="$(basename "$f")"
      if [[ "$base" == "opencode.json" || "$base" == "opencode.jsonc" ]]; then
        # opencode.json goes to repo root
        cp "$f" "$SCRIPT_DIR/$base" || error "Failed to copy $base to repo root"
      else
        cp "$f" "$target/$base" || error "Failed to copy $base"
      fi
    done
  fi

  # Generate AGENTS.md from template
  if [[ -f "$SHARED_DIR/AGENTS.md.template" ]]; then
    cp "$SHARED_DIR/AGENTS.md.template" "$SCRIPT_DIR/AGENTS.md" || error "Failed to copy AGENTS.md.template"
  fi

  # Install script dependencies (in .shared/scripts — copied into target)
  if [[ -f "$SHARED_DIR/scripts/package.json" ]]; then
    if [[ ! -d "$SHARED_DIR/scripts/node_modules" ]]; then
      info "Installing script dependencies..."
      npm install --prefix "$SHARED_DIR/scripts" --silent 2>/dev/null || true
    fi
    # Copy node_modules into target if not already there
    if [[ -d "$SHARED_DIR/scripts/node_modules" && ! -d "$target/scripts/node_modules" ]]; then
      cp -R "$SHARED_DIR/scripts/node_modules" "$target/scripts/node_modules" || warn "Failed to copy node_modules"
    fi
  fi

  ok ".opencode/ generated"
}

# ── Agent Transformation (OpenCode → Claude Code) ────────────────────────────

# Convert OpenCode agent frontmatter to Claude Code format.
# OpenCode and Claude Code use different agent frontmatter schemas. This function
# transforms .shared/agents/*.md files (OpenCode format) into Claude Code format:
# - Adds `name:` from filename (Claude requires it)
# - Converts `permission:` → `tools:` / `disallowedTools:`
# - Converts `steps:` → `maxTurns:`
# - Removes `mode:`, `hidden:`, `temperature:` (not applicable in Claude Code)
# - Maps OpenCode tool names to Claude Code equivalents (e.g., task → Agent)
transform_agent_for_claude() {
  local src="$1"
  local dest="$2"
  local name
  name="$(basename "$src" .md)"

  # Map OpenCode permission keys to Claude Code tool names
  # OpenCode: edit, bash, webfetch, websearch, read, glob, grep, task, todowrite
  # Claude Code tools: Read, Write, Edit, Bash, Glob, Grep, Agent (formerly Task)
  # Note: WebFetch/WebSearch/TodoWrite don't exist in Claude Code — skip them

  local in_frontmatter=false
  local frontmatter_done=false
  local has_name=false
  local permissions=""
  local in_permission_block=false
  local steps_value=""
  local description=""
  local other_fields=""

  # Parse frontmatter
  while IFS= read -r line; do
    if [[ "$frontmatter_done" == "true" ]]; then
      break
    fi
    if [[ "$line" == "---" ]]; then
      if [[ "$in_frontmatter" == "true" ]]; then
        frontmatter_done=true
      else
        in_frontmatter=true
      fi
      continue
    fi
    if [[ "$in_frontmatter" == "true" ]]; then
      # Parse key-value pairs
      if [[ "$line" =~ ^[a-z] && "$line" != "  "* ]]; then
        in_permission_block=false
      fi
      if [[ "$line" =~ ^description:\ (.*) ]]; then
        description="${BASH_REMATCH[1]}"
      elif [[ "$line" =~ ^(temperature):\ .* ]]; then
        : # skip — not supported in Claude Code subagent frontmatter
      elif [[ "$line" =~ ^steps:\ (.*) ]]; then
        steps_value="${BASH_REMATCH[1]}"
      elif [[ "$line" == "permission:" ]]; then
        in_permission_block=true
      elif [[ "$in_permission_block" == "true" && "$line" =~ ^[[:space:]]+([a-z]+):\ (.*) ]]; then
        permissions+="${BASH_REMATCH[1]}=${BASH_REMATCH[2]} "
      elif [[ "$line" =~ ^(mode|hidden): ]]; then
        : # skip these
      elif [[ "$line" =~ ^name:\ (.*) ]]; then
        has_name=true
        name="${BASH_REMATCH[1]}"
      fi
    fi
  done < "$src"

  # Build tools and disallowedTools from permissions
  local tools_list=""
  local disallowed_list=""

  for pair in $permissions; do
    local key="${pair%%=*}"
    local val="${pair##*=}"
    local claude_tools=""
    case "$key" in
      edit)      claude_tools="Write Edit" ;;
      bash)      claude_tools="Bash" ;;
      webfetch)  claude_tools="" ;;  # No equivalent in Claude Code
      websearch) claude_tools="" ;;  # No equivalent in Claude Code
      read)      claude_tools="Read" ;;
      glob)      claude_tools="Glob" ;;
      grep)      claude_tools="Grep" ;;
      task)      claude_tools="Agent" ;;
      todowrite) claude_tools="" ;;  # No equivalent in Claude Code
    esac
    if [[ "$val" == "allow" && -n "$claude_tools" ]]; then
      tools_list+="$claude_tools "
    elif [[ "$val" == "deny" && -n "$claude_tools" ]]; then
      disallowed_list+="$claude_tools "
    fi
  done

  # Write transformed file
  local body
  body="$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2{print}' "$src")"

  {
    echo "---"
    echo "name: $name"
    echo "description: $description"
    [[ -n "$steps_value" ]] && echo "maxTurns: $steps_value"
    if [[ -n "$tools_list" ]]; then
      echo "tools: $(echo "$tools_list" | xargs | sed 's/ /, /g')"
    fi
    if [[ -n "$disallowed_list" ]]; then
      echo "disallowedTools: $(echo "$disallowed_list" | xargs | sed 's/ /, /g')"
    fi
    echo "---"
    echo "$body"
  } > "$dest"
}

# ── Generate Claude Code ──────────────────────────────────────────────────────

generate_claude() {
  local target="$SCRIPT_DIR/.claude"

  info "Generating .claude/ ..."

  # Clean previous
  rm -rf "$target"
  mkdir -p "$target" || error "Failed to create target directory $target"

  # Claude Code settings
  if [[ -d "$SHARED_DIR/claude" ]]; then
    for f in "$SHARED_DIR/claude"/*; do
      [[ -e "$f" ]] || continue
      local base
      base="$(basename "$f")"
      if [[ "$base" == "mcp.json" ]]; then
        # MCP servers go at repo root as .mcp.json (per Claude Code docs)
        cp "$f" "$SCRIPT_DIR/.mcp.json" || error "Failed to copy .mcp.json to repo root"
      else
        cp "$f" "$target/$base" || error "Failed to copy $base"
      fi
    done
  fi

  # Claude Code uses commands/ directly (format is compatible)
  if [[ -d "$SHARED_DIR/commands" ]]; then
    cp -R "$SHARED_DIR/commands" "$target/commands" || error "Failed to copy commands"
  fi

  # Copy skills — Claude Code loads SKILL.md files the same way
  if [[ -d "$SHARED_DIR/skills" ]]; then
    cp -R "$SHARED_DIR/skills" "$target/skills" || error "Failed to copy skills"
  fi

  # Copy scripts (for bash tool invocations from commands/workflows)
  if [[ -d "$SHARED_DIR/scripts" ]]; then
    cp -R "$SHARED_DIR/scripts" "$target/scripts" || error "Failed to copy scripts"
  fi

  # Copy workflows — commands reference these
  if [[ -d "$SHARED_DIR/workflows" ]]; then
    cp -R "$SHARED_DIR/workflows" "$target/workflows" || error "Failed to copy workflows"
  fi

  # Transform agents (OpenCode permission format → Claude Code tools format)
  if [[ -d "$SHARED_DIR/agents" ]]; then
    mkdir -p "$target/agents" || error "Failed to create agents directory"
    for agent_file in "$SHARED_DIR/agents"/*.md; do
      [[ -e "$agent_file" ]] || continue
      local dest_file="$target/agents/$(basename "$agent_file")"
      transform_agent_for_claude "$agent_file" "$dest_file"
    done
    local agent_files=("$target/agents"/*.md)
    info "Transformed ${#agent_files[@]} agent(s)"
  fi

  # Reference docs — just files the agent reads on demand (NOT auto-loaded rules)
  if [[ -d "$SHARED_DIR/reference" ]]; then
    cp -R "$SHARED_DIR/reference" "$target/reference" || error "Failed to copy reference"
  fi

  # Resolve {{AGENT_DIR}} → .claude in all copied markdown
  resolve_templates "$target" ".claude"

  # Generate CLAUDE.md from template
  if [[ -f "$SHARED_DIR/CLAUDE.md.template" ]]; then
    cp "$SHARED_DIR/CLAUDE.md.template" "$SCRIPT_DIR/CLAUDE.md" || error "Failed to copy CLAUDE.md.template"
  elif [[ -f "$SHARED_DIR/AGENTS.md.template" ]]; then
    # Fallback: use OpenCode memory as base (user can create claude-specific later)
    cp "$SHARED_DIR/AGENTS.md.template" "$SCRIPT_DIR/CLAUDE.md" || error "Failed to copy AGENTS.md.template as CLAUDE.md"
  fi

  # Install script dependencies (Claude Code also needs scripts for shell commands)
  if [[ -f "$SHARED_DIR/scripts/package.json" ]]; then
    if [[ ! -d "$SHARED_DIR/scripts/node_modules" ]]; then
      info "Installing script dependencies..."
      npm install --prefix "$SHARED_DIR/scripts" --silent 2>/dev/null || true
    fi
  fi

  # Install Claude Code plugins (context-mode for context optimization)
  if have claude; then
    info "Installing Claude Code plugins..."
    claude plugin marketplace add mksglu/context-mode 2>/dev/null || true
    claude plugin install context-mode@context-mode --scope project 2>/dev/null || true
  fi

  ok ".claude/ generated"
}

# ── Main ──────────────────────────────────────────────────────────────────────

echo "generate: building agent configuration from .shared/"
echo ""

AGENTS=()
for arg in "$@"; do
  case "$arg" in
    opencode) AGENTS+=("opencode") ;;
    claude)   AGENTS+=("claude") ;;
    *)        error "Unknown agent: $arg. Use 'opencode' or 'claude'." ;;
  esac
done

# Store selection for update task (one agent per line)
printf '%s\n' "${AGENTS[@]}" > "$SCRIPT_DIR/.agent-config"

# Generate each requested agent
for agent in "${AGENTS[@]}"; do
  case "$agent" in
    opencode) generate_opencode ;;
    claude)   generate_claude ;;
  esac
done

echo ""
ok "Done. Generated: ${AGENTS[*]}"
