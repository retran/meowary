---
description: Sync Confluence map and execute resource operations for new/modified pages
---

Sync the Confluence map and execute resource operations for new and modified pages. Load the `resources` skill and then `resources/sync.md` sub-skill before proceeding. Then execute Workflow B in full.

Arguments: `/r-sync` — no arguments. Operates on all configured Confluence spaces.

Execute all steps of **Workflow B** as defined in `.opencode/skills/resources/sync.md`:

1. Detect missing pages (`node scripts/confluence-missing.js`).
2. Add missing pages to `confluence-map.md` (batches of 10).
3. Detect recently modified pages (`node scripts/confluence-updates.js <last-changelog-date>`).
4. Update modified rows in `confluence-map.md`.
5. Backfill Last Modified dates (`node scripts/confluence-backfill-dates.js`).
6. Add changelog entry to `confluence-map.md`.
7. Produce an ordered resource operation plan from the actionable pages.
8. Execute operations (delete → merge → reclassify → split → create → actualize) loading `resources/operations` sub-skill for structural ops and Workflow A rules for actualize ops.
9. Rebuild semantic index (`node scripts/qmd-index.js`).
10. Graph health check (full orphan scan across all resources, staleness check, tag consistency).
11. Commit: `Confluence sync: N new pages, M updated; resource ops: D deleted, G merged, C created, U actualized`.
12. Append dated entry to `resources-log.md`.

$ARGUMENTS
