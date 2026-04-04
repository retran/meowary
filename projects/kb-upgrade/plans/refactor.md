---
title: "Resources System Refactor — Implementation Plan"
status: draft
spec: "specs/system-design.md"
created: 2026-04-04
updated: 2026-04-04
tags: [p-kb-upgrade]
---
<!-- Decisions: commands use r- prefix; /new-person and /new-team retired; synthesis-template.md added; person-template.md and team-template.md deleted -->

# Resources System Refactor — Implementation Plan

Spec: [system-design.md](../specs/system-design.md)

## End State

- **TRUE:** `node scripts/health-all.js` runs without errors and produces grouped output; zero inline `rg`/`grep`/`bash` remain in any skill or command workflow; Workflow B (`sync.md`) is functional; Workflow D lives exclusively in `operations.md`; no command files with `resources-` prefix or old names (`lint.md`, `new-person.md`, `new-team.md`) remain.
- **EXIST:** 3 shared lib files, 10 health scripts (incl. `health-all.js`), `find-backlinks.js`, 2 analysis scripts, `qmd.yml`, `qmd-index.js`, `fetch-source.js`, `resources-log.md`, `operations.md`, `ingest.md`, `query.md`; commands: `r-enrich.md`, `r-sync.md`, `r-plan.md`, `r-discover.md`, `r-lint.md`, `r-ingest.md`, `ask.md`; template: `synthesis-template.md`.
- **WIRED:** All skill files reference scripts by their new names; `enrich.md`, `sync.md`, `discover.md`, `plan.md`, `operations.md` delegate mechanical work to scripts; `AGENTS.md` dispatch table includes the new workflows and `r-` command names; `package.json` reflects renamed scripts.

Execution order: Phase 0 before Phase 1; Phase 1 before Phase 2; Phase 2 before Phase 3. Within each phase, steps are ordered by dependency.

---

## Phase 0 — Cleanup: Commands + Templates

Goal: retire dead commands; rename all resource commands to `r-` prefix; clean up templates.

### 0.1 Rename resource commands

- [ ] 0.1.1 Rename `resources-enrich.md` → `r-enrich.md`.
  - **Files:** `.opencode/commands/r-enrich.md` (create from copy), `.opencode/commands/resources-enrich.md` (delete)
  - **Changes:** Copy content verbatim; update YAML `description` if needed.

- [ ] 0.1.2 Rename `resources-sync.md` → `r-sync.md`.
  - **Files:** `.opencode/commands/r-sync.md` (create from copy), `.opencode/commands/resources-sync.md` (delete)
  - **Changes:** Copy content verbatim.

- [ ] 0.1.3 Rename `resources-plan.md` → `r-plan.md`.
  - **Files:** `.opencode/commands/r-plan.md` (create from copy), `.opencode/commands/resources-plan.md` (delete)
  - **Changes:** Copy content verbatim.

- [ ] 0.1.4 Rename `lint.md` → `r-lint.md`.
  - **Files:** `.opencode/commands/r-lint.md` (create from copy), `.opencode/commands/lint.md` (delete)
  - **Changes:** Copy content verbatim.

### 0.2 Retire dead commands

- [ ] 0.2.1 Delete `new-person.md`.
  - **Files:** `.opencode/commands/new-person.md` (delete)
  - **Changes:** None. Replaced by `/r-enrich resources/people/<slug>.md`.

- [ ] 0.2.2 Delete `new-team.md`.
  - **Files:** `.opencode/commands/new-team.md` (delete)
  - **Changes:** None. Replaced by `/r-enrich resources/teams/<slug>.md`.

### 0.3 Create `r-discover.md` command

- [ ] 0.3.1 Create `.opencode/commands/r-discover.md`.
  - **Files:** `.opencode/commands/r-discover.md` (create)
  - **Changes:** Load `resources` + `resources/discover` skills. Execute Workflow E. YAML front matter: `description: "Discover gaps and connection opportunities in resources"`.

### 0.4 Update templates

- [ ] 0.4.1 Delete `person-template.md`.
  - **Files:** `.opencode/templates/person-template.md` (delete)
  - **Changes:** Retired with `new-person.md`.

- [ ] 0.4.2 Delete `team-template.md`.
  - **Files:** `.opencode/templates/team-template.md` (delete)
  - **Changes:** Retired with `new-team.md`.

- [ ] 0.4.3 Create `synthesis-template.md`.
  - **Files:** `.opencode/templates/synthesis-template.md` (create)
  - **Changes:** Front matter: `title`, `question`, `status: synthesis`, `sources: []`, `created`, `updated`, `tags: []`. Body: `# <title>` heading, `## Question`, `## Synthesis`, `## Sources` sections.

### 0.5 Update `AGENTS.md` command references

- [ ] 0.5.1 Update `AGENTS.md` dispatch table and triggers to reference `r-` command names.
  - **Files:** `AGENTS.md`
  - **Changes:** Trigger table: replace `/lint` → `/r-lint`; replace `/resources-enrich` → `/r-enrich`; replace `/resources-sync` → `/r-sync`; replace `/resources-plan` → `/r-plan`. Remove `/new-person` and `/new-team` references if present.

- [ ] 0.5.2 Update skill files that mention old command names.
  - **Files:** `.opencode/skills/resources/SKILL.md`, `.opencode/skills/resources/enrich.md`, `.opencode/skills/resources/sync.md`, `.opencode/skills/resources/plan.md`, `.opencode/skills/resources/discover.md`
  - **Changes:** Replace any `resources-enrich`, `resources-sync`, `resources-plan`, `/lint`, `new-person`, `new-team` references with their `r-` counterparts.

### 0.6 Patch `enrich.md` for create-if-not-exists

- [ ] 0.6.1 Add create-if-not-exists preamble to `enrich.md`.
  - **Files:** `.opencode/skills/resources/enrich.md`
  - **Changes:** Add a preamble before Step 0: "If the article path does not exist, run Workflow D Create for that concept first (use the path slug as the concept name; gather available context from Confluence, Jira, and journal). Then proceed with Step 0 on the newly created file." This enables `/r-enrich resources/people/<slug>.md` to create new person or team articles without a dedicated create command. **Must complete in the same commit as 0.2.1 and 0.2.2** — retiring `/new-person` and `/new-team` before this preamble is in place creates a window where new person/team articles cannot be created.

---

## Phase 1 — Foundation: Scripts + Health

Goal: all mechanical operations scripted; no inline `rg`/`grep` remaining in skills or commands.

### 1.1 Create shared library

- [ ] 1.1.1 Create `scripts/lib/` directory.
  - **Files:** `scripts/lib/` (new dir)
  - **Changes:** Create directory.

- [ ] 1.1.2 Extract link utilities into `scripts/lib/links.js`. Delete `resources-links-common.ts`.
  - **Files:** `scripts/lib/links.js` (create), `scripts/resources-links-common.ts` (delete)
  - **Changes:** Move and re-export: `findMdFiles(root)`, `extractLinks(content)`, `resolveLink(from, to)`, `findBacklinks(file, root)`. Update any existing imports.

- [ ] 1.1.3 Create `scripts/lib/frontmatter.js`.
  - **Files:** `scripts/lib/frontmatter.js` (create)
  - **Changes:** Export: `parseFrontmatter(content): Record<string, unknown>`, `hasFrontmatter(content): boolean`, `getFrontmatterField(content, field): unknown`.

- [ ] 1.1.4 Create `scripts/lib/graph.js`.
  - **Files:** `scripts/lib/graph.js` (create)
  - **Changes:** Export: `readKnowledgeGraph(path): string`, `listResourceFiles(root): string[]`, `getGraphEntry(file): string | null`.

- [ ] 1.1.5 Write `scripts/lib/links.test.js`.
  - **Files:** `scripts/lib/links.test.js` (create)
  - **Changes:** Vitest unit tests for `lib/links.js`. Test `extractLinks` handles relative, absolute, and anchor-only links; test `resolveLink` produces correct absolute paths; test `findBacklinks` returns correct files for a fixture directory. Use in-memory fixture files — do not mock the unit under test.

- [ ] 1.1.6 Write `scripts/lib/frontmatter.test.js`.
  - **Files:** `scripts/lib/frontmatter.test.js` (create)
  - **Changes:** Vitest unit tests for `lib/frontmatter.js`. Test `hasFrontmatter` returns true/false correctly; test `getFrontmatterField` returns correct values and handles missing fields.

- [ ] 1.1.7 Write `scripts/lib/graph.test.js`.
  - **Files:** `scripts/lib/graph.test.js` (create)
  - **Changes:** Vitest unit tests for `lib/graph.js`. Test `readKnowledgeGraph` parses the graph table; test `getGraphEntry` returns correct entry or null; test `listResourceFiles` returns only `.md` files.

- [ ] 1.1.8 Create `scripts/find-backlinks.js`.
  - **Files:** `scripts/find-backlinks.js` (create)
  - **Changes:** Thin CLI wrapper around `lib/links.js`'s `findBacklinks(file, root)`. Accept `<file>` positional arg. Print one file path per line for every file in repo root that links to `<file>`. Used by Workflow D structural operations as the replacement for inline `rg "<old-path>"` — run before deleting, merging, or reclassifying a file to find all inbound links that need updating.

### 1.2 Rename existing scripts

All renames are hard (delete old, create new). Existing scripts are TypeScript; new versions are JavaScript — strip type annotations when rewriting. Update `package.json`.

- [ ] 1.2.0 Convert `scripts/config.ts` → `scripts/config.js`.
  - **Files:** `scripts/config.js` (create), `scripts/config.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Exports: `CONFLUENCE_BASE`, `CONFLUENCE_SPACES`, `authHeader()`, `loadMapIds()`, `REPO_ROOT`. Must complete before 1.2.5–1.2.7 (Confluence scripts all import from this module). Also add `REPO_ROOT` constant derived from `new URL('../', import.meta.url).pathname` so scripts can resolve paths from any working directory.

- [ ] 1.2.1 Convert `scripts/audit-resources-links.ts` → `scripts/health-links.js`. Add `--scope resources|journal|all` flag.
  - **Files:** `scripts/health-links.js` (create), `scripts/audit-resources-links.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Import from `lib/links.js`. Add scope flag. Keep existing broken-link + missing-back-link logic.

- [ ] 1.2.2 Convert `scripts/fix-resources-links.ts` → `scripts/fix-links.js`.
  - **Files:** `scripts/fix-links.js` (create), `scripts/fix-resources-links.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Import from `lib/links.js`. Logic unchanged.

- [ ] 1.2.3 Convert `scripts/generate-resources-plan.ts` → `scripts/plan-resources.js`.
  - **Files:** `scripts/plan-resources.js` (create), `scripts/generate-resources-plan.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Logic unchanged.

- [ ] 1.2.4 Convert `scripts/resources-operation.ts` → `scripts/run-operation.js`.
  - **Files:** `scripts/run-operation.js` (create), `scripts/resources-operation.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Logic unchanged.

- [ ] 1.2.5 Convert `scripts/fetch-confluence-updates.ts` → `scripts/confluence-updates.js`.
  - **Files:** `scripts/confluence-updates.js` (create), `scripts/fetch-confluence-updates.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Logic unchanged.

- [ ] 1.2.6 Convert `scripts/fetch-missing-pages.ts` → `scripts/confluence-missing.js`.
  - **Files:** `scripts/confluence-missing.js` (create), `scripts/fetch-missing-pages.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Logic unchanged.

- [ ] 1.2.7 Convert `scripts/update-confluence-dates.ts` → `scripts/confluence-backfill-dates.js`.
  - **Files:** `scripts/confluence-backfill-dates.js` (create), `scripts/update-confluence-dates.ts` (delete)
  - **Changes:** Rewrite in JavaScript. Logic unchanged.

- [ ] 1.2.8 Update `scripts/package.json` and remove TypeScript tooling.
  - **Files:** `scripts/package.json`, `scripts/tsconfig.json` (delete)
  - **Changes:** Update all script names to new `.js` names. Remove `tsx`, `typescript`, `@types/node` devDependencies. Add `vitest` devDependency (for `lib/*.test.js` unit tests). Delete `tsconfig.json`.

### 1.3 Write health scripts

Each script reads from repo, writes to stdout only. Exit 0 always (issues reported, not thrown).

- [ ] 1.3.1 `scripts/health-frontmatter.js`
  - **Files:** `scripts/health-frontmatter.js` (create)
  - **Changes:** Scan all `.md` files except `AGENTS.md`. Report files missing `updated` or `tags` front matter fields. Format: `- [ ] path — missing updated`.

- [ ] 1.3.2 `scripts/health-orphans.js`
  - **Files:** `scripts/health-orphans.js` (create)
  - **Changes:** For each `.md` in `resources/` (excluding `resources/people/`): count inbound links via `findBacklinks()`. Report files with count = 0.

- [ ] 1.3.3 `scripts/health-kg-coverage.js`
  - **Files:** `scripts/health-kg-coverage.js` (create)
  - **Changes:** List all `.md` files in `resources/`. Read `knowledge-graph.md`. Report files not referenced in any table row.

- [ ] 1.3.4 `scripts/health-tags.js`
  - **Files:** `scripts/health-tags.js` (create)
  - **Changes:** (a) Collect all `tags:` front matter values across repo; compare to `tags.md`; report used-but-unregistered. (b) Report tags in `tags.md` not used in any file.

- [ ] 1.3.5 `scripts/health-stale.js`
  - **Files:** `scripts/health-stale.js` (create)
  - **Changes:** Accept `--days N` (default 90). For each `resources/` article: read `actualized` field (fall back to `updated`). Report articles older than threshold with age in days.

- [ ] 1.3.6 `scripts/health-lengths.js`
  - **Files:** `scripts/health-lengths.js` (create)
  - **Changes:** Accept `--lines N` (default 80). For each `resources/` article: count non-front-matter lines. Report articles over threshold with line count.

- [ ] 1.3.7 `scripts/health-projects.js`
  - **Files:** `scripts/health-projects.js` (create)
  - **Changes:** Scan `projects/*/README.md`. Flag: (a) `status: Active` with no dev log entry in last 30 days; (b) `status: Active` with all tasks `[x]`.

- [ ] 1.3.8 `scripts/health-sections.js`
  - **Files:** `scripts/health-sections.js` (create)
  - **Changes:** Scan daily notes, project dashboards, area dashboards. Flag standard sections (`## Log`, `## Tasks`, `## Notes`, `## Dev Log`) with no content below them.

- [ ] 1.3.9 `scripts/health-all.js`
  - **Files:** `scripts/health-all.js` (create)
  - **Changes:** Run scripts 1.3.1–1.3.8 in sequence (via `execSync` or dynamic import). Collect stdout. Emit unified report grouped by check type with issue counts. Depends on all prior health scripts existing.

### 1.4 Write analysis scripts

- [ ] 1.4.1 `scripts/report-resources.js`
  - **Files:** `scripts/report-resources.js` (create)
  - **Changes:** For each `resources/` article: emit table row — path, line count, tag count, `actualized` date, inbound link count, outbound link count. Accept `--sort actualized|lines|inlinks`. Depends on `lib/links.js`, `lib/frontmatter.js`, `lib/graph.js`.

- [ ] 1.4.2 `scripts/discover-connections.js`
  - **Files:** `scripts/discover-connections.js` (create)
  - **Changes:** Accept `--scope <path>` (default: `resources/`). For each article pair: score from shared tags (+1), shared sources (+2), entity co-occurrence (+1), structural proximity (+1). Output scored pair table. Only pairs with score ≥ 1.

### 1.5 Set up qmd

- [ ] 1.5.1 Create `qmd.yml`.
  - **Files:** `qmd.yml` (create)
  - **Changes:** Three collections: `resources/`, `journal/`, `inbox/`.

- [ ] 1.5.2 Create `scripts/qmd-index.js`.
  - **Files:** `scripts/qmd-index.js` (create)
  - **Changes:** Run `qmd index` via `execSync`. Exit with clear message if qmd not installed.

- [ ] 1.5.3 Document qmd in `architecture.md`.
  - **Files:** `architecture.md`
  - **Changes:** Add qmd section: install command, Node ≥ 22 requirement, ~2GB first-run note, `qmd query "<question>"` usage.

### 1.6 Write ingest script

- [ ] 1.6.1 `scripts/fetch-source.js`
  - **Files:** `scripts/fetch-source.js` (create)
  - **Changes:** Accept `<url>` positional arg. Fetch via `fetch()`. Strip nav/ads/sidebars heuristically. Emit clean markdown to stdout.

### 1.7 Create `resources-log.md`

- [ ] 1.7.1 Create `resources-log.md`.
  - **Files:** `resources-log.md` (create)
  - **Changes:** Front matter with `updated`, `tags: []`. Body: `# Resources Log` heading, brief format comment, empty initial entry.

---

## Phase 2 — Skill and Command Updates

Goal: all skills reference scripts; no inline `rg`, `grep`, `bash` in skill workflows. Fix broken `.sh` references in `sync.md`.

Prerequisite: Phase 1 complete (all scripts exist at their new paths).

### 2.1 Extract Workflow D → `operations.md`

- [ ] 2.1.1 Create `.opencode/skills/resources/operations.md` with the full Workflow D content moved from `SKILL.md`.
  - **Files:** `.opencode/skills/resources/operations.md` (create)
  - **Changes:** YAML front matter (`name: resources/operations`, `depends_on: [resources]`). Copy Workflow D steps verbatim from SKILL.md; then apply Phase 2 script substitutions (task 2.1.2 below).

- [ ] 2.1.2 Replace `rg` calls in `operations.md` with script invocations.
  - **Files:** `.opencode/skills/resources/operations.md`
  - **Changes:** Delete step: `rg "<old-path>" resources/` → `node scripts/find-backlinks.js <old-path>` (run before deletion; remove or redirect each returned file). Merge step: same (run on the absorbed article before deleting it; redirect all inbound links to the survivor). Split step: `node scripts/find-backlinks.js <source>` to identify links referencing the extracted content, then redirect as appropriate. Create step: verify result with `node scripts/health-orphans.js`. Reclassify step: `node scripts/find-backlinks.js <old-path>` to list all links that must be updated to the new path.

- [ ] 2.1.3 Strip Workflow D from `SKILL.md`; add `operations` to dispatch table.
  - **Files:** `.opencode/skills/resources/SKILL.md`
  - **Changes:** Remove the Workflow D section entirely. Add `resources/operations` row to sub-skill dispatch table.

- [ ] 2.1.4 Update `AGENTS.md` sub-skills table — add `resources/operations` row.
  - **Files:** `AGENTS.md`
  - **Changes:** Add row to the Sub-skills table with path, parent, and description.

- [ ] 2.1.5 Update `r-enrich.md` and `r-sync.md` commands — add `operations.md` load instruction.
  - **Files:** `.opencode/commands/r-enrich.md`, `.opencode/commands/r-sync.md`
  - **Changes:** Where workflow calls for a structural operation, add note to load `resources/operations` skill.

### 2.2 Fix critical breakage in `sync.md`

These `.sh` references do not exist — Workflow B is currently non-functional.

- [ ] 2.2.1 Fix `sync.md` Steps 1, 3, 5: replace `.sh` invocations with `node` calls.
  - **Files:** `.opencode/skills/resources/sync.md`
  - **Changes:** Step 1: `node scripts/confluence-missing.js`. Step 3: `node scripts/confluence-updates.js --since <date>`. Step 5: `node scripts/confluence-backfill-dates.js`.

- [ ] 2.2.2 Update `r-sync.md` command to reference new script names.
  - **Files:** `.opencode/commands/r-sync.md`
  - **Changes:** Replace any remaining old script names.

- [ ] 2.2.3 Add qmd re-index step to `sync.md` after executing operations.
  - **Files:** `.opencode/skills/resources/sync.md`
  - **Changes:** Insert new step between current Step 8 (execute operations) and Step 9 (health check): `node scripts/qmd-index.js` — re-index all collections after batch creates and actualizations. Renumber old Step 9 → Step 10, Step 10 → Step 11.

- [ ] 2.2.4 Add `resources-log.md` append to `sync.md` before the final commit.
  - **Files:** `.opencode/skills/resources/sync.md`
  - **Changes:** Insert step before the commit (now Step 11): append sync summary to `resources-log.md` in the format `## [YYYY-MM-DD] sync\nPages added: N, modified: M\nOps: D deleted, G merged, C created, U actualized`. Derive counts from Steps 2, 4, and 8.

### 2.3 Update `enrich.md` — replace inline searches with scripts

- [ ] 2.3.1 Replace inline rg/grep guidance in Steps 2a and 7a–7c with script calls.
  - **Files:** `.opencode/skills/resources/enrich.md`
  - **Changes:** Step 2a (local search): `node scripts/report-resources.js` for inventory, then read specific files. Step 7a (orphan scan): `node scripts/health-orphans.js`. Step 7b (tag consistency): `node scripts/health-tags.js`. Step 7c (staleness): `node scripts/health-stale.js --days 14`.

### 2.4 Update `sync.md` Step 9 — replace inline health checks

- [ ] 2.4.1 Replace Step 9 inline orphan/staleness/tag checks with `health-all.js`.
  - **Files:** `.opencode/skills/resources/sync.md`
  - **Changes:** Step 9: `node scripts/health-all.js`. Report issues in commit message.

### 2.5 Update `plan.md` — add script-driven analysis

- [ ] 2.5.1 Add script calls to plan.md Steps 1 and 3.
  - **Files:** `.opencode/skills/resources/plan.md`
  - **Changes:** Step 1: run `node scripts/report-resources.js --sort actualized` first; use output to prioritize. Step 3: run `node scripts/discover-connections.js`; use scored pairs as missing cross-reference signals.

### 2.6 Update `discover.md` — replace inline rg with script

- [ ] 2.6.1 Replace Build-the-Connection-Index section with `discover-connections.js` call; remove Quick Discovery Commands section.
  - **Files:** `.opencode/skills/resources/discover.md`
  - **Changes:** Steps 2a–2e: replace with `node scripts/discover-connections.js [--scope <path>]`. LLM reads scored output for Steps 3–4. Remove "Quick Discovery Commands" section (inline bash/rg).

- [ ] 2.6.2 Add `resources-log.md` append to `discover.md` Step 5 (Patch).
  - **Files:** `.opencode/skills/resources/discover.md`
  - **Changes:** After patching cross-references and committing (Step 5): append to `resources-log.md` in the format `## [YYYY-MM-DD] discover | <scope>\nCross-references added: N`. Append even when N = 0 (report was generated; no patches applied).

### 2.7 Rewrite `ref-search.md` as script reference card

- [ ] 2.7.1 Replace `ref-search.md` content with a per-script reference card.
  - **Files:** `.opencode/skills/resources/ref-search.md`
  - **Changes:** One entry per script: name, invocation syntax, flags, output format, when to use. Remove rg patterns.

### 2.8 Update `/lint` command

- [ ] 2.8.1 Replace inline checks with `health-all.js`; add log append.
  - **Files:** `.opencode/commands/r-lint.md`
  - **Changes:** Replace all 6 inline check procedures with `node scripts/health-all.js`. After running, append summary line to `resources-log.md`.

---

## Phase 3 — New Workflows: Ingest and Query

Goal: arbitrary sources can enter resources; questions compound over time.

Prerequisite: Phase 2 complete.

### 3.1 Write `resources/ingest.md` (Workflow F)

- [ ] 3.1.1 Create `.opencode/skills/resources/ingest.md`.
  - **Files:** `.opencode/skills/resources/ingest.md` (create)
  - **Changes:** Workflow F: fetch (`node scripts/fetch-source.js <url>`) → identify concepts → decide create/actualize → execute → update knowledge-graph → re-index (`node scripts/qmd-index.js`) → log to `resources-log.md`.

### 3.2 Write `/ingest` command

- [ ] 3.2.1 Create `.opencode/commands/r-ingest.md`.
  - **Files:** `.opencode/commands/r-ingest.md` (create)
  - **Changes:** Load `resources` + `resources/ingest` skills. Execute Workflow F. `$ARGUMENTS` = `<url-or-file-path>`; if empty, ask user. YAML front matter: `description: "Ingest a URL or file into resources"`.

### 3.3 Write `resources/query.md` (Workflow G)

- [ ] 3.3.1 Create `.opencode/skills/resources/query.md`.
  - **Files:** `.opencode/skills/resources/query.md` (create)
  - **Changes:** Workflow G: `qmd query "<question>"` → read cited articles from any collection (resources, journal, inbox) → synthesize answer with citations → assess filing criteria → optionally create `resources/synthesis/<slug>.md` following Workflow D Create (data already gathered in Steps 1–3; skip Workflow D's Step 1 and start from file creation) → if filed: `node scripts/qmd-index.js` to index the new article → log to `resources-log.md`.

### 3.4 Write `/ask` command

- [ ] 3.4.1 Create `.opencode/commands/ask.md`.
  - **Files:** `.opencode/commands/ask.md` (create)
  - **Changes:** Load `resources` + `resources/query` skills. Execute Workflow G. `$ARGUMENTS` = `<question>`; if empty, ask user. YAML front matter: `description: "Query all journal data and synthesize an answer; optionally file to resources/synthesis/"`. Note: searches across `resources/`, `journal/`, and `inbox/` via qmd.

### 3.5 Add synthesis subfolder support

- [ ] 3.5.1 Document `resources/synthesis/` in `SKILL.md` and `ref-knowledge-graph.md`.
  - **Files:** `.opencode/skills/resources/SKILL.md`, `.opencode/skills/resources/ref-knowledge-graph.md`
  - **Changes:** Add `resources/synthesis/` to the storage overview. Articles here have `status: synthesis` in front matter and are cross-linked from their source articles.
### 3.6 Final `AGENTS.md` update

- [ ] 3.6.1 Add `/r-ingest` and `/ask` to AGENTS.md dispatch table and triggers.
  - **Files:** `AGENTS.md`
  - **Changes:** Available Skills table: add `ingest` and `query` rows. Trigger table: add "Ingesting an external source" → `resources` + `resources/ingest` and "Querying all journal data" → `resources` + `resources/query`. Repo structure: add `resources-log.md` and `qmd.yml`.

---

## Test Strategy

**Script verification (Phase 1):** After creating each script, run it: `node scripts/<name>.js` with appropriate flags (or `--help`). Any runtime error is a Phase 1 blocker.

**Smoke tests (Phase 1):** Run each script against the real repo. Assert: exits 0, produces stdout. No assertions on content — the repo state is not fixed.

**Integration (Phase 1):** `node scripts/health-all.js` must run cleanly and produce a grouped report. This is the single acceptance criterion for the Phase 1 foundation.

**Skill verification (Phase 2):** After Phase 2: `grep -r '\.sh' .opencode/skills/` must return zero results. `grep -r '\brg\b' .opencode/skills/` must return zero results (outside ref-search.md comments).

**End-to-end (Phase 3):** `/r-ingest <url>` must: (a) fetch the URL, (b) create or update at least one resource article, (c) update `knowledge-graph.md`, (d) append to `resources-log.md`. `/ask <question>` must: (a) invoke qmd across all collections, (b) read cited articles, (c) return a cited answer, (d) append to `resources-log.md`.

**Unit tests:** `lib/links.js`, `lib/frontmatter.js`, `lib/graph.js` are pure parsing functions — write co-located `*.test.js` files using Vitest. Test: `parseFrontmatter` round-trips, `extractLinks` handles relative/absolute/anchor links, `findBacklinks` returns correct files.

---

## Risks

- **`lib/links.js` extraction breaks consumers:** `audit-resources-links.ts` and `fix-resources-links.ts` import from `resources-links-common.ts`. Mitigation: read both files before starting 1.1.2; update imports atomically when rewriting as JavaScript.

- **Rename window:** Between deleting old scripts and updating skill files, skills will reference non-existent paths. Mitigation: complete Phase 1 before touching any skill file; Phase 2 only starts after all scripts exist.

- **`operations.md` extraction fidelity:** SKILL.md's Workflow D is long; copying it incompletely will silently break the workflow. Mitigation: read SKILL.md in full before extraction; diff the extracted content against the source after writing.

- **`fetch-source.js` quality:** HTML stripping is heuristic. Mitigation: test against a few known URLs (documentation pages, blog posts); scope is "good enough for resource enrichment" not "perfect".

- **qmd first-run latency:** ~2GB model download blocks `qmd-index.js` on fresh environments. Mitigation: `qmd-index.js` detects missing qmd and exits with install instructions; document in `architecture.md`.

- **`discover-connections.js` performance:** For large `resources/` dirs, O(n²) pair scoring may be slow. Mitigation: n is bounded by the resources size (expected < 500 articles); acceptable for CLI use. Add a `--limit N` flag if needed.

- **`resources-actualize-plan.md` overwrite:** Both `/r-sync` (Workflow B Step 7) and `/r-plan` (Workflow C Step 4) write to `resources-actualize-plan.md`. Running one after the other silently overwrites the existing plan. Mitigation: document in both command files that any pre-existing plan should be consumed before generating a new one. Consider adding a pre-flight warning to both commands when the file exists and was modified within the last 7 days.

- **Phase 0.2 / 0.6 ordering:** Retiring `/new-person` and `/new-team` (Phase 0.2) before the create-if-not-exists preamble lands in `enrich.md` (Phase 0.6) creates a gap where new person/team articles cannot be created. Mitigation: tasks 0.2.1, 0.2.2, and 0.6.1 must land in the same commit. See Phase 0.6.

- **Workflow C generates no health check input:** `plan.md` does not run `health-all.js` before producing the operation plan, so it may miss stale, orphaned, or malformed articles as plan candidates. This is intentional — `/r-lint` is the dedicated health entrypoint. To get a plan informed by current health state, run `/r-lint` before `/r-plan` and factor the health report in manually.

- **Workflow A qmd re-index cadence:** Running `/r-enrich` sequentially through a plan queue leaves qmd increasingly stale. After completing a full plan queue, run `node scripts/qmd-index.js` manually. Document this in the `/r-enrich` command file and `/r-plan` plan output header.
