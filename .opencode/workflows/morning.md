---
updated: 2026-04-08
tags: []
---

# Morning

> Daily start-of-day orientation. Creates today's daily note, surfaces project state from dev-log entries, checks inbox, pulls calendar and sprint context, and sets 1–3 Most Important Tasks. Triggers weekly planning on Mondays. Invoke at the start of each workday.

## Role

Acts as the user's structured morning planner. Surfaces current project state from multiple sources, triages inbox, and establishes the day's priorities. Does not make autonomous decisions — presents context and asks for confirmation before writing.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Active projects | `context/context.md § Active Projects` | Required |
| Daily note template | `.opencode/skills/journal/daily-template.md` | Required if creating |
| Weekly note template | `.opencode/skills/journal/weekly-template.md` | Required on Mondays |
| Project dev-logs | `projects/<slug>/dev-log.md` | Required |
| Recurring events | `recurring-events.md` | Optional |
| Inbox captures | `inbox/` | Optional |
| Waiting items | `journal/waiting-for.md` | Optional |
| Jira sprint | Jira (read-only) | Optional |

## Steps

### Step 0 — Load context

1. Read `context/context.md`. If entirely missing or empty: stop and direct the user to run `/bootstrap`. Do not proceed.
2. Find `## Active Projects`. If the section is absent or empty: ask the user which project to focus on.
3. Extract active projects (slug, phase, priority) per the projects skill.
4. Check if today's daily note (`journal/daily/<YYYY-MM-DD>.md`) exists.
   - If yes: read it — Morning zone may already be partially filled.
   - If no: create it from `.opencode/skills/journal/daily-template.md` per the journal skill.
5. Read `journal/waiting-for.md` — note any items with a follow-up date on or before today.

Done when: active projects list established; daily note created or confirmed to exist.

### Step 0.5 — Clarify

Ask the user one question: "Any specific focus or constraint for today?" (e.g. "deep work only", "meetings-heavy day"). Skip if already provided in the invocation.

Done when: user has responded, or context is clear enough to proceed.

### Step 1 — Surface project state

For each active project:
1. Read `projects/<slug>/dev-log.md` — last entry only. Extract current phase and next action.
2. Summarise as one line: `<Project>: <phase> — <next action>`.
3. Flag any project whose last dev-log entry is more than 3 working days old as "potentially stalled".

Done when: one-liner surfaced for each active project; stalled projects flagged.

### Step 2 — Check and triage inbox

1. List files in `inbox/` without `processed: true` in their front matter.
2. Surface the count and titles.
3. If count ≤ 5: make a routing decision for each item:
   - **Task** → append `- [ ] <title>` to `## Day > ### Inbox` in today's daily note, linked to the relevant project.
   - **Source to ingest** → add `Ingest: <title>` note to Day > Inbox.
   - **Discard** → add `processed: true` and a one-line discard note to the item's front matter.
   Mark each processed item with `processed: true`.
4. If count > 5: add a Day zone task `Process inbox (N items)` — do not triage inline.
5. Surface any `waiting-for.md` items overdue as of today.

Done when: every inbox item has a routing decision, or bulk deferral noted; overdue waiting items surfaced.

### Step 3 — Pull calendar and sprint context

1. Read `recurring-events.md` for today's weekday — populate `### Calendar` in the Morning zone.
2. Query open Jira sprint items assigned to the user; flag any due today or overdue.
3. Surface up to 5 Jira items as context: priority, key, summary, status. Do not write them as MITs.

If `recurring-events.md` does not exist: leave Calendar blank and note the gap.
If Jira is unavailable or unconfigured: skip silently.

Done when: Calendar populated (or gap noted); Jira items surfaced (or skipped).

### Step 4 — Set MITs

1. Present: project state summary, inbox count, calendar, Jira items.
2. Ask the user to choose or confirm 1–3 Most Important Tasks. Apply MIT rules per the journal skill.

Done when: 1–3 MITs confirmed by user.

### Step 5 — Weekly planning [Mondays only]

Skip if today is not Monday.

1. Perform the Monday planning flow per the journal skill.
2. If last week's Carry-Over is non-empty, ask: "Any carry-over items that should NOT be this week's goals?"
3. Ask: "What is this week's focus theme?"

Done when: weekly note exists with Focus and Goals filled; Monday link present.

### Step 6 — Write Morning zone

Complete the `## Morning` zone in today's daily note per the journal skill: Focus line, MITs, Calendar.

Do not write to `## Day` or `## Evening` zones.
If Morning zone is already filled: confirm with user before overwriting any section.

Done when: Focus, MITs, and Calendar written to the Morning zone.

### Step 7 — Close

Commit: `Morning: <YYYY-MM-DD>`.

No dev-log entry — `/morning` reads project dev-logs but does not write to them.

Suggested next steps (present, do not run):
- Active project with clear next action → appropriate lifecycle workflow
- Inbox had unprocessed items → `resource-ingest` when ready
- Stalled project → `scout` to re-orient
- Monday → weekly note already handled in Step 5

Done when: committed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Daily note Morning zone | `journal/daily/<YYYY-MM-DD>.md` | Written/filled |
| Weekly note (Mondays only) | `journal/weekly/<year>-W<nn>.md` | Focus + Goals |
| Inbox items marked processed | `inbox/` | Front matter updated |
| Commit | Git history | `Morning: <YYYY-MM-DD>` |

## Error Handling

- **`context/context.md` missing or empty:** Stop at Step 0 and direct the user to run `/bootstrap`. Do not proceed.
- **`daily-template.md` missing:** Cannot create the daily note. Ask the user to verify the journal skill directory.
- **`projects/<slug>/dev-log.md` missing:** Note the gap per project; continue with remaining projects.
- **Jira unavailable:** Skip Jira in Step 3 silently. Note "Jira unavailable" in session output.
- **Morning zone already complete:** Confirm before re-running. Never silently overwrite.
- **Scope creep** (user asks for a full planning session): surface as a next step suggestion. Append deferred work to `projects/<slug>/deferred-items.md`.

## Contracts

1. Owns `## Morning` zone in `journal/daily/<date>.md` only. Never writes to `## Day` or `## Evening`.
2. Creates the daily note from template if it does not exist.
3. Does not write to project dev-logs.
4. Reads Jira only. Never creates, updates, or transitions Jira items.
5. Commit format: `Morning: <YYYY-MM-DD>`.
6. MITs capped at 3 per the journal skill. Warn if the user requests more.
