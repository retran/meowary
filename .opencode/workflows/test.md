---
updated: 2026-04-07
tags: []
---

# Test

> First-class testing workflow covering automated and manual/exploratory testing. Reads success criteria from the plan, runs the applicable test suite, executes manual test sessions for features requiring human judgment, documents findings, and surfaces failures with actionable context. Invoke after `implement` completes a milestone, or to verify a bug fix.

## Role

Acts as a quality verification specialist. Distinguishes automated regression verification from exploratory quality investigation. Does not guess at test coverage — reads it from the plan's success criteria. Documents every session so findings accumulate across sessions. Surfaces failures with enough context to drive immediate action.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Plan and success criteria | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Testing framework info | `codebases/<name>.md` | Required |
| Complexity tier | User declaration | Required |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Run automated suite; report results; no manual testing | End gate only |
| **Standard** | Automated suite + targeted manual tests for changed areas | Mid-gate after automated + end gate |
| **Full** | Automated suite + structured manual session + exploratory testing + risk-based session planning | HARD-GATE after session planning; HARD-GATE after each test area |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry — what was implemented?
2. Read `projects/<name>/plans/<slug>.md` — identify success criteria and test strategy.
3. Load `codebases/<name>.md` for test framework, file structure, coverage policy, and codebase context.
4. Read today's daily note — find any tasks matching this testing work.

Done when: implemented scope, success criteria, test framework, and codebase context loaded.

### Step 0.5 — Clarify

Ask the user:
1. What is the scope of testing? (specific feature, full regression, exploratory)
2. Standard or Full: is manual testing required?
3. Are there specific risk areas? (recently changed code, known fragility, external integrations)

Also:
- Search `projects/<name>/notes/` for prior test session notes and known issues.
- Search `resources/` for testing patterns applicable to this codebase.

Do not assume the test strategy — read it from the plan and confirm with the user.

Done when: scope, manual testing requirement, and risk areas confirmed.

### Step 1 — Session planning (Full only)

1. Identify test areas: which features, flows, and edge cases to cover.
2. Prioritise by risk: recently changed code, critical paths, external boundaries.
3. Write test plan to `projects/<name>/notes/test-session-<YYYY-MM-DD>.md` — include test areas, prioritisation rationale, and pass/fail criteria.

**HARD-GATE (Full):** Present test plan to user; confirm before starting test execution.

Skip for Quick and Standard tiers.

Done when: test plan written; user confirmed (Full only).

### Step 2 — Run automated tests

1. Run the full test suite or targeted suite for the changed area.
   - Command: per `codebases/<name>.md` for this project.
2. Capture output: pass/fail counts, failing test names, error messages.
3. Do not proceed past failures without either addressing them or explicitly deferring with user approval.

Done when: automated suite complete; results captured.

### Step 3 — Analyse failures

For each failing test:
1. Categorise: pre-existing failure / new regression / expected pending failure.
2. For new regressions: identify the commit or change that introduced it.
3. Surface to the user with full context: test name, error message, relevant code location.

If failures are complex and require investigation: surface this clearly and suggest `debug` as next step.

Done when: every failing test categorised and surfaced with context.

**Mid-gate (Standard):** Present automated results to user before proceeding to manual testing.

### Step 4 — Manual test session (Standard + Full)

Execute manual tests following the test plan (Full) or a targeted checklist for changed areas (Standard).

For each test case:
1. State the precondition.
2. Execute the action.
3. Note the actual result vs. expected.
4. Mark: pass / fail / blocked / unexpected behavior.

Document all results in `projects/<name>/notes/test-session-<YYYY-MM-DD>.md`.

**HARD-GATE (Full):** After each test area, present results to user before proceeding to the next area.

Skip for Quick tier.

Done when: all manual test cases executed and documented.

### Step 5 — Exploratory testing (Full only)

After structured tests: explore edge cases not in the test plan.

Focus areas: boundary conditions, error paths, unusual inputs, performance at load, concurrent use.

Note any unexpected behaviors — these are potential bugs even if they do not count as formal failures.

Skip for Quick and Standard tiers.

Done when: exploratory session complete; unexpected behaviors noted.

### Step 6 — Proactive research (if needed)

If a test failure suggests a systemic issue or unfamiliar behavior:
- Search `resources/`, codebase history, and the web for prior context before reporting.
- Do not report "unknown failure" without searching first.

Done when: research complete (or confirmed not needed).

### Step 7 — Close

1. Produce test summary: total tests run, pass/fail/blocked, new regressions, open issues.
2. Write summary to `projects/<name>/notes/test-session-<YYYY-MM-DD>.md`.
3. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — test — <feature or scope>
**Phase:** test
**Duration:** <estimate>
**Summary:** <what was tested; overall result>
**Automated:** <N tests; N failures>
**Manual:** <N test cases; N failures; N unexpected behaviors>
**New regressions:** <list or "none">
**Next:** debug (if failures) | self-review (if clean) | plan replan (if scope-affecting failures)
```

4. Append work log entry to `## Day` zone of today's daily note.
5. Mark matching task items as done.
6. If new regressions found: add `- [ ]` pending tasks to daily note — one per regression.

Done when: summary written; dev-log entry appended; daily note updated; regression tasks filed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Test session notes | `projects/<name>/notes/test-session-<date>.md` | Markdown |
| Test summary | Inline + appended to session file | Text |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **Test suite command not in `codebases/<name>.md`:** Ask the user for the correct command. Do not guess. Update `codebases/<name>.md` with the confirmed command before running.
- **Test suite fails to run (not test failures — infrastructure failure):** Note the infrastructure failure; do not proceed. Ask the user to resolve the test environment.
- **Pre-existing failures in the automated suite:** Document them; do not block on them. Surface clearly as pre-existing so they are not confused with new regressions.
- **Test session file already exists for today:** Append to the existing file with a `---` separator and a timestamp header.

## Contracts

1. Always read success criteria and test strategy from `projects/<name>/plans/<slug>.md` before testing.
2. Test session notes are cumulative — they form a record across sessions. Never delete prior entries.
3. New regressions block the session or require explicit user approval to defer.
4. Manual and exploratory testing are first-class activities, not optional extras.
5. Never report "unknown failure" without searching `resources/`, codebase, and the web first.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| New regressions found | `debug` |
| All tests pass | `self-review` |
| Failures reveal scope-affecting issues | `plan replan` |
| Test session reveals missing test coverage | `implement` (add tests) |
