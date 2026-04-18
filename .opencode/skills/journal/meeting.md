---
name: journal/meeting
description: Meeting note format and philosophy — file naming, sections by meeting type, action item routing to project/daily/waiting-for, and resource scan. Load when recording a meeting, editing meeting notes, or routing action items after a meeting.
compatibility: opencode
updated: 2026-04-18
---

<role>Meeting note steward — record + routed commitments + durable knowledge capture.</role>

<summary>
> Meetings produce two outputs: record (the note) and commitments (action items). Both MUST complete before workflow closes. Unrouted action = forgotten commitment. Resources scan is mandatory — meetings are where durable knowledge first surfaces.
</summary>

<file_format>
Location: `journal/meetings/`, named `YYYY-MM-DD-<slug>.md`. One file per meeting.

Front matter:
```yaml
---
type: meeting
date: YYYY-MM-DD
title: "Meeting Title"
meeting-type: general
recurrence: once
attendees: []
updated: YYYY-MM-DD
tags: []
---
```

- `meeting-type`: `general` | `1-1` | `standup` | `retro` | `kickoff`
- `recurrence`: `once` | `daily` | `weekly` | `biweekly` | `monthly`
- `attendees`: leave `[]` — list in body instead.
- `tags`: include `p-`, `t-`, `person-` (no `#`).

H1 + header:
```markdown
# YYYY-MM-DD: Meeting Title

**Attendees:** [Name](../people/slug.md), [Name](../people/slug.md)
**Duration:** 30 min
**Type:** General
**Tags:** #p-project #t-team #person-name
```

Link attendees to resource people entries via relative links where available.
</file_format>

<sections>
Seven sections, in order. Required vs optional depends on `meeting-type`:

| Section | general | 1-1 | standup | retro | kickoff |
|---|:---:|:---:|:---:|:---:|:---:|
| Objective | required | — | — | — | required |
| Discussion | required | required | required* | required | required |
| Decisions | required | optional | — | optional | required |
| Action Items | required | required | required | required | required |
| Parking Lot | optional | — | required | optional | optional |
| Open Questions | optional | optional | — | — | required |
| Next Meeting | optional | required | — | — | — |

*Standups use per-person Discussion format.

OMIT sections marked `—`. Include `optional` only when content exists.

### Objective
One sentence; what the meeting achieves. OMIT for 1-1s and standups.

### Discussion
Bullets of main topics. Distill — NOT verbatim notes.

For **standups**, per-person:
```
- **Name:** Yesterday: X | Today: Y | Blockers: Z (or none)
```

### Decisions
Active voice bullets. If none: `*(none)*`.

### Action Items
Checkboxes. Each item:
- Assigns to person via `#person-<slug>`.
- Notes routing intent: `→ own task`, `→ waiting-for`, or `→ project tasks`.

```markdown
- [ ] #person-alice Write API spec for auth module #p-backend → project tasks
- [ ] #person-me Follow up with Bob on deployment date → waiting-for
- [ ] #person-me Review PR #142 by EOD → own task
```

### Parking Lot
Format: `- Topic: [next step or owner]`. If none: `*(none)*`.

### Open Questions
Format: `- Question? → [who answers, by when]`.

### Next Meeting
Format: `Date: YYYY-MM-DD | Focus: [topic]`. One-off: `*(n/a)*`.
</sections>

<one_on_one_extras>
For `meeting-type: 1-1`, ADD below Decisions:

| Section | Description |
|---|---|
| `### Wins` | What went well since last 1-1? |
| `### Blockers` | What slows them down? What help do they need? |
| `### Growth` | Career, learning, feedback exchange. |
| `### Follow-ups` | Open items + carry-overs from prior 1-1. |
</one_on_one_extras>

<action_routing gate="HARD-GATE">
Route every action item before closing:

| Item type | Route to |
|---|---|
| Own task today/tomorrow | Today's `### Inbox` in daily note |
| Waiting on someone | `journal/waiting-for.md` (`## Active`) |
| Belongs to a project | `projects/<slug>/README.md` Open Tasks |
| Deferred (no owner/date) | `### Parking Lot` |

**HARD-GATE (all tiers):** DO NOT close until all action items are routed.
</action_routing>

<cross_linking>
After creating meeting file:
1. Add entry to `## Day > ### Events` in today's daily note (relative link + one-line summary).
2. Tag entry with `#p-` and `#person-` tags.
3. Route all action items per table above.
4. Update relevant resource articles; create stubs if needed.
</cross_linking>

<resources_scan>
Scan for durable facts:
- Team/role/reporting changes.
- Process/policy decisions.
- Architecture/technology adoption decisions.
- New projects or status changes.

For each: enrich existing article OR create stub.

For **1-1 meetings**: also update `resources/people/<person-slug>.md` with:
- Role/team/reporting changes mentioned.
- Blockers revealing context.
- Open follow-ups from `### Follow-ups` (as "Last 1-1" note with date).

If nothing durable: state explicitly. NEVER leave scan implicit.
</resources_scan>

<self_review>
- [ ] Front matter complete (`type`, `date`, `title`, `meeting-type`, `recurrence`, `updated`, `tags`)?
- [ ] H1 follows `YYYY-MM-DD: Title`?
- [ ] Attendees linked to resource people where available?
- [ ] Correct sections present for `meeting-type`?
- [ ] Decisions in active voice?
- [ ] Action items: checkboxes + `#person-` + routing intent?
- [ ] Every action routed (daily / waiting-for / project)?
- [ ] Daily note cross-linked in `### Events`?
- [ ] Resources scan completed (or "nothing durable" stated)?
- [ ] For 1-1: person resource updated?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, tags remain English.
</output_rules>
