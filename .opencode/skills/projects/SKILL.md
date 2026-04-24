---
name: projects
description: Project dashboard format, lifecycle, and Step 0 state-reading protocol — tasks, dev log, status, companion file structure, cross-linking, and archiving. Load when creating a project, updating a dashboard, reading project state at the start of any lifecycle workflow, or archiving a completed project.
compatibility: opencode
updated: 2026-04-18
---

<role>Project dashboard steward — persistent contract of what a project is, where it stands, what's next.</role>

<summary>
> A project = time-bound deliverable with a defined end. README is canonical state; dev-log is continuity layer. Every session ends with dev-log entry; every session starts by reading the last one. Done = archived state, not a feeling.
</summary>

<principles>
- **Dashboards over notes.** README is canonical. Daily/meeting notes reference; never replace.
- **Dev log = continuity layer.** Every session ends with entry; next session starts by reading last.
- **Done = state.** Unarchived projects in `projects/` are active.
</principles>

<structure>
Every project at `projects/<slug>/README.md`. Slug = lowercase kebab-case (e.g. `mcp-client`, `release-tooling`).

**Required sections, in order:**

```
# <Project Name>

**Status:** Active | Paused | Done
**Deadline:** YYYY-MM-DD | TBD
**Tags:** #p-<slug>
**Dev Log:** [dev-log.md](dev-log.md)

## Overview

## Open Tasks
```

**Optional:** Insert **Completed Tasks** section after Open Tasks once `- [x]` items accumulate.

**Companion files:**

| File | Purpose |
|------|---------|
| `dev-log.md` | Persistent cross-session log (append-only) |
| `resources.md` | Links, snippets, references |
| `specs/` | Brainstorm output — problem specs |
| `plans/` | Implementation plans linked to specs |
| `drafts/` | Document brainstorms (proposals, RFCs, ADRs) |
| `adr-<slug>.md` | Architecture Decision Records project-specific |
| `<topic>.md` | Design docs, spike notes |
</structure>

<creation_steps>
1. Create `projects/<slug>/` folder.
2. Copy `.opencode/skills/projects/project-template.md` → `projects/<slug>/README.md`.
3. Replace placeholders: `{{PROJECT_NAME}}`, `{{PROJECT_SLUG}}`, `{{DEADLINE}}`, `{{DATE}}`.
4. Write substantive **Overview** — what it is, what it delivers, why exists. NO placeholder text.
5. Add ≥1 concrete **Open Task**.
6. Register `#p-<slug>` in `meta/tags.md` (projects table).
7. Create `projects/<slug>/dev-log.md` from `.opencode/skills/projects/dev-log-template.md`.
8. If today's daily exists, add log entry linking new README.
9. If weekly note exists, consider adding weekly goal.
</creation_steps>

<step_zero_protocol>
Run at start of any lifecycle workflow to re-establish context without asking the user.

### 1. Read active projects

Open `context/context.md`. Find `## Active Projects`. Format:
```
- **<slug>:** <description> | phase: <phase> | priority: high|medium|low
```

Extract: slug, current phase, priority for each.

**Fallback:** If `context/context.md` absent, no `## Active Projects` section, or empty:
- Glob `projects/*/dev-log.md`; read last entry from each to identify active projects.
- If still ambiguous, ASK: "Which project is this session for?"

**If `context/context.md` empty/missing:** STOP and direct user to run `/bootstrap`.

### 2. Determine active project

- User specified slug at invocation → use it.
- One project listed → use without asking.
- Multiple active + unspecified → read last `dev-log.md` entry across all; use most recent. If still unclear, ASK once: "Which project?" — DO NOT guess.

### 3. Read dev-log last entry

Open `projects/<slug>/dev-log.md`. Read first `##`-level heading after front matter — most recent entry.

Extract:
- `**Phase:**` — current phase
- `**Summary:**` — last accomplished
- `**Next:**` — suggested next action
- Workflow-specific fields (`**Gaps:**`, `**Root cause:**`, `**Decision:**`, etc.)

If `dev-log.md` missing/empty: treat as fresh start; note this; ASK user for context.

### 4. Read today's daily note (if exists)

Open `journal/daily/<date>.md` if exists. Scan for relevant tasks/notes. DO NOT create the daily note — that is `/morning`'s job.

### 5. Surface context before clarification

Before any clarification, present:
- Active project: `<slug>` — Phase: `<phase>` — Last: `<summary>`
- Suggested next from dev-log: `<next>`
- Relevant daily note tasks
- Whether `dev-log.md` was missing (fresh start)

DO NOT ask questions yet — present context first.

**Notes:** DO NOT load `codebases/<name>.md` in Step 0 — load just-in-time. For `/r` workflows, read `meta/resources-log.md` instead of `dev-log.md`.
</step_zero_protocol>

<task_management>
| State | Format | Example |
|-------|--------|---------|
| Open | `- [ ] text` | `- [ ] Write spike doc` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [YYYY-MM-DD](../../journal/daily/YYYY-MM-DD.md)` | `- [ ] ~~Write ADR~~ → [2026-03-25](../../journal/daily/2026-03-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

Rules:
- NEVER delete to change state — mark in place.
- Moved tasks MUST link to target daily note + add task there.
- Dropped/blocked require short reason in italics.

When Open Tasks > ~8 items (incl. done), MOVE all `- [x]` to **Completed Tasks** section after Open Tasks.
</task_management>

<after_session>
1. **Write dev-log entry.** See [dev-log.md](dev-log.md).
2. **Update Open Tasks.** Mark complete; add new; mark blocked.
3. **Update Overview if scope changed.** Reflect current reality.
4. **Update `updated` front matter** to today.
5. **Update daily note.** Log entry MUST link to README.
6. **Resource enrichment** — scan session for durable facts (architecture insights, patterns, tool decisions, process changes). For each:
   - Existing article in `resources/`? → append fact with source link.
   - No article? → create stub (front matter + H1 + 1-sentence fact).
   - Nothing durable? → note "no enrichment needed" in dev-log.
</after_session>

<status_transitions>
| From | To | When | Action |
|------|----|------|--------|
| Active | Paused | 2+ weeks no activity, no planned work | Set `status: Paused`; add Dev Log entry explaining. |
| Paused | Active | Work resumes | Set `status: Active`; add Dev Log entry. |
| Active/Paused | Done | All tasks complete, no further work | Set `status: Done`; final Dev Log entry; move to `archive/projects/`. |
</status_transitions>

<archiving>
1. Set `status: Done` in front matter and `**Status:** Done` inline.
2. Set `deadline` to actual completion date if not set.
3. Add final dev-log entry: `**Phase:** done`, `**Summary:** <what completed>`, `**Next:** project archived`.
4. Move folder: `git mv projects/<slug> archive/projects/<slug>`.
5. Update inbound links (daily, weekly, resources).
</archiving>

<cross_linking>
| Direction | Where | What |
|-----------|-------|------|
| Daily → project | Daily Log & Notes | `[Project Name](../projects/<slug>/README.md)` |
| Project → daily | Dev Log entry | `[2026-03-25](../../journal/daily/2026-03-25.md)` |
| Project → resource | Overview/Dev Log | Link when referencing durable concept |
| Weekly → project | Goals/Accomplishments | `#p-<slug>` tag on line |
| Meeting → project | Action Items | Add action to project Open Tasks |
</cross_linking>

<health_rules>
- `updated` front matter MUST change on every edit.
- `**Status:**` inline MUST match front matter `status`.
- NO stubs: Overview substantive; Open Tasks ≥1 concrete item on Active.
- `#p-<slug>` MUST be in front matter `tags` AND `**Tags:**` line.
- Tag MUST be registered in `meta/tags.md`.
- `dev-log.md` MUST exist with ≥1 entry.
</health_rules>

<sub_skills>
| Content type | Sub-skill |
|---|---|
| Architecture Decision Records | [adr.md](adr.md) |
| Dev log entries | [dev-log.md](dev-log.md) |
| Problem specs | [spec.md](spec.md) |
| Implementation plans | [plan.md](plan.md) |
| Requests for Comments | [rfc.md](rfc.md) |
</sub_skills>

<templates>
| Template | Use for |
|---|---|
| [project-template.md](project-template.md) | New project README |
| [dev-log-template.md](dev-log-template.md) | New `dev-log.md` |
| [debug-log-template.md](debug-log-template.md) | New `debug-log.md` |
| [spec-template.md](spec-template.md) | New spec documents |
| [plan-template.md](plan-template.md) | New implementation plans |
| [rfc-template.md](rfc-template.md) | New RFCs |
| [draft-template.md](draft-template.md) | Other drafts and proposals |
</templates>

<self_review>
- [ ] Front matter complete (`type: project`, `status`, `deadline`, `updated`, `tags`)?
- [ ] `**Status:**` matches front matter `status`?
- [ ] `**Dev Log:**` link present pointing to `dev-log.md`?
- [ ] `#p-<slug>` in front matter `tags` AND `**Tags:**` line?
- [ ] `updated` set to today?
- [ ] Overview substantive — not placeholder?
- [ ] ≥1 concrete Open Task on Active projects?
- [ ] `#p-<slug>` registered in `meta/tags.md`?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, tags remain English.
</output_rules>
