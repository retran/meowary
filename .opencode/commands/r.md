---
description: Route freeform intent to the right knowledge graph workflow
updated: 2026-04-07
tags: []
---

Knowledge graph router — parses intent and dispatches to the right resource workflow.

Arguments: `/r <intent> [article-slug|topic]`

> **Before proceeding:** Check that `meta/resources-log.md` exists. If not, copy from `.opencode/meta-templates/resources-log-template.md`.

1. Read `meta/resources-log.md` last entry if the file exists (may not exist before first `/r` run).
   Read `resources-actualize-plan.md` if it exists.
2. Parse `$ARGUMENTS`: operation type, target article/topic/scope.
3. Match against the trigger table below. Select the workflow file.
   - If "next" / "continue" and a plan queue is active: use the queue front.
   - Ambiguous: present options, await confirmation.
4. Read `.opencode/workflows/<matched>.md` and execute it. Pass target as input.

## Trigger Table

| Intent pattern | Workflow file |
|----------------|---------------|
| "enrich / actualize / update article X" | `resource-enrich` |
| "sync confluence / pull confluence pages" | `resource-sync` |
| "plan maintenance / what needs fixing in graph" | `resource-plan` |
| "find connections / discover links / what relates to X" | `resource-discover` |
| "delete / merge / split / create / reclassify article" | `resource-ops` |
| "ingest / import URL / import file / add source" | `resource-ingest` |
| "next" / "continue" (plan queue active) | next in `resources-actualize-plan.md` |

$ARGUMENTS
