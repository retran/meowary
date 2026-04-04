---
description: Create a new person entry in resources/people/
---

Create a new person KB entry. This is an interactive process.

Arguments: `/new-person [name]`

1. Load `resources` skill.
2. Gather details: full name (`$1`), slug, role, team, department, relationship. Ask for missing values. Check `resources/teams/` for existing teams.
3. Follow the entity creation workflow from the skill: create from template, register `#person-<slug>` tag, add to `knowledge-graph.md`, cross-link to team file, commit.

$ARGUMENTS
