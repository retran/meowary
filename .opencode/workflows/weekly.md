---
updated: 2026-04-07
tags: []
---

# Weekly

> Weekly heartbeat review in two modes: Monday planning (sets focus and goals) and Friday wrap-up (compiles accomplishments, carry-overs, and reflections). Also runs an end-of-week resources scan to crystallise durable knowledge. Triggered automatically from `/morning` on Mondays and `/evening` on Fridays, or invoked explicitly.

## Role

Acts as the user's weekly strategist and knowledge crystalliser. In planning mode: seeds goals from carry-overs and sprint context, confirms focus with the user. In wrap-up mode: compiles outcomes, surfaces unmet goals, prompts reflection, and enriches `resources/` with durable facts from the week.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Weekly note template | `.opencode/skills/journal/weekly-template.md` | Required if creating |
| Previous weekly note | `journal/weekly/<year>-W<prev-nn>.md` | Optional (planning mode) |
| This week's daily notes | `journal/daily/<date>.md` (Mon–Fri) | Required (wrap-up mode) |
| Project dev-logs | `projects/<name>/dev-log.md` | Required (wrap-up mode) |
| Meeting notes | `journal/meetings/<date>-<slug>.md` | Optional (wrap-up mode) |
| Waiting-for list | `journal/waiting-for.md` | Required (wrap-up mode) |
| Active projects | `context/context.md § Active Projects` | Required |
| Jira sprint items | Jira (read-only) | Optional |

## Steps — Monday Planning Mode

### Step 0 — Load context

1. Confirm mode: Monday planning.
2. Check if `journal/weekly/<year>-W<nn>.md` already exists.
   - If not: create from `.opencode/skills/journal/weekly-template.md`.
3. Read last week's weekly note (`journal/weekly/<year>-W<prev-nn>.md`) for Carry-Over items.
4. Read `context/context.md` for active projects list.

Done when: weekly note created or confirmed to exist; previous carry-overs loaded; active projects known.

### Step 0.5 — Clarify

Ask at most two questions:

1. "What is this week's focus theme?"
2. If last week's Carry-Over is non-empty: "Are there any carry-over items that should NOT be this week's goals?"

Done when: focus theme confirmed; carry-over scope confirmed.

### Step 1 — Seed Weekly Goals

1. Start from last week's Carry-Over items.
2. Query open Jira sprint items assigned to the user that are due this week (read-only).
3. Present proposed goal list to the user. Confirm additions or removals before writing.

Done when: user-confirmed goal list ready.

### Step 2 — Write Weekly Focus and Goals

Write to `journal/weekly/<year>-W<nn>.md`:

- `**Weekly Focus:**` — one sentence, the main theme (from Step 0.5).
- `**Weekly Goals:**` — task checkboxes, one per confirmed goal.
- `**Daily Notes:**` — link Monday (today); mark Tuesday–Friday as `*(no note)*`.
- Leave Accomplishments, Failures & Setbacks, Carry-Over, and Notes & Reflections blank.

Done when: Focus, Goals, and Monday link written; remaining sections blank.

### Step 3 — Close (Planning)

Commit: `Weekly plan: <YYYY-WNN>`.

Done when: committed.

---

## Steps — Friday Wrap-Up Mode

### Step 0 — Load context

1. Confirm mode: Friday wrap-up.
2. Open `journal/weekly/<year>-W<nn>.md` (must exist; was created on Monday).
   - If missing: create from template with a note that Monday planning was skipped.
3. Read all daily notes for this week: Monday through Friday.
4. Read all `dev-log.md` entries from this week for each active project.
5. Read all meeting notes from this week in `journal/meetings/`.
6. Open `journal/waiting-for.md`.

Done when: weekly note open; all week's daily notes and dev-logs loaded; meeting notes loaded.

### Step 0.5 — Clarify

Ask at most two questions:

1. "Were there any significant accomplishments this week not captured in the daily notes?"
2. "Any items from this week that should NOT carry over to next week?"

Done when: user has responded.

### Step 1 — Compile Accomplishments

1. Gather from all daily notes: `## Evening > ### Completed` sections.
2. Gather from dev-log entries: `**Summary:**` fields for completed phases.
3. Deduplicate and condense — one line per item.
4. Write to `**Accomplishments:**` section of weekly note.

Done when: Accomplishments section written.

### Step 2 — Identify Failures and Setbacks

1. Compare Weekly Goals (set Monday) against Accomplishments.
2. Identify unmet goals and incomplete tasks.
3. Write to `**Failures & Setbacks:**` section.

Done when: Failures & Setbacks section written.

### Step 3 — Compile Carry-Over

1. List incomplete goals and tasks.
2. Present to user: confirm what carries vs. drops.
3. Write confirmed carry-overs to `**Carry-Over:**` section.
4. Mark dropped items as dropped per the journal skill.

Done when: Carry-Over section written with user confirmation.

### Step 4 — Notes and Reflections

Prompt: "What did this week prove? What would you do differently?"

Write the user's response to `**Notes & Reflections:**` per the journal skill. If the user declines: write a placeholder and note it should be filled.

Done when: Notes & Reflections written.

### Step 5 — Waiting-For review

1. Open `journal/waiting-for.md`.
2. Flag items whose follow-up date is on or before today.
3. Note flagged items in Notes & Reflections or surface as MIT candidates for next week's goals.

Done when: overdue waiting items surfaced.

### Step 6 — Resources scan (mandatory)

Scan all daily notes and meeting notes from this week for durable facts not yet in `resources/`:

- Role changes, team updates, process decisions, architecture choices.
- Patterns identified across multiple sessions.
- Post-mortem findings from debug sessions.

For each fact:
- Check if a resource article exists.
- If yes: enrich it.
- If no: create a stub (YAML front matter + H1 + one sentence), or flag for `resource-enrich`.

Run `node .opencode/scripts/health-stale.js` to surface recently-referenced articles that are stale.

Update QMD index if new articles were created: `node .opencode/scripts/qmd-index.js --changed`.

**Sub-agent trigger:** If > 2 active projects had activity this week, offload the scan to a `general` agent. Pass: all daily note paths for the week, all meeting note paths, all active project dev-log entry excerpts from this week, and `resources/` directory listing. The agent returns a structured list: durable facts found, resource article paths to update, and new stub candidates. Run inline (no sub-agent) for ≤ 2 active projects.

Done when: durable facts routed or explicitly confirmed as none; stale articles surfaced; QMD index updated if needed.

### Step 7 — Close (Wrap-Up)

1. Mark completed Weekly Goals with `- [x]`.
2. Update `**Daily Notes:**` links — verify all five days are linked or marked `*(no note)*`.
3. Commit: `Weekly wrap-up: <YYYY-WNN>`.

Done when: goals marked; daily note links verified; committed.

---

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Weekly note | `journal/weekly/<year>-W<nn>.md` | Created (planning) or completed (wrap-up) |
| Resource article updates | `resources/` | Varies |
| QMD index | `.opencode/index/` | Updated if resources changed |
| Commit | Git history | `Weekly plan: <YYYY-WNN>` or `Weekly wrap-up: <YYYY-WNN>` |

## Error Handling

- **Weekly note missing on Friday:** Create from template with a note that Monday planning was skipped; proceed with wrap-up.
- **Daily notes missing for one or more days:** Note the gap; compile from dev-log entries only for those days.
- **Jira unavailable:** Skip the Jira query in planning Step 1 silently.
- **Resources scan sub-agent fails:** Run inline instead; note the fallback.
- **User skips Notes & Reflections:** Write a placeholder; do not omit the section entirely.

## Contracts

1. `/weekly` creates and fills the weekly note. Daily notes are read-only input.
2. Resources scan is mandatory in wrap-up mode. "Nothing found" is a valid outcome; omitting the step is not.
3. Carry-Over items must be confirmed by the user before writing. Never carry over silently.
4. Read Jira only. Never create, update, or transition Jira items.
5. Commit formats: `Weekly plan: <YYYY-WNN>` (planning) | `Weekly wrap-up: <YYYY-WNN>` (wrap-up).
6. Weekly note is built incrementally: Goals on Monday, outcomes on Friday. Never complete it mid-week.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 6 (Wrap-Up) — Resources scan | `general` | built-in | No | > 2 active projects with dev-log entries this week | Structured list: durable facts found, resource article paths, new stub candidates |

`general` receives: all daily note paths for the week, all meeting note paths for the week, all active project dev-log entry excerpts from this week, and the `resources/` directory listing for cross-reference.

Run inline (no sub-agent) when ≤ 2 active projects had activity this week.

## dev-log Update

`/weekly` does not write a dev-log entry for itself. Individual projects' dev-logs are read as input; they are not modified by this workflow.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Wrap-up: new resource stubs created | `resource-enrich` to flesh them out |
| Wrap-up: patterns identified across sessions | `resource-enrich` or `resource-ops` (merge related articles) |
| Planning: carry-over items are substantial | Review and re-scope with `plan replan` |
| Planning: stalled project identified | `scout` to re-orient |
