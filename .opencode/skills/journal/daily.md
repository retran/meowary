---
name: journal/daily
description: Daily note format and philosophy — three-zone structure (Morning/Day/Evening), MIT system, rapid logging, task migration, and Monday/Friday special flows. Load when creating a daily note, filling Morning intent or Evening reflection, or updating any daily note section.
compatibility: opencode
---

## Philosophy

The daily note is the atomic unit of the journal — the raw log of a single day. It is not a todo list or a diary. It is a structured record of intent (Morning), activity (Day), and reflection (Evening).

The **three-zone structure** exists because these are genuinely different epistemic modes. Planning what to do, logging what happened, and reflecting on what it means require different content and different permissions. Mixing them destroys the record's clarity.

The **MIT system** is a forcing function for prioritisation. Writing three MITs and starring one is not a time-management trick — it is a practice that surfaces the question: *if I only get one thing done today, what must it be?* Without that forcing function, everything feels equally important and nothing gets decided.

The **append-only rule** exists because daily notes are immutable historical records. Editing a past daily note destroys its value as evidence of what you actually thought and did. The past is a record, not a draft.

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
- `date`: ISO 8601 date.
- `weekday`: full weekday name.
- `week`: ISO week identifier (e.g. `"2026-W09"`).
- `updated`: today's date — update on every edit.
- `tags`: usually `[]` unless specific project/team tags are warranted.

### H1 and Navigation Bar

```markdown
# YYYY-MM-DD: Weekday

[← prev-date](prev-date.md) | [Week NN](../weekly/YYYY-WNN.md) | [next-date →](next-date.md)
```

- Omit the previous-day link if no previous daily note exists.
- Omit the next-day link if the next day's note does not exist yet.
- Always verify link targets exist before writing them.

---

## Three-Zone Structure

### `## Morning` — intent zone

Filled once, at the start of the day. Owned by `/morning`.

```
## Morning

Focus: <one sentence — what makes today a success>
★ MIT 1: <primary MIT — non-negotiable>
  MIT 2: <optional>
  MIT 3: <optional>

Calendar: <events for the day>
```

**MIT rules:**
- Soft limit of 3. If a 4th MIT is requested, warn: "4 MITs defeats the forced-selection purpose. Consider dropping or deferring one."
- The primary MIT is prefixed with `★`. It is the one thing that makes today a success.
- At least one MIT should link to an active project tag (e.g. `Complete auth retry logic #p-myproject`).
- Completed MITs are ticked in `### Completed` during Evening — never edited in place.

**Calendar format:** Times in bold (`**10:00–10:30**`). Link to meeting note files where they exist.

---

### `## Day` — log zone

Populated throughout the day. Three sub-sections:

```
## Day

### Inbox
(ephemeral bullets — raw captures: ideas, observations, requests, quick notes)
(processed in /evening)

### Events
(meetings logged as they happen — link to meeting note files)

### Waiting
(items delegated or blocked on others)
(format: - [ ] @Person — item — YYYY-MM-DD delegated — follow-up by YYYY-MM-DD)
```

**Work log entry format** (appended by lifecycle workflows):

```
- <time or context> — /<workflow> — <topic>: <one-line summary>
```

Examples:
- `- 14:30 — /implement — auth-retry: exponential backoff implemented, all tests green`
- `- /debug — payment-timeout: root cause found (DNS cache); fix applied`

Lifecycle workflows append work log entries to `## Day > ### Inbox`. Always append; never overwrite.

**Inbox vs. `inbox/` folder:**

| Channel | What it's for | Lifetime | How to add |
|---|---|---|---|
| `## Day > ### Inbox` | Raw same-day thoughts, reminders, quick ideas | Same-day; processed in `/evening` | Direct edit |
| `inbox/` folder | Richer captures: URLs, ideas to develop, references | Until processed via `/r ingest` | `/capture` command |

---

### `## Evening` — reflection zone

Filled once, at the end of the day. Owned by `/evening`.

```
## Evening

### Completed
(MITs ticked off + any additional done tasks)

### Carried / Dropped
(unfinished MITs — each with decision: carried to [date] or dropped + reason)

### Insights → Resources
(durable facts distilled from today; each linked to the resource article updated or created)

### Day Summary
(1–2 sentences on how the day went)
(**Done: N | Carried: N | Dropped: N**)
(End-of-day scan: [items actioned, or "nothing pending"])
```

**Insights → Resources** is mandatory. Every evening, look for at least one durable fact from the day's Inbox, Events, or Waiting that belongs in `resources/`. If none, write `nothing to promote today.`

---

## Task State Formats

| State | Format | Example |
|---|---|---|
| Open | `- [ ] text` | `- [ ] Review Alice's MR` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

---

## Creating a New Daily Note

1. Copy `.opencode/skills/journal/daily-template.md`.
2. Replace all placeholders: `{{DATE}}`, `{{DAY}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`.
3. Populate `### Calendar` from `recurring-events.md` — include events scheduled for this weekday.
4. Verify navigation links (prev/next) exist before writing them.

---

## Monday: Weekly Planning

When creating a daily note on **Monday**, also perform weekly planning:

1. Check if `journal/weekly/<year>-W<nn>.md` exists. If not, create from `.opencode/skills/journal/weekly-template.md`.
2. Review last week's **Carry-Over** items. Seed this week's **Weekly Goals** from them.
3. Ask the user for the **Weekly Focus** (main theme for the week).
4. Check Jira for sprint status and upcoming deadlines — surface relevant items as MIT candidates.
5. Populate `**Daily Notes:**` — link Monday (today); mark Tuesday–Friday as `*(no note)*`.

---

## Friday: Weekly Wrap-Up

When updating a daily note on **Friday** during the evening routine:

1. Complete the daily evening routine first.
2. Switch to the weekly note and run the Friday Wrap-Up Flow (defined in `journal/weekly`).

---

## Proactive Resource Scan

At the end of every daily note update, scan for resource enrichment:

- Did a meeting reveal a role change, team structure update, or process decision? Update the relevant resource article.
- Did work produce architectural knowledge or component ownership facts? Capture in `resources/`.
- Did you mention a concept, person, team, or tool with no resource article? Flag for creation.

Do not wait for an explicit resources task. Surface gaps and fill them during Evening > Insights → Resources.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `weekday`, `week`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Weekday` format?
- [ ] Navigation bar links verified to exist (or omitted if target missing)?
- [ ] All three zones present in order: Morning, Day, Evening?
- [ ] MITs: primary starred `★`, soft limit 3, at least one project tag?
- [ ] Day > Waiting uses correct format (`@Person — item — date — follow-up`)?
- [ ] Evening > Insights → Resources not left blank (minimum: "nothing to promote today")?
- [ ] Day Summary ends with `End-of-day scan:` line?
- [ ] Monday: weekly note created/updated with focus and goals?
- [ ] Friday: weekly wrap-up completed?
- [ ] `waiting-for.md` updated with any new Waiting items from today?
