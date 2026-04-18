---
updated: 2026-04-18
tags: []
---

# Capture

<summary>
> Frictionless capture router. Routes raw input to `inbox/<timestamp>-<topic>.md` (persistent) or `## Day > ### Inbox` in today's daily note (ephemeral). One question max. Capture; never process.
</summary>

<role>
Zero-friction capture router. Route input with minimal questions. NEVER process or analyze content — that is the job of `resource-ingest`, `resource-plan`, `evening`. Capture first, process later.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Capture content | User invocation | Yes |
| Active projects list | `context/context.md § Active Projects` | Optional (tagging) |
| Today's daily note | `journal/daily/<date>.md` | Only if routing to Day > Inbox |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<definitions>
**Routing decision:**

| Type | Destination | Lifetime |
|------|-------------|----------|
| Rich: URL, idea, reference, concept | `inbox/<timestamp>-<topic>.md` (new file) | Until processed via `resource-plan`/`resource-ingest` |
| Ephemeral same-day: thought, reminder, observation | `## Day > ### Inbox` in today's daily note | Same-day; processed in `/evening` |

DEFAULT to `inbox/` when ambiguous — persistent and cannot be lost.
</definitions>

<steps>

<step n="0" name="Load context">
1. READ `context/context.md` for active project names (tagging/linking only).
2. CHECK if `journal/daily/<YYYY-MM-DD>.md` exists (only if routing to Day > Inbox).

DO NOT load project dev-logs. `/capture` is fast.

<done_when>Project names known; daily note existence checked.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK at most one question:
- "Is this for development later (`inbox/`) or a quick same-day note?"

SKIP if invocation contains routing context (e.g. "save this URL", "quick note"). NEVER ask more than one question.

<done_when>Routing destination determined.</done_when>
</step>

<step n="1" name="Route and tag">
1. DETERMINE destination from routing table.
2. ASSIGN exactly one type tag: `idea`, `task`, `reference`, `question`, `bug`.
3. LINK to active project if clearly related. DO NOT force-tag ambiguous items.

<done_when>Destination and type tag determined.</done_when>
</step>

<step n="2" name="Write">
**inbox/ route:** Create `inbox/<YYYY-MM-DDTHHMM>-<topic>.md` per inbox skill capture format.
- `<topic>`: 1–3 word kebab-case slug.
- Set `project` if related to active project.
- Body: raw capture content, no processing.

**Day > Inbox route:** Append bullet `- <content>` to `## Day > ### Inbox` in today's daily note. Create note from template if missing.

<done_when>File created or bullet appended.</done_when>
</step>

<step n="3" name="Close" gate="END-GATE">
COMMIT:
- inbox: `Capture: <topic-slug>`
- Day > Inbox: `Note: <date> inline capture`

For batch captures: write one file per item, no questions between items, single commit covering all.

<self_review>
- [ ] All `Done when` met
- [ ] Routed to correct location
- [ ] Tags applied
- [ ] No placeholders (TBD/TODO/FIXME)
- [ ] All file paths correct, targets exist
</self_review>

<done_when>Committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Inbox capture | `inbox/<timestamp>-<topic>.md` | Markdown file |
| Daily inline capture | `journal/daily/<date>.md` Day > Inbox | Bullet |
| Commit | Git | `Capture: <slug>` or `Note: <date> inline capture` |
</outputs>

<error_handling>
- **`capture-template.md` missing:** Create file with front matter schema only + raw content body. Note missing template.
- **Daily note missing (Day > Inbox):** Create from `.opencode/skills/journal/daily-template.md` first, then append.
- **Project tag unclear:** Leave `project: null`. DO NOT block.
- **Multiple captures one invocation:** One file per item, single commit. NEVER ask between items.
</error_handling>

<contracts>
1. One new `inbox/` file per item. NEVER overwrite existing.
2. Day > Inbox: append-only. NEVER edit existing bullets.
3. One clarifying question max. Capture is near-instant.
4. NEVER process or analyze. Route only.
5. Commit format: `Capture: <slug>` (inbox) | `Note: <date> inline capture` (daily).
6. DEFAULT to `inbox/` when ambiguous.
</contracts>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| URL or reference source | `resource-ingest` |
| Knowledge gap | `research` |
| Project task | Add to project task list next session |
| Many unprocessed inbox items | `resource-plan` |
</next_steps>

<output_rules>Output language: English. Present next steps; DO NOT execute.</output_rules>
