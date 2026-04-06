---
name: confluence
description: Read Confluence pages and maintain the local confluence map — search, fetch, record, and transform pages into resource source material
compatibility: opencode
---

## Setup

Environment variables (set in `.env` — see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `CONFLUENCE_DOMAIN` | Your instance domain, e.g. `your-instance.atlassian.net` |
| `CONFLUENCE_EMAIL` | Your Atlassian email |
| `CONFLUENCE_API_TOKEN` | Atlassian API token (same value as `ATLASSIAN_API_TOKEN`) |
| `CONFLUENCE_API_PATH` | Set to `/wiki/rest/api` for Atlassian Cloud |
| `CONFLUENCE_READ_ONLY` | `true` blocks all write operations at CLI level |

Run once to initialize the CLI config from these env vars:
```bash
confluence init
```

`CONFLUENCE_SPACES` in `.env` lists the default spaces to search (used by `scripts/`).

## Write Policy

**Never create, edit, or delete Confluence pages without explicit user approval.**

Default posture is read-only. Before any write operation, stop and ask: "Should I write this to Confluence?" Proceed only if the user explicitly says yes. When in doubt, describe the change and provide the text — let the user apply it.

`CONFLUENCE_READ_ONLY=true` enforces this at the CLI level — all write commands exit with an error until the user sets it to `false`.

## Fetching Pages

### Before fetching

1. Check `confluence-map.md` for an existing row. If the Summary is sufficient for the task, do not re-fetch.
2. If the row exists but the page may have changed since `Last Modified`, re-fetch.
3. If no row exists, fetch.

### How to fetch

```bash
# Read by page ID (preferred — unambiguous)
confluence read PAGE_ID

# Read in markdown format
confluence read PAGE_ID --format markdown
```

### Getting page info (metadata)

```bash
confluence info PAGE_ID
```

### Search strategies

When a page ID is not known:

```bash
# Text search (general keyword search)
confluence search "deployment pipeline" --limit 10

# Find by exact title in a specific space
confluence find "Release Process" --space ENG

# List child pages of a known page
confluence children PAGE_ID --recursive --format tree

# List all spaces (to discover space keys)
confluence spaces
```

| Goal | Command |
|------|---------|
| Search by keyword | `confluence search "keyword" --limit 10` |
| Find by title in space | `confluence find "Title" --space SPACEKEY` |
| Browse space pages | `confluence children ROOT_PAGE_ID --recursive` |
| Discover space keys | `confluence spaces` |

Use at least two strategies before concluding a page does not exist.

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
| Last Modified | Date from `confluence info`, or `—` if unknown |
| Summary | 1–3 sentences. Name decisions, numbers, components. No filler. |
| Tags | Backtick-quoted tags from `tags.md`. At least one. |

**Section:** Place the row under `## Space: <SpaceKey>`. Create the section if it does not exist.

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

When the user explicitly approves a write, first ensure `CONFLUENCE_READ_ONLY=false` or unset.

- **Create:** `confluence create "Title" SPACEKEY --file content.md --format markdown` — confirm space key, title, and content before running.
- **Create child:** `confluence create-child "Title" PARENT_PAGE_ID --file content.md --format markdown`
- **Update:** `confluence update PAGE_ID --file content.md --format markdown` — show the diff or full new content to the user first. Title-only: `confluence update PAGE_ID --title "New Title"`.
- **Delete:** `confluence delete PAGE_ID --yes` — confirm the page ID and title before running. Irreversible — double-check.
- **Move:** `confluence move PAGE_ID NEW_PARENT_ID` — same space only.

After any write, update `confluence-map.md` to reflect the change.

## Rules

- **Read-only by default.** Ask before any write. `CONFLUENCE_READ_ONLY=true` enforces this at CLI level.
- **Check the map first.** Do not re-fetch a page whose Summary is sufficient.
- **Summary quality.** State facts directly — no "this page describes". Name decisions, numbers, components.
- **At least one tag per row.** Use registered tags from `tags.md` only.
- **Update the map after every fetch.** Missing rows lead to duplicate fetches.
- **Distill, don't copy.** Extract durable facts. Discard ephemeral content.
- **URL reads:** `confluence read` only accepts page IDs or URLs with a `pageId` query param — not display/pretty URLs.
