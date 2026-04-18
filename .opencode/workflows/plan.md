---
updated: 2026-04-18
tags: []
---

<role>
Structured project planner. Scope explicitly — separate in-scope from out-of-scope. Write success criteria before tasks. NEVER plan around assumptions — if Step 0.5 surfaces unresolved ambiguities, STOP. In replan mode: revise only affected sections, preserve all valid content, produce clear diff.
</role>

<summary>
Scopes work and produces a structured plan before implementation. Supports explicit **replan mode** when new findings change scope, invalidate assumptions, or reveal complexity. Plan artifact is the authoritative record of what is in scope, in what order, and why. Invoke before any implementation; invoke replan when scope changes.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Spec or problem statement | User / `specs/` | Required |
| Complexity tier | User declaration | Required |
| Research brief | `projects/<name>/research/` | Recommended |
| Current plan (replan only) | `projects/<name>/plans/` | Required for replan |
| Triggering context (replan only) | User / dev-log last entry | Required for replan |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Scout + clarify + scope + handoff; inline plan only; no charter | END-GATE only |
| Standard | All steps; charter optional; milestone-level breakdown | SOFT-GATE after scope; END-GATE at close |
| Full | All steps; charter required; full task breakdown with dependencies and risks | HARD-GATE after scope, after breakdown, before handoff |

Replan mode ALWAYS runs at Standard or Full regardless of original tier.
</tiers>

<definitions>
Risk classification:

| Risk | Criteria | Example |
|------|----------|---------|
| **high** | Touches auth, security, data persistence, public API, shared infrastructure, or no rollback | "Migrate user table schema" |
| **medium** | Touches multiple modules, requires coordination, or limited test coverage | "Refactor config loading" |
| **low** | Self-contained, well-tested area, easy to revert | "Add tooltip to button" |

Three levels only. Catastrophic risk (data loss, security breaches) handled by `context/safety.md` auto-Blocker rules at review time — separate dimension from planning-time risk tags.
</definitions>

<steps>

## Initial Plan

<step n="0" name="Load context">
1. **Project scaffold check:** if `projects/<name>/` does not exist, create now:
   - Directories: `notes/`, `research/`, `plans/`, `design/`, `docs/`, `drafts/`
   - Files: `dev-log.md` (empty + front matter), `STATE.md` (empty + front matter)
   - Announce: "Created project scaffold for `<name>`."
2. Read `projects/<name>/dev-log.md` last entry.
3. Load research brief if available: `projects/<name>/research/brief-<topic>.md`.
4. Load existing spec or problem statement.
5. Read today's daily note — find tasks matching plan.
<done_when>Project scaffold confirmed; dev-log, brief, spec loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. What are we building / solving? What does "done" look like?
2. Complexity tier: Quick / Standard / Full?
3. Known constraints, deadlines, non-negotiables?

<subagent_trigger agent="explore" condition="all tiers">
Pass: planning topic and project name. Search `resources/`, `projects/<name>/plans/`, codebase for prior plans and related work. Returns: relevant resource paths, prior plan files, codebase patterns. Launch as soon as planning topic clear, in parallel with clarifying questions. Merge findings into Step 1 context.
</subagent_trigger>

DO NOT proceed until scope intent and tier clear.
<done_when>Scope, done criteria, tier, constraints confirmed; `explore` results merged.</done_when>
</step>

<step n="1" name="Scout">
1. If `scout` already run for topic this session: load output.
2. Else: run `scout` for topic now.
3. Check `projects/<name>/plans/` for prior plans on related work.
4. Surface dependencies on other projects or codebases.
<done_when>Existing prior work surfaced; dependencies identified.</done_when>
</step>

<step n="2" name="Scope" gate="HARD-GATE (Full)">
1. Define explicitly: what is **in scope**, what is **out of scope**.
2. Write success criteria: how will we know this is done?
3. Identify known risks and unknowns.
4. NEVER reduce scope without surfacing it explicitly. Any scope reduction MUST be stated with reason.

HARD-GATE (Full): Present scope; confirm before proceeding.
<done_when>In/out scope documented; success criteria written; risks identified.</done_when>
</step>

<step n="3" name="Charter" condition="Standard + Full" skip_if="Quick">
1. Establish project constraints: technical limits, deadlines, team constraints.
2. Define principles and non-negotiables (e.g., "must not break backwards compatibility").
3. Write to `projects/<name>/plans/charter.md`.
<done_when>`charter.md` written with constraints, principles, non-negotiables.</done_when>
</step>

<step n="4" name="Breakdown" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
1. Decompose into milestones (major deliverables) and tasks (actionable units).
2. Each task format:
   ```markdown
   - [ ] <task> (<effort>) [risk: high|medium|low] [depends: <task>]
   ```
3. USE risk classification from `<definitions>`.
4. Order tasks goal-backward: what must be TRUE first → what must EXIST → what must be WIRED. Dependency-driven sequencing, NOT convenience-driven.
5. Among tasks with no dependency order: prefer high-risk first (fail fast).
6. Quick: one-line task list only (no risk tags).

HARD-GATE (Full): Present breakdown; confirm before writing plan artifact.
<done_when>Task list with effort, risk tags, dependencies written; ordered goal-backward.</done_when>
</step>

<step n="5" name="Roadmap" condition="Standard + Full" skip_if="Quick">
1. Sequence tasks; identify critical path.
2. Flag risks: what could block? What is most uncertain?
3. Note deferred items explicitly — NOT removed from scope, just sequenced later.
<done_when>Tasks sequenced; critical path identified; risks and deferrals noted.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
Write plan to `projects/<name>/plans/<slug>.md`:

```markdown
## Plan: <name>
**Created:** <date>
**Updated:** <date>
**Status:** active
**Complexity:** Quick | Standard | Full

## Scope
**In scope:** <list>
**Out of scope:** <list>
**Success criteria:** <list>

## Charter (Standard + Full)
**Constraints:** <list>
**Principles:** <list>
**Non-negotiables:** <list>

## Milestones
1. <Milestone name> — <description>

## Tasks
- [ ] <task> (<effort>) [risk: high|medium|low] [depends: <task>]

## Risks
- <risk>: <mitigation>

## Deferred
- <item>: <reason>
```

Then:
1. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — plan — <name>
**Phase:** planning [initial]
**Duration:** <estimate>
**Summary:** <what was scoped, what decisions made>
**Key decisions:** <bullet list>
**Deferred:** <items and reasons>
**Next:** <first task or next workflow>
```

2. Append work log to `## Day` zone of today's daily note.
3. Mark matching task items done.

<self_review>
- All `<done_when>` criteria met
- Every spec requirement maps to ≥1 task
- No task depends on a task that depends on it (no circular chains)
- Every task has effort estimate and risk tag (Standard + Full)
- Risk mitigations actionable, not vague
- Deferred items have explicit reasons
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Plan file written; dev-log entry appended; daily note updated.</done_when>
</step>

## Replan Mode

Triggered explicitly by user with the word "replan". User provides (or agent reads from dev-log) the triggering context.

<step n="R0" name="Load context (replan)">
1. Read `projects/<name>/plans/<slug>.md` (current plan).
2. Read `projects/<name>/dev-log.md` last entry for triggering context.
3. Ask user what changed and why replan needed if not stated.
<done_when>Current plan and triggering context loaded.</done_when>
</step>

<step n="R1" name="Assess">
1. Identify what changed and why replan triggered.
2. Classify impact: scope change / priority change / approach change / new risk.
3. Determine which parts of current plan still valid.
<done_when>Impact classified; valid and invalid sections identified.</done_when>
</step>

<step n="R2" name="Revise">
1. Update only affected sections.
2. Mark changed sections: `> **Revised <date>:** <reason>`.
3. Preserve all still-valid content verbatim.
4. Move invalidated items to `## Deprecated` section with explanation.
<done_when>Affected sections revised; `## Deprecated` written for all invalidated items.</done_when>
</step>

<step n="R3" name="Diff">
Produce delta summary:
- What's new
- What's removed or deprecated
- What's deferred (with reason)
- What's unchanged
<done_when>Delta summary written and presented to user.</done_when>
</step>

<step n="R4" name="Close (replan)" gate="END-GATE">
1. Update `projects/<name>/plans/<slug>.md`.
2. Append dev-log entry noting trigger and changes.
3. Append work log to `## Day` zone of today's daily note.
4. Mark matching task items done.

<self_review>
- All `<done_when>` criteria met
- Delta summary covers all changes
- Deprecated items preserved with explanation
- No silent scope reductions
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Plan file updated; dev-log entry appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Plan | `projects/<name>/plans/<slug>.md` | Markdown |
| Charter | `projects/<name>/plans/charter.md` | Markdown (Standard + Full) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **Unresolved scope ambiguity at Step 0.5:** STOP. DO NOT proceed to Step 1 until user resolves. A plan built on assumptions produces wrong implementation.
- **Project scaffold already exists:** Skip creation; announce and proceed.
- **Research brief missing:** Proceed without it. Note gap. Ask whether `research` should run first.
- **Replan triggered mid-implementation with no clear reason:** Ask before assessing. DO NOT guess what changed.
</error_handling>

<contracts>
1. Scope ambiguity blocks the workflow. DO NOT proceed past Step 0.5 without concrete scope.
2. NEVER reduce scope silently. Every scope reduction MUST be stated with reason.
3. Replan preserves history — deprecated content goes to `## Deprecated`, NEVER deleted.
4. Tasks ordered goal-backward (TRUE → EXIST → WIRED), NOT by convenience.
5. Deferred items remain in plan. "Deferred" is NOT "dropped".
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 0.5 | `explore` | built-in | Yes — parallel to clarification | All tiers | Prior plans, related resource articles, codebase patterns relevant to planning scope |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Architecture decisions needed before coding | `design` |
| Scope clear and approach known | `implement` |
| Output is a document, not code | `write` |
| New constraint discovered during planning | `design` |
| Research needed to validate assumptions | `research` |
| Planning reveals spec needs broader exploration | `brainstorm` |
</next_steps>

<output_rules>
- Language: English.
- NEVER plan around unresolved ambiguities.
- NEVER reduce scope silently.
- Replan: preserve deprecated content, NEVER delete.
</output_rules>
