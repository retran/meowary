---
name: query
description: Multi-source retrieval strategy — 5-tier source priority (QMD → direct read → Confluence → Jira → web), citation format, confidence tags, staleness rules, and gap reporting. Load when answering any question that requires searching the knowledge base, citing sources, or reporting what is unknown.
---

# Query Skill

Rules and conventions for retrieving and synthesizing information from the full knowledge base. This skill owns *how* to search, cite, and report confidence. For QMD CLI mechanics (query types, syntax), load the `qmd` skill alongside this one.

## Source Priority

Search sources in this order. Do not skip a tier without a reason.

| Tier | Sources | When to use |
|------|---------|-------------|
| 1 | QMD index (`qmd query`) | Always first — covers `resources/`, `journal/`, `projects/` if indexed |
| 2 | Direct file read | When QMD snippets are insufficient; read full article or note |
| 3 | Confluence | Team decisions, architecture, process docs, org charts |
| 4 | Jira | Project history, ownership, deadlines, ticket decisions |
| 5 | Web | External facts, library docs, recent developments |

Never report a gap before exhausting all five tiers.

## QMD Search Strategy

1. Run `qmd query "<question>"` — top 5–10 results.
2. If results are sparse: run a second query with alternative phrasing or a different query type (`lex`, `vec`, `hyde`).
3. If QMD returns nothing after two attempts: browse the relevant directory tree manually before falling through to Tier 3.

Multiple query types improve recall on complex topics — combine `lex` + `vec` when the vocabulary is uncertain.

When QMD returns 5 or more relevant results, offload bulk reading to an `explore` sub-agent rather than reading each article inline. Pass: the question, the list of result paths, and the repo root. The agent returns key claims per source, dates, and cross-references. Read inline when ≤ 4 results.

## Citation Format

Tag every claim with its source.

| Source | Citation format |
|--------|----------------|
| Resource article | `[resource: resources/<path>.md]` |
| Daily note | `[journal: journal/daily/<date>.md]` |
| Weekly note | `[journal: journal/weekly/<date>.md]` |
| Project note / dev-log | `[project: projects/<slug>/<path>.md]` |
| Confluence page | `[confluence: <page-title> (<page-id>)]` |
| Jira issue | `[jira: <KEY-123>]` |
| Web | `[web: <url>]` |

Lead with the answer. Citations and preamble follow.

## Confidence Tags

Attach one tag to every claim or section.

| Tag | Meaning |
|-----|---------|
| `[VERIFIED]` | Multiple independent sources agree |
| `[CITED]` | Single source; no contradiction found |
| `[ASSUMED]` | Inferred from context; no direct source |

Do not suppress low-confidence answers. Surface them with `[ASSUMED]` and state why confidence is low.

## Staleness Rules

| Source | Staleness threshold | Action |
|--------|--------------------|----|
| Resource article (`actualized` field) | > 3 months | Warn with `⚠ stale` note; still present the content |
| Journal entry | > 6 months | Flag as historical context only |
| Confluence page | Modified after article's `actualized` date | Flag; suggest `resource-enrich` |

When multiple conflicting sources exist: surface the conflict explicitly, note which is more recent, do not silently pick one.

## Gap Reporting

A gap is only reportable after all five source tiers are exhausted.

For each gap, state:
- What the query could not answer.
- Which source tier would most likely fill it (e.g., "Confluence, Finance space" or "web search for library docs").

If an external source fills the gap during search: note it and suggest `resource-ingest` to add it to the graph.

## Read-Only Rule

Querying never modifies any file. No commits, no dev-log entries, no daily note writes during a query.

Exception: if a critical gap is found that warrants immediate enrichment, surface the suggestion and ask the user whether to proceed with `resource-ingest` or `resource-enrich`.

## Editor Checklist (run silently before every output)

- [ ] Answer leads — no "I searched and found..." preamble
- [ ] Every claim has a citation tag
- [ ] Every claim has a confidence tag
- [ ] Stale sources are flagged with `⚠ stale`
- [ ] Conflicts are surfaced, not silently resolved
- [ ] Gaps listed only after all five tiers exhausted
- [ ] No writes to any file
