---
description: Generate a standup summary from recent daily notes
---

Generate a standup for copy-paste. Does not commit.

Arguments: `/standup`

1. Load `writing` skill.
2. Find the most recent daily note (skip weekends if today is Monday).
3. Extract completed tasks from Evening > Completed. Extract open MITs and blockers from Morning > MITs and Day > Waiting.
4. Pull today's planned tasks from today's Morning > MITs (or carry-over items from yesterday's Evening > Carried / Dropped).
5. Present in **Yesterday / Today / Blockers** format (3-5 bullets each, one line per bullet, specific names and details).
6. Ask for edits. Output is for copy-paste — do not commit.

$ARGUMENTS
