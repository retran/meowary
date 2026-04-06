---
name: project
description: Create, update, and maintain project dashboards — tasks, dev log, status, cross-links, lifecycle
compatibility: opencode
---

Load the `writing` skill alongside this one — it governs style and formatting for all project content.

## Structure

Every project lives at `projects/<slug>/README.md`. The slug is lowercase kebab-case (e.g. `mcp-client`, `release-tooling`).

### Required sections, in order

```
# <Project Name>

**Status:** Active | Paused | Done
**Deadline:** YYYY-MM-DD | TBD
**Tags:** #p-<slug>

## Overview

## Open Tasks

## Dev Log
```

### Optional sections

Insert **Completed Tasks** between Open Tasks and Dev Log once completed tasks accumulate and clutter Open Tasks.

### Companion files

Store companion files alongside the README in the same folder:

| File | Purpose |
|------|---------|
| `resources.md` | Links, snippets, references |
| `specs/` | Brainstorm output — problem specs with options |
| `plans/` | Implementation plans linked to specs |
| `drafts/` | Document brainstorm output (proposals, RFCs, ADRs) |
| `adr-<slug>.md` | Architecture Decision Records specific to this project |
| `<topic>.md` | Design docs, spike notes |

---

## Creating a Project

Use `/new-project` for interactive creation. When creating manually:

1. Create `projects/<slug>/` folder.
2. Copy `.opencode/templates/project-template.md` → `projects/<slug>/README.md`.
3. Replace all placeholders: `{{PROJECT_NAME}}`, `{{PROJECT_SLUG}}`, `{{DEADLINE}}`, `{{DATE}}`.
4. Write a real **Overview** — what the project is, what it delivers, why it exists. No placeholder text.
5. Add at least one concrete **Open Task**.
6. Register `#p-<slug>` in `tags.md` (projects table).
7. If today's daily note exists, add a log entry linking to the new README.
8. If a weekly note exists, consider adding a weekly goal.

---

## Task Management

Use these formats consistently across Open Tasks and any tasks in Dev Log entries:

| State | Format | Example |
|-------|--------|---------|
| Open | `- [ ] text` | `- [ ] Write spike doc` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [YYYY-MM-DD](../../journal/daily/YYYY-MM-DD.md)` | `- [ ] ~~Write ADR~~ → [2026-03-25](../../journal/daily/2026-03-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)* ` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

Rules:
- Never delete a task to change its state — mark it in place.
- Moved tasks must link to the target daily note. Add the task there too.
- Dropped and blocked require a short reason in italics.

### Keeping Open Tasks clean

When Open Tasks accumulates more than ~8 items (including done items), move all `- [x]` items to a **Completed Tasks** section placed between Open Tasks and Dev Log:

```markdown
## Completed Tasks

- [x] Set up repo structure
- [x] Draft initial API design
```

This keeps Open Tasks short and actionable.

---

## Dev Log

The Dev Log is a reverse-chronological record of work done on the project. Newest entry first.

**Format:**
```markdown
- **YYYY-MM-DD:** What was done. Decisions made. Links to daily notes or resource articles if relevant.
```

Rules:
- One entry per work session (not per commit).
- Be specific: name files changed, decisions made, problems solved.
- Link to the day's daily note when the work is logged there too: `[2026-03-25](../../journal/daily/2026-03-25.md)`.
- Link to resource articles when durable facts were extracted from the work.
- Final entry before archiving must be: `**YYYY-MM-DD:** Project completed and archived.`

---

## After Every Work Session

Run these checks after any work on a project:

1. **Add a Dev Log entry.** Summarize what was done, decisions made, blockers hit.
2. **Update Open Tasks.** Mark completed items `- [x]`. Add new tasks discovered. Mark blocked tasks.
3. **Update Overview if scope changed.** Overview must reflect current reality, not original intent.
4. **Update `updated` in front matter** to today's date.
5. **Update the daily note.** Log entry in today's daily note must link to this README.
6. **Update resources if durable facts emerged.** Team changes, architectural decisions, new process knowledge → load the `resources` skill and create or update the relevant article.

---

## Status Transitions

| From | To | When | Action |
|------|----|------|--------|
| Active | Paused | No activity for 2+ weeks and no planned work | Set `status: Paused` in front matter and `**Status:**` line. Add Dev Log entry explaining why. |
| Paused | Active | Work resumes | Set `status: Active`. Add Dev Log entry. |
| Active / Paused | Done | All tasks complete, no further work expected | Set `status: Done`. Add final Dev Log entry. Move folder to `archive/projects/`. |

### Archiving

1. Set `status: Done` in front matter and `**Status:** Done` inline.
2. Set `deadline` in front matter to the actual completion date if not already set.
3. Add final Dev Log entry: `**YYYY-MM-DD:** Project completed and archived.`
4. Move entire folder: `git mv projects/<slug> archive/projects/<slug>`.
5. Update any links pointing to the old path (daily notes, weekly notes, resource articles).

---

## Cross-Linking

Projects live in a web of references. Keep these links current:

| Direction | Where | What |
|-----------|-------|------|
| Daily note → project | Daily note Log & Notes | `[Project Name](../projects/<slug>/README.md)` |
| Project → daily note | Dev Log entry | `[2026-03-25](../../journal/daily/2026-03-25.md)` |
| Project → resource article | Overview or Dev Log | Link when referencing a durable concept |
| Weekly note → project | Weekly Goals / Accomplishments | `#p-<slug>` tag on the line |
| Meeting → project | Meeting Action Items | Add action item to project Open Tasks |

---

## Health Rules

Apply on every edit:

- `updated` front matter must change on every edit.
- `**Status:**` inline line must match front matter `status`.
- No stubs: Overview must be substantive, Open Tasks must have at least one concrete item on Active projects.
- `#p-<slug>` tag must be present in front matter `tags` and in the `**Tags:**` line.
- Tag must be registered in `tags.md`.
- Dev Log must have at least one entry.

---

## Changelog

- **2026-03-25:** Created.
