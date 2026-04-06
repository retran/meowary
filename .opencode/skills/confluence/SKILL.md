---
name: confluence
description: Read Confluence pages and maintain Confluence tracking — search, fetch, record in sync registry and article frontmatter, transform pages into resource source material
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

Default posture is read-only. Before any write operation, stop and ask: "Should I write this to Confluence?" Proceed only if the user explicitly says yes.

`CONFLUENCE_READ_ONLY=true` enforces this at the CLI level.

## Fetching Pages

### Before fetching

1. Check the article's `confluence:` front matter for existing page IDs. If the article already cites the page and the content is sufficient, do not re-fetch.
2. Check `confluence-sync.json` for the page's last `synced` date. If synced recently, the local content may still be current.
3. If neither check is sufficient, fetch.

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

## Recording Pages

After fetching a page, record it in two places:

### 1. Article `confluence:` front matter (provenance)

Add the page ID to the `confluence:` list in any resource article the page informed:

```yaml
confluence: [123456789]
```

This records which pages contributed facts to this article. One article may cite many pages; one page may inform many articles.

### 2. `confluence-sync.json` (monitoring registry)

Add the page to the monitoring registry if you want to be notified when it changes:

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
| `title` | Exact Confluence page title |
| `space` | Space key (e.g. `ENG`, `TEAM`) |
| `synced` | Date we last ingested this page into resource articles (`YYYY-MM-DD`), or `null` |
| `resources` | Optional hint list of resource article paths this page informs |

Not every fetched page needs to be in `confluence-sync.json` — only pages worth monitoring for changes. Use `node scripts/confluence-missing.js` to discover untracked pages in a space, and `node scripts/confluence-updates.js YYYY-MM-DD` to check which tracked pages have changed since a given date.

## Transforming Pages into Resource Source Material

Confluence pages are raw material. Resource articles are refined output.

**What to extract:** Durable facts only — decisions, process definitions, architecture, ownership, team structure. Discard meeting logistics, ephemeral status updates, changelogs, and formatting boilerplate.

**Condensing:** A resource article is shorter than its source. Use tables and bullets. Quote specific numbers, dates, and names. A 5-page Confluence document might become 30 lines.

**One page → multiple articles:** Split when the page covers distinct topics belonging in different resource folders. Each article links to the other.

**Multiple pages → one article:** Merge when several pages describe aspects of one topic. Track all source page IDs in the article's `confluence:` front matter.

**Source attribution:** Each resource article's `## Sources` section lists every Confluence page used:

```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```

## Writing to Confluence (with approval)

When the user explicitly approves a write, first ensure `CONFLUENCE_READ_ONLY=false` or unset.

- **Create:** `confluence create "Title" SPACEKEY --file content.md --format markdown`
- **Create child:** `confluence create-child "Title" PARENT_PAGE_ID --file content.md --format markdown`
- **Update:** `confluence update PAGE_ID --file content.md --format markdown` — show full new content to user first.
- **Delete:** `confluence delete PAGE_ID --yes` — confirm page ID and title. Irreversible.
- **Move:** `confluence move PAGE_ID NEW_PARENT_ID` — same space only.

After any write, update `confluence-sync.json` to reflect the change.

## Rules

- **Read-only by default.** Ask before any write.
- **Check frontmatter and sync.json first.** Do not re-fetch a page whose content is sufficient.
- **Distill, don't copy.** Extract durable facts. Discard ephemeral content.
- **Record provenance.** Add page IDs to `confluence:` front matter whenever you extract facts.
- **URL reads:** `confluence read` only accepts page IDs or URLs with a `pageId` query param — not display/pretty URLs.
