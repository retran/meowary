---
name: projects
description: Project dashboard format, lifecycle, and Step 0 state-reading protocol — tasks, dev log, status, companion file structure, cross-linking, and archiving. Load when creating a project, updating a dashboard, reading project state at the start of any lifecycle workflow, or archiving a completed project.
compatibility: opencode
---

## Philosophy

A project is a time-bound deliverable with a defined end. The dashboard is not just task management — it is a persistent contract with your future self about what this project is, where it stands, and what comes next. The dev log is the memory; the README is the current state.

- **Dashboards over notes.** The README is the canonical source of project state. Daily notes and meeting notes reference it; they do not replace it.
- **The dev log is the continuity layer.** Every session ends with a dev-log entry. Every session starts by reading the last one. Without this, context is rebuilt from scratch each time.
- **Done is a state, not a feeling.** A project is not done until it is archived. Unarchived projects in `projects/` are active.

---

## Structure

Every project lives at `projects/<slug>/README.md`. The slug is lowercase kebab-case (e.g. `mcp-client`, `release-tooling`).

### Required sections, in order

```
# <Project Name>

**Status:** Active | Paused | Done
**Deadline:** YYYY-MM-DD | TBD
**Tags:** #p-<slug>
**Dev Log:** [dev-log.md](dev-log.md)

## Overview

## Open Tasks
```

### Optional sections

Insert a **Completed Tasks** section after Open Tasks once completed tasks accumulate and clutter Open Tasks.

### Companion files

Store companion files alongside the README in the same folder:

| File | Purpose |
|------|---------|
| `dev-log.md` | Persistent cross-session work log (append-only) |
| `resources.md` | Links, snippets, references |
| `specs/` | Brainstorm output — problem specs with options |
| `plans/` | Implementation plans linked to specs |
| `drafts/` | Document brainstorm output (proposals, RFCs, ADRs) |
| `adr-<slug>.md` | Architecture Decision Records specific to this project |
| `<topic>.md` | Design docs, spike notes |

---

## Creating a Project

1. Create `projects/<slug>/` folder.
2. Copy `.opencode/skills/projects/project-template.md` → `projects/<slug>/README.md`.
3. Replace all placeholders: `{{PROJECT_NAME}}`, `{{PROJECT_SLUG}}`, `{{DEADLINE}}`, `{{DATE}}`.
4. Write a real **Overview** — what the project is, what it delivers, why it exists. No placeholder text.
5. Add at least one concrete **Open Task**.
6. Register `#p-<slug>` in `meta/tags.md` (projects table).
7. Create `projects/<slug>/dev-log.md` from `.opencode/skills/projects/dev-log-template.md`.
8. If today's daily note exists, add a log entry linking to the new README.
9. If a weekly note exists, consider adding a weekly goal.

---

## Reading Project State (Step 0)

Run this at the start of any lifecycle workflow to re-establish context without asking the user.

### 1. Read active projects

Open `context/context.md`. Find the `## Active Projects` section. Each entry follows this format:

```
- **<slug>:** <description> | phase: <phase> | priority: high|medium|low
```

Extract: slug, current phase, priority for each entry.

**Fallback:** If `context/context.md` is absent, has no `## Active Projects` section, or the section is empty:
- Glob `projects/*/dev-log.md` and read the last entry from each to identify active projects.
- If still ambiguous, ask the user: "Which project is this session for?"

**If `context/context.md` is empty or missing entirely:** stop and direct the user to run `/bootstrap`.

### 2. Determine the active project for this session

- If the user specified a project slug at invocation, use it.
- If only one project is listed in `context/context.md`, use it without asking.
- If multiple projects are active and the user did not specify: read the last `dev-log.md` entry across all projects; use the most recently updated one. If still unclear, ask once: "Which project?" — do not guess.

### 3. Read the dev-log last entry

Open `projects/<slug>/dev-log.md`. Read the first `##`-level heading after the front matter — this is the most recent entry.

Extract:
- `**Phase:**` — current phase
- `**Summary:**` — what was last accomplished
- `**Next:**` — suggested next action
- Any workflow-specific fields (`**Gaps:**`, `**Root cause:**`, `**Decision:**`, etc.)

If `dev-log.md` does not exist or is empty: treat as a fresh start. Note this and ask the user for context.

### 4. Read today's daily note (if exists)

Open `journal/daily/<date>.md` if it exists. Scan for tasks or notes relevant to the current workflow topic. Do not create the daily note in Step 0 — that is the responsibility of `/morning`.

### 5. Surface context before clarification

Before any clarification step, present:
- Active project: `<slug>` — Phase: `<phase>` — Last: `<summary>`
- Suggested next from dev-log: `<next>`
- Any relevant daily note tasks
- Whether `dev-log.md` was missing (fresh start)

Do not ask questions yet — just present context.

**Notes:** Do not load `codebases/<name>.md` in Step 0 — load it just-in-time in the step that needs it. If the workflow is a `/r` (knowledge graph) workflow, read `meta/resources-log.md` instead of a project `dev-log.md`.

---

## Task Management

Use these formats consistently across Open Tasks and any tasks in Dev Log entries:

| State | Format | Example |
|-------|--------|---------|
| Open | `- [ ] text` | `- [ ] Write spike doc` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [YYYY-MM-DD](../../journal/daily/YYYY-MM-DD.md)` | `- [ ] ~~Write ADR~~ → [2026-03-25](../../journal/daily/2026-03-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

Rules:
- Never delete a task to change its state — mark it in place.
- Moved tasks must link to the target daily note. Add the task there too.
- Dropped and blocked require a short reason in italics.

When Open Tasks accumulates more than ~8 items (including done items), move all `- [x]` items to a **Completed Tasks** section placed after Open Tasks.

---

## After Every Work Session

1. **Write a dev-log entry.** Append a new entry to `dev-log.md` summarizing what was done, decisions made, and blockers hit. See [dev-log.md](dev-log.md) for the format.
2. **Update Open Tasks.** Mark completed items `- [x]`. Add new tasks discovered. Mark blocked tasks.
3. **Update Overview if scope changed.** Overview must reflect current reality, not original intent.
4. **Update `updated` in front matter** to today's date.
5. **Update the daily note.** Log entry in today's daily note must link to this README.
6. **Update resources if durable facts emerged.** Team changes, architectural decisions, new process knowledge → create or update the relevant resource article.

---

## Status Transitions, Archiving, and Cross-Linking

### Status Transitions

| From | To | When | Action |
|------|----|------|--------|
| Active | Paused | No activity for 2+ weeks and no planned work | Set `status: Paused` in front matter and `**Status:**` line. Add Dev Log entry explaining why. |
| Paused | Active | Work resumes | Set `status: Active`. Add Dev Log entry. |
| Active / Paused | Done | All tasks complete, no further work expected | Set `status: Done`. Add final Dev Log entry. Move folder to `archive/projects/`. |

### Archiving

1. Set `status: Done` in front matter and `**Status:** Done` inline.
2. Set `deadline` in front matter to the actual completion date if not already set.
3. Add a final dev-log entry (see [dev-log.md](dev-log.md)): `**Phase:** done`, `**Summary:** <what was completed>`, `**Next:** project archived`.
4. Move entire folder: `git mv projects/<slug> archive/projects/<slug>`.
5. Update any links pointing to the old path (daily notes, weekly notes, resource articles).

### Cross-Linking

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
- Tag must be registered in `meta/tags.md`.
- `dev-log.md` must exist and have at least one entry.

---

## Sub-skills

| Content type | Sub-skill file |
|---|---|
| Architecture Decision Records | [adr.md](adr.md) |
| Dev log entries | [dev-log.md](dev-log.md) |
| Problem specs | [spec.md](spec.md) |
| Implementation plans | [plan.md](plan.md) |
| Requests for Comments | [rfc.md](rfc.md) |

---

## Templates

| Template | Use for |
|---|---|
| [project-template.md](project-template.md) | New project README |
| [dev-log-template.md](dev-log-template.md) | New `dev-log.md` |
| [debug-log-template.md](debug-log-template.md) | New `debug-log.md` |
| [spec-template.md](spec-template.md) | New spec documents |
| [plan-template.md](plan-template.md) | New implementation plans |
| [rfc-template.md](rfc-template.md) | New RFCs |
| [draft-template.md](draft-template.md) | Other drafts and proposals |

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: project`, `status`, `deadline`, `updated`, `tags`?
- [ ] `**Status:**` matches front matter `status`?
- [ ] `**Dev Log:**` link present and pointing to `dev-log.md`?
- [ ] `#p-<slug>` tag present in both front matter `tags` and `**Tags:**` line?
- [ ] `updated` front matter set to today?
- [ ] Overview is substantive — not a placeholder?
- [ ] At least one concrete Open Task present on Active projects?
- [ ] `#p-<slug>` registered in `meta/tags.md`?
