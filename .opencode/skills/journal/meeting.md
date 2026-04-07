---
name: journal/meeting
description: Meeting note format and philosophy — file naming, sections by meeting type, action item routing to project/daily/waiting-for, and resource scan. Load when recording a meeting, editing meeting notes, or routing action items after a meeting.
compatibility: opencode
---

## Philosophy

Meetings produce two outputs: a **record** and **commitments**. The record is the meeting note; the commitments are the action items. Both must be complete before the workflow closes.

An unrouted action item is a commitment that will be forgotten. The routing step exists not as a formality but because unrouted work disappears. The person who said "I'll look into that" will not remember by next week unless it is written somewhere trackable.

The **resources scan** is mandatory because meetings are where durable knowledge is created first. Role changes, architectural decisions, team restructures, and process shifts surface in conversation before they appear anywhere else. If you do not capture them at the meeting, they may never be captured.

Meeting notes are not meeting minutes. They are a distillation of what matters: decisions made, actions committed, questions opened.

---

## File Format

Meeting notes live in `journal/meetings/`, named `YYYY-MM-DD-<slug>.md`. One file per meeting.

### Front Matter

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
- `attendees`: leave as `[]` — attendees are listed in the body instead.
- `tags`: include relevant `p-`, `t-`, and `person-` tags (no `#` prefix).

### H1 and Header Block

```markdown
# YYYY-MM-DD: Meeting Title

**Attendees:** [Name](../people/slug.md), [Name](../people/slug.md)
**Duration:** 30 min
**Type:** General
**Tags:** #p-project #t-team #person-name
```

Link attendees to their resource people entries using relative links where they exist.

---

## Sections

Seven sections, in this order. Required vs. optional depends on `meeting-type`:

| Section | general | 1-1 | standup | retro | kickoff |
|---|:---:|:---:|:---:|:---:|:---:|
| Objective | required | — | — | — | required |
| Discussion | required | required | required* | required | required |
| Decisions | required | optional | — | optional | required |
| Action Items | required | required | required | required | required |
| Parking Lot | optional | — | required | optional | optional |
| Open Questions | optional | optional | — | — | required |
| Next Meeting | optional | required | — | — | — |

*Standups use per-person format for Discussion.

Omit sections marked `—`. Sections marked `optional` include only if there is content.

### Objective
One sentence: what this meeting is trying to achieve. Omit for 1-1s and standups.

### Discussion
Bullet list of main topics. Each bullet names a topic or summarises a point. Distil — not verbatim notes.

For **standups**, use per-person format:
```
- **Name:** Yesterday: X | Today: Y | Blockers: Z (or none)
```

### Decisions
Bullet list of decisions made. Each decision in active voice. If none, write `*(none)*`.

### Action Items
Checkboxes. Each item:
- Assigns to a person: tag with `#person-<slug>`.
- Notes routing intent: `→ own task`, `→ waiting-for`, or `→ project tasks`.

```markdown
- [ ] #person-alice Write API spec for auth module #p-backend → project tasks
- [ ] #person-me Follow up with Bob on deployment date → waiting-for
- [ ] #person-me Review PR #142 by EOD → own task
```

### Parking Lot
Topics raised but not resolved. Format: `- Topic: [next step or owner]`. If none, write `*(none)*`.

### Open Questions
Questions needing an answer from a specific person by a deadline. Format: `- Question? → [who answers, by when]`.

### Next Meeting
Date and focus for recurring meetings. Format: `Date: YYYY-MM-DD | Focus: [topic]`. If one-off: `*(n/a)*`.

---

## 1-1 Additional Sections

For `meeting-type: 1-1`, add these sections below Decisions:

| Section | Description |
|---|---|
| `### Wins & Highlights` | What went well since last 1-1? |
| `### Blockers & Concerns` | What is slowing them down? What do they need help with? |
| `### Growth & Development` | Career conversations, learning goals, feedback exchange. |
| `### Follow-ups` | Open items from this meeting and carry-overs from the previous 1-1. |

---

## Action Item Routing

Route every action item before closing:

| Item type | Route to |
|---|---|
| Own task for today or tomorrow | Today's `### Inbox` in daily note |
| Waiting on someone else | `waiting-for.md` (append to `## Active`) |
| Task belonging to a project | `projects/<slug>/README.md` Open Tasks |
| Deferred (no clear owner or date) | `### Parking Lot` |

Every action item must be routed. This is a hard contract.

---

## Cross-Linking

After creating the meeting file:

1. Add an entry to `## Day > ### Events` in today's daily note: relative link to the meeting file + one-line summary.
2. Tag the entry with relevant `#p-` and `#person-` tags.
3. Route all action items per the table above.
4. Update relevant resource articles with durable facts learned. Create stubs if needed.

---

## Resources Scan

Scan the meeting notes for durable facts:
- Team changes, role updates, reporting structure changes.
- Process decisions, policy changes.
- Architectural choices, technology adoption decisions.
- New projects or project status changes.

For each durable fact: check if a resource article exists. If yes, enrich it. If no, create a stub.

For **1-1 meetings**: after the general scan, update `resources/people/<person-slug>.md` with:
- Role, team, or reporting changes mentioned.
- Blockers revealing important context about their situation.
- Open follow-ups from `### Follow-ups` — add as a "Last 1-1" note with date.

If nothing durable was learned: note this explicitly. Do not leave the scan implicit.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `title`, `meeting-type`, `recurrence`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Title` format?
- [ ] Attendees linked to resource people entries where they exist?
- [ ] Correct sections present for this `meeting-type`?
- [ ] Decisions in active voice?
- [ ] Action items are checkboxes with `#person-` tags and routing intent marked?
- [ ] Every action item routed to daily note / waiting-for / project tasks?
- [ ] Daily note cross-linked (entry in `### Events`)?
- [ ] Resources scan completed (even if result is "nothing durable")?
- [ ] For 1-1: person resource article updated?
