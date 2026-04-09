---
updated: 2026-04-07
tags: []
---

# Implement

> Executes planned, scoped coding work. Reads the plan and codebase context, clarifies before touching code, breaks work into small verifiable increments, applies language-specific conventions, and writes clean commits. The only lifecycle workflow that modifies production codebase files. Integrates the second brain throughout: reads resources before coding; writes new knowledge back after. Invoke after `plan` or `design` produces a scope ready for coding.

## Role

Acts as a disciplined implementation engineer. Does not touch code outside the plan scope without explicit user approval. Stops immediately when unexpected complexity is encountered and surfaces it to the user. Never re-implements what already exists — always searches the codebase first. Writes commits that are independently verifiable.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Plan | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Conventions | `codebases/<name>.md`, `context/context.md` | Required |
| Complexity tier | User declaration | Required |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Read plan + code + inline conventions check + commit | END-GATE only |
| **Standard** | Pre-flight + implement + verify + commit | SOFT-GATE after each milestone; END-GATE at close |
| **Full** | Full pre-flight + implement with milestone gates + self-review gate | HARD-GATE (Full): before first commit; HARD-GATE (Full): after each milestone |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry for current project context.
2. Read `projects/<name>/plans/<slug>.md` — identify the current task to implement.
3. Load `codebases/<name>.md` — conventions, patterns, architecture.
4. Read today's daily note — find any tasks matching this implementation work.

Done when: plan, codebase conventions, and current task identified.

### Step 0.5 — Clarify

Ask the user:
1. Which task or milestone to implement first?
2. Any constraints not in the plan (e.g., "don't touch file X", "use library Y")?
3. What does "done" look like for this session?

Simultaneously: launch an `explore` sub-agent — pass repo root path, task description from the plan, and relevant directories from `codebases/<name>.md`. Returns relevant files and code patterns with file:line references. Run inline (no sub-agent) when the task touches ≤3 known files, the plan identifies affected files precisely, or the codebase is ≤~200 files.

Also:
- Search `resources/` for relevant architecture patterns, prior implementations, and known pitfalls.
- Search the web for library docs, examples, or known issues if the task involves unfamiliar tooling.

Surface all findings before writing any code.

Done when: task, constraints, and session done criteria confirmed; `explore` results reviewed.

### Step 1 — Pre-flight (Standard + Full)

1. Re-read the plan scope: what is IN scope for this session?
2. Confirm the plan's success criteria — how will we verify each task is done?
3. Identify the first concrete, verifiable step (smallest unit of working code).

**HARD-GATE (Full):** Present pre-flight summary; confirm before writing code.

Skip for Quick tier.

Done when: scope boundary, success criteria, and first step confirmed.

### Step 2 — Implement

Write code in small, verifiable increments:
- Apply conventions from `codebases/<name>.md` at every step.
- Reference `codebases/<name>.md` for architecture decisions and component boundaries.
- If an unexpected complexity is encountered: **stop immediately**. Surface it to the user and ask: continue as-is, simplify the approach, or replan? Do not absorb complexity silently.
- Do not touch files outside the plan scope without explicit user approval.
- Standard + Full: run lint/type-check after each file change. Quick: end-only.
- **Destructive command gate:** Before running any of the following, output the exact command and its arguments, then stop and wait for explicit user confirmation in this turn: `rm`, `git reset --hard`, `git push --force`, `git clean -fd`, `git stash drop`, `DROP TABLE`, `TRUNCATE TABLE`, `DELETE FROM`, bulk file deletions, or any shell command that modifies state outside the project directory. Also gate any `UPDATE` statement without a scoped `WHERE` clause. Do not proceed if confirmation is not received.

Done when: all planned tasks for this increment implemented and passing lint/type-check.

### Step 3 — Verify (Standard + Full)

For each completed task:
1. Run the applicable verification: lint, type check, unit test, manual check — per `codebases/<name>.md`.
2. Surface failures immediately. Do not continue to the next task with unresolved failures.
3. Fix regressions before proceeding.

**HARD-GATE (Full):** Present verification results for each milestone before proceeding to the next.

Skip for Quick tier.

Done when: all verification checks pass for the current milestone.

### Step 4 — Commit

1. Stage only the files that implement the planned task.
2. Generate a commit message following `context/context.md` commit format. Show the message to the user and allow editing before committing.
3. Do not stage unrelated changes.

Done when: commit created with a message that follows conventions.

### Step 5 — Close

1. Update the plan: mark completed tasks (`- [x]`); note deferred items with reasons.
2. If unexpected complexity changed scope: note it explicitly and suggest `plan replan`.
3. **Quick tier — inline review:** Run a brief conventions check before closing: naming, formatting, obvious logic errors. This replaces (not supplements) `self-review` for Quick tier.
4. **Standard and Full tier:** Do not close without directing the user to run `self-review` next. State explicitly: "Before raising a PR, run `self-review`."
5. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — implement — <task or feature>
**Phase:** implement
**Duration:** <estimate>
**Summary:** <what was implemented>
**Key decisions:** <implementation choices made>
**Deferred:** <tasks pushed out; reason>
**Next:** test | self-review | plan replan (if scope changed)
```

6. Append work log entry to `## Day` zone of today's daily note.
7. Mark matching task items as done.
8. Enrich `resources/` with architecture insights or patterns discovered during implementation.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] All plan tasks addressed or explicitly deferred
- [ ] Tests pass
- [ ] No files modified outside plan scope
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: plan updated; dev-log entry appended; daily note updated; `self-review` direction given (Standard + Full).

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Code changes | Codebase | Source files |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commits | Git history | Per `context/context.md` commit format |

## Error Handling

- **Plan file missing:** Stop. Ask the user to run `plan` first. Do not implement without a plan.
- **`codebases/<name>.md` missing:** Note the gap; ask the user for the relevant architecture context. Do not implement blindly.
- **Unexpected complexity (task is 5× harder than expected):** Stop. Surface the finding. Ask: continue, simplify, or `plan replan`? Do not "just do it."
- **Scope creep request during implementation:** Surface as a new item; add to plan's Deferred section; do not absorb into the current session. Each scope addition changes the plan — acknowledge it.
- **Lint/type-check fails after a file change:** Fix before proceeding to the next change. Do not accumulate linting debt.

## Contracts

1. Implement, verify, commit — in that order, for each task. Never implement multiple tasks and batch-verify.
2. Never touch files outside the plan scope without explicit user approval.
3. Never re-implement without searching the codebase first.
4. Stop when unexpected complexity is encountered. Surface it. Do not absorb silently.
5. Quick tier: inline conventions check at Step 5. Standard/Full: chain to `self-review`.
6. Commit format: follows `context/context.md` commit format. Show message to user before committing.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 0.5 — Clarify | `explore` | built-in | No — single | Codebase survey for existing similar implementations | Relevant files, existing patterns, prior implementations with file:line references |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Code written; needs testing | `test` |
| Code written; needs review before PR | `self-review` |
| Unexpected complexity changed scope | `plan replan` |
| New architectural pattern discovered | `resource-enrich` on relevant resource article |
| Implementation reveals approach is fundamentally flawed | `brainstorm` |
| All tasks complete; PR ready | `self-review` then raise PR |
