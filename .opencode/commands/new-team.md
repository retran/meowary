---
description: Create a new team entry in resources/teams/
---

Create a new team KB entry. This is an interactive process.

Arguments: `/new-team [name]`

1. Load `resources` skill.
2. Gather details: slug, full name (`$1`), department, mission, members, key contacts. Ask for missing values. Check `resources/people/` for existing person files.
3. Follow the entity creation workflow from the skill: create from template, register `#t-<slug>` tag, add to `knowledge-graph.md`, cross-link to member files, commit.

$ARGUMENTS
