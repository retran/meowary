---
updated: 2026-04-18
tags: []
---

# Evening

<summary>
> Daily end-of-day close-out. Completes Evening zone, distills the day, routes waiting items, scans for resource enrichment, optionally runs Friday weekly wrap-up.
</summary>

<role>
Structured end-of-day closer. Reviews work, routes delegated items, surfaces durable knowledge. NEVER make autonomous routing decisions for resources — present options and confirm before writing.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Today's daily note | `journal/daily/<date>.md` | Yes |
| Project dev-logs | `projects/<name>/dev-log.md` | Optional |
| Waiting-for list | `journal/waiting-for.md` | Yes |
| Resource articles | `resources/` | Optional |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<steps>

<step n="0" name="Load context">
1. READ today's daily note in full. If missing: create from `.opencode/skills/journal/daily-template.md`, note Morning zone skipped.
2. READ last entry of `dev-log.md` for each active project worked today.
3. READ `journal/waiting-for.md`; note items with follow-up date ≤ today.

<done_when>Daily note loaded; dev-log entries surfaced; overdue waiting items identified.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK at most two questions:
1. "Notable events or decisions today not in the work log?"
2. If Friday: "Run weekly wrap-up after evening close-out?"

SKIP if context clear or if not Friday (Q2).

<done_when>User responded or N/A.</done_when>
</step>

<step n="1" name="Review Day zone">
1. READ `## Day > ### Inbox`, `### Events`, `### Waiting`.
2. CATEGORIZE each Inbox item: **done**, **carry** (to date), **drop**.
3. CONFIRM Events linked to meeting notes; flag unlinked.
4. IDENTIFY new Waiting items to route.
5. FLAG existing `waiting-for.md` items overdue.

<done_when>Every Inbox item categorized; Events checked; new Waiting items identified.</done_when>
</step>

<step n="2" name="Route Waiting items">
For each new Waiting item: APPEND to `journal/waiting-for.md § Active` per journal skill format. DO NOT duplicate.

If overdue items flagged: surface to user with chase/close prompt.

<done_when>All new waiting items appended; overdue surfaced.</done_when>
</step>

<step n="3" name="Compile Evening zone">
WRITE `## Evening` with four sub-sections:
1. `### Completed` — tick MITs and done tasks.
2. `### Carried / Dropped` — each unfinished MIT: decision (carried to `<date>` | dropped) + reason.
3. `### Insights → Resources` — durable facts, each linked to resource article (Step 4).
4. `### Day Summary` — 1–2 sentences + task stats + end-of-day scan per journal skill.

Evening zone APPENDS only. NEVER edit Morning or Day content. Mark MITs in `### Completed` — DO NOT edit Morning in-place.

<done_when>All four sub-sections written.</done_when>
</step>

<step n="4" name="Resource scan" gate="HARD-GATE">
Scan today's Inbox/Events/work-log for durable knowledge:
- Role changes, team updates, process decisions → update person/team article.
- Architecture, ownership, tool decisions → update relevant article.
- New concepts with no article → create stub (front matter + H1 + 1 sentence) or add to `inbox/` for `resource-enrich`.

If nothing durable: WRITE `nothing to promote today.` in `### Insights → Resources`.

MANDATORY. NEVER skip; "nothing" is valid, silence is not.

<done_when>Durable facts routed or explicitly confirmed as none.</done_when>
</step>

<step n="5" name="Friday weekly wrap-up" condition="Today is Friday AND user accepted in Step 0.5">
1. OPEN or create `journal/weekly/<year>-W<nn>.md`.
2. PERFORM Friday wrap-up per journal skill.

<done_when>Weekly note completed.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
1. UPDATE `## Active Projects` in `context/context.md`:
   - ADD new projects started today (per projects skill).
   - REMOVE completed/archived projects.
   - UPDATE `phase:` and `priority:` for changed projects.
2. COMMIT:
   - Evening only: `Evening: <YYYY-MM-DD>`
   - Evening + weekly: two commits — `Evening: <YYYY-MM-DD>` then `Weekly wrap-up: <year>-W<nn>`.

No dev-log entry for `/evening` itself.

<self_review>
- [ ] All `Done when` met
- [ ] All inbox items processed or deferred
- [ ] Daily note updated
- [ ] Tomorrow's priorities identified
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>`context.md` updated; committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Evening zone | `journal/daily/<date>.md` | Appended |
| Waiting updates | `journal/waiting-for.md` | Appended |
| Resource updates | `resources/` | Varies |
| Weekly note (Fri) | `journal/weekly/<year>-W<nn>.md` | Wrap-up filled |
| Commit | Git | `Evening: <YYYY-MM-DD>` |
</outputs>

<error_handling>
- **No daily note:** Create from template, note Morning skipped.
- **`waiting-for.md` missing:** Create from `.opencode/meta-templates/waiting-for-template.md`. If template missing, create with `## Active`/`## Resolved` sections.
- **Evening zone already filled:** Confirm before overwriting any section. NEVER silently overwrite.
- **Resource article missing for fact:** Create stub before writing fact.
- **Weekly note missing on Friday:** Create from `.opencode/skills/journal/weekly-template.md` noting Monday skipped.
</error_handling>

<contracts>
1. Owns `## Evening` zone. May write `- [x]` markers in Morning/Day, NEVER add new content there.
2. Resource scan MANDATORY. "Nothing" valid, silence is not.
3. Waiting items routed before close. No unrouted items.
4. NEVER rewrite or delete Morning or Day content.
5. Commit format: `Evening: <YYYY-MM-DD>`.
6. Friday wrap-up opt-in. ALWAYS ask; never auto-trigger.
</contracts>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Resource stubs created today | `resource-enrich` |
| Inbox flagged source material | `resource-ingest` |
| Friday wrap-up done | Done for the week |
| Deferred items need processing | `capture` or project task list |
</next_steps>

<output_rules>Output language: English.</output_rules>
