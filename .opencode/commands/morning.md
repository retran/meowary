---
description: Morning review, daily note creation, and planning (includes week planning on Mondays)
---

Run the morning routine. This is an interactive process.

Arguments: `/morning`

1. Load `writing` skill and `writing/daily` sub-skill.
2. Review yesterday's daily note:
   - Check Evening > Carried / Dropped. For any carried item, confirm it appears as an MIT candidate for today.
   - Mark any open tasks on yesterday's note as moved, dropped, or blocked as appropriate.
3. Create today's daily note from `.opencode/templates/daily-template.md` if it does not exist. Replace all placeholders. Verify navigation links.
4. Populate `## Morning > Calendar` from `recurring-events.md` — include all events for today's weekday. For biweekly events, calculate the correct occurrence.
5. Scan active projects (`projects/`) and areas (`areas/`) for work in flight. Surface MIT candidates.
5b. **Jira open issues (if configured):** Load the `jira` skill for query commands. Surface any high-priority or sprint-blocked issues as MIT candidates. If `jira` is not installed or `jira init` has not been run, skip this step silently.
6. Set the Focus line: ask the user "What would make today a success?" Encourage a project tag inline (e.g. `Ship X #p-myproject`).
7. Fill MITs:
   - Primary MIT (`★`) first — the non-negotiable for the day. Must link to an active project or area.
   - MIT 2 and MIT 3 are optional.
   - Soft limit of 3. If a 4th is requested, warn: "You have 4 MITs — that defeats the forced-selection purpose. Consider dropping or deferring one."
   - At least one MIT must carry a project tag.
8. **On Mondays**, also run weekly planning (defined in `writing/daily`): create this week's weekly note if missing, review last week's Carry-Over, set Weekly Focus and Goals.
9. Commit with a descriptive message (e.g. `Morning: YYYY-MM-DD`).

$ARGUMENTS
