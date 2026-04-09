---
updated: 2026-04-07
tags: []
---

# Resource-Enrich

> Single-article enrichment workflow for the `resources/` knowledge graph. Takes one article, gathers data from all available sources (local resources, Confluence, Jira, codebase, journal, web), enriches content, applies progressive summarization, fixes cross-references, and updates metadata. One article per invocation. Always stops and waits after committing. Inside-out: starts from an existing article and gathers sources. Use `resource-ingest` instead when starting from a source.

## Role

Acts as a systematic knowledge graph curator. Enriches from all sources — never stops after the first hit per source channel. Extracts durable facts only; discards transient content (meeting logistics, expiring status). An article that is touched must be meaningfully different afterward — the evolution check is non-negotiable. Tracks all provenance changes in `## Changelog`. Commits and stops; does not auto-continue.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Article path | User invocation | Required |
| `resources-actualize-plan.md` | Repo root | Optional (context only) |

## Complexity Tiers

Not applicable. Fixed-procedure workflow — all steps are mandatory. No tiers. No skipping.

## Steps

### Step 0 — Load context

1. Read today's daily note — find any tasks matching this article or topic.
2. If `resources-actualize-plan.md` exists: read the `actualize` row for this article; note the `Details`, `Missing Cross-References`, and `Notes` columns.
3. If the article **does not exist**: ask the user whether to create it via `resource-ops create` first, then return here.

Done when: daily note checked; plan row read if present; article existence confirmed.

### Step 0.5 — Clarify

**SOFT-GATE (all tiers):** Confirm target and scope before proceeding.

1. If the article path is not fully specified, ask: which article? (search `resources/` to confirm the path)
2. Confirm scope: full enrichment, or targeted update for a specific section?

Do not proceed until the target article is unambiguously identified.

Done when: article path confirmed; enrichment scope confirmed.

### Step 1 — Read and understand

1. Read the article in full: front matter, body, `## Related`, `## Changelog`.
2. Note `status`, `updated`, `actualized`, `tags`, `confluence:` front matter, outbound links.
3. Identify 3–8 key terms to drive source searches.
4. Note candidate new nodes (concepts mentioned with no resource article).

Done when: article read in full; key terms and new-node candidates identified.

### Step 2 — Gather data from all sources

Run all sub-steps. Do not stop after the first hit per sub-step.

**2a. Local resources** — QMD query + ripgrep across `resources/`; check tag siblings and same-subfolder articles; identify missing back-links and cross-references.

**2b. Confluence** — search using ≥3 strategies (exact title, domain terms, synonyms, people/component names, tags); extract durable facts; add page IDs to `confluence:` front matter and `meta/confluence-sync.json`. (≥3 strategies because Confluence search is keyword-based with no semantic fallback — multiple strategies compensate for vocabulary mismatches.)

**2c. Jira** — search using ≥2 strategies (component/feature names, team project key, epics, people); extract durable facts only (decisions, deadlines, ownership changes). (≥2 strategies because Jira ticket titles vary widely; component + owner searches complement each other.)

**2d. Codebase** — verify file paths, component names, architecture descriptions against current code; correct stale technical details.

**2e. Journal** — search key terms across `journal/daily/`, `journal/weekly/`, `projects/`; extract durable facts (decisions, ownership, concrete numbers/dates); discard transient content.

**2f. Web** — search the web proactively for recent developments, official documentation updates, or external references relevant to the article topic. Do not skip this step if the topic has an external dimension. Extract durable facts only.

**2g. Entity and topic extraction** — scan all gathered material for named entities and concepts with no resource article; note them in `## Changelog` as `create` candidates for the next `resource-plan` pass.

**Person-file priority:** For `resources/people/` articles, prioritize Confluence (team roster, org chart) and Jira (assignee/reporter). Codebase is lower priority unless the person owns specific technical areas.

**Sub-agent triggers:** Spawn `url-fetcher` (`.opencode/agents/url-fetcher.md`) for web sources when source count > 3 in Step 2f — pass the URL, article topic context, and target path `resources/sources/<article-slug>-<date>.md`; returns path written plus 3–5 extracted facts. Spawn `confluence-fetcher` (`.opencode/agents/confluence-fetcher.md`) for each Confluence page in Step 2b — pass the page URL or ID, the matching resource article path, and article topic context; returns 3–7 extracted facts and GDPR notes. Both agents run in parallel when count > 3; run inline when ≤ 3.

Done when: all source channels queried; sub-agents returned; facts gathered.

### Step 3 — Enrich the article

1. Add new durable facts; fill thin sections; replace inline concept explanations with links.
2. Do **not** split, merge, rename, or create articles here — note candidates in `## Changelog`.

Done when: article body updated with new durable facts; no structural changes made.

### Step 3.1 — Progressive summarization

- **Layer 1 — Highlight:** bold the most important phrases in each section (~10–20% of body text). (10–20% preserves signal density without over-bolding; more than 20% dilutes emphasis.)
- **Layer 2 — Summary:** if article body > ~80 lines, add/update a `## Summary` with 3–5 self-contained bullets. (~80 lines is the threshold where readers benefit from a navigation summary before diving in.)
- **Layer 3 — Synthesize:** if connected to 3+ other articles on a shared theme, add a one-sentence synthesis note linking them. (3+ connections indicates a cluster worth articulating; fewer may be coincidental.)

Done when: highlights applied; summary added if body >~80 lines; synthesis note added if 3+ connections.

### Step 3.2 — Evolution check

If re-reading adds no new facts: find one claim to sharpen, one implied link to make explicit, or one thin section to expand. An article that is touched must be meaningfully different.

Done when: at least one meaningful change confirmed.

### Step 3.3 — Synthesis check

If any two newly linked articles suggest an insight neither contains alone: append a synthesis candidate note to `## Changelog`.

Done when: synthesis candidate documented if applicable.

### Step 4 — Remove outdated content

1. Remove facts contradicted by sources; remove disbanded teams, deprecated processes, renamed components, resolved speculation.
2. If the entire article is obsolete: set `status: outdated`; add a blockquote at top.

Done when: outdated content removed or status updated.

### Step 5 — Fix cross-references

1. Verify every outbound link targets an existing file; fix or remove broken links.
2. For every new link A → B: add back-link in B's `## Related`.
3. Drop links to archived/deleted articles; fix links to renamed/moved files.

Done when: all outbound links verified; back-links added for new links.

### Step 6 — Update metadata

1. Set `updated` and `actualized` to today.
2. Append to `## Changelog`: `- **YYYY-MM-DD:** <what changed>.`
3. Update `## Sources`; update `confluence:` front matter; verify tags; register new tags in `meta/tags.md`.

Done when: front matter updated; changelog appended; tags verified.

### Step 7 — Graph health check

**7a. Orphan scan:** Run `node .opencode/scripts/find-backlinks.js <article-path>`. Zero inbound links = orphaned; fix by linking from the closest related article. (People files are exempt.)

**7b. Tag consistency:** All tags must exist in `meta/tags.md`. Inline `#tags` must match front matter.

**7c. Staleness spot-check:** Check same-subfolder articles sharing tags; flag (do not fix) those with `actualized` > 2 weeks old or with Confluence pages modified since `actualized`.

Done when: orphan check done and fixed; tag consistency verified; stale neighbors flagged.

### Step 8 — Close

1. Stage: the article, back-linked articles, newly created articles, `meta/tags.md`, `meta/confluence-sync.json`.
2. Commit: `Enrich resources: <subfolder>/<article-name>`
3. If staleness check found stale neighbors: append their paths to the commit message body.
4. Append to `meta/resources-log.md`: `- **YYYY-MM-DD:** enrich | <path> — <one-line summary>`
5. Append work log entry to `## Day` zone of today's daily note.
6. Mark any matching task items as done.
7. **Stop.** Report completion. Do not auto-continue to the next article.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Article is meaningfully different from before (evolution check passed)
- [ ] All outbound links target existing files
- [ ] Back-links added for every new link
- [ ] Tag consistency verified
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: committed; log entry appended; daily note updated; stopped.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Enriched article | `resources/<path>.md` | Markdown |
| Back-linked articles | Various `resources/` paths | Markdown |
| `meta/tags.md` updates | `meta/` | Markdown |
| `meta/confluence-sync.json` updates | `meta/` | JSON registry |
| `meta/resources-log.md` entry | `meta/` | Append entry |
| Daily note work log | `journal/daily/<date>.md` Day zone | Append entry |
| Commit | Git history | Git commit |

## Error Handling

- **Article does not exist:** Ask the user whether to run `resource-ops create` first. Do not create an article here.
- **All sources return no new facts:** Apply the evolution check (Step 3.2) — at minimum sharpen one claim or make one link explicit. Never leave an article unchanged after touching it.
- **Confluence search returns no results for any strategy:** Note the failure; proceed without Confluence. Do not block.
- **Broken inbound link found in orphan scan:** Fix by adding a link from the closest related article. If no close relative exists, note in `## Changelog` as a future `create` candidate.

## Contracts

1. All steps are mandatory — no skipping.
2. One article per invocation. Stop and wait after committing.
3. Durable facts only. Discard meeting logistics, formatting boilerplate, and expiring status.
4. An article that is touched must be meaningfully different afterward.
5. Confluence and Jira are read-only sources — never write back.
6. Web search in Step 2f is not optional for articles with an external dimension.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 2f — Web gather | `url-fetcher` | custom | Yes — one per URL | Source count > 3 in Step 2f | Source note written to `resources/sources/`; 3–5 bullet fact summary |
| Step 2b — Confluence gather | `confluence-fetcher` | custom | Yes — one per page | Any Confluence page identified in Step 2b | Resource article update + 3–7 bullet facts; GDPR notes |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Staleness spot-check found stale neighbors | `resource-enrich` on neighbor articles (next session) |
| New node candidates identified in Step 2g | `resource-ops create` then `resource-enrich` |
| Graph has accumulated many candidates | `resource-plan` to generate full operation queue |
| Structural operation needed (merge, split) | `resource-ops` |
