---
updated: 2026-04-18
tags: []
---

# Meeting

<summary>
> Captures meeting notes for any type, routes every action item before close, cross-links to today's daily note, scans for durable facts. Produces `journal/meetings/<date>-<slug>.md`.
</summary>

<role>
Meeting note-taker and action item router. Creates file, populates per type-specific section rules, routes every action item, extracts durable knowledge. **HARD-GATE (all tiers):** every action item routed before close.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Title, type, attendees | User invocation | Yes |
| Meeting content | User-provided | Yes |
| Active projects | `context.md § Active Projects` | Optional |
| Attendee articles | `resources/people/` | Optional |
| Today's daily note | `journal/daily/<date>.md` | Yes (cross-link) |
| Waiting-for list | `journal/waiting-for.md` | Yes (routing) |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<steps>

<step n="0" name="Load context">
1. READ `context/context.md` for active projects and people.
2. CHECK today's daily note exists.
3. SEARCH `resources/people/` for attendee matches.
4. **If type=`1-1`:** READ `resources/people/<other-person-slug>.md` if exists — surface role, team, recent context, open follow-ups.

<done_when>Projects/people loaded; attendee articles located; daily note checked.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK at most three questions:
1. Title, type (`general`|`1-1`|`standup`|`retro`|`kickoff`), attendees?
2. Recurrence (`once`|`daily`|`weekly`|`biweekly`|`monthly`)?
3. If meeting happened: "Provide notes/key points." If pre-meeting: "Create template for live notes, or provide notes after?"

<done_when>Title, type, attendees, recurrence, note-taking mode confirmed.</done_when>
</step>

<step n="1" name="Create meeting file">
1. Filename: `journal/meetings/<YYYY-MM-DD>-<slug>.md` (`<slug>`: 1–4 word kebab-case).
2. CREATE from `.opencode/skills/journal/meeting-template.md`.
3. APPLY front matter and header per meeting skill.
4. **Recurring:** add `**Previous:** [<date>](../meetings/<prev-date>-<slug>.md)` to header if previous exists.

<done_when>File created with front matter and header.</done_when>
</step>

<step n="2" name="Capture content">
WRITE sections required for type per meeting skill rules. Apply all content rules (decisions in active voice, action item format, per-person standup format).

For `1-1`: also write 1-1 additional sections per skill.

<done_when>All required sections written; none blank.</done_when>
</step>

<step n="3" name="Route action items" gate="HARD-GATE">
For each action item in `### Action Items`: ROUTE to exactly one destination per meeting skill routing table.

**HARD-GATE:** Every action item MUST be routed.

<done_when>Every action item has routing destination.</done_when>
</step>

<step n="4" name="Cross-link to daily note">
APPEND cross-link entry to `## Day > ### Events` in today's daily note per meeting skill. Tag with `#p-` and `#person-` tags.

If `### Events` missing under `## Day`: create it.

<done_when>Cross-link written.</done_when>
</step>

<step n="5" name="Resources scan">
Scan notes for durable facts; route per meeting skill resources scan procedure.

For `1-1`: UPDATE `resources/people/<other-person-slug>.md` per skill 1-1 update procedure. Create stub if missing.

If nothing durable: note explicitly.

<done_when>Durable facts routed or confirmed none; 1-1 article updated if applicable.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
1. APPLY meeting note editor checklist.
2. COMMIT: `Meeting: <YYYY-MM-DD> <slug>`.

<self_review>
- [ ] All `Done when` met
- [ ] All action items routed
- [ ] Attendees and date complete
- [ ] Decisions documented
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Checklist passed; committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Meeting note | `journal/meetings/<date>-<slug>.md` | Markdown |
| Daily cross-link | `journal/daily/<date>.md` Day > Events | Appended |
| Own tasks | `journal/daily/<date>.md` Day > Inbox | Appended |
| Waiting items | `journal/waiting-for.md` | Appended |
| Project tasks | `projects/<slug>/README.md` | Appended |
| Resource updates | `resources/` | Varies |
| Commit | Git | `Meeting: <YYYY-MM-DD> <slug>` |
</outputs>

<error_handling>
- **`meeting-template.md` missing:** Create manually with required schema/sections. Note missing.
- **Today's daily note missing:** Create from `.opencode/skills/journal/daily-template.md` before cross-link.
- **`waiting-for.md` missing:** Create from `.opencode/meta-templates/waiting-for-template.md` before routing.
- **Attendee no resource article:** Create stub `resources/people/<slug>.md` before resources scan.
- **Action item no clear routing:** DEFAULT `→ Parking Lot`. Surface at end of Step 3.
- **Pre-meeting template mode:** Create file with empty structural sections. Run Steps 3–6 after meeting.
</error_handling>

<contracts>
1. One meeting file per invocation. Complete before commit.
2. Every action item routed. No exceptions.
3. Cross-link MANDATORY. NEVER omit Step 4.
4. Resources scan on every meeting. "Nothing" valid; skipping not.
5. For 1-1: update or create person article.
6. Commit format: `Meeting: <YYYY-MM-DD> <slug>`.
</contracts>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Resource stubs created | `resource-enrich` |
| Own tasks for today | Work Day > Inbox in current session |
| Project decision | `design` or `plan` |
| Source material in notes | `resource-ingest` |
</next_steps>

<output_rules>Output language: English.</output_rules>
