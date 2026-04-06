---
name: resources/sync
description: Confluence map sync — detect new and modified pages, update the map, produce a typed resources operation plan, execute operations
depends_on: resources
compatibility: opencode
---

## Workflow B: Confluence Map Sync

Scan all configured Confluence spaces for new and modified pages, update the map, produce a typed operation plan for resource changes, execute the operations, and commit.

### Step 1: Detect Missing Pages

Run the missing-pages script:

```
node scripts/confluence-missing.js
```

Scans configured Confluence spaces (set in `CONFLUENCE_SPACES` — see `.env.example`). Pass space keys as arguments to limit the scan. Output: table of page IDs not yet in the map. If empty, skip to Step 3.

### Step 2: Add Missing Pages

Load the `confluence` skill for the row format and tag rules.

For each missing page ID:

1. Fetch the page via `confluence read <page_id>`.
2. Determine the parent from the `ancestors` array. Use the immediate parent's page ID. Write `root` if the page has no ancestors.
3. Write a one-to-three-sentence summary. Name decisions, numbers, components, ownership. No filler ("this page describes...").
4. Assign tags from `tags.md`. Every row needs at least one tag.
5. Append a row to the correct `## Space: <key>` section in `confluence-map.md`, before `## Changelog`.

**Row format:**

```
| PAGE_ID | [Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) | PARENT | — | Summary. | `#tag1` `#tag2` |
```

Set `Last Modified` to `—` — the date script fills it in Step 5.

**New space:** If a page belongs to a space not yet in the map, add a `## Space: <SpaceKey>` section before `## Changelog` with the space key line and table headers, then insert the row.

**Tag rules:** Use the team tag for team-specific pages. Use topic tags for content covering a specific product area. Both can coexist. Do not create new tags without registering them in `tags.md`.

Process in batches of 10. Save after each batch.

### Step 3: Detect Recently Modified Pages

Run the updates script:

```
node scripts/confluence-updates.js YYYY-MM-DD
```

Replace `YYYY-MM-DD` with the date of the last `## Changelog` entry in `confluence-map.md`. Scans configured spaces by default. If output is empty, skip to Step 5.

### Step 4: Update Modified Rows

For each modified page ID:

1. Fetch the current content via `confluence read <page_id>`.
2. Update `Summary` and `Tags` if the content changed meaningfully.
3. Leave `Last Modified` as-is — Step 5 overwrites it.

### Step 5: Backfill Last Modified Dates

Run the dates script:

```
node scripts/confluence-backfill-dates.js
```

The script reads credentials from `.env` (see `.env.example`), calls the Confluence REST API for each row, and writes `version.when` dates in place.

### Step 6: Add Changelog Entry

Append a dated entry to `## Changelog` in `confluence-map.md`:

```
- **YYYY-MM-DD:** <what changed>
```

### Step 7: Produce Operation Plan

Before touching any resource articles, do a full analysis across all actionable pages from Steps 2 and 4. The goal is to see the complete picture and plan resource changes as **typed operations**, not page-by-page.

**Filter the work set.** Skip pages that are folders, stubs, indexes, sprint reviews, changelogs, announcements, or meeting notes without durable decisions. Keep pages containing architecture decisions, process definitions, team structure, codebase descriptions, or person profiles.

**For each page in the work set**, fetch its content and extract:

- **Named entities:** people, teams, components, systems, services, Jira projects, namespaces.
- **Concepts:** processes, patterns, standards, decisions, frameworks, methodologies.
- **Relationships:** ownership, dependencies, supersessions, replacements, migrations.

**Aggregate across the full work set:**

- Deduplicate: the same concept appearing in multiple pages is one candidate, not many.
- Group related concepts that belong in the same article.
- Cross-reference every candidate against `knowledge-graph.md`.

**Produce an ordered operation list** using the same format and ordering rules as [Workflow C Step 4](plan.md#step-4-produce-the-operation-plan):

| # | Op | Target | Details |
|---|-----|--------|---------|
| 1 | delete | ... | ... |
| 2 | merge | ... ← ... | ... |
| 3 | reclassify | ... → ... | ... |
| 4 | split | ... → ... + ... | ... |
| 5 | create | ... | What concept; source page IDs |
| 6 | actualize | ... | What new facts to merge; source page IDs |

**Operation types** (same definitions as [operations.md](operations.md)):
- `delete` — article is a stub, duplicate, or obsolete.
- `merge` — two articles cover the same concept. Surviving article absorbs the other.
- `reclassify` — article is in the wrong subfolder or needs renaming.
- `split` — article covers multiple distinct concepts. Extract into separate articles.
- `create` — concept has no article but is substantial enough to be a graph node. List source Confluence page IDs.
- `actualize` — existing article needs enrichment with new facts from Confluence. List what facts and source page IDs.

**Ordering rules:** delete → merge → reclassify → split → create → actualize. This cleans up the graph before growing it.

Do not create or edit any resource articles yet. The operation list is input to Step 8.

### Step 8: Execute Operations

Execute each operation from Step 7 in order, loading the `resources/operations` sub-skill ([operations.md](operations.md)) for each operation type:

**Structural operations** (`delete`, `merge`, `reclassify`, `split`):
Follow the operations.md procedure for that type exactly. These change graph structure.

**`create` operations:**
Follow the operations.md Create procedure. Use source Confluence page IDs from the plan to gather facts.

**`actualize` operations:**
Merge new durable facts from the source Confluence pages into the existing article:
- Discard ephemeral content (meeting logistics, status updates, formatting boilerplate).
- Add concrete details: numbers, dates, component names, ownership, versions.
- Update `## Sources`, `updated`, `actualized` (set to today), `## Changelog`.
- Add bidirectional cross-references.
- Follow the same metadata and health rules as [Workflow A Steps 4–7](enrich.md#step-4-remove-outdated-content).

Process in batches of 10. Save after each batch.

### Step 9: Rebuild Semantic Index

Run `node scripts/qmd-index.js` to rebuild the QMD semantic index after structural changes.

### Step 10: Graph Health Check

Run `node scripts/health-all.js` for a full health report. Review and address:

1. **Orphan scan.** Articles in `resources/` (excl. `people/`) with no inbound links. Fix by adding a cross-reference from a related article, or flag for review. Report orphans in the commit message.
2. **Staleness check.** For pages updated in Step 4, compare Confluence `Last Modified` against the resource article's `actualized` date. Set `status: outdated` if facts drifted and cannot be fixed now.
3. **Tag consistency.** Verify front matter `tags` match the `knowledge-graph.md` row for every article created or updated in Step 8.

### Step 11: Commit

```
git add resources/ confluence-map.md knowledge-graph.md tags.md
git commit -m "Confluence sync: N new pages, M updated; resources ops: D deleted, G merged, C created, U actualized"
```

### Step 12: Append to resources-log.md

Append a dated entry to `resources-log.md` at the repo root:

```
- **YYYY-MM-DD:** Confluence sync — N new pages, M updated; D deleted, G merged, C created, U actualized
```
