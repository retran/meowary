---
description: Generate a standup summary from recent daily notes
---

Generate a standup for copy-paste. Does not commit.

Arguments: `/standup`

1. Load `writing` skill.
2. Find the most recent daily note (skip weekends if today is Monday).
3. Extract completed tasks from Evening > Completed. Extract open MITs and blockers from Morning > MITs and Day > Waiting.
3b. **Jira cross-check (if configured):** If `jira` is available, run:
   ```bash
   jira issue list -q "assignee = currentUser() AND updated >= -1d" --plain
   ```
   Collect relevant Jira issue keys and summaries. If `jira` is unavailable or unconfigured, skip silently — this section will be empty.
4. Pull today's planned tasks from today's Morning > MITs (or carry-over items from yesterday's Evening > Carried / Dropped).
5. Present in two sections:

   **Jira (macro-tasks):** Items that have a Jira key from step 3b. Format: Yesterday / Today / Blockers, 1-3 bullets each, include the issue key (e.g. `PROJ-123`). If Jira is unconfigured, omit this section entirely — do not print a header with no content.

   **Shadow (micro-tasks):** Local completed/planned items from daily notes that have no Jira key. Format: Yesterday / Today / Blockers, 3-5 bullets each, one line per bullet, specific names and details.

6. Ask for edits. Output is for copy-paste — do not commit.

$ARGUMENTS
