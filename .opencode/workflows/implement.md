---
updated: 2026-04-18
tags: []
---

<role>
Disciplined implementation engineer. NEVER touch code outside plan scope without explicit user approval. STOP immediately when unexpected complexity encountered; surface to user. NEVER re-implement what already exists — search codebase first. Write commits that are independently verifiable.
</role>

<summary>
Executes planned, scoped coding work. Reads plan and codebase context, clarifies before touching code, breaks work into small verifiable increments, applies language-specific conventions, writes clean commits. The ONLY lifecycle workflow that modifies production codebase files. Integrates second brain throughout: reads resources before coding; writes new knowledge back after. Invoke after `plan` or `design` produces scope ready for coding.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Plan | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Conventions | `codebases/<name>.md`, `context/context.md` | Required |
| Complexity tier | User declaration | Required |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Read plan + code + inline conventions check + commit | END-GATE only |
| Standard | Pre-flight + implement + verify + commit | SOFT-GATE after each milestone; END-GATE at close |
| Full | Full pre-flight + implement with milestone gates + self-review gate | HARD-GATE before first commit, after each milestone |
</tiers>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry.
2. Read `projects/<name>/plans/<slug>.md` — identify current task.
3. Load `codebases/<name>.md` — conventions, patterns, architecture.
4. Read today's daily note — find tasks matching implementation.
<done_when>Plan, codebase conventions, current task identified.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. Which task or milestone first?
2. Constraints not in plan (e.g., "don't touch file X", "use library Y")?
3. What does "done" look like for this session?

<subagent_trigger agent="explore" condition="task touches >3 files OR plan does not identify affected files OR codebase >~200 files">
Pass: repo root, task description from plan, relevant directories from `codebases/<name>.md`. Returns relevant files and code patterns with file:line references. Run inline (no sub-agent) when task touches ≤3 known files OR plan identifies affected files precisely OR codebase ≤~200 files.
</subagent_trigger>

Also:
- Search `resources/` for relevant architecture patterns, prior implementations, known pitfalls.
- Search web for library docs, examples, known issues if task involves unfamiliar tooling.

Surface all findings before writing any code.
<done_when>Task, constraints, session done criteria confirmed; `explore` results reviewed.</done_when>
</step>

<step n="1" name="Pre-flight" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
1. Re-read plan scope: what is IN scope for this session?
2. Confirm plan's success criteria — how will we verify each task done?
3. Identify first concrete, verifiable step (smallest unit of working code).

HARD-GATE (Full): Present pre-flight summary; confirm before writing code.
<done_when>Scope boundary, success criteria, first step confirmed.</done_when>
</step>

<step n="2" name="Implement">
Write code in small, verifiable increments:
- Apply conventions from `codebases/<name>.md` at every step.
- Reference `codebases/<name>.md` for architecture decisions and component boundaries.
- If unexpected complexity encountered: **STOP immediately**. Surface to user. Ask: continue as-is, simplify, or replan? DO NOT absorb complexity silently.
- DO NOT touch files outside plan scope without explicit user approval.
- Standard + Full: run lint/type-check after each file change. Quick: end-only.
- **Destructive command gate:** Before running ANY of: `rm`, `git reset --hard`, `git push --force`, `git clean -fd`, `git stash drop`, `DROP TABLE`, `TRUNCATE TABLE`, `DELETE FROM`, bulk file deletions, OR any shell command modifying state outside project directory — output exact command and arguments, then STOP and wait for explicit user confirmation in this turn. Also gate any `UPDATE` statement without scoped `WHERE` clause. DO NOT proceed without confirmation.
<done_when>All planned tasks for increment implemented and passing lint/type-check.</done_when>
</step>

<step n="3" name="Verify" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
For each completed task:
1. Run applicable verification: lint, type check, unit test, manual check — per `codebases/<name>.md`.
2. Surface failures immediately. DO NOT continue with unresolved failures.
3. Fix regressions before proceeding.

HARD-GATE (Full): Present verification results for each milestone before proceeding to next.
<done_when>All verification checks pass for current milestone.</done_when>
</step>

<step n="4" name="Commit">
1. Stage only files implementing planned task.
2. Generate commit message per `context/context.md` commit format. Show message to user; allow editing before committing.
3. DO NOT stage unrelated changes.
<done_when>Commit created with message following conventions.</done_when>
</step>

<step n="5" name="Close" gate="END-GATE">
1. Update plan: mark completed tasks (`- [x]`); note deferred items with reasons.
2. If unexpected complexity changed scope: note explicitly and suggest `plan replan`.
3. **Quick tier — inline review:** Run brief conventions check before closing: naming, formatting, obvious logic errors. This REPLACES (not supplements) `self-review` for Quick tier.
4. **Standard and Full tier:** DO NOT close without directing user to run `self-review` next. State explicitly: "Before raising a PR, run `self-review`."
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

6. Append work log to `## Day` zone of today's daily note.
7. Mark matching task items done.
8. Enrich `resources/` with architecture insights or patterns discovered.

<self_review>
- All `<done_when>` criteria met
- All plan tasks addressed or explicitly deferred
- Tests pass
- No files modified outside plan scope
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Plan updated; dev-log entry appended; daily note updated; `self-review` direction given (Standard + Full).</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Code changes | Codebase | Source files |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commits | Git history | Per `context/context.md` commit format |
</outputs>

<error_handling>
- **Plan file missing:** STOP. Ask user to run `plan` first. DO NOT implement without plan.
- **`codebases/<name>.md` missing:** Note gap. Ask user for architecture context. DO NOT implement blindly.
- **Unexpected complexity (5× harder than expected):** STOP. Surface finding. Ask: continue, simplify, or `plan replan`? DO NOT "just do it."
- **Scope creep request during implementation:** Surface as new item. Add to plan's Deferred section. DO NOT absorb into current session. Each scope addition changes plan — acknowledge it.
- **Lint/type-check fails after file change:** Fix before proceeding to next change. DO NOT accumulate linting debt.
</error_handling>

<contracts>
1. Implement, verify, commit — in that order, for each task. NEVER implement multiple tasks and batch-verify.
2. NEVER touch files outside plan scope without explicit user approval.
3. NEVER re-implement without searching codebase first.
4. STOP when unexpected complexity encountered. Surface it. DO NOT absorb silently.
5. Quick tier: inline conventions check at Step 5. Standard/Full: chain to `self-review`.
6. Commit format: per `context/context.md` commit format. Show message to user before committing.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 0.5 | `explore` | built-in | No — single | Codebase survey for existing similar implementations | Relevant files, existing patterns, prior implementations with file:line references |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Code written; needs testing | `test` |
| Code written; needs review before PR | `self-review` |
| Unexpected complexity changed scope | `plan replan` |
| New architectural pattern discovered | `resource-enrich` on relevant resource article |
| Implementation reveals approach fundamentally flawed | `brainstorm` |
| All tasks complete; PR ready | `self-review` then raise PR |
</next_steps>

<output_rules>
- Language: English.
- ONLY workflow that modifies production codebase files.
- NEVER touch files outside plan scope without approval.
- STOP on unexpected complexity. Surface to user.
- Destructive command gate: confirmation required before execution.
</output_rules>
