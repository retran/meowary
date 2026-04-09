---
description: Route freeform intent to the right lifecycle workflow
updated: 2026-04-07
tags: []
---

Lifecycle workflow router — parses intent and dispatches to the right workflow.

Arguments: `/do <intent> [project-slug] [quick|standard|full]`

1. Read the last entry in `dev-log.md` for the active project and current phase.
2. Parse `$ARGUMENTS`: action verb, topic, project slug, complexity hint.
3. Match against the trigger table below. Select the workflow file.
   - Single match: announce selection, read the file.
   - Ambiguous (2–3 plausible matches): present options, await confirmation.
   - No match: ask one clarifying question.
4. If no complexity tier given, use the table default. If still unclear, ask once:
   `quick / standard (recommended) / full`
5. Read `.opencode/workflows/<matched>.md` and execute it. Pass project slug and tier as inputs.

## Trigger Table

| Intent pattern | Context | Workflow file | Default tier |
|----------------|---------|---------------|--------------|
| "what do I know / what exists about X" | any | `scout` | quick |
| "understand / research / deep dive into X" | any | `research` | full |
| "brainstorm / ideate / what should we build / how should we approach" | any | `brainstorm` | standard |
| "plan / scope / break down X" | any | `plan` | standard |
| "replan / scope changed / new constraint" | any | `plan` (replan mode) | standard |
| "design / decide how to build X" | any | `design` | standard |
| "write ADR / RFC / proposal / draft / postmortem / doc" | any | `write` | standard |
| "implement / code / build X" | any | `implement` | standard |
| "test / manual QA / verify X" | any | `test` | standard |
| "review my own work / self-review" | any | `self-review` | standard |
| "review feedback / address comments / resolve" | any | `resolve` | standard |
| "broken / bug / debug / investigate X" | any | `debug` | standard |
| "review PR / give feedback on / peer review" | any | `peer-review` | standard |

Conflict resolution: more specific pattern wins. Ties → present options.

$ARGUMENTS
