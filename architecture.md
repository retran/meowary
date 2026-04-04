---
updated: 2026-04-04
---

# Architecture

## Journal Repo

Markdown-only personal knowledge base following PARA (Projects, Areas, Resources, Archive).

```
journal/          Time-based notes (daily, weekly, meetings)
projects/         Active work with defined end
areas/            Ongoing responsibilities
resources/        Knowledge base — atomic, topic-based articles
drafts/           External-facing content
archive/          Completed/inactive items
.opencode/        Agent configuration (skills, commands, templates, context)
```

Key indexes:
- `knowledge-graph.md` — resource article index with topics, tags, relationships
- `confluence-map.md` — Confluence page index with summaries (optional)
- `tags.md` — tag registry
- `resources-log.md` — append-only log of resource operations (ingest, sync, enrich, discover, lint)
- `qmd.yml` — QMD semantic search index config (7 collections: `resources/`, `journal/`, `inbox/`, `projects/`, `areas/`, `drafts/`, `archive/`)

## QMD — Semantic Search

QMD provides semantic search across the journal. Used by the `/ask` command (Workflow G) and the `r-ingest` workflow.

- Install: `npm install -g qmd` (Node.js ≥ 22 required)
- First run: downloads ~2GB embedding model — allow time and disk space
- Index: `node scripts/qmd-index.js` — runs `qmd update` + `qmd embed` against all 7 collections in `qmd.yml`
  - `--changed` flag: skip re-index if no git changes since last commit (fast early-exit for CI/hooks)
  - `--full` flag: force full re-embed (`qmd embed -f`) — use after switching embedding model
- Query: `qmd query "<question>"` — returns cited snippets across all 7 collections
- Re-index after: any bulk create/actualize operation, any `/r-ingest` run, any `/r-sync` run

## Scripts — `scripts/`

Automation scripts for health checks, Confluence sync, and resource operations.

- Language: JavaScript (ESM). `scripts/package.json` has `"type": "module"`.
- Run from repo root: `node scripts/<name>.js [args]`
- No build step, no TypeScript. Run directly with Node.js.
- Shared utilities: `scripts/lib/` (links.js, frontmatter.js, graph.js)
- All scripts write to stdout only (read-only), except `fix-links.js`, `confluence-backfill-dates.js`, `run-operation.js`, `plan-resources.js`.

## Source Code Repos (External)

<!-- Fill in your external repo structure here. The agent uses this to understand what source code directories look like and which tech is involved.

Example:
| Directory     | Tech             | Purpose     |
|---------------|------------------|-------------|
| `frontend/`   | TypeScript/React | Web UI      |
| `backend/`    | Python/FastAPI   | API service |

Build system: ...
CI: ...
Source control: ...
-->
