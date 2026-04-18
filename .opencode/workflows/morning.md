---
updated: 2026-04-18
tags: []
---

# Morning

<summary>
> Daily start-of-day orientation. Creates today's daily note, surfaces project state from dev-logs, checks inbox, pulls calendar from `journal/recurring-events.md` and sprint context, sets 1–3 MITs. Triggers weekly planning on Mondays.
</summary>

<role>
Structured morning planner. Surfaces project state from multiple sources, triages inbox, establishes priorities. NEVER make autonomous decisions — present context, confirm before writing.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Active projects | `context/context.md § Active Projects` | Yes |
| Daily template | `.opencode/skills/journal/daily-template.md` | If creating |
| Weekly template | `.opencode/skills/journal/weekly-template.md` | Mondays |
| Project dev-logs | `projects/<slug>/dev-log.md` | Yes |
| Recurring events | `journal/recurring-events.md` | Optional |
| Inbox | `inbox/` | Optional |
| Waiting items | `journal/waiting-for.md` | Optional |
| Jira sprint | Jira (read-only) | Optional |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<steps>

<step n="0" name="Load context">
1. READ `context/context.md`. If missing/empty: STOP and direct user to `/bootstrap`.
2. FIND `## Active Projects`. If absent/empty: ask which project to focus on.
3. EXTRACT active projects (slug, phase, priority) per projects skill.
4. CHECK today's daily note exists.
   - Yes: READ — Morning may be partially filled.
   - No: CREATE from `.opencode/skills/journal/daily-template.md`.
5. READ `journal/waiting-for.md`; note items with follow-up date ≤ today.

<done_when>Active projects established; daily note exists.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK: "Any specific focus or constraint for today?" SKIP if provided.

<done_when>User responded or context clear.</done_when>
</step>

<step n="1" name="Surface project state">
For each active project:
1. READ `projects/<slug>/dev-log.md` last entry. Extract phase + next action.
2. SUMMARIZE: `<Project>: <phase> — <next action>`.
3. FLAG projects with last entry > 3 working days old as "potentially stalled".

<done_when>One-liner per project; stalled flagged.</done_when>
</step>

<step n="2" name="Triage inbox">
1. LIST `inbox/` files without `processed: true`.
2. SURFACE count and titles.
3. If count ≤ 5: route each:
   - **Task** → append `- [ ] <title>` to `## Day > ### Inbox`, link to project.
   - **Source to ingest** → add `Ingest: <title>` to Day > Inbox.
   - **Discard** → add `processed: true` + one-line discard note to front matter.
   Mark each `processed: true`.
4. If count > 5: add Day task `Process inbox (N items)`. NO inline triage.
5. SURFACE overdue `waiting-for.md` items.

<done_when>Every item routed or bulk deferred; overdue waiting surfaced.</done_when>
</step>

<step n="3" name="Calendar and sprint">
1. READ `journal/recurring-events.md` for today's weekday → populate `### Calendar`.
2. QUERY open Jira sprint items assigned to user; flag due today/overdue.
3. SURFACE up to 5 Jira items: priority, key, summary, status. DO NOT write as MITs.

If `recurring-events.md` missing: leave Calendar blank, note gap.
If Jira unavailable: skip silently.

<done_when>Calendar populated or noted; Jira surfaced or skipped.</done_when>
</step>

<step n="4" name="Set MITs">
1. PRESENT: project state, inbox count, calendar, Jira items.
2. ASK user to choose/confirm 1–3 MITs per journal skill.

<done_when>1–3 MITs confirmed.</done_when>
</step>

<step n="5" name="Weekly planning" condition="Today is Monday">
1. PERFORM Monday planning per journal skill.
2. If last week's Carry-Over non-empty: ask "Any carry-overs that should NOT be this week's goals?"
3. ASK: "What is this week's focus theme?"

<done_when>Weekly note exists with Focus and Goals; Monday link present.</done_when>
</step>

<step n="6" name="Write Morning zone">
COMPLETE `## Morning`: Focus line, MITs, Calendar.

DO NOT write `## Day` or `## Evening`. If Morning already filled: confirm before overwriting.

<done_when>Focus, MITs, Calendar written.</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
COMMIT: `Morning: <YYYY-MM-DD>`.

No dev-log entry — `/morning` reads dev-logs but never writes them.

<self_review>
- [ ] All `Done when` met
- [ ] MITs ≤ 3
- [ ] Calendar checked
- [ ] Daily note has correct front matter
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Morning zone | `journal/daily/<YYYY-MM-DD>.md` | Written |
| Weekly note (Mon) | `journal/weekly/<year>-W<nn>.md` | Focus + Goals |
| Inbox marked processed | `inbox/` | Front matter |
| Commit | Git | `Morning: <YYYY-MM-DD>` |
</outputs>

<error_handling>
- **`context.md` missing/empty:** STOP at Step 0; direct to `/bootstrap`.
- **`daily-template.md` missing:** Cannot create note. Ask user to verify journal skill dir.
- **`dev-log.md` missing:** Note gap per project; continue.
- **`recurring-events.md` missing:** Leave Calendar blank. Restore from `.opencode/meta-templates/recurring-events-template.md`.
- **Jira unavailable:** Skip silently, note "Jira unavailable" in output.
- **Morning zone complete:** Confirm before re-running. NEVER silently overwrite.
- **Scope creep (full planning request):** Surface as next step. Append deferred to `projects/<slug>/deferred-items.md`.
</error_handling>

<contracts>
1. Owns `## Morning` only. NEVER writes `## Day`/`## Evening`.
2. Creates daily note from template if missing.
3. NEVER writes project dev-logs.
4. Reads Jira only. NEVER creates/updates/transitions.
5. Commit format: `Morning: <YYYY-MM-DD>`.
6. MITs capped at 3. Warn if user requests more.
</contracts>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Active project clear next action | Appropriate lifecycle workflow |
| Inbox unprocessed | `resource-ingest` |
| Stalled project | `scout` |
| Monday | Weekly handled in Step 5 |
</next_steps>

<output_rules>Output language: English.</output_rules>
