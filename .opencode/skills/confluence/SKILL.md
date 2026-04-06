---
name: confluence
description: Read Confluence pages and maintain the local confluence map — search, fetch, record, and transform pages into resource source material
compatibility: opencode
---

## Write Policy

**Never create, edit, or delete Confluence pages without explicit user approval.**

Default posture is read-only. Before any write operation, stop and ask: "Should I write this to Confluence?" Proceed only if the user explicitly says yes. When in doubt, describe the change and provide the text — let the user apply it.

## Fetching Pages

### Before fetching

1. Check `confluence-map.md` for an existing row. If the Summary is sufficient for the task, do not re-fetch.
2. If the row exists but the page may have changed since `Last Modified`, re-fetch.
3. If no row exists, fetch.

### How to fetch

Use `atlassian_confluence_get_page` with `page_id`. Prefer page ID over title+space to avoid ambiguity.

### Search strategies

When a page ID is not known, use `atlassian_confluence_search` with CQL:

| Goal | CQL example |
|------|-------------|
| Page by exact title | `title = "Release Process" AND space = "ENG"` |
| Pages about a topic | `text ~ "deployment pipeline" AND type = page` |
| Pages in a space | `space = "ENG" AND type = page` |
| Recent pages | `space = "ENG" AND lastModified > "2026-01-01"` |
| Pages mentioning a person | `text ~ "Alice Smith" AND type = page` |

Use at least three strategies before concluding a page does not exist.

## Recording Pages in `confluence-map.md`

After fetching a page, add or update a row.

**Row format:**

```
| PAGE_ID | [Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) | PARENT | LAST_MODIFIED | Summary. | `#tag1` `#tag2` |
```

| Column | Content |
|--------|---------|
| Page ID | Confluence numeric page ID |
| Title | Exact page title, linked to Confluence URL |
| Parent | Parent page ID, or `root` for top-level pages |
| Last Modified | `version.when` date (YYYY-MM-DD), or `—` if unknown |
| Summary | 1–3 sentences. Name decisions, numbers, components. No filler. |
| Tags | Backtick-quoted tags from `tags.md`. At least one. |

**Section:** Place the row under `## Space: <SpaceKey>`. Create the section if it does not exist.

**Configured spaces:** See `CONFLUENCE_SPACES` in `.env` / `.env.example`. Base URL from `CONFLUENCE_URL`.

**Tag rules:**
- Use team tag for team-specific pages.
- Use topic tags for content covering a specific product area.
- Both can coexist.
- Do not create new tags without registering in `tags.md`.

## Transforming Pages into Resource Source Material

Confluence pages are raw material. Resource articles are refined output.

**What to extract:** Durable facts only — decisions, process definitions, architecture, ownership, team structure. Discard meeting logistics, ephemeral status updates, changelogs, and formatting boilerplate.

**Condensing:** A resource article is shorter than its source. Use tables and bullets. Quote specific numbers, dates, and names. A 5-page Confluence document might become 30 lines.

**One page → multiple articles:** Split when the page covers distinct topics belonging in different resource folders. Each article links to the other.

**Multiple pages → one article:** Merge when several pages describe aspects of one topic. Track all source page IDs in `confluence-map.md`.

**Source attribution:** Each resource article's `## Sources` section lists every Confluence page used:

```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```

## Writing to Confluence (with approval)

When the user explicitly approves a write:

- **Create:** Use `atlassian_confluence_create_page`. Confirm space key, parent page, title, and content before calling.
- **Update:** Use `atlassian_confluence_update_page`. Show the diff or full new content to the user first.
- **Delete:** Use `atlassian_confluence_delete_page`. Confirm the page ID and title before calling. Irreversible — double-check.

After any write, update `confluence-map.md` to reflect the change.

## Rules

- **Read-only by default.** Ask before any write.
- **Check the map first.** Do not re-fetch a page whose Summary is sufficient.
- **Summary quality.** State facts directly — no "this page describes". Name decisions, numbers, components.
- **At least one tag per row.** Use registered tags from `tags.md` only.
- **Update the map after every fetch.** Missing rows lead to duplicate fetches.
- **Distill, don't copy.** Extract durable facts. Discard ephemeral content.
