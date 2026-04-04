---
description: Create a new area dashboard from template
---

Create a new area under `areas/`. This is an interactive process.

Arguments: `/new-area [slug] [name]`

1. Load `project` skill.
2. Gather details: slug (`$1`), name (`$2`). Ask for missing values.
3. Follow the area creation workflow from the skill: create folder from template, fill focus and initial tasks, register `#a-<slug>` tag, cross-link to daily note, commit.

$ARGUMENTS
