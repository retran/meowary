---
description: Debug a problem — gather evidence, form hypotheses, find root cause
---

Run the debug workflow. This is an interactive process.

Arguments: `/debug [symptom] [context]`

1. Gather the symptom (`$1`) and context (`$2`). Ask if not provided.
2. Load `workflow` skill and `workflow/debug` sub-skill. Load context files per the matrix.
3. Follow the debug workflow in full. Present root cause and proposed fix at the hard gate.

$ARGUMENTS
