---
name: writing/daily
description: Daily note format rules — file naming, front matter, three-zone structure (Morning/Day/Evening), phase ownership, task states
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

---

## Three-Zone Structure

The daily note is divided into three temporal zones. Each zone is owned by a specific command or workflow phase. **Never fill a zone outside its designated phase.**

### `## Morning` — owned by `/morning`

Filled once, at the start of the day.

```
## Morning

Focus: <one sentence — what makes today a success; link to project tag where applicable>
★ MIT 1: <primary MIT — non-negotiable; must link to an active project or area>
  MIT 2: <optional>
  MIT 3: <optional>

Calendar: <events for the day, populated from recurring-events.md>
```

**MIT rules:**
- Soft limit of 3. If a 4th MIT is requested, warn: "You have 4 MITs — that defeats the forced-selection purpose. Consider dropping or deferring one."
- The primary MIT is prefixed with `★`. It is the one thing that makes today a success.
- At least one MIT must link to an active project using its tag (e.g. `Complete auth retry logic #p-myproject`).
- Completed MITs: `- [x]` in Evening > Completed, not edited in place.

**Focus format:** Freeform sentence. Encourage an inline project tag where applicable. Example: `Ship the payments retry logic #p-myproject`.

**Calendar format:** Times in bold (e.g. `**10:00–10:30**`). Link to meeting note files where they exist.

---

### `## Day` — populated throughout the day

Populated throughout the day as things happen. Three sub-sections:

```
## Day

### Inbox
(ephemeral bullets — raw captures: ideas, observations, requests, quick notes)
(processed in /evening; do NOT use /capture command for these)

### Events
(meetings logged as they happen — link to meeting note files)

### Waiting
(items delegated or blocked on others during this day)
(format: - [ ] @Person — item — YYYY-MM-DD delegated — follow-up by YYYY-MM-DD)
```

**Inbox vs. `inbox/` folder distinction:**

| Channel | What it's for | Lifetime | How to add |
|---------|---------------|----------|------------|
| `## Day > ### Inbox` | Raw same-day thoughts, reminders, quick ideas | Same-day; processed in `/evening` | Direct edit — no command |
| `inbox/` folder | Richer captures: URLs, ideas to develop, references to file | Until processed via `/r-plan` or `/r-ingest` | `/capture` command |

**Waiting format:** `- [ ] @Person — item delegated — YYYY-MM-DD delegated — follow-up by YYYY-MM-DD`

Items in Day > Waiting are appended to `waiting-for.md` (journal root) during `/evening`. Do not duplicate — the daily note is the log of new delegations; `waiting-for.md` is the authoritative list.

---

### `## Evening` — owned by `/evening`

Filled once, at the end of the day.

```
## Evening

### Completed
(MITs ticked off + any additional actions accomplished)

### Carried / Dropped
(unfinished MITs — each with a decision: carried to [date] or dropped, plus a reason)

### Insights → Resources
(durable facts distilled from today's work; each item linked to the resource article it was written to)

### Day Summary
(1–2 sentences on how the day went)
(bold task stats: **Done: N | Carried: N | Dropped: N**)
(End-of-day scan: [items actioned, or "nothing pending"])
```

**Insights → Resources** is a mandatory step, not optional. Every evening, look for at least one durable fact from the day's Inbox, Events, or Waiting that belongs in `resources/`. If none, write `nothing to promote today.`

---

## Task State Formats

| State | Format | Example |
|-------|--------|---------|
| Open | `- [ ] text` | `- [ ] Review Alice's MR` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

---

## Creating a New Daily Note

1. Copy `.opencode/templates/daily-template.md`.
2. Replace all placeholders: `{{DATE}}`, `{{DAY}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`.
3. Populate Morning > Calendar from `recurring-events.md` — include events scheduled for this weekday. For biweekly events, calculate whether this week's Monday is an even number of weeks from the anchor date.
4. Verify navigation links (prev/next) exist before writing them.

---

## Monday Morning: Include Weekly Planning

When creating/updating a daily note on **Monday**, also perform weekly planning:

1. Create the weekly note (`journal/weekly/YYYY-WNN.md`) using the weekly template if it does not exist.
2. Review last week's **Carry-Over** items. Seed this week's **Weekly Goals** from them.
3. Ask the user for the **Weekly Focus** (main theme for the week).
4. Check Jira for sprint status and upcoming deadlines — surface relevant items as MIT candidates.
5. Check Confluence for recently updated pages in watched spaces — flag anything needing attention.

This replaces the standalone `/week-plan` command. Load `writing/weekly` for the weekly note format.

---

## Friday Evening: Trigger Weekly Wrap-Up

When updating a daily note on **Friday** during the evening routine, also trigger the weekly wrap-up:

1. Complete the daily evening workflow first.
2. Then switch to the weekly note and run the Friday Wrap-Up Flow (defined in `writing/weekly`).
3. Compile **Accomplishments** from the week's Evening > Completed sections.
4. Identify **Failures & Setbacks** from unmet goals.
5. Collect **Carry-Over** items — confirm with user what carries vs. drops.
6. Write **Notes & Reflections** — prompt: "What did this week prove? What would you do differently?"

This replaces the standalone `/week-wrap` command.

---

## Append-Only Rule

Never delete or overwrite past daily notes. They are an append-only log. You may add content or mark tasks complete, but never remove existing lines.

---

## Proactive Resource Scan

At the end of every daily note update (and always during `/evening`), scan for resource enrichment opportunities:

- Did a meeting reveal a person's role change, team structure update, or process decision? Update the relevant resource article.
- Did a work session produce architectural knowledge, component ownership facts, or process observations? Capture in `resources/`.
- Did you mention a concept, person, team, or tool with no resource article? Flag it as a candidate for creation.
- After writing to or creating a resource article, update `knowledge-graph.md`: add the article if new, or refresh its `actualized` date and topic tags if existing.

Do not wait for an explicit resources task. Surface gaps and fill them during Evening > Insights → Resources.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `weekday`, `week`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Weekday` format?
- [ ] Navigation bar links verified to exist (or omitted if target missing)?
- [ ] All three zones present in order: Morning, Day, Evening?
- [ ] Morning filled only during morning phase?
- [ ] MITs: primary starred `★`, soft limit 3, at least one project tag?
- [ ] Day > Inbox is ephemeral bullets (not structured captures)?
- [ ] Day > Waiting uses correct format (`@Person — item — date — follow-up`)?
- [ ] Evening > Insights → Resources not left blank (at minimum: "nothing to promote today")?
- [ ] Day Summary ends with `End-of-day scan:` line?
- [ ] Monday: weekly note created/updated with focus and goals?
- [ ] Friday: weekly wrap-up completed?
- [ ] `waiting-for.md` updated with any new Waiting items from today?
