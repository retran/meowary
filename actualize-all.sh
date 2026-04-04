#!/usr/bin/env bash
# actualize-all.sh
#
# Plan-driven batch resource actualization. Reads the Operation Queue table from
# resources-actualize-plan.md and dispatches each operation sequentially via
# scripts/resources-operation.sh. Supports resume — re-run to continue from where
# it left off.
#
# Workflow:
#   1. generate-resources-plan.sh produces resources-actualize-plan.md (Workflow C)
#   2. User reviews the plan
#   3. This script parses the plan, builds a progress file, and executes
#
# Usage:
#   ./actualize-all.sh                    # run from plan, resume if progress exists
#   ./actualize-all.sh --once             # run just the next pending operation, then stop
#   ./actualize-all.sh --plan             # generate plan first, then execute
#   ./actualize-all.sh --plan-only        # generate plan and stop (for review)
#   ./actualize-all.sh --reset            # regenerate progress file from plan
#   ./actualize-all.sh --dry-run          # show what would be done, don't run
#   ./actualize-all.sh --subfolder maia   # filter to resources/maia/ operations only
#
# Progress file: resources-actualize-progress.md
# Each line: - [ ] op_type | target | details      (pending)
#            - [~] op_type | target | details      (in-progress / interrupted)
#            - [x] op_type | target | details      (done)
#            - [!] op_type | target | details      (failed)

set -euo pipefail

JOURNAL_DIR="$(cd "$(dirname "$0")" && pwd)"
PLAN="$JOURNAL_DIR/resources-actualize-plan.md"
PROGRESS="$JOURNAL_DIR/resources-actualize-progress.md"
KB_OP_SCRIPT="$JOURNAL_DIR/scripts/resources-operation.sh"
PLAN_SCRIPT="$JOURNAL_DIR/scripts/generate-resources-plan.sh"
LOG_DIR="$JOURNAL_DIR/tmp/actualize-logs"

# ---------------------------------------------------------------------------
# Helper: replace a line in the progress file by line number (avoids sed
# regex escaping issues with pipes, dots, parens, etc.)
# ---------------------------------------------------------------------------

replace_line() {
  # Usage: replace_line <file> <line_number> <new_content>
  local file="$1" lineno="$2" new_content="$3"
  awk -v n="$lineno" -v rep="$new_content" 'NR==n{print rep; next}{print}' "$file" > "${file}.tmp"
  mv "${file}.tmp" "$file"
}

append_after_marker() {
  # Usage: append_after_marker <file> <marker> <new_line>
  # Appends new_line after the first line matching marker exactly.
  local file="$1" marker="$2" new_line="$3"
  awk -v m="$marker" -v a="$new_line" '{print} $0==m{print a}' "$file" > "${file}.tmp"
  mv "${file}.tmp" "$file"
}

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------

RESET=false
DRY_RUN=false
GEN_PLAN=false
PLAN_ONLY=false
RUN_ONCE=false
SUBFOLDER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reset)     RESET=true; shift ;;
    --dry-run)   DRY_RUN=true; shift ;;
    --plan)      GEN_PLAN=true; shift ;;
    --plan-only) GEN_PLAN=true; PLAN_ONLY=true; shift ;;
    --once)      RUN_ONCE=true; shift ;;
    --subfolder)
      SUBFOLDER="${2:-}"
      [[ -z "$SUBFOLDER" ]] && { echo "ERROR: --subfolder requires a value" >&2; exit 1; }
      shift 2
      ;;
    *)
      echo "ERROR: Unknown argument: $1" >&2
      echo "Usage: $0 [--plan] [--plan-only] [--reset] [--dry-run] [--once] [--subfolder <name>]" >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Step 1: Generate plan if requested
# ---------------------------------------------------------------------------

if [[ "$GEN_PLAN" == true ]]; then
  echo "=== Generating resources actualize plan ==="
  PLAN_ARGS=()
  [[ -n "$SUBFOLDER" ]] && PLAN_ARGS+=(--subfolder "$SUBFOLDER")
  bash "$PLAN_SCRIPT" "${PLAN_ARGS[@]+"${PLAN_ARGS[@]}"}"

  if [[ "$PLAN_ONLY" == true ]]; then
    echo ""
    echo "Plan generated. Review it at: $PLAN"
    echo "Then run: ./actualize-all.sh"
    exit 0
  fi
  echo ""
fi

# ---------------------------------------------------------------------------
# Step 2: Verify plan exists
# ---------------------------------------------------------------------------

if [[ ! -f "$PLAN" ]]; then
  echo "ERROR: Plan file not found: $PLAN" >&2
  echo "" >&2
  echo "Generate a plan first:" >&2
  echo "  ./actualize-all.sh --plan-only" >&2
  echo "  # or" >&2
  echo "  bash scripts/generate-resources-plan.sh" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 3: Parse Operation Queue from plan or resume from progress
# ---------------------------------------------------------------------------

parse_plan_operations() {
  # Parse the Operation Queue table from the plan file.
  # Expected format: | # | Op | Target | Details |
  # Outputs: op_type<TAB>target<TAB>details (one per line)
  #
  # Details may contain pipe characters; we join all fields from column 4
  # onward to handle this.
  local in_table=false
  local header_skipped=false

  while IFS= read -r line; do
    # Detect table start by looking for the header row
    if [[ "$line" =~ ^\|[[:space:]]*#[[:space:]]*\| ]]; then
      in_table=true
      header_skipped=false
      continue
    fi

    # Skip separator row (|---|---|---|---|)
    if [[ "$in_table" == true && "$header_skipped" == false ]]; then
      if [[ "$line" =~ ^\|[[:space:]]*-+[[:space:]]*\| ]]; then
        header_skipped=true
        continue
      fi
    fi

    # Stop at next section or empty line after table
    if [[ "$in_table" == true && "$header_skipped" == true ]]; then
      if [[ ! "$line" =~ ^\| ]]; then
        break
      fi

      # Parse table row: | # | op | target | details (may contain |) |
      # Use awk to extract fields; join fields 4+ for details to handle
      # embedded pipes.
      local op target details
      op=$(echo "$line" | awk -F'|' '{gsub(/^[ \t]+|[ \t]+$/, "", $3); print $3}')
      target=$(echo "$line" | awk -F'|' '{gsub(/^[ \t]+|[ \t]+$/, "", $4); print $4}')
      # Join all fields from $5 onward (in case details contains pipes)
      details=$(echo "$line" | awk -F'|' '{
        s=""
        for(i=5;i<NF;i++){
          if(s!="") s=s"|"
          s=s $i
        }
        gsub(/^[ \t]+|[ \t]+$/, "", s)
        print s
      }')

      # Strip backticks from target (plan uses inline code formatting)
      target="${target//\`/}"

      # Skip empty rows
      [[ -z "$op" ]] && continue

      printf "%s\t%s\t%s\n" "$op" "$target" "$details"
    fi
  done < "$PLAN"
}

if [[ "$RESET" == true ]] || [[ ! -f "$PROGRESS" ]]; then
  if [[ "$RESET" == true ]] && [[ -f "$PROGRESS" ]]; then
    echo "Resetting progress file..."
    mv "$PROGRESS" "${PROGRESS}.bak.$(date +%Y%m%d-%H%M%S)"
  fi

  echo "Parsing plan: $PLAN"
  OPERATIONS=$(parse_plan_operations)

  if [[ -z "$OPERATIONS" ]]; then
    echo "No operations found in plan. Nothing to do."
    exit 0
  fi

  # Filter by subfolder if specified
  if [[ -n "$SUBFOLDER" ]]; then
    FILTERED=$(echo "$OPERATIONS" | awk -F'\t' -v prefix="resources/${SUBFOLDER}/" '$2 ~ prefix {print}')
    if [[ -z "$FILTERED" ]]; then
      echo "No operations found for resources/$SUBFOLDER/. Nothing to do."
      exit 0
    fi
    OPERATIONS="$FILTERED"
  fi

  TOTAL=$(echo "$OPERATIONS" | wc -l | tr -d ' ')

  # Build progress file
  {
    echo "---"
    echo "type: meta"
    echo "updated: $(date +%Y-%m-%d)"
    echo "tags: []"
    echo "---"
    echo ""
    echo "# Resources Actualize Progress"
    echo ""
    echo "Generated: $(date +%Y-%m-%d\ %H:%M)"
    echo "Plan: resources-actualize-plan.md"
    if [[ -n "$SUBFOLDER" ]]; then
      echo "Scope: resources/$SUBFOLDER/"
    fi
    echo ""
    echo "## Queue"
    echo ""
    while IFS=$'\t' read -r op target details; do
      echo "- [ ] ${op} | ${target} | ${details}"
    done <<< "$OPERATIONS"
    echo ""
    echo "## Log"
    echo ""
  } > "$PROGRESS"

  echo "Progress file created: $PROGRESS ($TOTAL operations)"
else
  echo "Resuming from existing progress file: $PROGRESS"
fi

# ---------------------------------------------------------------------------
# Count stats
# ---------------------------------------------------------------------------

count_status() {
  local n
  n=$(grep -c "^\- \[$1\]" "$PROGRESS" 2>/dev/null) || true
  printf '%s\n' "${n:-0}"
}

TOTAL_PENDING=$(count_status " ")
TOTAL_PROGRESS=$(count_status "~")
TOTAL_DONE=$(count_status "x")
TOTAL_FAILED=$(count_status "!")
TOTAL_ALL=$(( TOTAL_PENDING + TOTAL_PROGRESS + TOTAL_DONE + TOTAL_FAILED ))

echo ""
echo "--- Progress ---"
echo "Pending      : $TOTAL_PENDING"
echo "In-progress  : $TOTAL_PROGRESS  (interrupted — will be retried)"
echo "Done         : $TOTAL_DONE"
echo "Failed       : $TOTAL_FAILED"
echo "Total        : $TOTAL_ALL"
echo ""

# Reset interrupted (in-progress) back to pending
if [[ "$TOTAL_PROGRESS" -gt 0 ]]; then
  echo "Resetting $TOTAL_PROGRESS interrupted operation(s) back to pending..."
  awk '{gsub(/^- \[~\]/, "- [ ]"); print}' "$PROGRESS" > "${PROGRESS}.tmp"
  mv "${PROGRESS}.tmp" "$PROGRESS"
  TOTAL_PENDING=$(( TOTAL_PENDING + TOTAL_PROGRESS ))
  TOTAL_PROGRESS=0
fi

if [[ "$TOTAL_PENDING" -eq 0 ]]; then
  echo "All operations have been processed. Nothing to do."
  echo "Use --reset to regenerate progress from plan."
  exit 0
fi

if [[ "$DRY_RUN" == true ]]; then
  echo "--- Dry run: operations that would be executed ---"
  grep '^\- \[ \]' "$PROGRESS" | sed 's/^- \[ \] /  /'
  echo ""
  echo "Run without --dry-run to start processing."
  exit 0
fi

# ---------------------------------------------------------------------------
# Create log directory
# ---------------------------------------------------------------------------

mkdir -p "$LOG_DIR"

# ---------------------------------------------------------------------------
# Process operations sequentially
# ---------------------------------------------------------------------------

PROCESSED=0
FAILED=0
START_TIME=$(date +%s)

while true; do
  # Pick next pending operation — get both the line number and content
  MATCH=$(grep -n -m1 '^\- \[ \]' "$PROGRESS" || true)
  if [[ -z "$MATCH" ]]; then
    break
  fi

  LINE_NUM="${MATCH%%:*}"
  LINE="${MATCH#*:}"

  # Parse: "- [ ] op_type | target | details"
  RAW="${LINE#- \[ \] }"
  OP_TYPE=$(echo "$RAW" | awk -F' \\| ' '{print $1}')
  TARGET=$(echo "$RAW" | awk -F' \\| ' '{print $2}')
  # Join fields 3+ to handle pipes in details
  DETAILS=$(echo "$RAW" | awk -F' \\| ' '{s=""; for(i=3;i<=NF;i++){if(s!="")s=s" | ";s=s $i}; print s}')

  PROCESSED=$(( PROCESSED + 1 ))
  REMAINING=$(( TOTAL_PENDING - PROCESSED ))

  # Create a safe filename for the log (use printf %q-style sanitization)
  SAFE_NAME=$(printf '%s-%s' "$OP_TYPE" "$TARGET" | LC_ALL=C tr -cs 'a-zA-Z0-9._-' '_' | cut -c1-80)
  LOG_FILE="$LOG_DIR/${SAFE_NAME}-$(date +%Y%m%d-%H%M%S).log"

  echo "==========================================================="
  echo "[$PROCESSED/$TOTAL_PENDING] $OP_TYPE: $TARGET"
  echo "  Details: $DETAILS"
  echo "  Remaining: $REMAINING | Failed so far: $FAILED"
  echo "  Log: $LOG_FILE"
  echo "==========================================================="

  # Mark in-progress using line number (no regex escaping needed)
  replace_line "$PROGRESS" "$LINE_NUM" "- [~] ${RAW}"

  # Run resources-operation.sh
  OP_START=$(date +%s)
  if "$KB_OP_SCRIPT" "$OP_TYPE" "$TARGET" "$DETAILS" 2>&1 | tee "$LOG_FILE"; then
    # Mark done using line number
    replace_line "$PROGRESS" "$LINE_NUM" "- [x] ${RAW}"

    OP_END=$(date +%s)
    DURATION=$(( OP_END - OP_START ))

    # Append to log section
    append_after_marker "$PROGRESS" "## Log" \
      "- **$(date +%Y-%m-%d\ %H:%M):** ${OP_TYPE} ${TARGET} — done (${DURATION}s)"

    echo "  Done in ${DURATION}s"
  else
    EXIT_CODE=$?
    # Mark failed using line number
    replace_line "$PROGRESS" "$LINE_NUM" "- [!] ${RAW}"
    FAILED=$(( FAILED + 1 ))

    append_after_marker "$PROGRESS" "## Log" \
      "- **$(date +%Y-%m-%d\ %H:%M):** ${OP_TYPE} ${TARGET} — FAILED (exit $EXIT_CODE)"

    echo "  FAILED (exit code: $EXIT_CODE) — continuing to next operation"
  fi

  echo ""

  # --once mode: stop after one operation
  if [[ "$RUN_ONCE" == true ]]; then
    break
  fi
done

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

END_TIME=$(date +%s)
TOTAL_DURATION=$(( END_TIME - START_TIME ))
MINUTES=$(( TOTAL_DURATION / 60 ))
SECONDS_REM=$(( TOTAL_DURATION % 60 ))

echo "==========================================================="
if [[ "$RUN_ONCE" == true ]]; then
  echo "  SINGLE OPERATION COMPLETE"
else
  echo "  ACTUALIZE-ALL COMPLETE"
fi
echo "==========================================================="
echo "  Processed : $PROCESSED"
echo "  Succeeded : $(( PROCESSED - FAILED ))"
echo "  Failed    : $FAILED"
echo "  Duration  : ${MINUTES}m ${SECONDS_REM}s"
echo "  Progress  : $PROGRESS"
echo "==========================================================="

if [[ "$FAILED" -gt 0 ]]; then
  echo ""
  echo "Failed operations:"
  grep '^\- \[!\]' "$PROGRESS" | sed 's/^- \[!\] /  /'
  echo ""
  echo "Logs in: $LOG_DIR"
fi
