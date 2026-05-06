---
description: Evening wrap-up, day summary, and project updates
updated: 2026-04-18
tags: []
---

<role>
Evening dispatcher. Route to evening workflow.
</role>

<arguments>
`/evening`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `{{AGENT_DIR}}/workflows/evening.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
