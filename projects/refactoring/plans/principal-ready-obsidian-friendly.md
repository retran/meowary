---
title: "Principal-Ready & Obsidian-Friendly — Implementation Plan"
status: draft
spec: "specs/principal-ready-obsidian-friendly.md"
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Principal-Ready & Obsidian-Friendly — Implementation Plan

## End State

- `TRUE:` AGENTS.md instructions match verified codebase reality — no stale references to `confluence-map.md` or `knowledge-graph.md`. `shell_strategy.md` accurately describes macOS. `/archive` sets `status: archived` before moving. `/standup` produces two-dimensional output. qmd routing is documented.
- `EXIST:` `/check-env` slash-command. `scripts/lib/confluence.js` with `loadConfluenceIds(repoRoot)`. `scripts/lib/confluence.test.js`.
- `WIRED:` `confluence-updates.js` and `confluence-missing.js` use `lib/confluence.js`. `health-all.js` excludes `kg-coverage`. `ask.md` no longer references `knowledge-graph.md`. `run-operation.js` prompts no longer reference deleted global index files. All 10 templates contain `confluence: []` in YAML frontmatter.

---

## Phase 1 — Instructions & Commands

### Task 1.1 — Fix templates: add `confluence: []` frontmatter

- **Files:** All 10 templates in `.opencode/templates/`:
  `area-template.md`, `capture-template.md`, `daily-template.md`, `debug-log.md`,
  `draft-template.md`, `meeting-template.md`, `project-template.md`,
  `resources-template.md`, `synthesis-template.md`, `weekly-template.md`
- **Changes:** Read each file first. Add `confluence: []` as a new frontmatter field (after `tags:` line). Do not change any other content.
- **Verify:** Each file's frontmatter contains `confluence: []`.

### Task 1.2 — Fix `shell_strategy.md`: remove macOS-irrelevant vars

- **Files:** `.opencode/plugin/shell-strategy/shell_strategy.md`
- **Changes:**
  - Remove `DEBIAN_FRONTEND: noninteractive` from the Environment Variables table and from section 2.
  - Annotate `CI: true` — add inline note: `# shell-behavior-only, not an environment fact — macOS host`.
  - Update `updated:` in frontmatter to today's date.
- **Verify:** File no longer mentions `DEBIAN_FRONTEND`. `CI=true` has the annotation.

### Task 1.3 — Update `/standup`: two-dimensional output

- **Files:** `.opencode/commands/standup.md`
- **Changes:** Rewrite step 5 to output two sections:
  - **Jira (macro-tasks):** Jira issue keys + summaries from step 3b cross-check.
  - **Shadow (micro-tasks):** Local completed/planned items from daily notes that have no Jira key.
  - Both sections use Yesterday / Today / Blockers format. If Jira is unconfigured, output only the Shadow section with no error.
- **Verify:** Command file describes two-section output.

### Task 1.4 — Update `/archive`: add `status: archived` step

- **Files:** `.opencode/commands/archive.md`
- **Changes:**
  - In step 2 (Update status), add: set `status: archived` in frontmatter (not just `status: Done`).
  - Remove step 5 (`Update knowledge-graph.md`) — this reference is to a file that will be deleted in Phase 2, and the step is obsolete.
  - Renumber remaining steps.
- **Verify:** `status: archived` is set before the physical move. No mention of `knowledge-graph.md`.

### Task 1.5 — Add `/check-env` slash-command

- **Files:** `.opencode/commands/check-env.md` (new file)
- **Changes:** Create the command. It should:
  1. Run `node --version` — report version, flag if < 22.
  2. Check `jira`, `gh`, `qmd`, `repomix` are available (`command -v <tool>`).
  3. Output results as a markdown table: Tool | Status | Version/Note.
  4. Exit summary: "All tools OK" or list missing tools.
- **Verify:** File exists, describes the check steps and table format.

### Task 1.6 — Update `AGENTS.md`: qmd routing guide + /check-env trigger + Wikilinks standard

- **Files:** `AGENTS.md`
- **Changes:**
  - **QMD routing guide:** Add a table in the QMD section documenting when to use each mode:
    - `qmd query` — default, hybrid (BM25 + vector + LLM reranking); use for natural-language questions
    - `qmd search` — pure BM25; use for exact-match queries (error codes, IDs, version strings)
    - `qmd vsearch` — pure vector; use when semantic similarity is more important than keyword presence
  - **`/check-env` trigger rule:** Add to Session Start (Tier 0) or a new "Tool Health" section: "Run `/check-env` after updating Node.js, installing a new CLI tool, or when a tool fails unexpectedly."
  - **Wikilinks standard:** Add rule: "Use relative Markdown links (`[text](../path/file.md)`) — not Wikilinks (`[[file]]`) — so links work in both Obsidian and standard Markdown renderers."
  - **Update `updated:` date.**
- **Verify:** All three additions are present. No other content changed.

---

## Phase 2 — Metadata Decentralization

### Task 2.1 — Create `scripts/lib/confluence.js`

- **Files:** `scripts/lib/confluence.js` (new file)
- **Changes:** Export `loadConfluenceIds(repoRoot)`:
  - Walk all `.md` files under `repoRoot` using `fs.readdirSync` recursively (or glob pattern via Node built-ins — no new deps).
  - Parse each file's frontmatter using `lib/frontmatter.js` → `parseFrontmatter`.
  - Collect all string values from the `confluence:` array field.
  - Return `{ ids: string[], inMap: Set<string> }` — same shape as the old `loadMapIds()` from `config.js`.
  - Skip files under `node_modules/`, `.git/`, `.opencode/` directories.
- **Verify:** Unit tests pass (Task 2.2).

### Task 2.2 — Create `scripts/lib/confluence.test.js`

- **Files:** `scripts/lib/confluence.test.js` (new file)
- **Changes:** Vitest tests for `loadConfluenceIds`:
  - Returns empty `{ ids: [], inMap: Set }` for a directory with no `.md` files.
  - Returns correct IDs from files with `confluence: [123, 456]` frontmatter.
  - Ignores files with no `confluence:` key.
  - Skips `.git/` and `node_modules/` paths.
  - Uses a temporary directory (or inline fixture strings) — no real repo dependency.
- **Verify:** `node --test scripts/lib/confluence.test.js` or vitest passes.

### Task 2.3 — Update `scripts/config.js`: remove MAP_FILE and loadMapIds

- **Files:** `scripts/config.js`
- **Changes:**
  - Remove `export const MAP_FILE = ...` line.
  - Remove the `loadMapIds()` function (lines 52–63).
  - Update the JSDoc comment at the top to remove `MAP_FILE` and `loadMapIds()` from the exports list.
- **Verify:** No references to `MAP_FILE` or `loadMapIds` remain in `config.js`.

### Task 2.4 — Update `scripts/confluence-updates.js`: use lib/confluence.js

- **Files:** `scripts/confluence-updates.js`
- **Changes:**
  - Remove `MAP_FILE` and `loadMapIds` from the import of `config.js`.
  - Add import: `import { loadConfluenceIds } from "./lib/confluence.js";`
  - Add import of `REPO_ROOT` from `config.js` (already exported).
  - Replace `loadMapIds(MAP_FILE)` call (line 48) with `loadConfluenceIds(REPO_ROOT)`.
  - Update output messages: "Map contains" → "Frontmatter contains" (or similar).
  - Update summary line: "In confluence-map.md" → "In frontmatter".
- **Verify:** Script runs without error; imports resolve correctly.

### Task 2.5 — Update `scripts/confluence-missing.js`: use lib/confluence.js

- **Files:** `scripts/confluence-missing.js`
- **Changes:**
  - Remove `MAP_FILE` and `loadMapIds` from the import of `config.js`.
  - Add import: `import { loadConfluenceIds } from "./lib/confluence.js";`
  - Add `REPO_ROOT` to the `config.js` import.
  - Replace `loadMapIds(MAP_FILE)` call (line 36) with `loadConfluenceIds(REPO_ROOT)`.
  - Update output messages: "Map contains" → "Frontmatter contains".
  - Update summary line: "Already in map" → "Already in frontmatter".
- **Verify:** Script runs without error; imports resolve correctly.

### Task 2.6 — Retire `scripts/confluence-backfill-dates.js`

- **Files:** `scripts/confluence-backfill-dates.js`
- **Changes:** Delete the file. It is the only script that wrote to `confluence-map.md`; after removing that file the script has no valid target.
- **Verify:** File no longer exists. No other file imports it.

### Task 2.7 — Delete `scripts/lib/graph.js` and `scripts/lib/graph.test.js`

- **Files:** `scripts/lib/graph.js`, `scripts/lib/graph.test.js`
- **Changes:** Delete both files. They depend entirely on `knowledge-graph.md` which will be removed.
- **Verify:** Files no longer exist. No other file imports from `./lib/graph.js`.

### Task 2.8 — Delete `scripts/health-kg-coverage.js`

- **Files:** `scripts/health-kg-coverage.js`
- **Changes:** Delete the file. It depends on `lib/graph.js` (deleted in Task 2.7) and checks coverage against `knowledge-graph.md` (deleted in this phase). `health-orphans.js` provides equivalent coverage with stricter criteria.
- **Verify:** File no longer exists.

### Task 2.9 — Update `scripts/health-all.js`: remove kg-coverage check

- **Files:** `scripts/health-all.js`
- **Changes:** Remove the `{ name: "kg-coverage", script: "health-kg-coverage.js", label: "Knowledge Graph Coverage" }` entry from the `CHECKS` array (line 22).
- **Verify:** `CHECKS` array has 8 entries instead of 9. `health-all.js` runs without error.

### Task 2.10 — Update `scripts/run-operation.js`: remove references to deleted files

- **Files:** `scripts/run-operation.js`
- **Changes:**
  - In the `delete` prompt (line 94–95): remove steps 5 and 6 (updating `knowledge-graph.md` and `confluence-map.md`). Rewrite those steps: step 5 → "Commit." with appropriate message.
  - Update `COMMON_PREAMBLE` (line 78): remove reference to `resources-actualize-plan.md` if it doesn't exist (leave if it does); remove any references to `knowledge-graph.md` or `confluence-map.md`.
  - Search all prompt strings for mentions of `knowledge-graph.md` and `confluence-map.md` — remove or rephrase.
- **Verify:** No mention of `knowledge-graph.md` or `confluence-map.md` in any prompt string.

### Task 2.11 — Update `commands/ask.md`: remove knowledge-graph update step

- **Files:** `.opencode/commands/ask.md`
- **Changes:**
  - In step 5, remove "update `knowledge-graph.md`" from the filing workflow. The step becomes: "If filing: create `resources/synthesis/<slug>.md`, re-index with `node scripts/qmd-index.js`, commit."
- **Verify:** No mention of `knowledge-graph.md` in `ask.md`.

### Task 2.12 — Delete `confluence-map.md` and `knowledge-graph.md`

- **Files:** `confluence-map.md`, `knowledge-graph.md`
- **Changes:** Delete both files. Both are verified empty (schema/template only). All script dependencies removed in Tasks 2.3–2.11.
- **Verify:** Files no longer exist. `node scripts/health-all.js` runs without error.

---

## Test Strategy

**Phase 1 (instructions only — no code):**
- Verify each changed file manually: read it back and confirm the described changes are present.
- Run `node scripts/health-all.js` before and after Phase 1 to confirm no regressions.

**Phase 2 (scripts):**
- Task 2.2: run `npx vitest run scripts/lib/confluence.test.js` — all tests must pass.
- After Task 2.9 + 2.12: run `node scripts/health-all.js` — must complete with 0 new errors (kg-coverage entry is gone, no import errors).
- After Tasks 2.4 + 2.5: run each script with `--help` / no args to confirm they start without import errors.
- After all Phase 2 tasks: `grep -r "knowledge-graph\|confluence-map\|loadMapIds\|MAP_FILE" scripts/` should return no results.

**Edge cases:**
- `loadConfluenceIds` with files that have no `confluence:` key — must return empty, not crash.
- `loadConfluenceIds` with `confluence: []` (empty list) — must return empty, not crash.
- `confluence-updates.js` and `confluence-missing.js` with zero frontmatter IDs — must print "0 page IDs" and continue.

---

## Risks

- **Task 2.12 is irreversible** — deleting `confluence-map.md` and `knowledge-graph.md`. Mitigated: both files verified empty (no data loss). Git history preserves them if needed.
- **`run-operation.js` prompt edits** (Task 2.10) could alter agent behavior if done carelessly — the prompts are long strings. Read the full file before editing; change only the specific lines referencing the deleted files.
- **Template edits** (Task 1.1) risk corrupting frontmatter if indentation or YAML syntax is wrong. Read each file before editing; confirm YAML validity by scanning for `---` boundaries.
- **`confluence-updates.js` output change** (Task 2.4) changes the console text from "In confluence-map.md" to "In frontmatter" — scripts or docs that parse this output would break. Risk: low (no known consumers).
- **`lib/confluence.js` recursive walk** (Task 2.1) must correctly skip `.git/` and `node_modules/` or it will scan thousands of files. Test this explicitly in Task 2.2.
