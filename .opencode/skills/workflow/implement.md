---
name: workflow/implement
description: "Execute an approved plan — write code, documents, or both."
compatibility: opencode
depends_on:
  - workflow
---

# Implement Phase

Execute an approved plan by writing code or documents, validating output, and tracking progress.

## When to Use

- After a plan is approved (normal flow)
- For small, clear tasks that skip brainstorm/plan phases
- When the user says "implement", "build", "code", "write", or "do it"

## Workflow

### Step 0: Load Context

**Code mode:**
1. Read `style.md`, `patterns.md`, `testing.md`, `safety.md`
2. Read the approved plan (`projects/<project>/plans/<slug>.md`)
3. If no plan exists, confirm the task is small enough to proceed without one
4. If the code touches security-sensitive areas (auth, credentials, prod systems), load the `security` skill

**Document mode:**
1. Load the `writing` skill (and appropriate sub-skill: `writing/adr`, `writing/meeting`, etc.)
2. Read the approved plan
3. Gather source material identified in the plan

### Step 1: Execute Tasks

For each task in the plan:

1. **Read** the target files. Understand existing code or content before changing it.
2. **Write** the changes. Follow the project's existing style exactly.
   3. **Validate** after each significant change:
      - Code mode: run tests if a test suite exists
      - Document mode: verify cross-links, front matter, style compliance
   4. **Check off** the task in the plan file (`- [x]`).
   5. **Commit** at natural boundaries if the user has asked for commits. Load the `conventions` skill for the required commit message format.

### Step 2: Self-Review

Before presenting results:

**Code mode:**
- [ ] All plan tasks completed (or explicitly deferred with reason)
- [ ] No debug artifacts left (console.log, print statements, TODO hacks)
- [ ] New code follows existing patterns — not introducing a new style
- [ ] Error handling is present at boundaries
- [ ] No unused imports, variables, or dead code added
- [ ] Tests pass (if test suite exists)

**Document mode:**
- [ ] All plan tasks completed (or explicitly deferred with reason)
- [ ] Front matter is complete — title, tags, updated date
- [ ] Style matches `writing` skill rules — no filler, active voice, tables over prose
- [ ] Cross-links are valid — all referenced files exist
- [ ] Knowledge-graph updated if this is a resource article
- [ ] Tags registered in `tags.md` if new tags introduced

### Step 3: Present Results

Summarize what was done:
1. List of files changed (with brief description of each change)
2. Tests added or modified (code mode) / cross-links updated (document mode)
3. Any deviations from the plan (and why)
4. Remaining work (if any)

### Step 4: Resource Enrichment Scan

After implementation, scan for resource gaps:
- New concepts encountered → create resource stubs
- People or teams referenced → verify resource entries exist
- Tools or processes used → check for resource articles

## Implementation Rules

### Analysis Paralysis Guard

If you have read 5+ files without writing any changes, stop. State what you have learned, what is blocking action, and propose a next step. Do not continue reading. For genuinely complex tasks that require broad context (e.g., large refactors across many files), the threshold may be higher — but you must justify it explicitly before continuing to read.

### Deferred Items

When implementation reveals out-of-scope work — bugs, improvements, refactors unrelated to the current task — do not expand scope. Append the item to `projects/<project>/deferred-items.md` (create if missing) with format: `- **YYYY-MM-DD:** <description> (discovered during implementation)`. Continue the current task.

### Match the Codebase / Journal Style

- Use the same formatting, naming conventions, and patterns as existing content.
- If the codebase uses `snake_case`, do not introduce `camelCase`.
- If the journal uses specific section headings, follow them exactly.
- When in doubt, find 3 similar examples and follow their pattern.

### Write Minimal Code / Content

- Solve the specific problem. Do not add features or sections "while you're in there."
- Do not refactor adjacent code unless it is part of the plan.
- Do not add abstractions that are not needed yet.
- Prefer clear, obvious output over clever, compact output.

### Test Discipline (Code Mode)

- Every new function gets at least one test (if a test framework exists).
- Every bug fix gets a regression test.
- Test the behavior, not the implementation.
- Do not mock the unit under test.

### Error Handling (Code Mode)

- Handle errors at the appropriate level — not everywhere.
- Provide context in error messages: what operation failed, with what input.
- Never swallow errors silently (empty catch blocks).
- Distinguish between expected errors (bad input) and unexpected errors (bugs).

### Validation is Mandatory

An unvalidated output is a draft, not a deliverable. Before presenting results:

**Code mode:**
1. Run the project's test suite (if one exists)
2. Run linters/formatters (if configured)
3. Both must pass. If either fails, fix the issue before presenting.

**Document mode:**
1. Verify all cross-links resolve to existing files
2. Verify front matter is complete and valid
3. Verify style compliance with `writing` skill rules

If no validation mechanism exists, state that explicitly — do not silently skip validation.

### Checkpointing

For large implementations (5+ tasks), checkpoint at natural boundaries. Three checkpoint types:

| Type | When | Frequency |
|------|------|-----------|
| **human-verify** | Confirm correctness of output before continuing | ~90% of checkpoints |
| **human-decision** | Choose between alternatives the agent cannot resolve | ~9% |
| **human-action** | User must do something the agent cannot (e.g., run a local GUI, approve a deployment) | ~1% |

Default: automate everything; checkpoint only what requires human judgment. If something unexpected comes up mid-implementation, pause and inform the user. If the plan needs adjustment, say so rather than silently deviating.
