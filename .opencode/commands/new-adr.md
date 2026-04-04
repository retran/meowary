---
description: Draft a new Architecture Decision Record in a project folder
---

Draft a new ADR. This is an interactive process.

Arguments: `/new-adr [project-or-area-slug] [series-id]`

1. Load `writing` skill and `writing/adr` sub-skill.
2. Identify the project/area (`$1`) and series ID (`$2`). Check `context.md` for ADR naming conventions. Ask for missing values.
3. Follow the ADR workflow from the skill: gather content (title, background, options, decision, consequences, decision makers, status), write the ADR file, cross-link to project/area README and daily note, commit.

$ARGUMENTS
