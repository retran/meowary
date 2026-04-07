---
updated: 2026-04-07
tags: []
---

# Resource-Sync

> Synchronizes tracked Confluence pages with the local `resources/` knowledge graph. Discovers untracked pages worth monitoring, detects pages modified since the last sync, ingests updated content into resource articles, rebuilds the QMD semantic index, and runs a graph health check. The primary mechanism for keeping the knowledge graph current with Confluence.

## Role

Acts as a systematic Confluence sync operator. Reads Confluence pages; never writes to them. Extracts durable facts — not raw page content. Pauses and asks the user when a content conflict is encountered. Runs the full pipeline: discover → detect → ingest → index → health check → commit.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| `confluence-sync.json` | Repo root | Required |
| `CONFLUENCE_SPACES` env var | `.env` | Required for discovery |
| Last sync date | `confluence-sync.json` | Required for Step 2 |

## Complexity Tiers

Not applicable. Fixed-procedure workflow — all steps run in sequence.

## Steps

### Step 0 — Load context

1. Read today's daily note — find any tasks matching this sync.
2. Check `confluence-sync.json` for the date of the last sync pass (used in Step 2).

Done when: daily note checked; last sync date noted.

### Step 0.5 — Clarify

1. If the scope is ambiguous (full sync vs. specific spaces), ask the user.
2. Confirm which Confluence spaces to scan if `CONFLUENCE_SPACES` env var covers more than needed.
3. If this is a targeted sync for a specific page or space, note that before Step 1.

Done when: sync scope and target spaces confirmed.

### Step 1 — Discover untracked pages

```
node .opencode/scripts/confluence-missing.js [SPACE...]
```

- Scans configured Confluence spaces (from `CONFLUENCE_SPACES` in `.env`).
- Outputs page IDs not yet in `confluence-sync.json`.
- For each untracked page worth monitoring: add an entry to `confluence-sync.json` with `synced: null`.
- If output is empty: skip to Step 2.

Done when: untracked pages identified; new entries added to `confluence-sync.json`.

### Step 2 — Detect stale pages

```
node .opencode/scripts/confluence-updates.js <last-sync-date> [SPACE...]
```

- Replace `<last-sync-date>` with the date of the last sync pass from Step 0.
- Outputs tracked pages modified in Confluence since that date.
- If output is empty: skip to Step 3.

Done when: stale pages identified (pages with Confluence `lastModified` > `synced`, or `synced: null`).

### Step 3 — Ingest stale pages

```
node .opencode/scripts/confluence-ingest.js
```

For each stale entry:
1. Read the Confluence page via the `confluence` skill.
2. Identify relevant resource articles (from `confluence-sync.json` `resources` hint or by concept matching).
3. Extract durable facts; update resource articles (follow `resource-enrich` Steps 3–6 for each article).
4. Set `synced` to today in `confluence-sync.json` after each successful ingest.

To ingest specific pages only: `node .opencode/scripts/confluence-ingest.js PAGE_ID [PAGE_ID ...]`

If a page's content is ambiguous or conflicts with existing resource content: **pause and ask the user** how to resolve before continuing.

**Sub-agent trigger:** When only 1 stale page exists, run inline. When ≥2 stale pages exist, spawn one `confluence-fetcher` agent per page in parallel; integrate results before Step 4. Each agent receives: the Confluence page URL or ID, the matching resource article path from `confluence-sync.json` `resources` hint (or "no existing article" if none), and a topic context derived from the page title and space. Returns: path written, 3–7 extracted facts, GDPR notes, and sync registry update status. Agent file: `.opencode/agents/confluence-fetcher.md`. If any agent returns a conflict: it flags it; pause and ask the user to resolve before proceeding to Step 4.

Done when: all stale pages ingested; sync registry updated; conflicts resolved.

### Step 4 — Rebuild semantic index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

### Step 5 — Graph health check

```
node .opencode/scripts/health-all.js
```

- Review output: orphaned articles, staleness, tag inconsistencies.
- Address **critical** issues (broken links, orphaned articles in the sync scope) before committing.
- Note non-critical issues in the commit message body for follow-up.

Done when: health check complete; critical issues addressed; non-critical issues noted.

### Step 6 — Commit

```
git add resources/ confluence-sync.json tags.md
git commit -m "Confluence sync: N pages ingested; resources: D deleted, G merged, C created, U actualized"
```

Done when: commit created with accurate counts.

### Step 7 — Close

1. Append to `resources-log.md`:
   ```
   - **YYYY-MM-DD:** Confluence sync — N pages ingested; D deleted, G merged, C created, U actualized
   ```
2. Append work log entry to `## Day` zone of today's daily note.
3. Mark any matching task items as done.

Done when: log entry appended; daily note updated.

## Outputs

| Output | Location |
|--------|----------|
| Updated resource articles | `resources/` |
| Updated `confluence-sync.json` | Repo root |
| Updated `tags.md` | Repo root |
| `resources-log.md` entry | Repo root |
| Daily note work log | `journal/daily/<date>.md` Day zone |
| Commit | Git history |

## Error Handling

- **`confluence-missing.js` returns empty:** No untracked pages — proceed to Step 2.
- **`confluence-updates.js` returns empty:** No stale pages — skip to Step 3.
- **Content conflict during ingest:** Pause. Ask the user how to resolve. Do not silently overwrite existing resource content.
- **`CONFLUENCE_SPACES` not set:** Ask the user to confirm which spaces to scan or set the env var. Do not guess.
- **Health check finds critical issues:** Fix before committing. Do not commit with broken links or orphaned articles in the sync scope.

## Contracts

1. Never write to Confluence — read-only external.
2. Extract durable facts; discard meeting logistics and expiring status.
3. One page at a time during ingest.
4. Pause and ask the user if a content conflict is encountered during ingest.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Many new/updated articles after a large sync | `resource-plan` to review the graph |
| Individual articles need deeper enrichment | `resource-enrich` on specific articles |
| New orphaned articles discovered in health check | `resource-ops` to link or merge |
