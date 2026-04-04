---
description: Implement an approved plan — execute tasks, write code or documents
---

Run the implement phase of the workflow.

Arguments: `/implement [plan-path-or-project-slug]`

1. Identify the plan (`$1`). If a project slug is given, list plans in `projects/<slug>/plans/`. Ask if not provided. If no plan exists, suggest `/plan` first.
2. Load `workflow` skill and `workflow/implement` sub-skill. Load context files per the matrix.
3. Follow the implement workflow in full. Checkpoint after each major task.
4. Self-review, then present results. Suggest `/review` for independent review.

$ARGUMENTS
