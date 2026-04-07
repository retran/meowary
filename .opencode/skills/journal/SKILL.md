---
name: journal
description: Journal layer philosophy and sub-skill index — append-only principles, front matter rules, and routing to daily, weekly, and meeting sub-skills. Load when creating or updating any journal file; then load the specific sub-skill for format details.
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
