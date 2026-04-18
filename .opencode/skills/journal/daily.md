---
name: journal/daily
description: Daily note format and philosophy — three-zone structure (Morning/Day/Evening), MIT system, rapid logging, task migration, and Monday/Friday special flows. Load when creating a daily note, filling Morning intent or Evening reflection, or updating any daily note section.
compatibility: opencode
updated: 2026-04-18
---

<role>Daily note steward — atomic unit of the journal, three-zone structured record.</role>

<summary>
> Daily note = single-day record with three epistemic modes: Morning (intent), Day (activity log), Evening (reflection). MIT forces prioritization. Append-only — past notes are immutable evidence, not drafts.
</summary>

<file_format>
Location: `journal/daily/`, named `YYYY-MM-DD.md`. One file per day.

Front matter:
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

H1 + nav:
```markdown
# YYYY-MM-DD: Weekday

[← prev-date](prev-date.md) | [Week NN](../weekly/YYYY-WNN.md) | [next-date →](next-date.md)
```

OMIT prev/next links if target file does not exist. ALWAYS verify before writing.
</file_format>

<zones>
### `## Morning` — intent zone (filled by `/morning`)

```
## Morning

Focus: <one sentence — what makes today a success>
- ★ MIT 1: <primary MIT — non-negotiable>
- MIT 2: <optional>
- MIT 3: <optional>

Calendar: <events for the day>
```

**MIT rules:**
- Soft limit 3. If 4th requested, WARN: "4 MITs defeats the forced-selection purpose. Drop or defer one."
- Primary MIT prefixed `★`.
- At least one MIT links to active project tag (e.g. `Complete auth retry logic #p-myproject`).
- Completed MITs ticked in `### Completed` during Evening — NEVER edited in place.

Calendar: times bold (`**10:00–10:30**`); link meeting note files where exist.

### `## Day` — log zone (populated throughout)

```
## Day

### Inbox
(ephemeral bullets — raw captures)
(processed in /evening)

### Events
(meetings logged as they happen — link meeting files)

### Waiting
(items delegated/blocked)
(format: - [ ] @Person — item — YYYY-MM-DD delegated — follow-up by YYYY-MM-DD)
```

Work log entry (appended by lifecycle workflows):
```
- <time or context> — /<workflow> — <topic>: <one-line summary>
```

ALWAYS append to `## Day > ### Inbox`; NEVER overwrite.

| Channel | Purpose | Lifetime | How |
|---|---|---|---|
| `## Day > ### Inbox` | Raw same-day thoughts | Same-day; processed in `/evening` | Direct edit |
| `inbox/` folder | Richer captures, URLs, ideas | Until processed via `/r ingest` | `/capture` |

### `## Evening` — reflection zone (filled by `/evening`)

```
## Evening

### Completed
(MITs ticked + additional done tasks)

### Carried / Dropped
(unfinished MITs — each with: carried to [date] OR dropped + reason)

### Insights → Resources
(durable facts; each linked to resource updated/created)

### Day Summary
(1–2 sentences)
(**Done: N | Carried: N | Dropped: N**)
(End-of-day scan: [actioned items, or "nothing pending"])
```

**Insights → Resources is mandatory.** Every evening identify ≥1 durable fact. If none: write `nothing to promote today.`
</zones>

<task_states>
| State | Format | Example |
|---|---|---|
| Open | `- [ ] text` | `- [ ] Review Alice's MR` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |
</task_states>

<creation_steps>
1. Copy `.opencode/skills/journal/daily-template.md`.
2. Replace placeholders: `{{DATE}}`, `{{DAY}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`.
3. Populate `### Calendar` from `journal/recurring-events.md` (events for this weekday). If file missing, copy from `.opencode/meta-templates/recurring-events-template.md`.
4. VERIFY navigation links exist before writing.
</creation_steps>

<monday_planning>
On Monday, also perform weekly planning:
1. Check `journal/weekly/<year>-W<nn>.md`. Create from `.opencode/skills/journal/weekly-template.md` if missing.
2. Review last week's **Carry-Over**; seed this week's **Weekly Goals**.
3. Ask user for **Weekly Focus**.
4. Check Jira for sprint status; surface MIT candidates.
5. Populate `**Daily Notes:**` — link Monday today; mark Tue–Fri `*(no note)*`.
</monday_planning>

<friday_wrapup>
On Friday during evening:
1. Complete daily evening routine first.
2. Switch to weekly note; run Friday Wrap-Up Flow (defined in `journal/weekly`).
</friday_wrapup>

<resource_scan>
At end of every daily update:
- Meeting reveal role/team/process change? Update relevant resource.
- Work produce architectural knowledge? Capture in `resources/`.
- Concept/person/team/tool with no article? Flag for creation.

DO NOT wait for explicit task. Surface gaps; fill during Evening > Insights → Resources.
</resource_scan>

<self_review>
- [ ] Front matter complete (`type`, `date`, `weekday`, `week`, `updated`, `tags`)?
- [ ] H1 follows `YYYY-MM-DD: Weekday`?
- [ ] Nav links verified or omitted?
- [ ] All three zones present in order?
- [ ] MITs: primary `★`, soft limit 3, ≥1 project tag?
- [ ] Day > Waiting uses `@Person — item — date — follow-up`?
- [ ] Evening > Insights → Resources not blank (min: "nothing to promote today")?
- [ ] Day Summary ends with `End-of-day scan:` line?
- [ ] Monday: weekly note created/updated?
- [ ] Friday: weekly wrap-up completed?
- [ ] `journal/waiting-for.md` updated with new Waiting items? (If missing, copy from `.opencode/meta-templates/waiting-for-template.md`.)
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, tags remain English.
</output_rules>
