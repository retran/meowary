---
description: Morning review and daily planning
---

Run the morning review and planning session. This is an interactive process -- ask questions at each step before moving on.

**Important:** If today is Monday, tell the user to run `/week-plan` instead -- it includes the full morning flow plus weekly planning. Do not proceed with this command on Mondays.

## Step 1: Daily Branch

- Switch to `main` and pull if a remote is configured.
- Check if a branch `daily/YYYY-MM-DD` already exists.
  - **Exists:** switch to it and tell the user "Resuming today's branch."
  - **Does not exist:** create and switch to `daily/YYYY-MM-DD`.

## Step 2: Yesterday's Review

- Find the most recent daily note before today in daily/.
- Check for any incomplete tasks (- [ ]) from that note.
- Present the list of unfinished tasks to the user and ask:
  - Which tasks should carry over to today?
  - Which should be dropped or deferred?

## Step 3: Create Today's Page

- If today's daily note does not exist yet, create it from meta/templates/daily-template.md.
- Replace all placeholders: {{DATE}}, {{DAY}}, {{WEEK_NUMBER}} (zero-padded, e.g. 09), {{WEEK_FILE}} (e.g. 2026-W09.md).
- Set up the navigation bar: link to the previous day's note (omit if none exists) and the current week's note. Omit the next-day link.
- Populate Events & Meetings from meta/recurring-events.md for today's day of the week. For biweekly events, calculate from the anchor date.
- Ask the user if there are any blockers or time-off items for today (e.g. doctor appointments, errands) and populate the Blockers & Time Off section.

## Step 4: Project and External Check-In

- Scan all active projects under projects/ (exclude \_archive/).
- Summarize each project's status and open tasks.
- Flag any projects that look stale (no dev log entry for 2+ weeks) and ask the user if they should be paused.
- If Jira is configured (check meta/context.md), query the user's assigned issues and current sprint. Surface issues not yet reflected in local projects or tasks.
- If Confluence is configured, check for relevant recent pages (meeting notes, decisions) that may affect today's plan.
- Ask the user if any project tasks or Jira issues should become today's tasks.

## Step 5: Set Tasks

- Compile the carried-over tasks, project tasks, Jira issues, and any new items.
- Consult the knowledge base for context on today's work -- check relevant team, codebase, or process entries before finalizing tasks.
- Present a proposed Tasks list and ask the user to confirm, reorder, add, or remove items.
- Tag each task with the appropriate `#p-`, `#t-`, `#person-`, or topic tags.
- Write the final tasks into today's daily note.

## Step 6: Commit

- Once the user confirms the daily note is ready, commit all changes on the daily branch.

$ARGUMENTS
