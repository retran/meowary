---
description: Route freeform intent to the right lifecycle workflow
updated: 2026-04-18
tags: []
---

<role>
Lifecycle workflow router. Parse user intent. Dispatch to one workflow file with project slug and tier as inputs.
</role>

<arguments>
`/do <intent> [project-slug] [quick|standard|full]`
</arguments>

<trigger_table>
More specific pattern wins. Ties → present options.

| Intent pattern | Workflow file | Default tier |
|----------------|---------------|--------------|
| "what do I know / what exists about X" | `scout` | quick |
| "understand / research / deep dive into X" | `research` | full |
| "brainstorm / ideate / what should we build / how should we approach" | `brainstorm` | standard |
| "plan / scope / break down X" | `plan` | standard |
| "replan / scope changed / new constraint" | `plan` (replan mode) | standard |
| "design / decide how to build X" | `design` | standard |
| "write ADR / RFC / proposal / draft / postmortem / doc" | `write` | standard |
| "implement / code / build X" | `implement` | standard |
| "test / manual QA / verify X" | `test` | standard |
| "review my own work / self-review" | `self-review` | standard |
| "review feedback / address comments / resolve" | `resolve` | standard |
| "broken / bug / debug / investigate X" | `debug` | standard |
| "review PR / give feedback on / peer review" | `peer-review` | standard |
</trigger_table>

<steps>
<step n="1" name="Load project state">
Read last entry in active project `dev-log.md` — note current phase.
<done_when>Project phase known.</done_when>
</step>

<step n="2" name="Parse arguments">
Parse `$ARGUMENTS`: action verb, topic, project slug, complexity hint.
<done_when>Components extracted.</done_when>
</step>

<step n="3" name="Match workflow">
Match against trigger table.
- Single match: announce selection, read file.
- 2–3 plausible matches: present options, await confirmation.
- No match: ask one clarifying question.
<done_when>Workflow file selected.</done_when>
</step>

<step n="4" name="Determine tier">
If no tier given: use table default.
If still unclear, ask once: `quick / standard (recommended) / full`.
<done_when>Tier selected.</done_when>
</step>

<step n="5" name="Dispatch">
Read `.opencode/workflows/<matched>.md`. Execute it. Pass project slug and tier as inputs.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
- Maximum one clarifying question.
</output_rules>

$ARGUMENTS
