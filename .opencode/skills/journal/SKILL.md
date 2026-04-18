---
name: journal
description: Journal layer philosophy and sub-skill index — append-only principles, front matter rules, reading list management, waiting-for list management, and routing to daily, weekly, and meeting sub-skills. Load when creating or updating any journal file, adding items to the reading list or waiting-for list, or routing to a sub-skill for format details.
compatibility: opencode
updated: 2026-04-18
---

<role>Journal layer steward — append-only temporal record of work, decisions, and learning.</role>

<summary>
> The journal is the episodic layer of the second brain: daily notes (atomic unit, three zones), weekly notes (rhythmic summaries), meeting notes (records + routed actions). Once written, it is immutable. Distill durable facts into `resources/`; never edit the past.
</summary>

<principles>
1. **Append-only.** NEVER edit or delete past notes. Mark tasks complete; add new content; DO NOT remove existing lines.
2. **Distill → resources.** Every journal update includes a resources scan. Durable facts (role changes, decisions, architecture) belong in `resources/`, not the journal.
3. **Format serves recall.** Rigid section structures keep notes machine-readable.
4. **Write for your future self.** Assume reader is you in 6 months with no other context.
5. **Routing is mandatory.** Meeting actions, waiting items, and captures MUST be routed before workflow closes.
</principles>

<front_matter>
- `updated` — mandatory; set on creation, update on every edit.
- `tags` — mandatory; may be `[]`. Lowercase kebab-case, no `#` prefix.
- Inline `#tags` in body MUST match front matter tags.
- Navigation links: VERIFY targets exist before writing. OMIT links to non-existent files.
- USE relative Markdown links (`[text](../path/file.md)`); NEVER Wikilinks.
</front_matter>

<sub_skills>
| Content type | Sub-skill |
|---|---|
| Daily notes (`journal/daily/`) | [daily.md](daily.md) |
| Weekly notes (`journal/weekly/`) | [weekly.md](weekly.md) |
| Meeting notes (`journal/meetings/`) | [meeting.md](meeting.md) |
</sub_skills>

<templates>
| Template | Use for |
|---|---|
| [daily-template.md](daily-template.md) | New daily notes |
| [weekly-template.md](weekly-template.md) | New weekly notes |
| [meeting-template.md](meeting-template.md) | New meeting notes |
</templates>

<reading_list>
File: `journal/reading-list.md`. If missing, copy from `.opencode/meta-templates/reading-list-template.md`.

Format (table row):
```markdown
| Title | Type | Status | Notes |
| ----- | ---- | ------ | ----- |
| [Title](url-or-path) | book / article / paper / video | to-read / reading / done | Why it matters; key insight |
```

- **Type:** `book`, `article`, `paper`, `video`, `thread`
- **Status:** `to-read`, `reading`, `done`
- **Notes:** required — capture *why* added at minimum

**Add:** When user mentions material to read, append row with `to-read` status; populate Notes with reason.
**Update:** `to-read` → `reading` on start; `reading` → `done` on finish (add key insight).
</reading_list>

<waiting_for_list>
File: `journal/waiting-for.md`. If missing, copy from `.opencode/meta-templates/waiting-for-template.md`.

Two sections: `## Active` (open) and `## Resolved` (closed).

Active line format:
```markdown
- **YYYY-MM-DD** | **<context>** | <what waiting for> | follow-up: <YYYY-MM-DD> | @<person-or-system>
```

Example: `- **2026-04-08** | **PROJ-123** | PR review from Alice | follow-up: 2026-04-10 | @alice`

On resolve: move line to `## Resolved`, append ` → resolved YYYY-MM-DD`.

| Source | Action |
|--------|--------|
| Meeting action (waiting on someone) | Append to `## Active` |
| Daily `## Day > ### Waiting` item | Append to `## Active` (evening close-out) |
| Weekly overdue review | Surface flagged items; close or extend follow-up |
| Item resolved | Move to `## Resolved` |

- NEVER edit/delete lines in `## Resolved`.
- CHECK for duplicates before appending.
- ALWAYS include `follow-up:` date.
</waiting_for_list>

<output_rules>
Output language: English. Match user's language for ad-hoc replies; structural elements (frontmatter, section headers, tags) remain English.
</output_rules>
