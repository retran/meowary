---
description: Parse freeform text and dispatch to the best matching command
---

Smart dispatcher — translates natural language into the most appropriate command.

Arguments: `/do <freeform text>`

1. Read the user's freeform input (`$ARGUMENTS`).
2. Read the list of available commands from `.opencode/commands/` — filename and `description` from front matter.
3. Match the input to the best command by intent. Consider keywords, entity types (project, person, team, resource), and action verbs (create, review, plan, debug, draft).
4. Present the match: "Best match: `/command args`. Run it?" using the question tool with the top match and 2-3 alternatives.
5. If confirmed, state: "Run `/command args` to proceed." (Commands cannot be invoked programmatically — instruct the user to run it.)
6. If rejected, show the next 3 best matches.

$ARGUMENTS
