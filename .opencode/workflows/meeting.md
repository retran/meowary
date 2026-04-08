---
updated: 2026-04-07
tags: []
---

# Meeting

> Captures meeting notes for any meeting type, routes every action item before closing, cross-links to today's daily note, and scans for durable facts to enrich `resources/`. Produces a single structured file at `journal/meetings/<date>-<slug>.md`. Invoke before, during, or immediately after any meeting.

## Role

Acts as the user's meeting note-taker and action item router. Creates the meeting file, populates it per type-specific section rules, routes every action item to a tracked location, and extracts durable knowledge. Does not leave action items unrouted — that is a hard contract.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Meeting title, type, attendees | User invocation | Required |
| Meeting content / notes | User-provided | Required |
| Active projects list | `context.md § Active Projects` | Optional (for tagging) |
| Attendee resource articles | `resources/people/` | Optional (for linking) |
| Today's daily note | `journal/daily/<date>.md` | Required (for cross-link) |
| Waiting-for list | `journal/waiting-for.md` | Required (for routing) |

## Steps

### Step 0 — Load context

1. Read `context/context.md` for active projects list and people context (for linking attendees to resource articles).
2. Check if today's daily note (`journal/daily/<YYYY-MM-DD>.md`) exists — needed for cross-linking.
3. Search `resources/people/` for articles matching attendee names.
4. **If meeting type is `1-1`:** also read `resources/people/<other-person-slug>.md` if it exists — surface their role, team, recent context, and any open follow-ups from previous 1-1s.

Done when: active projects and people context loaded; attendee resource articles located; daily note existence confirmed.

### Step 0.5 — Clarify

Ask at most three questions:

1. Meeting title, type (`general` | `1-1` | `standup` | `retro` | `kickoff`), and attendees?
2. Recurrence: `once` | `daily` | `weekly` | `biweekly` | `monthly`?
3. If meeting already happened: "Please provide notes or key points to capture." If invoked before the meeting: "Should I create a template for live note-taking, or will you provide notes after?"

Done when: meeting title, type, attendees, and recurrence confirmed; note-taking mode determined.

### Step 1 — Create meeting file

1. Determine filename: `journal/meetings/<YYYY-MM-DD>-<slug>.md`
   - `<slug>`: 1–4 word kebab-case from the meeting title.
2. Create the file using `.opencode/skills/journal/meeting-template.md` as the base.
3. Apply front matter and header block per the meeting skill.
4. **For recurring meetings:** add `**Previous:** [<date>](../meetings/<prev-date>-<slug>.md)` to the header block if a previous file exists.

Done when: meeting file created with front matter and header.

### Step 2 — Capture content

Write the sections required for this meeting type per the meeting skill section rules. Apply all content rules (decisions in active voice, action item format, per-person standup format) as defined in the skill.

For `meeting-type: 1-1`: also write the 1-1 additional sections defined in the meeting skill.

Done when: all required sections written; no required section left blank.

### Step 3 — Route action items

For each action item in `### Action Items`, route it to exactly one destination per the meeting skill routing table.

Every action item must be routed. Do not leave action items unrouted — this is a hard contract.

Done when: every action item has a routing destination written.

### Step 4 — Cross-link to daily note

Add a cross-link entry to `## Day > ### Events` in today's daily note per the meeting skill. Tag with relevant `#p-` and `#person-` tags.

If `### Events` does not exist under `## Day`: create it.

Done when: cross-link written to daily note.

### Step 5 — Resources scan

Scan the meeting notes for durable facts and route them per the meeting skill resources scan procedure.

For `meeting-type: 1-1`: update `resources/people/<other-person-slug>.md` per the meeting skill 1-1 update procedure. If no person article exists: create a stub first.

If nothing durable was learned: note this explicitly.

Done when: durable facts routed or confirmed as none; 1-1 person article updated if applicable.

### Step 6 — Close

1. Apply the meeting note editor checklist.
2. Commit: `Meeting: <YYYY-MM-DD> <slug>`.

Done when: checklist passed; committed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Meeting note | `journal/meetings/<date>-<slug>.md` | Markdown file |
| Daily note cross-link | `journal/daily/<date>.md` Day > Events | Appended |
| Own tasks routed | `journal/daily/<date>.md` Day > Inbox | Appended |
| Waiting items routed | `journal/waiting-for.md` | Appended |
| Project tasks routed | `projects/<slug>/README.md` | Appended |
| Resource article updates or stubs | `resources/` | Varies |
| Commit | Git history | `Meeting: <YYYY-MM-DD> <slug>` |

## Error Handling

- **`meeting-template.md` missing:** Create the file manually with the required front matter schema and sections. Note the missing template.
- **Today's daily note missing:** Create from `.opencode/skills/journal/daily-template.md` before writing the cross-link.
- **`journal/waiting-for.md` missing:** Create from `.opencode/meta-templates/waiting-for-template.md` before routing waiting items.
- **Attendee has no resource article:** Create a stub (`resources/people/<slug>.md`) before the resources scan step.
- **Action item has no clear routing:** Default to `→ Parking Lot`. Surface to user at end of Step 3 for confirmation.
- **Pre-meeting template mode:** Create the file with all structural sections empty (except front matter and header). Run Steps 3–6 after the meeting when the user provides notes.

## Contracts

1. Create one meeting file per invocation. File must be complete before committing.
2. Every action item must be routed. No unrouted action items.
3. Cross-link to today's daily note is mandatory. Never omit Step 4.
4. Resources scan runs on every meeting. "Nothing durable" is a valid outcome; skipping the scan is not.
5. For 1-1 meetings: update or create the person resource article.
6. Commit format: `Meeting: <YYYY-MM-DD> <slug>`.

## dev-log Update

None. `/meeting` does not write dev-log entries. If a meeting produced a decision that affects a project, the affected lifecycle workflow (e.g. `/do plan`, `/do design`) will write the dev-log entry when that work is executed.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Resource stubs created | `resource-enrich` to flesh them out |
| Action items include own tasks for today | Work through Day > Inbox in the current session |
| Meeting generated a project decision | `design` or `plan` to formalise it |
| Meeting notes contain source material for research | `resource-ingest` |
