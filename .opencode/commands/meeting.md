---
description: Record meeting notes interactively
---

Record meeting notes. This is an interactive process.

Arguments: `/meeting [project-slug]`

1. Load `writing` skill and `writing/meeting` sub-skill.
2. Gather meeting details:
   - Title, meeting type (`general` | `1-1` | `standup` | `retro` | `kickoff`), recurrence.
   - Attendees and duration.
   - Objective (one sentence — skip for 1:1 and standup).
3. Take notes. Capture required sections for the meeting type:
   - Discussion (or per-person Yesterday/Today/Blockers for standup).
   - Decisions (if applicable).
   - Action Items — tag each with `#person-<slug>` and mark routing intent (`→ own task`, `→ waiting-for`, `→ project tasks`).
   - Parking Lot and Open Questions (if applicable).
   - Next Meeting date and focus (for recurring meetings).
4. Write to `journal/meetings/YYYY-MM-DD-<slug>.md` from template.
5. Route action items:
   - Own tasks → add to today's `### Inbox` in the daily note.
   - Waiting items → append to `## Active` in `waiting-for.md`.
   - Project tasks → add to `projects/<slug>/README.md` Open Tasks.
6. Cross-link to daily note: add entry to today's `## Day > ### Events` with a relative link and one-line summary.
7. Resources scan: if durable facts were learned (team changes, role updates, process decisions, architecture choices), update relevant resource articles. Create stubs if needed. Update `knowledge-graph.md`.
8. Commit with a descriptive message (e.g. `Meeting: YYYY-MM-DD <title>`).

$ARGUMENTS
