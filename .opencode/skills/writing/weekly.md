---
name: writing/weekly
description: Weekly note format rules — file naming, front matter, sections, planning and wrap-up flows
compatibility: opencode
---

This sub-skill extends `writing`. Load `writing` first, then load `writing/weekly` when creating or updating weekly notes.

---

## File Format

Weekly notes live in `journal/weekly/`, named `YYYY-WNN.md` (ISO week numbering, zero-padded). One file per week.

### Front Matter

```yaml
---
type: weekly
week: "YYYY-WNN"
date_start: YYYY-MM-DD
date_end: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
---
```

- `type`: always `weekly`.
- `week`: full ISO week identifier (e.g. `"2026-W09"`).
- `date_start`: Monday's date.
- `date_end`: Friday's date.
- `updated`: today's date — update on every edit.
- `tags`: usually `[]` unless specific project/team tags are warranted.

### H1 and Navigation Bar

```markdown
# Week NN: YYYY-MM-DD -- YYYY-MM-DD

[← prev-week](../weekly/YYYY-WNN.md) | [next-week →](../weekly/YYYY-WNN.md)
```

- H1: `# Week NN: YYYY-MM-DD -- YYYY-MM-DD` (Monday to Friday range).
- Navigation bar: links to previous and next week notes.
- Verify link targets exist before writing them. Omit if target does not exist.

### Sections (in order)

**Daily Notes** — links to each day's note, Monday through Friday:
```
- [Monday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Tuesday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Wednesday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Thursday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Friday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
```
Mark days with no note as `*(no note)*`.

**Weekly Focus** — single main theme for the week. One line. Tag with relevant `#p-`, `#t-`, or topic tags.

**Weekly Goals** — task checkboxes (same state formats as daily notes). Seeded from previous week's Carry-Over during Monday planning.

**Accomplishments** — bullet list. Each item one short line. Tag with relevant `#p-`, `#t-` tags. Filled in during Friday wrap-up only.

**Failures & Setbacks** — bullet list. Items are tasks planned but not completed, or goals missed. Filled in during Friday wrap-up only.

**Carry-Over** — items moving to next week. Bullet list or checkboxes. Each item tagged. Filled in during Friday wrap-up only.

**Notes & Reflections** — free-form. 2+ sentences minimum. Filled in during Friday wrap-up only.

---

## Creating a New Weekly Note

1. Copy `.opencode/templates/weekly-template.md`.
2. Replace all placeholders: `{{WEEK_NUMBER}}` (zero-padded, e.g. `09`), `{{WEEK_ID}}` (e.g. `2026-W09`), `{{WEEK_START}}`, `{{WEEK_END}}`, `{{PREV_WEEK_FILE}}`, `{{NEXT_WEEK_FILE}}`, `{{MON_DATE}}` through `{{FRI_DATE}}`.
3. Created on Monday during weekly planning.

---

## Monday Planning Flow

Fill in on Monday:
- **Weekly Focus** — ask user for the main theme.
- **Weekly Goals** — seed from previous week's Carry-Over, then ask if anything should be added or removed.
- **Daily Notes** links — populate Monday's link; mark Tuesday–Friday as `*(no note)*` until notes are created.

Leave empty: Accomplishments, Failures & Setbacks, Carry-Over, Notes & Reflections.

---

## Friday Wrap-Up Flow

Fill in on Friday, after completing the daily evening wrap-up:
- **Accomplishments** — compile from the week's daily notes Evening > Completed sections and Day > Inbox sections. One line per item.
- **Failures & Setbacks** — identify unmet goals and uncompleted tasks.
- **Carry-Over** — collect incomplete tasks; confirm with user what carries vs. drops.
- **Notes & Reflections** — prompt: "What did this week prove? What would you do differently?" Minimum 2 sentences. Do not leave blank.
- Mark completed goals with `- [x]`.
- **Waiting-For review** — open `waiting-for.md` and scan all Active items. Flag any whose follow-up date is on or before today. For each flagged item: note it in Notes & Reflections or carry it forward as an MIT candidate for next week.

### Resources Scan (end of weekly wrap-up)

Review the week's daily notes and meeting notes for durable facts not yet captured in resources:

1. Scan all daily log entries and meeting discussions from the week.
2. Identify: role changes, team updates, process decisions, architecture choices, tool adoptions.
3. For each durable fact found: check if a resource article exists. If yes, update it. If no, create one or flag for creation.
4. Check `knowledge-graph.md` for articles with `actualized` older than 2 weeks that were referenced this week — flag as stale.

This scan consolidates what might have been missed during individual daily resource scans.

---

## Granularity Rule

Weekly notes are summaries, not logs. Each bullet in Accomplishments, Failures, or Goals is one short line. Details belong in daily notes — link to them if needed.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `week`, `date_start`, `date_end`, `updated`, `tags`?
- [ ] H1 follows `Week NN: YYYY-MM-DD -- YYYY-MM-DD` format?
- [ ] Navigation bar links verified (or omitted if target missing)?
- [ ] All seven sections present in order?
- [ ] Daily Notes links current for the week?
- [ ] Weekly Goals use task checkbox format?
- [ ] Items are one-line summaries (not logs)?
