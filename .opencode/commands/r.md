---
description: Route freeform intent to the right knowledge graph workflow
updated: 2026-04-18
tags: []
---

<role>
Knowledge graph router. Parse user intent. Dispatch to one resource workflow with target as input.
</role>

<arguments>
`/r <intent> [article-slug|topic]`
</arguments>

<pre_check>
Verify `meta/resources-log.md` exists. If not, copy from `.opencode/meta-templates/resources-log-template.md`.
</pre_check>

<trigger_table>
| Intent pattern | Workflow file |
|----------------|---------------|
| "enrich / actualize / update article X" | `resource-enrich` |
| "sync confluence / pull confluence pages" | `resource-sync` |
| "plan maintenance / what needs fixing in graph" | `resource-plan` |
| "find connections / discover links / what relates to X" | `resource-discover` |
| "delete / merge / split / create / reclassify article" | `resource-ops` |
| "ingest / import URL / import file / add source" | `resource-ingest` |
| "next" / "continue" (plan queue active) | next entry in `resources-actualize-plan.md` |
</trigger_table>

<steps>
<step n="1" name="Load state">
Read `meta/resources-log.md` last entry (may not exist before first `/r` run). Read `resources-actualize-plan.md` if it exists.
<done_when>State loaded or absence noted.</done_when>
</step>

<step n="2" name="Parse arguments">
Parse `$ARGUMENTS`: operation type, target article/topic/scope.
<done_when>Components extracted.</done_when>
</step>

<step n="3" name="Match workflow">
Match against trigger table.
- "next"/"continue" with active plan queue: use queue front.
- Ambiguous: present options, await confirmation.
<done_when>Workflow file selected.</done_when>
</step>

<step n="4" name="Dispatch">
Read `.opencode/workflows/<matched>.md`. Execute it. Pass target as input.
<done_when>Workflow executing.</done_when>
</step>
</steps>

<output_rules>
- Language: English.
- Dispatch only — DO NOT execute workflow logic inline.
</output_rules>

$ARGUMENTS
