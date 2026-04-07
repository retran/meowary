---
updated: 2026-04-07
tags: []
---

# Plan

> Scopes work and produces a structured plan before implementation begins. Supports an explicit **replan mode** triggered when new findings change scope, invalidate assumptions, or reveal unexpected complexity. The plan artifact is the authoritative record of what is in scope, in what order, and why. Invoke before any implementation; invoke replan when scope changes.

## Role

Acts as a structured project planner. Scopes explicitly — separates what is in scope from what is out. Writes success criteria before tasks. Never plans around assumptions — if Step 0.5 surfaces unresolved ambiguities, the workflow stops. In replan mode: revises only the affected sections, preserves all valid content, and produces a clear diff of what changed.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Spec or problem statement | User / `specs/` | Required |
| Complexity tier | User declaration | Required |
| Research brief | `projects/<name>/research/` | Recommended |
| Current plan (replan only) | `projects/<name>/plans/` | Required for replan |
| Triggering context (replan only) | User / dev-log last entry | Required for replan |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Scout + clarify + scope + handoff; inline plan only; no charter | End gate only |
| **Standard** | All steps; charter optional; milestone-level breakdown | Mid-gate after scope + end gate |
| **Full** | All steps; charter required; full task breakdown with dependencies and risks | HARD-GATE after scope; HARD-GATE after breakdown; HARD-GATE before handoff |

Replan mode always runs at Standard or Full regardless of original tier.

---

## Steps — Initial Plan

### Step 0 — Load context

1. **Project scaffold check:** if `projects/<name>/` does not exist, create it now:
   - Directories: `notes/`, `research/`, `plans/`, `design/`, `docs/`, `drafts/`
   - Files: `dev-log.md` (empty with front matter), `STATE.md` (empty with front matter)
   - Announce: "Created project scaffold for `<name>`."
2. Read `projects/<name>/dev-log.md` last entry for current project context.
3. Load research brief if available: `projects/<name>/research/brief-<topic>.md`.
4. Load existing spec or problem statement.
5. Read today's daily note — find any tasks matching this plan.

Done when: project scaffold confirmed; dev-log, brief, and spec loaded.

### Step 0.5 — Clarify

Ask the user:
1. What are we building / solving? What does "done" look like?
2. Complexity tier: Quick / Standard / Full?
3. Are there known constraints, deadlines, or non-negotiables?

Simultaneously: launch an `explore` sub-agent to search `resources/`, `projects/<name>/plans/`, and the codebase for prior plans and related work. Pass: planning topic and project name. Agent returns: relevant resource article paths, prior plan files, and codebase patterns. Launch as soon as the planning topic is clear, in parallel with asking the clarifying questions. Merge findings into Step 1 context.

Do not proceed until scope intent and tier are clear.

Done when: scope, done criteria, tier, and constraints confirmed; `explore` results merged.

### Step 1 — Scout

1. If `scout` was already run for this topic this session: load its output.
2. Otherwise: run `scout` for the topic now.
3. Check `projects/<name>/plans/` for prior plans on related work.
4. Surface dependencies on other projects or codebases.

Done when: existing prior work surfaced; dependencies identified.

### Step 2 — Scope

1. Define explicitly: what is **in scope** and what is **out of scope**.
2. Write success criteria: how will we know this is done?
3. Identify known risks and unknowns.
4. Never reduce scope without surfacing it explicitly — any scope reduction must be stated with a reason.

**HARD-GATE (Full):** Present scope definition; confirm before proceeding.

Done when: in/out scope documented; success criteria written; risks identified.

### Step 3 — Charter (Standard + Full)

1. Establish project constraints: technical limits, deadlines, team constraints.
2. Define principles and non-negotiables (e.g., "must not break backwards compatibility").
3. Write to `projects/<name>/plans/charter.md`.

Skip for Quick tier.

Done when: `charter.md` written with constraints, principles, and non-negotiables.

### Step 4 — Breakdown (Standard + Full)

1. Decompose into milestones (major deliverables) and tasks (actionable units).
2. Each task: name, description, estimated effort, dependencies.
3. Order tasks goal-backward: what must be TRUE first → what must EXIST → what must be WIRED. This ensures dependency-driven sequencing, not convenience-driven.
4. Quick: one-line task list only.

**HARD-GATE (Full):** Present breakdown; confirm before writing plan artifact.

Skip for Quick tier.

Done when: task list with effort and dependencies written; ordered goal-backward.

### Step 5 — Roadmap (Standard + Full)

1. Sequence tasks; identify critical path.
2. Flag risks: what could block progress? What is most uncertain?
3. Note deferred items explicitly — not removed from scope, just sequenced later.

Skip for Quick tier.

Done when: tasks sequenced; critical path identified; risks and deferrals noted.

### Step 6 — Handoff

Write plan to `projects/<name>/plans/<slug>.md` using this format:

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
- [ ] <task> (<effort>) [depends: <task>]

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
**Summary:** <what was scoped, what decisions were made>
**Key decisions:** <bullet list>
**Deferred:** <items and reasons>
**Next:** <first task or next workflow>
```

2. Append work log entry to `## Day` zone of today's daily note.
3. Mark matching task items as done.

Done when: plan file written; dev-log entry appended; daily note updated.

---

## Steps — Replan Mode

Triggered explicitly by the user with the word "replan". The user provides (or the agent reads from dev-log) the triggering context.

### Step R0 — Load

1. Read `projects/<name>/plans/<slug>.md` (current plan).
2. Read `projects/<name>/dev-log.md` last entry for triggering context.
3. Ask the user what changed and why the replan is needed if not already stated.

Done when: current plan and triggering context loaded.

### Step R1 — Assess

1. Identify what changed and why the replan was triggered.
2. Classify impact: scope change / priority change / approach change / new risk.
3. Determine which parts of the current plan are still valid.

Done when: impact classified; valid and invalid sections identified.

### Step R2 — Revise

1. Update only the affected sections of the plan.
2. Mark changed sections: `> **Revised <date>:** <reason>`.
3. Preserve all still-valid content verbatim.
4. Move invalidated items to a `## Deprecated` section with explanation.

Done when: affected sections revised; `## Deprecated` section written for all invalidated items.

### Step R3 — Diff

Produce a clear delta summary:
- What's new
- What's removed or deprecated
- What's deferred (with reason)
- What's unchanged

Done when: delta summary written and presented to user.

### Step R4 — Handoff

1. Update `projects/<name>/plans/<slug>.md`.
2. Append dev-log entry noting what triggered the replan and what changed.
3. Append work log entry to `## Day` zone of today's daily note.
4. Mark matching task items as done.

Done when: plan file updated; dev-log entry appended; daily note updated.

---

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Plan | `projects/<name>/plans/<slug>.md` | Markdown |
| Charter | `projects/<name>/plans/charter.md` | Markdown (Standard + Full) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **Unresolved scope ambiguity at Step 0.5:** Stop. Do not proceed to Step 1 until the user resolves the ambiguity. A plan built on assumptions will produce wrong implementation.
- **Project scaffold already exists:** Skip creation; announce that the scaffold already exists and proceed.
- **Research brief missing:** Proceed without it; note the gap and ask whether `research` should be run first.
- **Replan triggered mid-implementation with no clear triggering reason:** Ask before assessing. Do not attempt to guess what changed.

## Contracts

1. Scope ambiguity blocks the workflow. Do not proceed past Step 0.5 without a concrete scope.
2. Never reduce scope silently. Every scope reduction must be stated with a reason.
3. Replan preserves history — deprecated content goes to `## Deprecated`, never deleted.
4. Tasks are ordered goal-backward (TRUE → EXIST → WIRED), not by convenience.
5. Deferred items remain in the plan. "Deferred" is not the same as "dropped."

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 0.5 — Clarify | `explore` | built-in | Yes — parallel to clarification | All tiers | Prior plans, related resource articles, and codebase patterns relevant to the planning scope |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Architecture decisions needed before coding | `design` |
| Scope is clear and approach is known | `implement` |
| Output is a document, not code | `write` |
| New constraint discovered during planning | `design` |
| Research needed to validate assumptions | `research` |
