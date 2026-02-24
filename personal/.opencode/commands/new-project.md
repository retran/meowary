---
description: Create a new project folder from template
---

Create a new project under projects/. Follow these steps:

1. Create the folder `projects/$1/`.
2. Copy from `meta/templates/project-template.md` into `projects/$1/README.md`.
3. Replace placeholders:
   - {{PROJECT_NAME}} with: $2 (if not provided, derive a readable name from the folder name)
   - {{PROJECT_SLUG}} with: $1
   - {{DEADLINE}} with: $3 (if not provided, use TBD)
   - {{DATE}} with today's date (YYYY-MM-DD)
4. Ask the user for a brief overview of the project (what it is, what the goals are). Write it into the Overview section. Do not leave the overview as a placeholder -- every project needs a real description (see "No stubs" rule in AGENTS.md).
5. Ask the user for initial open tasks and write them into the Open Tasks section. At least one concrete task is required.
6. Add the appropriate tags. Register the new `#p-$1` tag in `meta/tags.md`.
7. If today's daily note exists, add a log entry mentioning the new project.
8. If a weekly note exists for this week, ask the user if a goal should be added for this project.
9. Commit with a message like "Add project $1".

$ARGUMENTS
