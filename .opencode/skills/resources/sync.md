---
name: resources/sync
description: Confluence sync — discover untracked pages, detect stale entries, ingest updated pages into resource articles
depends_on: resources
compatibility: opencode
---

## Workflow B: Confluence Sync

Synchronize tracked Confluence pages with local resource articles. The registry of monitored pages lives in `confluence-sync.json` at repo root. Article `confluence:` front matter records which pages informed each article (provenance).

### Step 1: Discover Untracked Pages

```
node scripts/confluence-missing.js [SPACE...]
```

Scans configured Confluence spaces (from `CONFLUENCE_SPACES` in `.env`). Outputs page IDs not yet in `confluence-sync.json`. If empty, skip to Step 2.

For each untracked page worth monitoring: add an entry to `confluence-sync.json` with `synced: null`.

### Step 2: Detect Stale Pages

```
node scripts/confluence-updates.js YYYY-MM-DD [SPACE...]
```

Replace `YYYY-MM-DD` with the date of the last sync pass. Shows tracked pages modified in Confluence since that date. If empty, skip to Step 3.

### Step 3: Ingest Stale Pages

```
node scripts/confluence-ingest.js
```

For each stale entry (Confluence `lastModified` > `synced`, or `synced: null`): dispatches OpenCode to read the page and update relevant resource articles. Sets `synced` to today after each successful ingest.

To ingest specific pages only:
```
node scripts/confluence-ingest.js PAGE_ID [PAGE_ID ...]
```

### Step 4: Rebuild Semantic Index

```
node scripts/qmd-index.js
```

### Step 5: Graph Health Check

```
node scripts/health-all.js
```

Review output: orphaned articles, staleness, tag inconsistencies. Address critical issues before committing.

### Step 6: Commit

```
git add resources/ confluence-sync.json tags.md
git commit -m "Confluence sync: N pages ingested; resources: D deleted, G merged, C created, U actualized"
```

### Step 7: Append to resources-log.md

```
- **YYYY-MM-DD:** Confluence sync — N pages ingested; D deleted, G merged, C created, U actualized
```

---

## Confluence Tracking Model

| Artifact | Purpose |
|----------|---------|
| `confluence-sync.json` | Operational registry — which pages to monitor, when last synced |
| Article `confluence: [PAGE_IDs]` | Provenance — which pages informed this article |

These are separate concerns. An article may cite many pages; a page may inform many articles. There is no 1:1 mapping.

To add a page to the monitoring registry manually, add an entry to `confluence-sync.json`:

```json
"PAGE_ID": {
  "title": "Page Title",
  "space": "SPACE_KEY",
  "synced": null,
  "resources": ["resources/domain/article.md"]
}
```

`resources` is an optional hint list — not authoritative. The ingest script uses it as a starting point for finding related articles.
