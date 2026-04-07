---
title: "Principal-Ready & Obsidian-Friendly Refactoring"
status: draft
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Principal-Ready & Obsidian-Friendly Refactoring

## Problem

The journal system has six structural weaknesses that degrade reliability and utility at Principal-engineer scale:

1. **Global metadata bottlenecks.** `confluence-map.md` and `knowledge-graph.md` are centralized index files that every script and the agent depends on. They create write conflicts, manual maintenance burden, and a single point of failure. **[VERIFIED]** — `config.js` exports `MAP_FILE` pointing to `confluence-map.md`; 5 scripts call `loadMapIds()` from it; `health-kg-coverage.js` and `lib/graph.js` are fully coupled to `knowledge-graph.md`.

2. **Destructive archive.** `/archive` physically moves directories, breaking links and Git history. **[VERIFIED]** — `commands/archive.md` step 3: "Move the entire directory".

3. **Regex-based parsing.** `migrate-daily-notes.js` and related scripts use regex to navigate document structure. Any manual reformatting breaks them. **[VERIFIED]** — `migrate-daily-notes.js` uses `/^## ${escapeRegex(sectionName)}[ \t]*$/m` patterns throughout.

4. **No hybrid task tracking.** The agent cannot distinguish Jira-tracked macro-tasks from local shadow tasks. `/standup` produces a single-dimensional output. **[VERIFIED]** — `commands/standup.md` has one Yesterday/Today/Blockers format with no namespace awareness.

5. **Shell strategy assumes CI/Linux.** `shell_strategy.md` sets `CI=true` and `DEBIAN_FRONTEND=noninteractive`. The journal runs on macOS, not in CI. These flags cause no direct breakage today but misalign agent behavior expectations and would cause confusion if scripts ever check `CI`. **[VERIFIED]** — `shell_strategy.md` in `.opencode/plugin/shell-strategy/` explicitly prescribes these env vars.

6. **Search is semantic-only.** `qmd` provides vector/semantic search. Exact-match queries (specific error codes, library versions, incident IDs) degrade in recall quality. **[ASSUMED]** — qmd documentation not reviewed; based on its positioning as a semantic search tool.

## Constraints

- **[VERIFIED]** Both `confluence-map.md` and `knowledge-graph.md` are currently empty (schema/template only) — no data loss from removing them.
- **[VERIFIED]** Scripts are plain ESM Node.js — no build step. `remark`/`mdast` can be added to `scripts/package.json` directly.
- **[VERIFIED]** `scripts/package.json` currently has only `dotenv` + `vitest` as dependencies.
- **[VERIFIED]** 5 scripts depend on `loadMapIds()` / `MAP_FILE` from `config.js`: `confluence-updates.js`, `confluence-missing.js`, `confluence-backfill-dates.js`, and indirectly `run-operation.js`.
- **[VERIFIED]** Host OS is macOS. No apt/dpkg. `DEBIAN_FRONTEND=noninteractive` is inert but misleading.
- **[ASSUMED]** `qmd` does not natively support frontmatter-based filtering (e.g., excluding `status: archived`). Soft-archive exclusion from search would require either directory separation or a qmd wrapper.
- **[ASSUMED]** BM25 hybrid search is not available in qmd out of the box — would require a separate tooling layer (e.g., ripgrep as the keyword backend, or a search tool that supports hybrid modes).
- No deadline. Changes are incremental and self-contained.

## Options

### Option A: Big Bang — Full Rework

Implement all 6 areas in a single pass: remove global files, rewrite confluence scripts, add AST parsing, update all commands and AGENTS.md, add `/check-env`, add hybrid search.

**Pros:**
- Coherent end state in one pass. [ASSUMED]
- No temporary dual-path logic needed.

**Cons:**
- Blast radius: touches 10+ files, 5+ scripts simultaneously. [VERIFIED — by dependency count]
- If anything breaks mid-way, the repo is in an inconsistent state.
- Difficult to review or test incrementally.
- AST migration and hybrid search are high-effort and unrelated — coupling them to metadata changes adds risk with no gain.

**Effort:** Large  
**Risk:** High — hard to isolate failures, no checkpoint to roll back to.

---

### Option B: Phased Incremental *(Recommended)*

Split into three independent phases, each shippable and testable on its own.

**Phase 1 — Instructions & Commands (no script changes):**
- Update `AGENTS.md`: Wikilinks standard, frontmatter key preservation, decomposition policy, analysis paralysis limit.
- Update `shell_strategy.md`: remove macOS-irrelevant vars (`DEBIAN_FRONTEND`), annotate `CI=true` as shell-behavior-only (not environment fact).
- Update `/standup` command: two-dimensional output (Jira macro / Shadow micro).
- Update `/archive` command: soft-archive via `status: archived` metadata, physical move becomes optional.
- Add `/check-env` command: verify required binaries (`jira`, `gh`, `qmd`, `node`) and versions.

**Phase 2 — Metadata Decentralization (script changes):**
- Remove `confluence-map.md`. Update `config.js`: remove `MAP_FILE` / `loadMapIds()`. Rewrite confluence scripts to scan `confluence: []` frontmatter across all project/resource/area files.
- Remove `knowledge-graph.md`. Retire `health-kg-coverage.js` and `lib/graph.js`. Replace coverage check with an orphan-based heuristic (`health-orphans.js` already does this).
- Update `commands/archive.md`: remove "Update knowledge-graph.md" step (now obsolete).
- Update `run-operation.js` prompts: remove references to both global index files.
- Update `qmd.yml`: add note on `status: archived` exclusion workaround (directory-based or wrapper script).

**Phase 3 — Robustness & Search (isolated, deferrable):**
- AST migration: add `remark` + `mdast-util-from-markdown` to `scripts/package.json`. Rewrite `migrate-daily-notes.js` section extraction using AST. Extend to other regex-heavy scripts if patterns emerge.
- Hybrid search: evaluate whether `qmd` supports BM25 mode; if not, add `rg`-based keyword search wrapper usable from `/ask`. Document both search paths in `AGENTS.md`.
- Agent safe-edit rule: document in `AGENTS.md` that sections without `(AI Generated)` marker are append-only for the agent.

**Pros:**
- Each phase is independently deployable and testable. [VERIFIED — dependencies don't cross phase boundaries]
- Phase 1 delivers immediate value (better standup, safer archive, env check) with zero risk.
- Phase 2 is safe because source files are currently empty.
- Phase 3 can be deferred without blocking Phases 1–2.

**Cons:**
- Total elapsed time is longer.
- Phase 2 requires touching 5 scripts in one commit.

**Effort:** Medium per phase (Large total)  
**Risk:** Low — each phase is independently reversible.

---

### Option C: Instructions-Only Minimal

Update only AGENTS.md, commands, and shell_strategy.md. Keep `confluence-map.md` and `knowledge-graph.md` as optional caches. Skip all script rewrites and AST migration.

**Pros:**
- Zero risk to existing automation.
- Fastest to ship.

**Cons:**
- Architectural bottleneck persists — global index files will accumulate stale data as content grows. [ASSUMED — based on current growth trajectory]
- Script fragility (regex) stays unaddressed.
- Hybrid search not addressed.

**Effort:** Small  
**Risk:** Minimal, but defers the real problem.

## Recommendation

**Option B: Phased Incremental.**

Phase 1 is pure upside — it fixes the most user-visible issues (archive, standup, shell strategy, env check) with no script changes and full reversibility. Phase 2 is the right time to remove the global indexes because they are currently empty — this window closes once real Confluence and resource data starts accumulating. Phase 3 (AST, hybrid search) is genuinely deferrable and should only proceed once Phases 1–2 are stable.

Option A couples too many unrelated changes. Option C leaves the architectural debt unresolved.

## Open Questions

1. **qmd + soft archive:** Does qmd support frontmatter-based filtering (e.g., `status: archived`)? If not, what is the acceptable workaround — separate `archive/` directory (current) vs. metadata flag with agent awareness only?
2. **Hybrid search tooling:** Is a separate BM25 layer worth adding, or is `rg` (already available on macOS) sufficient as the keyword-search complement to qmd? Should `/ask` route to both automatically?
3. **Confluence scripts post-migration:** After removing `confluence-map.md`, the scripts need to scan all `.md` files for `confluence: []` entries. Should this be a new shared utility in `lib/confluence.js`, or inline per-script?
4. **`/check-env` scope:** Which binaries should the pre-flight check verify? Candidates: `node` (version), `jira`, `gh`, `glab`, `qmd`, `repomix`. Should it be a slash command (on-demand) or a hook in `opencode.json`?
5. **`health-kg-coverage.js` replacement:** Once `knowledge-graph.md` is removed, what is the equivalent coverage check? `health-orphans.js` already checks for zero-inbound-link resources — is that sufficient, or do we need a separate check?
