---
updated: 2026-04-18
tags: []
---

# Weekly

<summary>
> Weekly review in two modes. Monday planning: sets focus and goals. Friday wrap-up: compiles accomplishments, carry-overs, reflections, runs end-of-week resources scan. Triggered from `/morning` (Mon) or `/evening` (Fri), or invoked explicitly.
</summary>

<role>
Weekly strategist and knowledge crystallizer. Planning: seeds goals from carry-overs and sprint, confirms focus. Wrap-up: compiles outcomes, surfaces unmet goals, prompts reflection, enriches `resources/`.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Weekly template | `.opencode/skills/journal/weekly-template.md` | If creating |
| Previous weekly | `journal/weekly/<year>-W<prev-nn>.md` | Optional (planning) |
| This week's daily notes | `journal/daily/<date>.md` (Mon–Fri) | Yes (wrap-up) |
| Project dev-logs | `projects/<name>/dev-log.md` | Yes (wrap-up) |
| Meeting notes | `journal/meetings/<date>-<slug>.md` | Optional (wrap-up) |
| Waiting-for | `journal/waiting-for.md` | Yes (wrap-up) |
| Active projects | `context/context.md § Active Projects` | Yes |
| Jira sprint | Jira (read-only) | Optional |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<steps>

<step n="0-mon" name="Monday: Load context" condition="Monday planning mode">
1. CONFIRM mode: Monday planning.
2. CHECK `journal/weekly/<year>-W<nn>.md` exists; if not, create from template.
3. READ last week's note for Carry-Over items.
4. READ `context/context.md` for active projects.

<done_when>Weekly note exists; carry-overs loaded; projects known.</done_when>
</step>

<step n="0.5-mon" name="Monday: Clarify" condition="Monday planning mode">
ASK at most two:
1. "What is this week's focus theme?"
2. If carry-over non-empty: "Any carry-overs that should NOT be this week's goals?"

<done_when>Focus theme + carry-over scope confirmed.</done_when>
</step>

<step n="1-mon" name="Monday: Seed Weekly Goals" condition="Monday planning mode">
1. START from last week's Carry-Over.
2. QUERY Jira sprint items due this week (read-only).
3. PRESENT proposed goals; confirm before writing.

<done_when>User-confirmed goal list.</done_when>
</step>

<step n="2-mon" name="Monday: Write Focus and Goals" condition="Monday planning mode">
WRITE to `journal/weekly/<year>-W<nn>.md`:
- `**Weekly Focus:**` — one sentence (from Step 0.5).
- `**Weekly Goals:**` — checkboxes per confirmed goal.
- `**Daily Notes:**` — link Monday; mark Tue–Fri `*(no note)*`.
- LEAVE Accomplishments, Failures & Setbacks, Carry-Over, Notes & Reflections blank.

<done_when>Focus, Goals, Monday link written.</done_when>
</step>

<step n="3-mon" name="Monday: Close" condition="Monday planning mode" gate="END-GATE">
COMMIT: `Weekly plan: <YYYY-WNN>`.

<self_review>
- [ ] All `Done when` met
- [ ] Goals set and linked to projects
- [ ] Prior week review actions noted
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Committed.</done_when>
</step>

<step n="0-fri" name="Friday: Load context" condition="Friday wrap-up mode">
1. CONFIRM mode: Friday wrap-up.
2. OPEN `journal/weekly/<year>-W<nn>.md` (must exist from Monday). If missing: create from template, note Monday skipped.
3. READ all daily notes Mon–Fri.
4. READ all dev-log entries from this week.
5. READ all meeting notes from this week.
6. OPEN `journal/waiting-for.md`.

<done_when>Weekly note open; all sources loaded.</done_when>
</step>

<step n="0.5-fri" name="Friday: Clarify" condition="Friday wrap-up mode">
ASK at most two:
1. "Significant accomplishments not in daily notes?"
2. "Items that should NOT carry to next week?"

<done_when>User responded.</done_when>
</step>

<step n="1-fri" name="Friday: Compile Accomplishments" condition="Friday wrap-up mode">
1. GATHER from daily notes `## Evening > ### Completed`.
2. GATHER from dev-log `**Summary:**` for completed phases.
3. DEDUPE and condense — one line per item.
4. WRITE `**Accomplishments:**`.

<done_when>Section written.</done_when>
</step>

<step n="2-fri" name="Friday: Failures and Setbacks" condition="Friday wrap-up mode">
1. COMPARE Goals (Mon) vs Accomplishments.
2. IDENTIFY unmet goals and incomplete tasks.
3. WRITE `**Failures & Setbacks:**`.

<done_when>Section written.</done_when>
</step>

<step n="3-fri" name="Friday: Carry-Over" condition="Friday wrap-up mode">
1. LIST incomplete goals/tasks.
2. PRESENT to user; confirm carry vs drop.
3. WRITE confirmed `**Carry-Over:**`.
4. MARK dropped items per journal skill.

<done_when>Section written with confirmation.</done_when>
</step>

<step n="4-fri" name="Friday: Notes and Reflections" condition="Friday wrap-up mode">
PROMPT: "What did this week prove? What would you do differently?"

WRITE `**Notes & Reflections:**` per journal skill. If user declines: write placeholder noting fill-needed.

<done_when>Section written.</done_when>
</step>

<step n="5-fri" name="Friday: Waiting-For review" condition="Friday wrap-up mode">
1. OPEN `journal/waiting-for.md`.
2. FLAG items with follow-up date ≤ today.
3. NOTE in Reflections or surface as MIT candidates next week.

<done_when>Overdue surfaced.</done_when>
</step>

<step n="6-fri" name="Friday: Resources scan" condition="Friday wrap-up mode" gate="HARD-GATE">
Scan daily/meeting notes from this week for durable facts not in `resources/`:
- Role changes, team updates, process decisions, architecture choices.
- Patterns across sessions.
- Post-mortem findings from debug sessions.

For each fact:
- Article exists → enrich.
- No article → stub (front matter + H1 + 1 sentence) or flag for `resource-enrich`.

RUN `node .opencode/scripts/health-stale.js` to surface stale referenced articles.

UPDATE QMD index if new articles: `node .opencode/scripts/qmd-index.js --changed`.

<subagent_trigger>If > 2 active projects had activity this week: offload to `general` agent. Pass: all daily note paths, all meeting note paths, all dev-log excerpts from week, `resources/` directory listing. Returns structured list: durable facts, paths to update, stub candidates. Inline (no agent) for ≤ 2 projects.</subagent_trigger>

<done_when>Durable facts routed or confirmed none; stale surfaced; QMD updated if needed.</done_when>
</step>

<step n="7-fri" name="Friday: Close" condition="Friday wrap-up mode" gate="END-GATE">
1. MARK completed Weekly Goals `- [x]`.
2. UPDATE `**Daily Notes:**` links — verify all 5 days linked or `*(no note)*`.
3. COMMIT: `Weekly wrap-up: <YYYY-WNN>`.

<self_review>
- [ ] All `Done when` met
- [ ] Accomplishments documented
- [ ] Unfinished items carried or dropped
- [ ] All sections complete
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Goals marked; links verified; committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Weekly note | `journal/weekly/<year>-W<nn>.md` | Created (plan) or completed (wrap) |
| Resource updates | `resources/` | Varies |
| QMD index | `.opencode/index/` | Updated if changed |
| Commit | Git | `Weekly plan: <YYYY-WNN>` or `Weekly wrap-up: <YYYY-WNN>` |
</outputs>

<error_handling>
- **Weekly note missing on Friday:** Create from template, note Monday skipped, proceed.
- **Daily notes missing for days:** Note gap; compile from dev-log only.
- **Jira unavailable:** Skip Jira query in planning Step 1 silently.
- **Resources scan sub-agent fails:** Run inline; note fallback.
- **User skips Reflections:** Write placeholder; NEVER omit section.
</error_handling>

<contracts>
1. `/weekly` creates and fills weekly note. Daily notes are read-only input.
2. Resources scan MANDATORY in wrap-up. "Nothing" valid; omitting not.
3. Carry-Over confirmed by user before writing. NEVER carry silently.
4. Read Jira only. NEVER create/update/transition.
5. Commit formats: `Weekly plan: <YYYY-WNN>` | `Weekly wrap-up: <YYYY-WNN>`.
6. Built incrementally: Goals Mon, outcomes Fri. NEVER complete mid-week.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 6-fri Resources scan | `general` | built-in | No | > 2 active projects with dev-log entries this week | Structured list: durable facts, article paths, stub candidates |

`general` receives: all daily note paths for week, all meeting note paths, dev-log excerpts from week, `resources/` directory listing.

Inline (no agent) when ≤ 2 active projects had activity.
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Wrap: new resource stubs | `resource-enrich` |
| Wrap: patterns identified | `resource-enrich` or `resource-ops` (merge) |
| Plan: substantial carry-over | Re-scope with `plan replan` |
| Plan: stalled project | `scout` |
</next_steps>

<output_rules>Output language: English.</output_rules>
