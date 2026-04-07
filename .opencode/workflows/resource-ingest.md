---
updated: 2026-04-07
tags: []
---

# Resource-Ingest

> Processes a single external source — a Confluence page, a web article, a document, a Jira issue, or a file — and distills it into the `resources/` knowledge graph. Outside-in: starts from a source and determines which resource articles to create or update. Use `resource-enrich` instead when starting from an existing article. One source per invocation. Invoke when external information arrives that warrants capturing in the knowledge graph.

## Role

Acts as a disciplined knowledge distiller. Reads the source fully before mapping it to articles. Extracts durable facts only — decisions, ownership, architecture, metrics, deadlines. Discards transient content (meeting logistics, formatting boilerplate, expiring status). Every fact added to a resource article must be traceable to the source. Never writes back to external sources.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Source reference (URL, page ID, issue key, path) | User invocation | Required |
| Target resource article(s) | User / QMD match | Optional |

## Complexity Tiers

Not applicable. Fixed-procedure workflow — all steps are mandatory.

## Steps

### Step 0 — Load context

1. Read the last entry in `dev-log.md` to understand current project and phase (if relevant).
2. Search `resources/` with `qmd query "<source topic>"` to identify related articles before fetching the source.
3. Read today's daily note to identify any matching tasks.

Done when: related resource articles identified; daily note checked.

### Step 0.5 — Clarify

Ask the user:
1. What is the source? (URL, Confluence page ID, Jira issue key, file path)
2. Is there a target resource article to update, or should a new article be created?
3. Any specific aspects to focus on?

Do not proceed until the source is identified.

Done when: source reference, target intent, and focus confirmed.

### Step 1 — Fetch the source

- **Confluence page:** fetch via `confluence` skill; record page ID and space.
- **Web URL:** fetch via web fetch tool; record URL and retrieval date.
- **Jira issue:** fetch via `jira` skill; record issue key and project.
- **File:** read from local path.
- Note source metadata: title, author, date, URL/ID.

**Sub-agent trigger:** For web URLs, spawn `url-fetcher` (`.opencode/agents/url-fetcher.md`) — pass the URL, source topic context, and target path `resources/sources/<slug>-<date>.md`; returns path written, 3–5 extracted facts, and source metadata. Run inline (no sub-agent) for Confluence, Jira, and file sources — those use the `confluence` skill, `jira` skill, or the Read tool respectively.

Done when: source content fetched; metadata noted.

### Step 2 — Assess content

1. Read the source in full.
2. Identify:
   - Core concepts covered
   - Durable facts (decisions, ownership, architecture, metrics, deadlines)
   - Transient content to discard (meeting logistics, status updates, boilerplate)
3. Ask yourself: is this source worth ingesting? If it contains only transient content, inform the user and stop.

Done when: durable facts identified; transient content categorised; ingestion decision made.

### Step 3 — Map to resource articles

1. Run `qmd query "<core concepts>"` to find existing resource articles covering the same topics.
2. For each relevant article found: note what can be added.
3. For concepts with no existing article: note them as create candidates.
4. If the mapping is ambiguous (e.g., two plausible target articles): ask the user to confirm before proceeding.

Done when: existing target articles identified; create candidates noted; ambiguities resolved.

### Step 4 — Update existing articles

For each target resource article:
1. Add new durable facts from the source.
2. Fill thin sections.
3. Replace inline explanations with links to the source's concepts.
4. Add the source to `## Sources` with provenance type: `[WEB]`, `[CONFLUENCE]`, `[JIRA]`, `[DOC]`.
5. Update `confluence:` front matter if the source is a Confluence page.
6. Update `updated` and `actualized` dates.
7. Append to `## Changelog`.

Done when: all target articles updated with durable facts and provenance.

### Step 5 — Create new articles (if needed)

For each create candidate confirmed by the user:
1. Create `resources/<subfolder>/<slug>.md` with the distilled content.
2. Apply progressive summarization (highlight + summary if >80 lines — ~80 lines is the threshold where a navigation summary helps readers).
3. Add to `tags.md` if new tags are needed.
4. Link from the nearest related article.

Done when: new articles created and linked from nearest relatives.

### Step 6 — Fix cross-references

1. For every new link A → B: add back-link in B's `## Related`.
2. Verify all outbound links in modified articles target existing files.

Done when: all back-links added; outbound links verified.

### Step 7 — Update registries

1. If source is Confluence: update `confluence-sync.json` with page ID, space, and `synced: today`.
2. Register any new tags in `tags.md`.

Done when: `confluence-sync.json` updated; tags registered.

### Step 8 — Commit and close

1. Stage: modified/created resource articles, `tags.md`, `confluence-sync.json`.
2. Commit: `Ingest resources: <source-title> → <N articles affected>`
3. Append to `resources-log.md`: `- **YYYY-MM-DD:** ingest | <source-type>: <source-title> → <N articles>`
4. Run QMD re-index: `node .opencode/scripts/qmd-index.js`
5. Append work log entry to `## Day` zone of today's daily note.
6. Mark any matching task items as done.

Done when: committed; log entry appended; QMD re-indexed; daily note updated.

## Outputs

| Output | Location |
|--------|----------|
| Updated resource articles | `resources/` |
| New resource articles | `resources/<subfolder>/` |
| `confluence-sync.json` updates | Repo root |
| `tags.md` updates | Repo root |
| `resources-log.md` entry | Repo root |
| Daily note work log | `journal/daily/<date>.md` Day zone |
| Commit | Git history |

## Error Handling

- **Source contains only transient content:** Inform the user; stop. Do not create or update articles from low-value sources.
- **QMD finds no relevant existing articles:** Treat the source as creating a new article. Confirm the subfolder and slug with the user before creating.
- **Ambiguous mapping (two plausible target articles):** Ask the user to confirm. Do not infer the target when two plausible choices exist.
- **Web URL fetch fails:** Note the failure; ask the user whether to try another fetch method or skip this source.
- **Confluence page requires authentication:** Note the failure; ask the user to confirm credentials are set in `.env`.

## Contracts

1. One source per invocation — batching obscures provenance.
2. Never write to external sources (Confluence, Jira) — read-only.
3. Ask before creating new articles if the mapping is ambiguous.
4. Every fact added must be traceable to the source — use `[WEB]`, `[CONFLUENCE]`, `[JIRA]`, `[DOC]` provenance tags.
5. Distill, don't mirror. A 10-page document may add 5 bullets to an existing article and create one new stub.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 1 — Fetch | `url-fetcher` | custom | No — single source | Source is a web URL | Source note written to `resources/sources/`; extracted facts and source metadata |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| New stub articles created | `resource-enrich` on each stub |
| Source referenced related concepts worth tracking | `resource-discover` for a broader gap scan |
| Many Confluence pages queued | `resource-sync` for batch sync |
| Graph health questionable after additions | `resource-plan` |
