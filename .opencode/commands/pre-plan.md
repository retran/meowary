---
description: Surface gray areas and capture context before planning
---

Run a pre-planning scout to identify ambiguities, discover reusable assets, and resolve open questions before writing an implementation plan.

Arguments: `/pre-plan [spec-path]`

1. Load `workflow` skill.
2. Read the approved spec. If `$1` is provided, use it as the spec path. Otherwise, auto-detect from the active project's `specs/` directory — pick the most recently updated spec with `status: approved`.
3. **Scout the codebase** (code projects only): scan for reusable assets, existing patterns, and integration points relevant to the spec. Note what already exists that the plan can build on.
4. **Identify gray areas** — ambiguities, unstated assumptions, alternative interpretations, missing details. Present as numbered questions.
5. Ask the user to resolve gray areas interactively.
6. Write `projects/<project>/specs/CONTEXT-<slug>.md` alongside the spec. Include: resolved decisions, discovered assets, integration constraints, and any user preferences captured during the conversation.
7. Do not commit — the user may want to revise.

$ARGUMENTS
