---
name: writing/meeting
description: Meeting note format rules — file naming, front matter, sections, routing, cross-linking
compatibility: opencode
---

This sub-skill extends `writing`. Load `writing` first, then load `writing/meeting` when recording or editing meeting notes.

---

## File Format

Meeting notes are standalone files in `journal/meetings/`, named `YYYY-MM-DD-<slug>.md`. One file per meeting, regardless of project.

### Front Matter

```yaml
---
type: meeting
date: YYYY-MM-DD
title: "Meeting Title"
meeting-type: general       # general | 1-1 | standup | retro | kickoff
recurrence: once            # once | daily | weekly | biweekly | monthly
attendees: []
updated: YYYY-MM-DD
tags: []
---
```

- `meeting-type`: drives which sections are required (see table below).
- `recurrence`: used to determine whether `### Next Meeting` is relevant.
- `attendees`: leave as `[]` — attendees are listed in the body instead.
- `tags`: include relevant `p-`, `t-`, and `person-` tags (no `#` prefix).

### H1 and Header Block

```markdown
# YYYY-MM-DD: Meeting Title

**Attendees:** [Name](#person-slug), [Name](#person-slug)
**Duration:** 30 min
**Type:** General
**Tags:** #p-project #t-team #person-name
```

- H1 format: `# YYYY-MM-DD: <Title>`.
- Link attendees to their resource people entries using relative links where they exist.
- Duration in human-readable format (e.g. "30 min", "1h 15 min").
- Tags line: all relevant inline tags separated by spaces.

---

## Sections

Seven sections, in this order. Required vs. optional depends on `meeting-type` (see table below).

### Objective

One sentence: what this meeting is trying to achieve. Omit for 1-1s and standups — the type already implies the purpose.

### Discussion

Bullet list of main topics covered. Each bullet names a topic or summarises a point. Not verbatim notes — distil into key facts.

For **standups**, replace with per-person bullets:
```
- **Name:** Yesterday: X | Today: Y | Blockers: Z (or none)
```

### Decisions

Bullet list of decisions made. Each decision is one sentence in active voice. If none, write `*(none)*`.

### Action Items

Checkboxes (`- [ ]`). Each item:
- Assigns to a person: tag with `#person-<slug>`.
- Links to a project if relevant: tag with `#p-<slug>`.
- Is concrete and completable.
- Notes routing intent inline: `→ own task`, `→ waiting-for`, or `→ project tasks`.

Example:
```markdown
- [ ] #person-alice Write API spec for auth module #p-backend → project tasks
- [ ] #person-me Follow up with Bob on deployment date → waiting-for
- [ ] #person-me Review PR #142 by EOD → own task
```

### Parking Lot

Topics raised but not resolved. Carry to next meeting or create tasks.

Format: `- Topic: [next step or owner]`. If none, write `*(none)*`.

For **standups**, use Parking Lot to capture off-agenda topics that surfaced — required.

### Open Questions

Questions that need an answer from a specific person, with a deadline.

Format: `- Question? → [who answers, by when]`. If none, write `*(none)*`.

### Next Meeting

Date and focus for recurring meetings. Format: `Date: YYYY-MM-DD | Focus: [topic]`. If one-off, write `*(n/a)*`.

---

## Required vs. Optional Sections by Meeting Type

| Section        | general  | 1-1      | standup  | retro    | kickoff  |
| -------------- | :------: | :------: | :------: | :------: | :------: |
| Objective      | required | —        | —        | —        | required |
| Discussion     | required | required | required*| required | required |
| Decisions      | required | optional | —        | optional | required |
| Action Items   | required | required | required | required | required |
| Parking Lot    | optional | —        | required | optional | optional |
| Open Questions | optional | optional | —        | —        | required |
| Next Meeting   | optional | required | —        | —        | —        |

*Standups use the per-person format for Discussion (Yesterday / Today / Blockers).

Omit sections marked `—` entirely. Sections marked `optional` include only if there is content.

---

## Action Item Routing

After capturing action items, route each one explicitly before closing the meeting file:

| Item type | Route to |
| --- | --- |
| Own task to do today or tomorrow | Today's `### Inbox` in daily note |
| Waiting on someone else | `waiting-for.md` (append to `## Active`) |
| Task belonging to a project | `projects/<slug>/README.md` Open Tasks |
| Deferred (no clear owner or date) | `### Parking Lot` in meeting file |

---

## Cross-Linking

After creating the meeting file:

1. Add or update the **Events** section in today's daily note: relative link to the meeting file and a one-line summary.
2. Tag the daily note entry with relevant `#p-` and `#person-` tags.
3. Route action items per the table above.
4. If durable facts were learned (team changes, role updates, process decisions, architecture choices), update the relevant resource articles. Create stubs if needed.
5. Update `knowledge-graph.md` if a new resource article was created or an existing one was updated.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `title`, `meeting-type`, `recurrence`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Title` format?
- [ ] Attendees linked to resource people entries where they exist?
- [ ] Correct sections present for this `meeting-type`?
- [ ] Decisions in active voice?
- [ ] Action items are checkboxes with `#person-` tags and routing intent marked?
- [ ] Action items routed to daily note inbox / waiting-for / project tasks?
- [ ] Daily note cross-linked (entry in `### Events`)?
- [ ] `knowledge-graph.md` updated if resources were touched?
