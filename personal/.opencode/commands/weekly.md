---
description: Create or update the weekly note
---

Create or update the weekly note for the current week. Can be run any day. This is an interactive process -- ask questions at each step before moving on.

## Step 1: Last Week Review

- Find last week's weekly note in weekly/ (if it exists).
- Summarize what was highlighted, what goals were met, and what was carried over.
- Present the summary to the user and ask if anything was missed.

## Step 2: Create or Open Weekly Note

- If this week's weekly note does not exist, create it from meta/templates/weekly-template.md.
- File name uses ISO week numbering: weekly/YYYY-WNN.md.
- Replace all placeholders:
  - {{WEEK_NUMBER}} with the zero-padded ISO week number (e.g. 09, not W09).
  - {{WEEK_START}} with this Monday's date and {{WEEK_END}} with this Sunday's date.
  - {{PREV_WEEK_NUMBER}} and {{PREV_WEEK_FILE}} with the previous week's number and file name.
  - {{NEXT_WEEK_NUMBER}} and {{NEXT_WEEK_FILE}} with the next week's number and file name.
  - {{MON_DATE}} through {{SUN_DATE}} with the actual dates for each day.
- In the Daily Notes section, link only to daily notes that already exist. Do not add placeholder entries for days without notes.
- If the weekly note already exists, open it and show its current state.

## Step 3: Set Goals

- Review all active projects under projects/ (exclude \_archive/). Summarize each project's status, deadline, and open tasks.
- If external integrations are configured (check meta/context.md), query for open tasks and upcoming deadlines.
- Seed the initial list from the previous week's Carry-Over items.
- Ask the user to define this week's goals — what are the key things to accomplish?
- Goals should be concrete. Tag each with relevant `#p-` or topic tags.
- Write the goals into the Goals section.

## Step 4: Commit

- Once the user confirms the weekly note is ready, commit all changes on the current branch (should be the daily branch if `/today` was run first).

$ARGUMENTS
