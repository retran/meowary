---
description: Record meeting notes interactively
updated: 2026-04-18
tags: []
---

<role>
Meeting dispatcher. Route to meeting workflow with optional project slug.
</role>

<arguments>
`/meeting [project-slug]`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `.opencode/workflows/meeting.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
