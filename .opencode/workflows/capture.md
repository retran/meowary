---
updated: 2026-04-07
tags: []
---

# Capture

> Frictionless quick-capture. Routes a raw idea, note, URL, question, or observation to either `inbox/<timestamp>-<topic>.md` (persistent capture for later processing) or `## Day > ### Inbox` in today's daily note (same-day ephemeral). One question maximum. Commit and close. Invoke whenever something surfaces that needs capturing.

## Role

Acts as a zero-friction capture router. Takes raw input and routes it to the right destination with minimal questions. Does not process or analyze the captured content — that is the job of `resource-ingest`, `resource-plan`, and `evening`. Capture first; process later.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Capture content | User invocation | Required |
| Active projects list | `context/context.md § Active Projects` | Optional (for tagging) |
| Today's daily note | `journal/daily/<date>.md` | Required only if routing to Day > Inbox |

## Complexity Tiers

Not applicable. Fixed-procedure workflow.

## Routing Decision

Before writing, determine destination:

| Type | Destination | Lifetime |
|------|-------------|----------|
| Rich capture: URL, idea to develop, reference to file, concept to research | `inbox/<timestamp>-<topic>.md` (new file) | Until processed via `resource-plan` or `resource-ingest` |
| Ephemeral same-day: quick thought, reminder, raw observation | `## Day > ### Inbox` inline in today's daily note | Same-day; processed in `/evening` |

When in doubt, default to `inbox/` — it is persistent and cannot be lost.

## Steps

### Step 0 — Load context

1. Read `context/context.md` for active project names — for tagging and linking only.
2. Check whether today's daily note exists (`journal/daily/<YYYY-MM-DD>.md`) — needed only if routing to Day > Inbox.

Do not load project dev-logs. `/capture` is fast.

Done when: project names known; daily note existence checked.

### Step 0.5 — Clarify

Ask at most one question:

- "Is this for development later (`inbox/`) or a quick same-day note?"

If the user's invocation contains enough context to determine routing automatically (e.g. "save this URL", "quick note"), skip the question and route immediately. Never ask more than one question.

Done when: routing destination determined.

### Step 1 — Route and tag

1. Determine destination using the Routing Decision table above.
2. Assign exactly one type tag: `idea`, `task`, `reference`, `question`, or `bug`.
3. Link to an active project if the capture is clearly related. Do not force-tag ambiguous items.

Done when: destination and type tag determined.

### Step 2 — Write

**If routing to `inbox/`:**

Create `inbox/<YYYY-MM-DDTHHMM>-<topic>.md` per the inbox skill capture format.
- `<topic>`: 1–3 word kebab-case slug from the capture content.
- Set `project` field if the capture is clearly related to an active project.
- Body: the raw capture content as received. No processing, no restructuring.

**If routing to `## Day > ### Inbox`:**

- Append a bullet to `## Day > ### Inbox` in today's daily note.
- Format: `- <content>` (no additional structure — ephemeral).
- If the daily note doesn't exist, create it from template first.

Done when: file created or bullet appended.

### Step 3 — Close

Commit:
- `inbox/` route: `Capture: <topic-slug>`
- Day > Inbox route: `Note: <date> inline capture`

For batch captures (multiple items in one invocation): write one file per item without asking questions between items. Use a single commit covering all items.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Capture routed to correct location (inbox/ or daily note)
- [ ] Tags applied for discoverability
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: committed.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Inbox capture | `inbox/<timestamp>-<topic>.md` | Markdown file |
| Daily note inline capture | `journal/daily/<date>.md` Day > Inbox | Appended bullet |
| Commit | Git history | `Capture: <slug>` or `Note: <date> inline capture` |

## Error Handling

- **`capture-template.md` missing:** Create the file with front matter schema only and the raw content in the body. Note the missing template.
- **Daily note missing (Day > Inbox route):** Create from `.opencode/skills/journal/daily-template.md` first; then append the bullet.
- **Project tag unclear:** Leave `project: null`. Do not block on tagging.
- **User provides multiple captures in one invocation:** Write one file per item; single commit at the end. Do not ask between items.

## Contracts

1. Write one new `inbox/` file per capture item. Never overwrite an existing file.
2. For Day > Inbox: append only. Never edit existing bullets.
3. One clarifying question maximum. Capture must be near-instant.
4. Never process or analyze captured content. Route only.
5. Commit format: `Capture: <slug>` (inbox) | `Note: <date> inline capture` (daily note).
6. Default to `inbox/` when routing is ambiguous.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Capture is a URL or reference source | `resource-ingest` when ready to process |
| Capture is a knowledge gap to investigate | `research` when ready |
| Capture is a task for a project | Add to project task list during next session |
| `inbox/` has accumulated many unprocessed items | `resource-plan` to plan a processing pass |
