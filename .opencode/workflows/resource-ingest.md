---
updated: 2026-04-18
tags: []
---

# Resource-Ingest

<summary>
> Processes one external source (Confluence page, web article, doc, Jira issue, file) and distills it into `resources/`. Outside-in: starts from source. Use `resource-enrich` when starting from existing article. One source per invocation.
</summary>

<role>
Disciplined knowledge distiller. Reads source fully before mapping to articles. Extracts durable facts only — decisions, ownership, architecture, metrics, deadlines. Discards transient. Every fact traceable to source. NEVER writes back to external sources.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Source ref (URL, page ID, issue key, path) | User invocation | Yes |
| Target article(s) | User / QMD match | Optional |
</inputs>

<tiers>Not applicable. All steps mandatory.</tiers>

<steps>

<step n="0" name="Load context">
1. READ active project's dev-log if invoked in project context.
2. SEARCH `resources/` with `qmd query "<source topic>"` before fetching.
3. READ today's daily note for matching tasks.

<done_when>Related articles identified; daily note checked.</done_when>
</step>

<step n="0.5" name="Clarify" gate="SOFT-GATE">
**SOFT-GATE:** ASK:
1. What is the source? (URL, page ID, issue key, path)
2. Target article to update, or create new?
3. Specific aspects to focus?

DO NOT proceed until source identified.

<done_when>Source, target intent, focus confirmed.</done_when>
</step>

<step n="1" name="Fetch source">
- **Confluence:** fetch via `confluence` skill; record page ID and space.
- **Web URL:** fetch via web tool; record URL and date.
- **Jira:** fetch via `jira` skill; record issue key and project.
- **File:** Read tool from local path.
- NOTE metadata: title, author, date, URL/ID.

<subagent_trigger>For web URLs: spawn `url-fetcher` (`.opencode/agents/url-fetcher.md`) — pass URL, topic context, target `resources/sources/<slug>-<date>.md`; returns path + 3–5 facts + metadata. Inline (no agent) for Confluence/Jira/file (use respective skills/Read).</subagent_trigger>

<done_when>Source fetched; metadata noted.</done_when>
</step>

<step n="2" name="Assess content">
1. READ source in full.
2. IDENTIFY:
   - Core concepts
   - Durable facts (decisions, ownership, architecture, metrics, deadlines)
   - Transient to discard (logistics, status, boilerplate)
3. ASK: worth ingesting? If transient-only: inform user, STOP.

<done_when>Durable facts identified; transient categorized; ingestion decision made.</done_when>
</step>

<step n="3" name="Map to articles">
1. RUN `qmd query "<core concepts>"` to find existing articles.
2. For each: note what to add.
3. For concepts without article: note as create candidates.
4. Ambiguous mapping (two plausible targets): ASK user before proceeding.

<done_when>Targets identified; create candidates noted; ambiguities resolved.</done_when>
</step>

<step n="4" name="Update existing">
For each target:
1. ADD durable facts.
2. FILL thin sections.
3. REPLACE inline explanations with links.
4. ADD source to `## Sources` with provenance: `[WEB]`, `[CONFLUENCE]`, `[JIRA]`, `[DOC]`.
5. UPDATE `confluence:` front matter if Confluence source.
6. UPDATE `updated` and `actualized`.
7. APPEND `## Changelog`.

<done_when>All targets updated with facts and provenance.</done_when>
</step>

<step n="5" name="Create new" condition="User-confirmed candidates">
For each confirmed:
1. CREATE `resources/<subfolder>/<slug>.md` with distilled content.
2. APPLY progressive summarization (highlight + summary if > ~80 lines).
3. ADD to `meta/tags.md` if new tags.
4. LINK from nearest related article.

<done_when>New articles created and linked.</done_when>
</step>

<step n="6" name="Fix cross-references">
1. For every new link A → B: ADD back-link in B's `## Related`.
2. VERIFY all outbound links in modified articles target existing files.

<done_when>Back-links added; outbound verified.</done_when>
</step>

<step n="7" name="Update registries">
1. If Confluence: UPDATE `meta/confluence-sync.json` with page ID, space, `synced: today`.
2. REGISTER new tags in `meta/tags.md`.

<done_when>Registries updated.</done_when>
</step>

<step n="8" name="Close" gate="END-GATE">
1. STAGE: modified/created articles, `meta/tags.md`, `meta/confluence-sync.json`.
2. COMMIT: `Ingest resources: <source-title> → <N articles affected>`
3. APPEND to `meta/resources-log.md`: `- **YYYY-MM-DD:** ingest | <source-type>: <source-title> → <N articles>`
4. RUN `node .opencode/scripts/qmd-index.js`
5. APPEND work log to today's daily note `## Day`.
6. MARK matching tasks done.

<self_review>
- [ ] All `Done when` met
- [ ] Source notes have proper front matter
- [ ] Articles created/updated from source
- [ ] Links between sources and resources established
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Committed; log appended; QMD re-indexed; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Updated articles | `resources/` | Markdown |
| New articles | `resources/<subfolder>/` | Markdown |
| Sync registry | `meta/confluence-sync.json` | JSON |
| Tag updates | `meta/tags.md` | Markdown |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **Transient-only source:** Inform user; STOP. NEVER create from low-value sources.
- **QMD finds no relevant articles:** Treat as new article. Confirm subfolder/slug with user before creating.
- **Ambiguous mapping:** Ask user. NEVER infer when two plausible.
- **Web fetch fails:** Note; ask whether to try another method or skip.
- **Confluence requires auth:** Note; ask user to confirm `.env` credentials.
</error_handling>

<contracts>
1. One source per invocation — batching obscures provenance.
2. NEVER write to external sources (Confluence, Jira) — read-only.
3. Ask before creating if mapping ambiguous.
4. Every fact traceable — use `[WEB]`/`[CONFLUENCE]`/`[JIRA]`/`[DOC]` provenance.
5. Distill, don't mirror. 10-page doc may add 5 bullets + 1 stub.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 1 Fetch | `url-fetcher` | custom | No (single source) | Source is web URL | Source note in `resources/sources/`; facts + metadata |
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| New stubs created | `resource-enrich` per stub |
| Source referenced related concepts | `resource-discover` |
| Many Confluence pages queued | `resource-sync` |
| Graph health questionable | `resource-plan` |
</next_steps>

<output_rules>Output language: English.</output_rules>
