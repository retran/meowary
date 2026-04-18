---
description: Generate a standup summary from recent daily notes
updated: 2026-04-18
tags: []
---

<role>
Standup dispatcher. Route to standup workflow.
</role>

<arguments>
`/standup`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `.opencode/workflows/standup.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
