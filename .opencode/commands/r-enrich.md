---
description: Actualize a single resource article
---

Load the `resources` skill and `resources/enrich` sub-skill, then execute **Workflow A** on the specified article. Stop after committing — one article per invocation.

Arguments: `/r-enrich <article-path>` — e.g. `resources/process/api-guidelines.md`. If no argument provided, ask the user which article to actualize.

$ARGUMENTS
