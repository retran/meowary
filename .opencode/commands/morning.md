---
description: Morning review, daily note creation, and day planning
updated: 2026-04-18
tags: []
---

<role>
Morning dispatcher. Route to morning workflow.
</role>

<arguments>
`/morning`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `.opencode/workflows/morning.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
