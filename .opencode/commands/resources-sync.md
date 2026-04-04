---
description: Sync Confluence map and execute resource operations for new/modified pages
---

Sync the Confluence map and execute resource operations for new and modified pages. Load the `resources` skill and then `resources/sync.md` sub-skill before proceeding. Then execute Workflow B in full.

Arguments: `/resources-sync` — no arguments. Operates on all configured Confluence spaces.

Execute all steps of **Workflow B** as defined in `.opencode/skills/resources/sync.md`:

1. Detect missing pages (`bash scripts/fetch-missing-pages.sh`).
2. Add missing pages to `confluence-map.md` (batches of 10).
3. Detect recently modified pages (`bash scripts/fetch-confluence-updates.sh <last-changelog-date>`).
4. Update modified rows in `confluence-map.md`.
5. Backfill Last Modified dates (`bash scripts/update-confluence-dates.sh`).
6. Add changelog entry to `confluence-map.md`.
7. Produce an ordered resource operation plan from the actionable pages.
8. Execute operations (delete → merge → reclassify → split → create → actualize) following Workflow D for structural ops and Workflow A rules for actualize ops.
9. Graph health check (full orphan scan across all resources, staleness check, tag consistency).
10. Commit: `Confluence sync: N new pages, M updated; resource ops: D deleted, G merged, C created, U actualized`.

$ARGUMENTS
