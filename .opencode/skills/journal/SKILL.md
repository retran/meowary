---
name: journal
description: Journal layer philosophy and sub-skill index — append-only principles, front matter rules, reading list management, waiting-for list management, and routing to daily, weekly, and meeting sub-skills. Load when creating or updating any journal file, adding items to the reading list or waiting-for list, or routing to a sub-skill for format details.
compatibility: opencode
---

## Philosophy

The journal is the **episodic layer** of the second brain — the append-only temporal record of what happened, what was done, and what was learned. Unlike `resources/` (permanent knowledge graph, concept-indexed, freely restructured) and `projects/` (active work toward a defined end), the journal is immutable once written. The past is a record, not a draft.

Three formats live in the journal:

- **Daily notes** (`journal/daily/`) — the atomic unit. One file per day, three temporal zones (Morning, Day, Evening).
- **Weekly notes** (`journal/weekly/`) — rhythmic summaries compiled from daily notes. One file per week.
- **Meeting notes** (`journal/meetings/`) — conversation records, complete with routed action items. One file per meeting.

---

## Principles

1. **Append-only.** Past notes are never edited or deleted. Mark tasks complete; add new content; never remove existing lines.
2. **Distil → resources.** Every journal update includes a resources scan. Durable facts — role changes, process decisions, architectural choices — belong in `resources/`, not the journal. The journal is raw material; resources distil the permanent layer.
3. **Format serves recall.** Rigid section structures make notes machine-readable and scannable. Deviating makes future retrieval harder.
4. **Write for your future self.** Assume the reader is you in 6 months with no other context.
5. **Routing is not optional.** Meeting action items, waiting items, and captured tasks must be routed before a workflow closes. An unrouted action is a commitment that will be forgotten.

---

## Front Matter

Every journal file begins with a YAML front matter block.

- `updated` — mandatory. Set on creation; update on every edit.
- `tags` — mandatory. May be `[]`. Lowercase kebab-case, no `#` prefix.
- Inline `#tags` in body text must match front matter tags.
- Navigation links (prev/next day, prev/next week): verify targets exist before writing. Omit links to non-existent files.
- Use relative Markdown links — `[text](../path/file.md)` — never Wikilinks.

---

## Sub-skills

| Content type | Sub-skill file |
|---|---|
| Daily notes (`journal/daily/`) | [daily.md](daily.md) |
| Weekly notes (`journal/weekly/`) | [weekly.md](weekly.md) |
| Meeting notes (`journal/meetings/`) | [meeting.md](meeting.md) |

---

## Templates

| Template | Use for |
|---|---|
| [daily-template.md](daily-template.md) | New daily notes |
| [weekly-template.md](weekly-template.md) | New weekly notes |
| [meeting-template.md](meeting-template.md) | New meeting notes |

---

## Reading List

The reading list lives at `journal/reading-list.md`. It is a simple table of books, articles, and other material to read or that has been read.

> **Before using this file:** Check that `journal/reading-list.md` exists. If not, copy from `.opencode/meta-templates/reading-list-template.md`.

### Format

Each item is a row in the table:

```markdown
| Title | Type | Status | Notes |
| ----- | ---- | ------ | ----- |
| [Title](url-or-path) | book / article / paper / video | to-read / reading / done | Why it matters; key insight; connects to |
```

- **Type:** `book`, `article`, `paper`, `video`, or `thread`
- **Status:** `to-read`, `reading`, or `done`
- **Notes:** not optional — capture at minimum *why* you added it

### Adding an item

When the user mentions a book, article, or resource they want to read or have just encountered:

1. Check that `journal/reading-list.md` exists; create from template if not.
2. Append a new row to the table with status `to-read`.
3. Populate Notes with the reason for adding (context from the conversation or the user's stated reason).

### Updating an item

When the user finishes or starts a resource:

- Change `to-read` → `reading` when they start.
- Change `reading` → `done` when they finish; add the key insight to Notes.

---

## Waiting-For List

The waiting-for list lives at `journal/waiting-for.md`. It tracks every item delegated, blocked, or waiting on someone else — a durable list that persists across sessions until each item is resolved.

> **Before using this file:** Check that `journal/waiting-for.md` exists. If not, copy from `.opencode/meta-templates/waiting-for-template.md`.

### Format

Two sections: `## Active` (open items) and `## Resolved` (closed items).

Each active item is one line:

```markdown
- **YYYY-MM-DD** | **<context>** | <what I am waiting for> | follow-up: <YYYY-MM-DD> | @<person-or-system>
```

Example:
- `- **2026-04-08** | **PROJ-123** | PR review from Alice | follow-up: 2026-04-10 | @alice`

When an item is resolved: move the line from `## Active` to `## Resolved` and append ` → resolved YYYY-MM-DD`.

### Routing rules

| Source | Action |
|--------|--------|
| Meeting action item (waiting on someone) | Append to `## Active` |
| Daily note `## Day > ### Waiting` item | Append to `## Active` (evening close-out) |
| Weekly wrap-up overdue review | Surface flagged items; close or extend follow-up dates |
| Item resolved | Move to `## Resolved` |

### Append rules

- Never edit or delete past lines in `## Resolved`.
- Check for duplicates before appending — do not add an item already in `## Active`.
- Always include a `follow-up:` date so the morning and evening workflows can surface overdue items.
