---
description: Quickly capture a raw note, idea, or link to inbox/
updated: 2026-04-18
tags: []
---

<role>
Capture dispatcher. Route to capture workflow with arguments.
</role>

<arguments>
`/capture [title]`
</arguments>

<steps>
<step n="1" name="Dispatch">
Read `.opencode/workflows/capture.md`. Execute it. Pass `$ARGUMENTS` as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
