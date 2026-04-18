---
name: journal/weekly
description: Weekly note format and philosophy — sections, Monday planning flow, Friday wrap-up, and carry-over migration. Load when creating a weekly note, running Monday planning, running Friday wrap-up, or updating any weekly note section.
compatibility: opencode
updated: 2026-04-18
---

<role>Weekly note steward — one-level-up summary of intent, accomplishment, learning, carry-over.</role>

<summary>
> Weekly = summary, not log. Details live in dailies; weeklies link but never repeat. Friday wrap-up surfaces patterns invisible at daily scale and makes lessons explicit before the weekend erases them.
</summary>

<file_format>
Location: `journal/weekly/`, named `YYYY-WNN.md` (ISO week, zero-padded). One file per week.

Front matter:
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

H1 + nav:
```markdown
# Week NN: YYYY-MM-DD -- YYYY-MM-DD

[← prev-week](../weekly/YYYY-WNN.md) | [next-week →](../weekly/YYYY-WNN.md)
```

VERIFY targets; OMIT if missing.
</file_format>

<sections>
**Daily Notes** — Mon–Fri links:
```
- [Monday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Tuesday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Wednesday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Thursday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
- [Friday YYYY-MM-DD](../daily/YYYY-MM-DD.md)
```
Mark missing days `*(no note)*`.

**Weekly Focus** — single theme, one line, tagged with `#p-`/`#t-`/topic.
**Weekly Goals** — task checkboxes, seeded from prior week's Carry-Over during Monday planning.
**Accomplishments** — bullets, one short line each. Friday only.
**Failures & Setbacks** — planned-not-done, missed goals. Friday only.
**Carry-Over** — items moving forward, tagged. Friday only.
**Notes & Reflections** — free-form, min 2 sentences. Friday only.
</sections>

<creation_steps>
1. Copy `.opencode/skills/journal/weekly-template.md`.
2. Replace: `{{WEEK_NUMBER}}`, `{{WEEK_ID}}`, `{{WEEK_START}}`, `{{WEEK_END}}`, `{{PREV_WEEK_FILE}}`, `{{NEXT_WEEK_FILE}}`, `{{MON_DATE}}`–`{{FRI_DATE}}`.
3. Created on Monday during weekly planning.
</creation_steps>

<monday_flow>
Fill on Monday:
- **Weekly Focus** — ask user for theme.
- **Weekly Goals** — seed from prior Carry-Over; ask for additions/removals.
- **Daily Notes** — populate Monday link; Tue–Fri `*(no note)*`.

LEAVE EMPTY: Accomplishments, Failures, Carry-Over, Notes.
</monday_flow>

<friday_flow>
Fill on Friday after daily evening close-out:
- **Accomplishments** — compile from week's daily Evening > Completed.
- **Failures & Setbacks** — unmet goals, uncompleted tasks.
- **Carry-Over** — collect incomplete; confirm with user (carry vs drop).
- **Notes & Reflections** — prompt: "What did this week prove? What would you do differently?" Min 2 sentences. NEVER blank.
- Mark completed goals `- [x]`.
- **Waiting-For review** — scan `journal/waiting-for.md` Active. Flag follow-ups on/before today.

### Resources Scan (end of wrap-up)
1. Scan week's daily logs and meeting notes.
2. Identify: role/team changes, process decisions, architecture choices, tool adoptions.
3. For each fact: update existing article OR create new one.
4. Run `node .opencode/scripts/health-stale.js` to surface stale articles referenced this week.
</friday_flow>

<self_review>
- [ ] Front matter complete (`type`, `week`, `date_start`, `date_end`, `updated`, `tags`)?
- [ ] H1 follows `Week NN: YYYY-MM-DD -- YYYY-MM-DD`?
- [ ] Nav links verified or omitted?
- [ ] All seven sections present in order?
- [ ] Daily Notes links current?
- [ ] Weekly Goals use checkbox format?
- [ ] Items are one-line summaries, not logs?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, tags remain English.
</output_rules>
