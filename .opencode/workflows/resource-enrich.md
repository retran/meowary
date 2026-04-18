---
updated: 2026-04-18
tags: []
---

# Resource-Enrich

<summary>
> Single-article enrichment of `resources/`. Gathers data from all sources (local, Confluence, Jira, codebase, journal, web), enriches content, applies progressive summarization, fixes cross-references, updates metadata. One article per invocation. Inside-out: starts from article. Use `resource-ingest` when starting from a source.
</summary>

<role>
Systematic knowledge graph curator. Enriches from all sources — NEVER stops after first hit per channel. Extracts durable facts only; discards transient. Touched articles MUST be meaningfully different — evolution check non-negotiable. Tracks provenance in `## Changelog`. Commits and stops; NEVER auto-continues.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Article path | User invocation | Yes |
| `resources-actualize-plan.md` | Repo root | Optional |
</inputs>

<tiers>Not applicable. All steps mandatory. No tiers, no skipping.</tiers>

<steps>

<step n="0" name="Load context">
1. READ today's daily note for matching tasks.
2. If `resources-actualize-plan.md` exists: READ `actualize` row for this article — note `Details`, `Missing Cross-References`, `Notes`.
3. If article does not exist: ASK user to run `resource-ops create` first, then return.

<done_when>Daily note checked; plan row read; article existence confirmed.</done_when>
</step>

<step n="0.5" name="Clarify" gate="SOFT-GATE">
**SOFT-GATE:** Confirm target and scope.

1. If path not specified: ASK which article (search `resources/`).
2. CONFIRM scope: full enrichment or targeted section update.

DO NOT proceed until target unambiguous.

<done_when>Path and scope confirmed.</done_when>
</step>

<step n="1" name="Read and understand">
1. READ article in full: front matter, body, `## Related`, `## Changelog`.
2. NOTE `status`, `updated`, `actualized`, `tags`, `confluence:`, outbound links.
3. IDENTIFY 3–8 key terms for source searches.
4. NOTE candidate new nodes (concepts mentioned with no article).

<done_when>Article read; terms and candidates identified.</done_when>
</step>

<step n="2" name="Gather from all sources">
Run all sub-steps. NEVER stop after first hit.

**2a Local:** QMD + ripgrep across `resources/`; check tag siblings, same-subfolder; identify missing back-links.

**2b Confluence:** ≥3 strategies (exact title, domain terms, synonyms, people/components, tags); extract durable facts; add page IDs to `confluence:` front matter and `meta/confluence-sync.json`.

**2c Jira:** ≥2 strategies (component/feature, project key, epics, people); durable facts only (decisions, deadlines, ownership).

**2d Codebase:** Verify file paths, components, architecture against current code; correct stale technical details.

**2e Journal:** Search key terms across `journal/daily/`, `journal/weekly/`, `projects/`; extract durable facts; discard transient.

**2f Web:** Proactively search for recent developments, official docs, external references. NEVER skip if topic has external dimension. Durable facts only.

**2g Entity extraction:** Scan all material for named entities/concepts with no article; note in `## Changelog` as `create` candidates for next `resource-plan`.

**Person-file priority:** For `resources/people/`, prioritize Confluence (roster, org chart) and Jira (assignee/reporter). Codebase lower unless person owns specific tech areas.

<subagent_trigger>Spawn `url-fetcher` (`.opencode/agents/url-fetcher.md`) for web sources when count > 3 in 2f — pass URL, topic context, target `resources/sources/<article-slug>-<date>.md`; returns path + 3–5 facts. Spawn `confluence-fetcher` (`.opencode/agents/confluence-fetcher.md`) per Confluence page in 2b — pass URL/ID, matching article path, topic context; returns 3–7 facts + GDPR notes. Both parallel when count > 3; inline when ≤ 3.</subagent_trigger>

<done_when>All channels queried; sub-agents returned; facts gathered.</done_when>
</step>

<step n="3" name="Enrich article">
1. ADD durable facts; fill thin sections; replace inline explanations with links.
2. DO NOT split, merge, rename, create here — note candidates in `## Changelog`.

<done_when>Body updated with durable facts; no structural changes.</done_when>
</step>

<step n="3.1" name="Progressive summarization">
- **Layer 1 Highlight:** Bold key phrases per section (~10–20% of body; more dilutes emphasis).
- **Layer 2 Summary:** If body > ~80 lines, add/update `## Summary` with 3–5 self-contained bullets.
- **Layer 3 Synthesize:** If connected to ≥ 3 articles on shared theme, add one-sentence synthesis note linking them.

<done_when>Highlights applied; summary if > ~80 lines; synthesis if ≥ 3 connections.</done_when>
</step>

<step n="3.2" name="Evolution check">
If re-reading adds no new facts: sharpen one claim, make one implied link explicit, or expand one thin section. Touched articles MUST be meaningfully different.

<done_when>≥ 1 meaningful change confirmed.</done_when>
</step>

<step n="3.3" name="Synthesis check">
If two newly linked articles suggest insight neither contains alone: append synthesis candidate to `## Changelog`.

<done_when>Synthesis candidate documented if applicable.</done_when>
</step>

<step n="4" name="Remove outdated">
1. REMOVE facts contradicted by sources; remove disbanded teams, deprecated processes, renamed components, resolved speculation.
2. If entirely obsolete: SET `status: outdated`; add blockquote at top.

<done_when>Outdated removed or status updated.</done_when>
</step>

<step n="5" name="Fix cross-references">
1. VERIFY every outbound link targets existing file; fix or remove broken.
2. For every new link A → B: ADD back-link in B's `## Related`.
3. DROP links to archived/deleted; FIX links to renamed/moved.

<done_when>All outbound verified; back-links added.</done_when>
</step>

<step n="6" name="Update metadata">
1. SET `updated` and `actualized` to today.
2. APPEND to `## Changelog`: `- **YYYY-MM-DD:** <what changed>.`
3. UPDATE `## Sources`; update `confluence:` front matter; verify tags; register new in `meta/tags.md`.

<done_when>Front matter updated; changelog appended; tags verified.</done_when>
</step>

<step n="7" name="Graph health check">
**7a Orphan scan:** `node .opencode/scripts/find-backlinks.js <article-path>`. Zero inbound = orphaned; fix by linking from closest related. (People exempt.)

**7b Tag consistency:** All tags in `meta/tags.md`. Inline `#tags` match front matter.

**7c Staleness spot-check:** Same-subfolder articles sharing tags; flag (not fix) those with `actualized` > 2 weeks old or Confluence pages modified since `actualized`.

<done_when>Orphan check done/fixed; tags verified; stale neighbors flagged.</done_when>
</step>

<step n="8" name="Close" gate="END-GATE">
1. STAGE: article, back-linked articles, new articles, `meta/tags.md`, `meta/confluence-sync.json`.
2. COMMIT: `Enrich resources: <subfolder>/<article-name>`
3. If staleness found neighbors: append paths to commit body.
4. APPEND to `meta/resources-log.md`: `- **YYYY-MM-DD:** enrich | <path> — <one-line summary>`
5. APPEND work log to today's daily note `## Day`.
6. MARK matching tasks done.
7. **STOP.** Report completion. NEVER auto-continue.

<self_review>
- [ ] All `Done when` met
- [ ] Article meaningfully different (evolution check passed)
- [ ] All outbound links target existing files
- [ ] Back-links added for every new link
- [ ] Tag consistency verified
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Committed; log appended; daily note updated; stopped.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Enriched article | `resources/<path>.md` | Markdown |
| Back-linked articles | Various `resources/` paths | Markdown |
| Tag updates | `meta/tags.md` | Markdown |
| Sync registry | `meta/confluence-sync.json` | JSON |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **Article missing:** Ask user to run `resource-ops create`. NEVER create here.
- **All sources no new facts:** Apply evolution check (3.2) — sharpen one claim or make one link explicit. NEVER leave unchanged after touching.
- **Confluence search no results:** Note failure; proceed without. DO NOT block.
- **Broken inbound link in orphan scan:** Fix from closest related. If none: note in `## Changelog` as future `create` candidate.
</error_handling>

<contracts>
1. All steps mandatory — no skipping.
2. One article per invocation. Stop after commit.
3. Durable facts only. Discard meeting logistics, boilerplate, expiring status.
4. Touched articles MUST be meaningfully different.
5. Confluence and Jira read-only — NEVER write back.
6. Web search in 2f NOT optional for external-dimension articles.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 2f Web gather | `url-fetcher` | custom | Yes (per URL) | Source count > 3 in 2f | Source note in `resources/sources/`; 3–5 fact bullets |
| 2b Confluence gather | `confluence-fetcher` | custom | Yes (per page) | Any Confluence page in 2b | Article update + 3–7 facts; GDPR notes |
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Stale neighbors flagged | `resource-enrich` on neighbors (next session) |
| New node candidates in 2g | `resource-ops create` then `resource-enrich` |
| Many candidates accumulated | `resource-plan` |
| Structural op needed | `resource-ops` |
</next_steps>

<output_rules>Output language: English.</output_rules>
