---
name: journal/weekly
description: Weekly note format and philosophy — sections, Monday planning flow, Friday wrap-up, and carry-over migration. Load when creating a weekly note, running Monday planning, running Friday wrap-up, or updating any weekly note section.
compatibility: opencode
---

## Philosophy

The weekly note is a **summary, not a log**. Its purpose is a one-level-up view of the week: what was intended, what was accomplished, what was learned, and what carries forward. Details live in daily notes — weekly notes link to them but never repeat them.

The **weekly rhythm** surfaces patterns that are invisible at the daily scale. A single bad day might be noise. A recurring pattern across four Fridays is a signal worth acting on.

The **Friday wrap-up** is a deliberate reflection ritual, not a chore. The questions — *What did this week prove? What would you do differently?* — are designed to make the week's lessons explicit before the weekend erases them.

---

## File Format

Weekly notes live in `journal/weekly/`, named `YYYY-WNN.md` (ISO week, zero-padded). One file per week.

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

### H1 and Navigation Bar

```markdown
# Week NN: YYYY-MM-DD -- YYYY-MM-DD

[← prev-week](../weekly/YYYY-WNN.md) | [next-week →](../weekly/YYYY-WNN.md)
```

Verify link targets exist before writing them. Omit if target does not exist.

---

## Sections (in order)

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

**Weekly Goals** — task checkboxes. Seeded from previous week's Carry-Over during Monday planning.

**Accomplishments** — bullet list. Each item one short line. Filled in during Friday wrap-up only.

**Failures & Setbacks** — items planned but not completed, or goals missed. Filled in during Friday wrap-up only.

**Carry-Over** — items moving to next week. Bullet list or checkboxes. Each item tagged. Filled in during Friday wrap-up only.

**Notes & Reflections** — free-form. Minimum 2 sentences. Filled in during Friday wrap-up only.

---

## Creating a New Weekly Note

1. Copy `.opencode/skills/journal/weekly-template.md`.
2. Replace all placeholders: `{{WEEK_NUMBER}}`, `{{WEEK_ID}}`, `{{WEEK_START}}`, `{{WEEK_END}}`, `{{PREV_WEEK_FILE}}`, `{{NEXT_WEEK_FILE}}`, `{{MON_DATE}}` through `{{FRI_DATE}}`.
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

Fill in on Friday, after completing the daily evening close-out:
- **Accomplishments** — compile from the week's daily notes Evening > Completed sections.
- **Failures & Setbacks** — identify unmet goals and uncompleted tasks.
- **Carry-Over** — collect incomplete tasks; confirm with user what carries vs. drops.
- **Notes & Reflections** — prompt: "What did this week prove? What would you do differently?" Minimum 2 sentences. Do not leave blank.
- Mark completed goals with `- [x]`.
- **Waiting-For review** — scan `waiting-for.md` Active items. Flag any whose follow-up date is on or before today.

### Resources Scan (end of weekly wrap-up)

Review the week's daily notes and meeting notes for durable facts not yet captured in resources:
1. Scan all daily log entries and meeting discussions from the week.
2. Identify: role changes, team updates, process decisions, architecture choices, tool adoptions.
3. For each durable fact: check if a resource article exists. If yes, update it. If no, create one.
4. Run `node .opencode/scripts/health-stale.js` to surface resource articles referenced this week but not updated recently.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `week`, `date_start`, `date_end`, `updated`, `tags`?
- [ ] H1 follows `Week NN: YYYY-MM-DD -- YYYY-MM-DD` format?
- [ ] Navigation bar links verified (or omitted if target missing)?
- [ ] All seven sections present in order?
- [ ] Daily Notes links current for the week?
- [ ] Weekly Goals use task checkbox format?
- [ ] Items are one-line summaries (not logs)?
