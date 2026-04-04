---
name: writing/daily
description: Daily note format rules — file naming, front matter, sections, navigation, task states
compatibility: opencode
---

This sub-skill extends `writing`. Load `writing` first, then load `writing/daily` when creating or updating daily notes.

---

## File Format

Daily notes live in `journal/daily/`, named `YYYY-MM-DD.md`. One file per day.

### Front Matter

```yaml
---
type: daily
date: YYYY-MM-DD
weekday: Monday
week: "YYYY-WNN"
updated: YYYY-MM-DD
tags: []
---
```

- `type`: always `daily`.
- `date`: ISO 8601 date of the note.
- `weekday`: full weekday name (e.g. `Monday`).
- `week`: ISO week identifier without `.md` (e.g. `"2026-W09"`).
- `updated`: today's date — update on every edit.
- `tags`: usually `[]` unless specific project/team tags are warranted.

### H1 and Navigation Bar

```markdown
# YYYY-MM-DD: Weekday

[← prev-date](prev-date.md) | [Week NN](../weekly/YYYY-WNN.md) | [next-date →](next-date.md)
```

- H1: `# YYYY-MM-DD: Weekday` (e.g. `# 2026-03-15: Sunday`).
- Navigation bar: links to previous day, current week, and next day.
- Omit the previous-day link if no previous daily note exists (e.g. Monday with no weekend note).
- Omit the next-day link if the next day's note does not exist yet.
- Always verify link targets exist before writing them.

### Sections (in order)

**Tasks** — task checkboxes. Use task state formats:

| State | Format |
|-------|--------|
| Open | `- [ ] text` |
| Done | `- [x] text` |
| Moved | `- [ ] ~~text~~ → [date](link)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` |
| Blocked | `- [ ] text *(blocked: reason)*` |

**Events & Meetings** — times in bold (e.g. `**10:00–10:30**`). Link to meeting note files where they exist.

**Blockers & Time Off** — non-work time sinks: doctor visits, errands, personal blockers.

**Log & Notes** — bullet list of what was done. Be specific: name files changed, problems solved, decisions made. Tag each entry with relevant `#p-`, `#t-`, `#person-`, or topic tags.

**Day Summary** — 1–2 sentences on how the day went, then a bold task stats line (done/total, blocked, moved, dropped). Must end with: `End-of-day scan: [items actioned, or "nothing pending"].`

---

## Creating a New Daily Note

1. Copy `.opencode/templates/daily-template.md`.
2. Replace all placeholders: `{{DATE}}`, `{{DAY}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`.
3. Check `recurring-events.md` — populate Events & Meetings with events scheduled for this weekday. For biweekly events, calculate whether this week's Monday is an even number of weeks from the anchor date.
4. Verify navigation links (prev/next) exist before writing them.

---

## Monday Morning: Include Weekly Planning

When creating/updating a daily note on **Monday**, also perform weekly planning:

1. Create the weekly note (`journal/weekly/YYYY-WNN.md`) using the weekly template if it does not exist.
2. Review last week's **Carry-Over** items. Seed this week's **Weekly Goals** from them.
3. Ask the user for the **Weekly Focus** (main theme for the week).
4. Check Jira for sprint status and upcoming deadlines — surface relevant items as tasks or goals.
5. Check Confluence for recently updated pages in watched spaces — flag anything needing attention.

This replaces the standalone `/week-plan` command. Load `writing/weekly` for the weekly note format.

---

## Friday Evening: Trigger Weekly Wrap-Up

When updating a daily note on **Friday** during the evening routine, also trigger the weekly wrap-up:

1. Complete the daily evening workflow first (task review, log entries, day summary).
2. Then switch to the weekly note and run the Friday Wrap-Up Flow (defined in `writing/weekly`).
3. Compile **Accomplishments** from the week's daily notes.
4. Identify **Failures & Setbacks** from unmet goals.
5. Collect **Carry-Over** items — confirm with user what carries vs. drops.
6. Write **Notes & Reflections** — prompt: "What did this week prove? What would you do differently?"

This replaces the standalone `/week-wrap` command.

---

## Updating a Daily Note

Log every substantive action during a session in **Log & Notes**. This includes:
- Files changed, problems solved, decisions made.
- Task state changes (moved, dropped, blocked).
- Meetings recorded.
- KB updates made.

Mark completed tasks with `- [x]`. Add new tasks if the session surfaced them.

Cross-link: log entries should link to project READMEs or KB articles where relevant.

### Proactive Resource Scan

At the end of every daily note update, scan for resource enrichment opportunities:

- Did a meeting reveal a person's role change, team structure update, or process decision? Update the relevant resource article.
- Did a work session produce architectural knowledge, component ownership facts, or process observations? Capture in resources.
- Did you mention a concept, person, team, or tool with no resource article? Flag it as a candidate for creation.

Do not wait for an explicit resources task. Surface gaps and fill them as part of daily work.

---

## Append-Only Rule

Never delete or overwrite past daily notes. They are an append-only log. You may add content or mark tasks complete, but never remove existing lines.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `weekday`, `week`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Weekday` format?
- [ ] Navigation bar links verified to exist (or omitted if target missing)?
- [ ] All five sections present in order?
- [ ] Tasks use correct state formats?
- [ ] Log entries are specific (files, decisions, names)?
- [ ] Log entries carry inline tags?
- [ ] Day Summary ends with `End-of-day scan:` line?
- [ ] Monday: weekly note created/updated with focus and goals?
- [ ] Friday: weekly wrap-up completed?
- [ ] Resource scan: any durable facts captured to KB?
