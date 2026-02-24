---
description: Monday weekly planning and morning routine
---

Run the Monday weekly planning session. This is an interactive process -- ask questions at each step before moving on.

## Step 1: Daily Branch

- Switch to `main` and pull if a remote is configured.
- Check if a branch `daily/YYYY-MM-DD` already exists.
  - **Exists:** switch to it and tell the user "Resuming today's branch."
  - **Does not exist:** create and switch to `daily/YYYY-MM-DD`.

## Step 2: Last Week Review

- Find last week's weekly note in weekly/ (if it exists).
- Summarize what was accomplished, what failed, and what was carried over.
- Find Friday's daily note (or the last daily note of the previous week) and check for incomplete tasks.
- Present the summary to the user and ask if anything was missed.

## Step 3: Create Weekly Note

- Create this week's weekly note from meta/templates/weekly-template.md.
- File name uses ISO week numbering: weekly/YYYY-WNN.md.
- Replace all placeholders:
  - {{WEEK_NUMBER}} with the zero-padded ISO week number (e.g. 09, not W09).
  - {{WEEK_START}} with this Monday's date and {{WEEK_END}} with this Friday's date.
  - {{PREV_WEEK_NUMBER}} and {{PREV_WEEK_FILE}} with the previous week's number and file name.
  - {{NEXT_WEEK_NUMBER}} and {{NEXT_WEEK_FILE}} with the next week's number and file name.
  - {{MON_DATE}} through {{FRI_DATE}} with the actual dates for each day.
- In the Daily Notes section, mark any days that will not have notes (e.g. holidays) as `*(no note)*`.

## Step 4: Set Weekly Focus

- Based on the last week review, active projects, and carry-over items, ask the user: "What is the one main focus for this week?"
- This should be a single theme or priority that guides the week (e.g. "Ship the v2.1 bugfix release", "Finalize the authentication ADR").
- Write it into the Weekly Focus section. Tag with relevant project/team tags.

## Step 5: Set Weekly Goals

- Review all active projects under projects/ (exclude _archive/). Summarize each project's status, deadline, and open tasks.
- If Jira is configured (check meta/context.md), query the user's assigned issues, current sprint goals, and upcoming deadlines. Surface items not reflected in local projects.
- If Confluence is configured, check for relevant team documentation or decisions that may affect the week's plan.
- Seed the initial list from the previous week's Carry-Over items.
- Ask the user to define this week's goals -- what are the key things to accomplish by Friday?
- Goals should be concrete and achievable within the week. Tag each with relevant `#p-`, `#t-`, or topic tags.
- Write the goals into the Weekly Goals section.

## Step 6: Daily Morning Flow

Now run the standard morning routine for today (Monday):

- Create today's daily note from meta/templates/daily-template.md if it doesn't exist.
- Replace all placeholders: {{DATE}}, {{DAY}}, {{WEEK_NUMBER}} (zero-padded), {{WEEK_FILE}}.
- Set up the navigation bar: omit the previous-day link if there is no daily note for the weekend. Link to the weekly note.
- Populate Events & Meetings from meta/recurring-events.md (include biweekly events if they fall on this Monday -- calculate from anchor dates).
- Ask the user if there are any blockers or time-off items for today and populate the Blockers & Time Off section.
- Ask the user to set today's Tasks, informed by the weekly goals just established. Tag each task.
- Write tasks into today's daily note.

## Step 7: Commit

- Once the user confirms both the weekly note and today's daily note are ready, commit all changes on the daily branch.

$ARGUMENTS
