---
description: Plan implementation for an approved spec — map changes, order tasks, write a plan
---

Run the plan phase of the workflow. This is an interactive process.

Arguments: `/plan [spec-path-or-project-slug]`

1. Identify the spec (`$1`). If a project slug is given, list specs in `projects/<slug>/specs/`. Ask if not provided. If no spec exists, suggest `/brainstorm` first.
2. Load `workflow` skill and `workflow/plan` sub-skill. Load context files per the matrix.
3. Follow the plan workflow in full. Present the plan at the hard gate.

$ARGUMENTS
