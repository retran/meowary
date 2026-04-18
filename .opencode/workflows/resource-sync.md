---
updated: 2026-04-18
tags: []
---

# Resource-Sync

<summary>
> Synchronizes tracked Confluence pages with `resources/`. Discovers untracked pages, detects modified pages since last sync, ingests updates, rebuilds QMD index, runs health check. Primary mechanism for keeping graph current with Confluence.
</summary>

<role>
Systematic Confluence sync operator. Reads pages; NEVER writes to them. Extracts durable facts — not raw content. Pauses and asks user on content conflict. Runs full pipeline: discover → detect → ingest → index → health → commit.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| `meta/confluence-sync.json` | `meta/` | Yes |
| `CONFLUENCE_SPACES` env | `.env` | Yes for discovery |
| Last sync date | `meta/confluence-sync.json` | Yes for Step 2 |
</inputs>

<tiers>Not applicable. All steps run in sequence.</tiers>

<steps>

<step n="0" name="Load context">
1. READ today's daily note for matching tasks.
2. CHECK `meta/confluence-sync.json` for last sync date (Step 2).

<done_when>Daily note checked; last sync date noted.</done_when>
</step>

<step n="0.5" name="Clarify">
1. If scope ambiguous (full vs spaces): ASK.
2. CONFIRM spaces if `CONFLUENCE_SPACES` covers more than needed.
3. If targeted sync (specific page/space): NOTE before Step 1.

<done_when>Scope and target spaces confirmed.</done_when>
</step>

<step n="1" name="Discover untracked">
```
node .opencode/scripts/confluence-missing.js [SPACE...]
```

- Scans `CONFLUENCE_SPACES` from `.env`.
- Outputs page IDs not in `meta/confluence-sync.json`.
- For each worth monitoring: ADD entry with `synced: null`.
- Empty: skip to Step 2.

<done_when>Untracked identified; new entries added.</done_when>
</step>

<step n="2" name="Detect stale">
```
node .opencode/scripts/confluence-updates.js <last-sync-date> [SPACE...]
```

- Replace `<last-sync-date>` with last sync from Step 0.
- Outputs tracked pages modified since.
- Empty: skip to Step 3.

<done_when>Stale identified (Confluence `lastModified` > `synced`, or `synced: null`).</done_when>
</step>

<step n="3" name="Ingest stale" gate="HARD-GATE">
```
node .opencode/scripts/confluence-ingest.js
```

For each stale:
1. READ page via `confluence` skill.
2. IDENTIFY relevant articles (from `resources` hint or concept matching).
3. EXTRACT durable facts; update articles (follow `resource-enrich` Steps 3–6).
4. SET `synced` to today after each successful ingest.

Specific pages: `node .opencode/scripts/confluence-ingest.js PAGE_ID [PAGE_ID ...]`

**HARD-GATE:** If page content ambiguous or conflicts: PAUSE and ask user before continuing.

<subagent_trigger>1 stale: inline. ≥ 2 stale: spawn `confluence-fetcher` per page in parallel; integrate before Step 4. Each receives: page URL/ID, matching article path from `resources` hint (or "no existing article"), topic context from title+space. Returns: path written, 3–7 facts, GDPR notes, sync status. Agent: `.opencode/agents/confluence-fetcher.md`. If conflict flagged: PAUSE and ask user before Step 4.</subagent_trigger>

<done_when>All stale ingested; registry updated; conflicts resolved.</done_when>
</step>

<step n="4" name="Rebuild semantic index">
```
node .opencode/scripts/qmd-index.js
```

<done_when>QMD rebuilt.</done_when>
</step>

<step n="5" name="Graph health check">
```
node .opencode/scripts/health-all.js
```

- REVIEW: orphaned, staleness, tag inconsistencies.
- ADDRESS critical (broken links, orphaned in sync scope) before commit.
- NOTE non-critical in commit body.

<done_when>Health complete; critical addressed; non-critical noted.</done_when>
</step>

<step n="6" name="Commit">
```
git add resources/ meta/confluence-sync.json meta/tags.md
git commit -m "Confluence sync: N pages ingested; resources: D deleted, G merged, C created, U actualized"
```

<done_when>Commit with accurate counts.</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
1. APPEND to `meta/resources-log.md`:
   ```
   - **YYYY-MM-DD:** Confluence sync — N pages ingested; D deleted, G merged, C created, U actualized
   ```
2. APPEND work log to today's daily note `## Day`.
3. MARK matching tasks done.

<self_review>
- [ ] All `Done when` met
- [ ] All stale ingested; registry dates updated
- [ ] Health passed (no critical remaining)
- [ ] Commit counts match operations
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Log appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Updated articles | `resources/` | Markdown |
| Sync registry | `meta/confluence-sync.json` | JSON |
| Tag updates | `meta/tags.md` | Markdown |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **`confluence-missing.js` empty:** Proceed to Step 2.
- **`confluence-updates.js` empty:** Skip to Step 3.
- **Content conflict during ingest:** PAUSE. Ask user. NEVER silently overwrite.
- **`CONFLUENCE_SPACES` not set:** Ask user to confirm spaces or set env var. DO NOT guess.
- **Health critical issues:** Fix before commit. NEVER commit with broken links/orphaned in sync scope.
</error_handling>

<contracts>
1. NEVER write to Confluence — read-only.
2. Extract durable facts; discard logistics and expiring status.
3. Track provenance per page; parallel fetching via sub-agents allowed.
4. PAUSE and ask on content conflict.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 3 | `confluence-fetcher` | custom | Yes (per page) | Each stale page when ≥ 2 | Structured resource facts |
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Many new/updated after large sync | `resource-plan` |
| Articles need deeper enrichment | `resource-enrich` |
| New orphaned in health check | `resource-ops` to link/merge |
</next_steps>

<output_rules>Output language: English.</output_rules>
