---
description: Run resources graph review and produce an operation plan
---

Run a full resources graph review and produce an ordered operation plan. Load the `resources` skill and then `resources/plan.md` sub-skill before proceeding. Then execute Workflow C in full.

Arguments: `/r-plan` — no arguments. Operates on all resources.

Execute all steps of **Workflow C** as defined in `.opencode/skills/resources/plan.md`:

1. Read the full resources map (`knowledge-graph.md`, `tags.md`, `confluence-map.md`).
2. Scan all articles in every `resources/` subfolder — including `resources/people/`.
3. Identify graph problems: merges, splits, new nodes, deletions, reclassifications, missing cross-references.
4. Write `resources-actualize-plan.md` with the operation queue (ordered: delete → merge → reclassify → split → create → actualize). Every surviving article must have an `actualize` entry.
5. Commit: `Generate resources actualize plan: N operations`.

Do not edit any resource articles during this command — this is a planning-only pass.

$ARGUMENTS
