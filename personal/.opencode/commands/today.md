---
description: Create or open today's daily note
---

Create today's daily note if it doesn't exist, review recent activity, and set up the day. This is an interactive process -- ask questions at each step before moving on.

Works any day of the week. No special Monday behavior -- use `/weekly` separately if you want to plan the week.

## Step 1: Daily Branch

- Switch to `main` and pull if a remote is configured.
- Check if a branch `daily/YYYY-MM-DD` already exists.
  - **Exists:** switch to it and tell the user "Resuming today's branch."
  - **Does not exist:** create and switch to `daily/YYYY-MM-DD`.

## Step 2: Recent Review

- Find the most recent daily note before today in daily/.
- Check for any incomplete tasks (- [ ]) from that note.
- If there are unfinished tasks, present the list to the user and ask:
  - Which tasks should carry over to today?
  - Which should be dropped or deferred?
- If there are no recent notes or no unfinished tasks, skip this step.

## Step 3: Create Today's Page

- If today's daily note does not exist yet, create it from meta/templates/daily-template.md.
- Replace all placeholders: {{DATE}}, {{DAY}}, {{WEEK_NUMBER}} (zero-padded, e.g. 09), {{WEEK_FILE}} (e.g. 2026-W09.md).
- Set up the navigation bar: link to the previous day's note (omit if none exists) and the current week's note. Omit the next-day link.
- Populate Events & Appointments from meta/recurring-events.md for today's day of the week. For biweekly events, calculate from the anchor date.
- Populate the Habits scorecard from meta/habits.md -- include all active habits, preset Done to No.
- If today's note already exists, open it and show its current state.

## Step 4: Project Check-In

- Scan all active projects under projects/ (exclude \_archive/).
- Summarize each project's status and open tasks.
- Flag any projects that look stale (no dev log entry for 2+ weeks) and ask the user if they should be paused.
- If external integrations are configured (check meta/context.md), query for open tasks or upcoming deadlines. Surface items not yet reflected in local projects or tasks.
- Ask the user if any project tasks should become today's tasks.

## Step 5: Set Tasks

- Compile the carried-over tasks, project tasks, and any new items.
- Consult the knowledge base for context on today's work -- check relevant entries before finalizing tasks.
- Present a proposed Tasks list and ask the user to confirm, reorder, add, or remove items.
- Tag each task with the appropriate `#p-`, `#person-`, or topic tags.
- Write the final tasks into today's daily note.

## Step 6: Commit

- Once the user confirms the daily note is ready, commit all changes on the daily branch.

$ARGUMENTS
