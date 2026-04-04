---
description: Review code or document changes — correctness, style, completeness
---

Run the review phase of the workflow.

Arguments: `/review [target]` — a file/directory path, git ref range, `staged`, or project slug. Defaults to staged changes; if nothing staged, reviews uncommitted changes.

1. Identify the review target (`$1`). Ask if ambiguous.
2. Load `workflow` skill and `workflow/review` sub-skill. Load context files per the matrix.
3. Follow the review workflow in full. Present findings grouped by severity.

$ARGUMENTS
