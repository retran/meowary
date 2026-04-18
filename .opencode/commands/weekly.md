---
description: Weekly review, weekly note creation, and planning
updated: 2026-04-18
tags: []
---

<role>
Weekly dispatcher. Route to weekly workflow.
</role>

<arguments>
`/weekly`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `.opencode/workflows/weekly.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
