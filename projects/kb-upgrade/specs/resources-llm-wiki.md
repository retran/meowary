---
title: "Resources System Upgrade — Consistent Knowledge Graph"
status: draft
created: 2026-04-04
updated: 2026-04-04
tags: []
---

# Resources System Upgrade — Consistent Knowledge Graph

## Problem

The current resources system has strong structure (concept graph, PARA, atomic articles) and solid Confluence-sourced enrichment workflows, but three gaps prevent resources from compounding over time:

1. **No general ingest workflow.** Sources are limited to Confluence. There is no way to incorporate web articles, markdown files, PDFs, meeting notes, or other documents into resources without manually writing resource articles from scratch. [VERIFIED: Workflows A–E all assume Confluence or journal as source; no generic ingest path exists]
2. **No query workflow.** The agent can search resources via grep, but there is no structured `/ask` command. Answers to questions disappear into chat history and do not compound resources. [VERIFIED: no `/ask` command exists in `.opencode/commands/`]
3. **Too much mechanical work done by the LLM inline.** Graph health checks (orphan detection, broken links, front matter validation, tag consistency, stale article detection) are currently executed by the LLM during workflows. This consumes tokens on deterministic work that a script can do in under a second. [VERIFIED: `enrich.md` Steps 5–7, `discover.md`, `plan.md` Step 3 all perform these checks in-agent]

Additionally, `qmd` (hybrid BM25+vector+reranking search for local markdown) is not configured. As the resources graph grows beyond a few dozen articles, grep degrades in quality. [VERIFIED: qmd v2.0.1, 17k stars, MIT, Node 22+, ~2GB model download on first use]

A `resources-log.md` (append-only ingest/query/lint history) does not exist. Without it, neither the agent nor the user can tell what was processed and when. [VERIFIED: no log file in repo]

The overarching goal is a **consistent knowledge graph system**: scripts handle all mechanical checks and indexing; the LLM handles only semantic work (enrichment, synthesis, ingest decisions, query answering). The agent runs scripts to get health reports and search results, then acts on structured output — it does not grep the repository itself.

---

## Current Scripts Inventory

All existing scripts are TypeScript, run via `npx tsx`. They live in `scripts/` with their own `package.json` and `tsconfig.json`.

| Script | Current purpose | Disposition |
|---|---|---|
| `scripts/config.ts` | Shared env config, Confluence credentials, `loadMapIds()`, `authHeader()` | Keep as-is |
| `scripts/resources-links-common.ts` | Shared link utilities: `findMdFiles()`, `extractLinks()`, `resolveLink()` | Rename → `scripts/lib/links.ts` |
| `scripts/audit-resources-links.ts` | Detects broken links and missing back-links in `resources/` | Rename → `scripts/health-links.ts`; extend to cover `journal/` |
| `scripts/fix-resources-links.ts` | Auto-fixes missing back-links in `## Related` sections | Rename → `scripts/fix-links.ts` |
| `scripts/generate-resources-plan.ts` | Runs `opencode run` with Workflow C prompt → produces plan file | Rename → `scripts/plan-resources.ts` |
| `scripts/resources-operation.ts` | Runs `opencode run` for a single structural operation | Rename → `scripts/run-operation.ts` |
| `scripts/fetch-confluence-updates.ts` | Fetches pages modified since a date; reports in/out of `confluence-map.md` | Rename → `scripts/confluence-updates.ts` |
| `scripts/fetch-missing-pages.ts` | Enumerates all pages in Confluence spaces; reports missing from map | Rename → `scripts/confluence-missing.ts` |
| `scripts/update-confluence-dates.ts` | Backfills Last Modified dates in `confluence-map.md` | Rename → `scripts/confluence-backfill-dates.ts` |

**New scripts to add** (all TypeScript, `npx tsx`):

| Script | Purpose |
|---|---|
| `scripts/health-orphans.ts` | Detect articles with zero inbound links in `resources/` |
| `scripts/health-frontmatter.ts` | Detect missing/invalid `updated` and `tags` fields |
| `scripts/health-kg-coverage.ts` | Compare `resources/` files against `knowledge-graph.md` rows; report gaps |
| `scripts/health-tags.ts` | Detect tags in front matter not registered in `tags.md` |
| `scripts/health-stale.ts` | Detect articles where `actualized` is older than a configurable threshold |
| `scripts/health-lengths.ts` | Detect articles over 80 lines (split candidates) |
| `scripts/health-all.ts` | Run all `health-*.ts` scripts; emit unified checklist report |
| `scripts/qmd-index.ts` | Run `qmd index` on configured collections after batch changes |
| `scripts/fetch-source.ts` | Fetch a URL and emit clean markdown (for ingest workflow) |

**LLM invocation patterns** — how the agent runs each script:

```bash
# Health check (before enrichment, after batch ops, on /lint)
npx tsx scripts/health-all.ts

# Single health checks
npx tsx scripts/health-orphans.ts
npx tsx scripts/health-links.ts       # (renamed from audit-resources-links.ts)
npx tsx scripts/health-frontmatter.ts
npx tsx scripts/health-kg-coverage.ts
npx tsx scripts/health-tags.ts
npx tsx scripts/health-stale.ts
npx tsx scripts/health-lengths.ts

# Fix links (after enrichment that adds new articles)
npx tsx scripts/fix-links.ts

# Re-index qmd (after ingest or batch enrichment)
npx tsx scripts/qmd-index.ts

# Fetch source for ingest
npx tsx scripts/fetch-source.ts <url>

# Confluence ops
npx tsx scripts/confluence-updates.ts --since 2026-03-01
npx tsx scripts/confluence-missing.ts
npx tsx scripts/confluence-backfill-dates.ts

# Structural op (runs opencode run internally)
npx tsx scripts/run-operation.ts --op actualize --file resources/tools/foo.md

# Plan generation (runs opencode run internally)
npx tsx scripts/plan-resources.ts
```

All scripts write to stdout. The agent reads script output and acts on it — no in-agent grep.

---

## Constraints

- Keep the existing `resources/` concept graph structure and PARA hierarchy. [VERIFIED: well-designed; no reason to replace it]
- New workflows must not break existing Workflows A–E. They are additive.
- All scripts must be TypeScript, run via `npx tsx`. No new shell scripts, no Python. [VERIFIED: all existing scripts already TypeScript]
- qmd requires Node.js ≥ 22 and downloads ~2GB of GGUF models on first use (embeddinggemma-300M, qwen3-reranker-0.6b, qmd-query-expansion-1.7B). [VERIFIED: qmd README]
- The agent reads script output; scripts do not call the LLM (exception: `run-operation.ts` and `plan-resources.ts` invoke `opencode run` as a subprocess — that is intentional).
- `context.md` is unpopulated — the system must not depend on Confluence or Jira being configured. New workflows degrade gracefully when those integrations are absent.

---

## What Should Be Scripted vs. LLM

| Task | Scripted? | Why |
|---|---|---|
| Orphan detection | Yes → `health-orphans.ts` | Purely mechanical: count inbound links |
| Broken link detection | Yes → `health-links.ts` | Purely mechanical: resolve paths |
| Front matter validation | Yes → `health-frontmatter.ts` | Purely mechanical: parse YAML |
| Knowledge-graph coverage | Yes → `health-kg-coverage.ts` | Purely mechanical: compare file list to table rows |
| Tag consistency | Yes → `health-tags.ts` | Purely mechanical: string comparison |
| Stale detection | Yes → `health-stale.ts` | Purely mechanical: date comparison |
| Length scan | Yes → `health-lengths.ts` | Purely mechanical: line count |
| qmd re-index | Yes → `qmd-index.ts` | Shell wrapper, no semantics |
| Source fetch + clean | Yes → `fetch-source.ts` | URL fetch + markdown conversion |
| Ingest decision (create vs. actualize) | LLM | Requires semantic judgment |
| Article enrichment content | LLM | Requires synthesis and writing |
| Query answering | LLM | Requires semantic understanding |
| Structural operation execution | LLM via `run-operation.ts` | Semantic: merge, split, reclassify |

---

## Options

### Option A: Full Stack Upgrade

Add all three missing operations plus scripted health checks and qmd, in one coordinated upgrade across skills, commands, and scripts.

**What changes:**
- Script renames (see inventory above)
- New `health-*.ts` scripts + `health-all.ts` master runner
- `scripts/qmd-index.ts` + `scripts/fetch-source.ts`
- qmd setup: `qmd.yml` collection config covering `resources/`, `journal/`, `inbox/`
- New sub-skill `resources/ingest` + `/ingest` command: fetch source → discuss takeaways → write or actualize article → update `knowledge-graph.md` → append to `resources-log.md`
- New `/query` command: run `qmd query` → synthesize answer with citations → optionally file result as new resource article → append to `resources-log.md`
- Updated `/lint` command: call `npx tsx scripts/health-all.ts` instead of in-agent grep; append to `resources-log.md`
- Update `enrich.md` Steps 5–7 and `discover.md` to call health scripts instead of in-agent grep
- `resources-log.md`: append-only log (ingest, query, lint entries) with parseable `## [YYYY-MM-DD] op | title` headers
- AGENTS.md updates: document all script invocation patterns in the Coding Context section

**Pros:**
- Closes all three gaps simultaneously [ASSUMED]
- qmd enables semantic search at scale [VERIFIED: hybrid BM25+vector+rerank]
- Health scripts remove ~40% of current LLM token usage on mechanical checks [ASSUMED]
- `resources-log.md` gives temporal context to agent and user [ASSUMED based on Karpathy]
- Answer-filing compounds resources on every query [CITED: Karpathy "explorations add up"]
- All scripts uniformly TypeScript — consistent dev experience [VERIFIED: existing scripts already TypeScript]

**Cons:**
- Large surface area — changes 8+ files [ASSUMED risk]
- qmd prerequisite (Node 22+, 2GB models) may delay initial setup [VERIFIED: qmd README]
- Ingest workflow needs quality-control design to avoid polluting resources [ASSUMED]

**Effort:** large  
**Risk:** Medium — individual pieces are well-bounded; coordination across files is the main risk

---

### Option B: Scripts + qmd Only (No New Workflows)

Write the health script bundle and configure qmd. Rename existing scripts. Update existing skills to call scripts instead of running grep. Do not add Ingest or Query workflows.

**What changes:**
- Script renames (see inventory above)
- New `health-*.ts` scripts + `health-all.ts`
- `scripts/qmd-index.ts`
- qmd setup: `qmd.yml`
- Updated `/lint` command: call `health-all.ts`
- Updated `enrich.md` and `discover.md`: call health scripts
- `resources-log.md` (lint entries only)
- No new commands or workflow sub-skills

**Pros:**
- Immediately reduces LLM token cost on mechanical checks [ASSUMED]
- qmd improves search quality as resources grows [VERIFIED]
- Low risk — no new workflows [VERIFIED by scope]
- Fast to implement [ASSUMED]

**Cons:**
- No Ingest workflow — still no way to bring arbitrary sources into resources [VERIFIED: gap remains]
- Query still ad-hoc — answers still ephemeral [VERIFIED: gap remains]
- Addresses tooling only; does not close the compounding knowledge gap [ASSUMED]

**Effort:** small–medium  
**Risk:** Low

---

### Option C: Ingest + qmd (Skip Scripts for Now)

Add the Ingest workflow and configure qmd. Skip health script bundle and query workflow.

**What changes:**
- New sub-skill `resources/ingest` + `/ingest` command
- `scripts/fetch-source.ts`
- `scripts/qmd-index.ts`
- qmd setup
- `resources-log.md`
- No health script bundle; no query workflow; no script renames

**Pros:**
- Targets the single highest-value gap (compounding via new sources) [ASSUMED]
- qmd improves ingest decisions [VERIFIED]
- Moderate scope, focused [ASSUMED]

**Cons:**
- Mechanical checks remain LLM-driven [VERIFIED: gap remains]
- Query still ephemeral [VERIFIED: gap remains]
- No script renames — existing scripts stay inconsistently named [VERIFIED: gap remains]
- Partial — requires follow-up work [ASSUMED]

**Effort:** medium  
**Risk:** Low–medium

---

## Recommendation

**Option A with phased execution**, using Option B as Phase 1.

**Phase 1 — Foundation (Option B scope):**
- Rename all existing scripts to the new naming convention
- Write `health-*.ts` + `health-all.ts`
- Write `scripts/qmd-index.ts`
- Configure qmd (`qmd.yml`)
- Update `/lint` to call `health-all.ts`
- Update `enrich.md` and `discover.md` to call health scripts
- Create `resources-log.md`

**Phase 2 — Ingest:**
- Write `scripts/fetch-source.ts`
- Write `resources/ingest` sub-skill
- Write `/ingest` command

**Phase 3 — Query:**
- Write `/query` command
- Add answer-filing mechanism

**Rationale:**
- The health script bundle has zero semantic ambiguity — all checks are mechanical. Doing it first clarifies the script/LLM boundary before adding complex workflows. [VERIFIED: all checks are string/file operations]
- qmd setup is a prerequisite for both Query and improved Ingest decisions. Do it once in Phase 1. [VERIFIED: qmd CLI and MCP needed for both]
- Ingest and Query need careful quality-control design. Doing them on a tested foundation reduces risk. [ASSUMED]
- Script renames happen in Phase 1 to avoid the naming inconsistency compounding through all subsequent phases. [ASSUMED]

---

## Open Questions

- **qmd prerequisites:** Is Node.js ≥ 22 already available? Should qmd be installed globally (`npm install -g @tobilu/qmd`) or per-project? [ASSUMED not yet installed — needs verification before Phase 1]
- **`health-links.ts` scope:** Should it cover `journal/` in addition to `resources/`, or `resources/` only for now? [ASSUMED: `resources/` first; `journal/` as a flag]
- **Ingest quality control:** What criteria determine `create` vs. `actualize`? Should low-quality sources be filtered before the LLM step? [ASSUMED: needs design in Phase 2]
- **Query answer filing:** Filed answers go to `resources/synthesis/` (new subfolder) or into existing concept articles? Auto-file or always prompt? [ASSUMED: prompt first; auto-file as follow-up]
- **`resources-log.md` scope:** Log ingest and query only, or also lint and enrichment passes? How long before entries are archived? [ASSUMED: all ops; archive annually]
- **MCP vs CLI for qmd:** Use qmd as MCP server (tighter integration, persistent model load) or CLI (simpler, stateless)? [ASSUMED: CLI first in Phase 1; MCP in Phase 3]
- **Script renames — migration:** Should old script names be kept as thin wrappers for backwards compatibility, or hard-renamed? [ASSUMED: hard rename; update all skill references in the same PR]
