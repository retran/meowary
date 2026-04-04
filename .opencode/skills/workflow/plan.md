---
name: workflow/plan
description: "Create an implementation plan from an approved spec or clear task description."
compatibility: opencode
depends_on:
  - workflow
---

# Plan Phase

Turn an approved spec (or a well-understood task) into an ordered implementation plan with file-level detail.

## When to Use

- After a spec is approved (normal flow)
- For medium-to-large tasks that touch multiple files
- When the user asks to "plan" or "break down" a task
- Skip for trivial changes (single-file fixes, typo corrections)

## Workflow

### Step 0: Load Context

**Code mode:**
1. Read `architecture.md`, `patterns.md`, `testing.md`
2. Read the approved spec if one exists (`projects/<project>/specs/<slug>.md`)
3. Check for `specs/CONTEXT-<slug>.md` alongside the spec. If it exists, read it — it contains resolved gray areas and discovered assets from `/pre-plan`. If it does not exist, note: "No context file found. Consider running `/pre-plan` first to surface gray areas. Proceed anyway?" Do not block.

**Document mode:**
1. Load the `writing` skill for style and formatting rules
2. Read the approved spec if one exists
3. Check for `specs/CONTEXT-<slug>.md` alongside the spec (same as code mode above). Do not block if absent.
3. Identify source material — load the `confluence` skill to fetch relevant Confluence pages; load the `jira` skill to read linked issues or epics; also check existing resource articles and external references
4. Identify cross-links needed (knowledge-graph, related resources, project dashboards)

### Step 1: Map the Change

**Code mode:**
1. Identify all files that need to change. Read each one.
2. Map dependencies — what calls what, what imports what.
3. Identify integration points — where new code meets existing code.
4. Check for tests that cover affected code.

**Document mode:**
1. Identify the document's final location (e.g., `resources/adr/`, `drafts/`, `resources/<domain>/`).
2. Identify existing content to reference or update.
3. List sources to consult (Confluence, Jira, existing resource articles, external docs).
4. Identify cross-links needed (knowledge-graph, related resources, project dashboards).

### Step 2: Order the Tasks

Before listing tasks, define the end state (goal-backward planning):
- `TRUE:` <behaviors that must hold>
- `EXIST:` <artifacts that must exist>
- `WIRED:` <integrations that must be connected>

Then create an ordered task list. Each task:

- **Has a clear deliverable** — "Create `UserService.ts` with `getPermissions` method" or "Write Background section covering X, Y, Z"
- **Specifies affected files** — exact paths
- **Describes the change** — what to add, modify, or remove
- **Is independently verifiable** — can confirm correctness before moving on

**Code mode ordering:**
1. Data model / type changes first (foundation)
2. Business logic second
3. Integration / wiring third
4. Tests alongside or immediately after each piece
5. Cleanup and documentation last

**Document mode ordering:**
1. Research and source gathering first
2. Core content sections (in logical reading order)
3. Cross-references and links
4. Front matter, tags, knowledge-graph updates last

### Step 3: Define Test/Verification Strategy

**Code mode:** For each significant change — what tests to add, what to assert, edge cases, integration verification.

**Document mode:** Verification checklist — style compliance, completeness vs spec, cross-links valid, front matter correct, knowledge-graph updated.

### Step 4: Assess Risks

Identify what could go wrong:
- Breaking changes to existing behavior (code) or contradicting existing resources (document)
- Performance implications (code) or audience mismatch (document)
- Migration requirements / rollback strategy

### Step 5: Write the Plan

Create `projects/<project>/plans/<slug>.md` using the template at `references/plan-template.md`.

### Step 6: Hard Gate

**`<HARD-GATE>`**

Present a summary:
1. Number of tasks and estimated scope
2. Task list (abbreviated — task names only)
3. Key risks
4. Test/verification strategy summary

Ask: "Does this plan look right? Should I adjust the scope, ordering, or approach?"

**Do not proceed to implementation until the user approves.**

## Plan Quality Checklist

Before presenting the plan, verify:

- [ ] Tasks are ordered by dependency — no task depends on a later task
- [ ] No circular dependencies; parallelizable tasks not serialized
- [ ] Each task names specific files — no vague "update the service layer"
- [ ] Test/verification strategy exists for non-trivial changes
- [ ] Risks are honest — not "no risks identified" for complex changes
- [ ] No task is too large — if a task would take >30 minutes of agent work, split it
- [ ] Plan accounts for existing content — does not reinvent what already exists
- [ ] Plan does not contradict style, patterns, or safety context files
- [ ] Deliverables match the spec (if one exists) — no more, no less

**Guard: run this checklist silently before presenting.** If any item fails, revise the plan. If a gap cannot be resolved (missing information, ambiguous requirement), present the plan with explicit open questions rather than guessing.

## Inline Plans

For tasks that do not warrant a spec (user gives a clear, scoped task), create the plan directly. Skip the spec phase. The plan file still goes in `projects/<project>/plans/`.

If the task is too small for even a plan file (single file, <20 lines changed), skip the plan phase entirely and go straight to implementation.

## Planning Rules

### Scope Reduction Prohibition

Never silently reduce scope. If a spec calls for X, the plan must deliver X. If X is genuinely infeasible, state the conflict explicitly and ask the user — do not substitute a simpler version.

### Goal-Backward Planning

Start from the end state. Define:
- **TRUE:** what behaviors must hold when done
- **EXIST:** what artifacts must exist
- **WIRED:** what integrations must be connected

Then work backward to derive the task list. This produces better dependency ordering than forward listing.
