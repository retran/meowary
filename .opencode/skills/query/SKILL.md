---
name: query
description: Multi-source retrieval strategy — 5-tier source priority (QMD → direct read → Confluence → Jira → web), citation format, confidence tags, staleness rules, and gap reporting. Load when answering any question that requires searching the knowledge base, citing sources, or reporting what is unknown.
updated: 2026-04-18
---

<role>Multi-source retrieval and citation authority. Owns *how* to search, cite, and report confidence.</role>

<summary>
> 5-tier source priority. Tag every claim with citation + confidence. Surface conflicts, NEVER silently resolve. Read-only — querying never writes. For QMD CLI mechanics, also load `qmd` skill.
</summary>

<source_priority>

Search in order. DO NOT skip a tier without reason.

| Tier | Sources | When to use |
|------|---------|-------------|
| 1 | QMD index (`qmd query`) | Always first — covers `resources/`, `journal/`, `projects/` if indexed |
| 2 | Direct file read | When QMD snippets insufficient; read full article |
| 3 | Confluence | Team decisions, architecture, process docs, org charts |
| 4 | Jira | Project history, ownership, deadlines, ticket decisions |
| 5 | Web | External facts, library docs, recent developments |

NEVER report a gap before exhausting all five tiers.

</source_priority>

<steps>

<step n="1" name="qmd_search">
1. Run `qmd query "<question>"` — top 5–10 results.
2. Sparse results? Run second query with alternative phrasing or different type (`lex`, `vec`, `hyde`).
3. Nothing after 2 attempts? Browse relevant directory tree manually before Tier 3.

Combine `lex` + `vec` when vocabulary uncertain.

When QMD returns ≥5 relevant results: offload bulk reading to `explore` sub-agent. Pass: question, result paths, repo root. Agent returns key claims per source, dates, cross-references. Read inline when ≤4 results.
</step>

<step n="2" name="cite_claims">

Tag every claim with source.

| Source | Citation |
|--------|----------|
| Resource | `[resource: resources/<path>.md]` |
| Daily note | `[journal: journal/daily/<date>.md]` |
| Weekly note | `[journal: journal/weekly/<date>.md]` |
| Project / dev-log | `[project: projects/<slug>/<path>.md]` |
| Confluence | `[confluence: <page-title> (<page-id>)]` |
| Jira | `[jira: <KEY-123>]` |
| Web | `[web: <url>]` |

Lead with answer. Citations and preamble follow.
</step>

<step n="3" name="confidence_tag">

Attach one tag to every claim or section.

| Tag | Meaning |
|-----|---------|
| `[VERIFIED]` | Multiple independent sources agree |
| `[CITED]` | Single source; no contradiction found |
| `[ASSUMED]` | Inferred from context; no direct source |

DO NOT suppress low-confidence answers. Surface with `[ASSUMED]` and state why.
</step>

<step n="4" name="staleness_check">

| Source | Threshold | Action |
|--------|-----------|--------|
| Resource (`actualized`) | >3 months | Warn `⚠ stale`; still present |
| Journal entry | >6 months | Flag as historical context only |
| Confluence page | Modified after article's `actualized` | Flag; suggest `resource-enrich` |

Conflicting sources: surface conflict explicitly, note which is more recent. NEVER silently pick one.
</step>

<step n="5" name="gap_reporting" condition="all 5 tiers exhausted">
For each gap state:
- What query could not answer.
- Which tier would most likely fill it (e.g., "Confluence Finance space" or "web search for library docs").

External source fills gap during search? Note it; suggest `resource-ingest` to add to graph.
</step>

</steps>

<read_only_rule>
Querying NEVER modifies files. No commits, no dev-log entries, no daily note writes during query.

**Exception:** critical gap warranting immediate enrichment — surface suggestion, ask user whether to proceed with `resource-ingest` or `resource-enrich`.
</read_only_rule>

<self_review>
- [ ] Answer leads — no "I searched and found..." preamble?
- [ ] Every claim has citation tag?
- [ ] Every claim has confidence tag?
- [ ] Stale sources flagged `⚠ stale`?
- [ ] Conflicts surfaced, not silently resolved?
- [ ] Gaps listed only after all five tiers exhausted?
- [ ] No writes to any file?
</self_review>

<output_rules>Output in English. Preserve verbatim citation tag formats and confidence tags.</output_rules>
