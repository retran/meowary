---
name: writing/meeting
description: Meeting note format rules — file naming, front matter, sections, cross-linking
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
attendees: []
updated: YYYY-MM-DD
tags: []
---
```

- `type`: always `meeting`.
- `date`: date of the meeting (ISO 8601).
- `title`: exact meeting title as a string.
- `attendees`: leave as `[]` — attendees are listed in the body instead.
- `updated`: today's date.
- `tags`: include relevant `p-`, `t-`, and `person-` tags (no `#` prefix).

### H1 and Header Block

```markdown
# YYYY-MM-DD: Meeting Title

**Attendees:** [Name](#person-slug), [Name](#person-slug)
**Duration:** 30 min
**Tags:** #p-project #t-team #person-name
```

- H1 format: `# YYYY-MM-DD: <Title>`.
- Link attendees to their KB people entries using relative links where they exist.
- Duration in human-readable format (e.g. "30 min", "1h 15 min").
- Tags line: all relevant inline tags separated by spaces.

### Sections

Three sections as H3 headings, in this order:

### Discussion

Bullet list of main topics covered. Each bullet names a topic or summarises a point. Not verbatim notes — distil into key facts.

### Decisions

Bullet list of decisions made. If none, write `*(none)*`. Each decision is one sentence in active voice.

### Action Items

Checkboxes (`- [ ]`). Each item:
- Assigns to a person: tag with `#person-<slug>`.
- Links to a project if relevant: tag with `#p-<slug>`.
- Is concrete and completable: what must be done, not who should think about something.

---

## Cross-Linking

After creating the meeting file:

1. Add or update the **Events & Meetings** section in today's daily note with a relative link to the meeting file and a one-line summary.
2. Tag the daily note entry with relevant `#p-` and `#person-` tags.
3. If action items belong to specific projects, add them to those projects' **Open Tasks** sections.
4. If durable facts were learned (team changes, role updates, process decisions, architecture choices), update the relevant KB entries. Create new entries if needed.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `date`, `title`, `attendees`, `updated`, `tags`?
- [ ] H1 follows `YYYY-MM-DD: Title` format?
- [ ] Attendees linked to KB people entries where they exist?
- [ ] All three sections present: Discussion, Decisions, Action Items?
- [ ] Decisions in active voice?
- [ ] Action items are checkboxes with `#person-` tags?
- [ ] Daily note cross-linked?
- [ ] Project tasks updated for any action items?
