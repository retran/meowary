---
description: Brainstorm solutions — explore a problem, generate options, write a spec
---

Run the brainstorm phase of the workflow. This is an interactive process.

Arguments: `/brainstorm [project-slug] [problem-description]`

1. Identify the project (`$1`) and problem (`$2`). Ask if not provided.
2. Load `workflow` skill and `workflow/brainstorm` sub-skill. Load context files per the matrix.
3. Follow the brainstorm workflow in full. Present the spec at the hard gate.

$ARGUMENTS
