---
name: confluence
description: Read Confluence pages and maintain Confluence tracking — search, fetch, record page IDs in sync registry and article frontmatter, and transform page content into resource facts. Load when fetching a Confluence page, enriching a resource from Confluence, or updating meta/confluence-sync.json.
compatibility: opencode
updated: 2026-04-18
---

<role>Confluence read/write CLI authority and Confluence → resource transformation rules.</role>

<summary>
> Read-only by default. NEVER create/edit/delete pages without explicit user approval. Distill durable facts into resource articles; record provenance in front matter `confluence:` and monitoring in `meta/confluence-sync.json`.
</summary>

<write_policy>
**NEVER create, edit, or delete Confluence pages without explicit user approval.**

Default: read-only. Before any write: ask "Should I write this to Confluence?" Proceed only on explicit yes.

`CONFLUENCE_READ_ONLY=true` enforces at CLI level.
</write_policy>

<steps>

<step n="1" name="check_before_fetch" condition="considering fetch">
1. Check article's `confluence:` front matter for existing page IDs. If cited and content sufficient, DO NOT re-fetch.
2. Check `meta/confluence-sync.json` for last `synced` date. If recent, local content may be current.
3. If neither sufficient, fetch.
</step>

<step n="2" name="fetch_page" condition="page ID known">
```bash
confluence read PAGE_ID                    # Preferred — unambiguous
confluence read PAGE_ID --format markdown  # Markdown
confluence info PAGE_ID                    # Metadata only
```
</step>

<step n="3" name="search_pages" condition="page ID unknown">
| Goal | Command |
|------|---------|
| Keyword search | `confluence search "keyword" --limit 10` |
| Title in space | `confluence find "Title" --space SPACEKEY` |
| Browse children | `confluence children ROOT_PAGE_ID --recursive --format tree` |
| Discover spaces | `confluence spaces` |

USE ≥2 strategies before concluding page does not exist.
</step>

<step n="4" name="record_page" condition="page fetched and used">

**A. Article `confluence:` front matter (provenance):**
```yaml
confluence: [123456789]
```
Records which pages contributed facts. Many-to-many.

**B. `meta/confluence-sync.json` (monitoring):**
```json
"PAGE_ID": {
  "title": "Page Title",
  "space": "SPACE_KEY",
  "synced": "YYYY-MM-DD",
  "resources": ["resources/domain/article.md"]
}
```

| Field | Content |
|-------|---------|
| `title` | Exact Confluence title |
| `space` | Space key (e.g. `ENG`) |
| `synced` | Last ingest date `YYYY-MM-DD`, or `null` |
| `resources` | Optional hint list of article paths |

Only register pages worth monitoring. Discovery scripts:
- `node .opencode/scripts/confluence-missing.js` — untracked pages in space
- `node .opencode/scripts/confluence-updates.js YYYY-MM-DD` — changed since date
</step>

<step n="5" name="transform_to_resources" condition="building resource articles">
**Extract:** durable facts only — decisions, process definitions, architecture, ownership, team structure.
**Discard:** meeting logistics, status updates, changelogs, formatting boilerplate.
**Condense:** 5-page Confluence doc → ~30-line resource article. Use tables/bullets. Quote numbers, dates, names.
**Split:** one page → multiple articles when distinct topics. Cross-link them.
**Merge:** multiple pages → one article when describing one topic. Track all IDs in `confluence:`.

`## Sources` section format:
```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```
</step>

<step n="6" name="write_with_approval" condition="user explicitly approved write" gate="HARD-GATE">
Ensure `CONFLUENCE_READ_ONLY=false` or unset.

- **Create:** `confluence create "Title" SPACEKEY --file content.md --format markdown`
- **Create child:** `confluence create-child "Title" PARENT_PAGE_ID --file content.md --format markdown`
- **Update:** `confluence update PAGE_ID --file content.md --format markdown` — show full new content first.
- **Delete:** `confluence delete PAGE_ID --yes` — confirm ID and title. Irreversible.
- **Move:** `confluence move PAGE_ID NEW_PARENT_ID` — same space only.

After any write: update `meta/confluence-sync.json`.
</step>

</steps>

<rules>
- Read-only by default. Ask before any write.
- Check frontmatter and `sync.json` first. DO NOT re-fetch sufficient content.
- Distill, never copy. Extract durable facts.
- Record provenance: add page IDs to `confluence:` front matter when extracting facts.
- `confluence read` accepts only page IDs or URLs with `pageId` query param — NOT display/pretty URLs.
</rules>

<self_review>
- [ ] Page ID in article front matter `confluence:`?
- [ ] Page ID in `meta/confluence-sync.json` (if monitoring)?
- [ ] PII stripped before storing?
- [ ] No write operations without explicit user approval?
</self_review>

<output_rules>Output in English. Preserve verbatim CLI commands, page IDs, and JSON structure.</output_rules>
