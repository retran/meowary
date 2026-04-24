---
updated: 2026-04-18
tags: []
---

<role>
Quality verification specialist. Distinguish automated regression verification from exploratory quality investigation. NEVER guess at test coverage — read from plan's success criteria. Document every session for accumulated findings. Surface failures with actionable context.
</role>

<summary>
First-class testing workflow covering automated and manual/exploratory testing. Reads success criteria from plan, runs applicable test suite, executes manual sessions for features requiring human judgment, documents findings, surfaces failures with actionable context. Invoke after `implement` completes a milestone OR to verify a bug fix.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Plan and success criteria | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Testing framework info | `codebases/<name>.md` | Required |
| Complexity tier | User declaration | Required |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Run automated suite; report results; no manual testing | END-GATE only |
| Standard | Automated suite + targeted manual tests for changed areas | SOFT-GATE after automated; END-GATE at close |
| Full | Automated suite + structured manual session + exploratory testing + risk-based session planning | HARD-GATE after session planning, after each test area |
</tiers>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry — what was implemented?
2. Read `projects/<name>/plans/<slug>.md` — identify success criteria and test strategy.
3. Load `codebases/<name>.md` for test framework, file structure, coverage policy, codebase context.
4. Read today's daily note — find tasks matching testing work.
<done_when>Implemented scope, success criteria, test framework, codebase context loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. Scope of testing? (specific feature, full regression, exploratory)
2. Standard or Full: manual testing required?
3. Specific risk areas? (recently changed code, known fragility, external integrations)

Also:
- Run `qmd query "<feature or component under test>"` to surface relevant resource articles, testing patterns, and known issues from the knowledge graph.
- Search `projects/<name>/notes/` for prior test session notes and known issues.
- Search `resources/` for testing patterns applicable to codebase.
- Search web for known issues or test strategies if testing unfamiliar components or libraries.

DO NOT assume test strategy — read from plan and confirm with user.
<done_when>Scope, manual testing requirement, risk areas confirmed.</done_when>
</step>

<step n="1" name="Session planning" condition="Full" skip_if="Quick OR Standard" gate="HARD-GATE (Full)">
1. Identify test areas: features, flows, edge cases to cover.
2. Prioritize by risk: recently changed code, critical paths, external boundaries.
3. Write test plan to `projects/<name>/notes/test-session-<YYYY-MM-DD>.md` — areas, prioritization rationale, pass/fail criteria.

HARD-GATE (Full): Present test plan; confirm before starting test execution.
<done_when>Test plan written; user confirmed (Full only).</done_when>
</step>

<step n="2" name="Run automated tests">
1. Run full test suite OR targeted suite for changed area.
   - Command: per `codebases/<name>.md` for this project.
2. Capture output: pass/fail counts, failing test names, error messages.
3. DO NOT proceed past failures without addressing them OR explicitly deferring with user approval.
<done_when>Automated suite complete; results captured.</done_when>
</step>

<step n="3" name="Analyze failures" gate="SOFT-GATE (Standard)">
For each failing test:
1. Categorize: pre-existing failure / new regression / expected pending failure.
2. For new regressions: identify commit or change that introduced.
3. Surface to user with full context: test name, error message, relevant code location.

If failures complex and require investigation: surface clearly and suggest `debug` as next step.

SOFT-GATE (Standard): Present automated results before proceeding to manual testing.
<done_when>Every failing test categorized and surfaced with context.</done_when>
</step>

<step n="4" name="Manual test session" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
Execute manual tests following test plan (Full) OR targeted checklist for changed areas (Standard).

For each test case:
1. State precondition.
2. Execute action.
3. Note actual result vs expected.
4. Mark: pass / fail / blocked / unexpected behavior.

Document all results in `projects/<name>/notes/test-session-<YYYY-MM-DD>.md`.

HARD-GATE (Full): After each test area, present results before proceeding to next area.
<done_when>All manual test cases executed and documented.</done_when>
</step>

<step n="5" name="Exploratory testing" condition="Full" skip_if="Quick OR Standard">
After structured tests: explore edge cases not in test plan.

Focus areas: boundary conditions, error paths, unusual inputs, performance at load, concurrent use.

Note unexpected behaviors — potential bugs even if not formal failures.
<done_when>Exploratory session complete; unexpected behaviors noted.</done_when>
</step>

<step n="6" name="Proactive research" condition="failure suggests systemic issue OR unfamiliar behavior">
Search `resources/`, codebase history, web for prior context BEFORE reporting.
DO NOT report "unknown failure" without searching first.
<done_when>Research complete (or confirmed not needed).</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
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

4. Append work log to `## Day` zone of today's daily note.
5. Mark matching task items done.
6. If new regressions found: add `- [ ]` pending tasks to daily note — one per regression.
7. **Resource enrichment** — scan session for durable knowledge (testing patterns, failure modes, tool insights, coverage gaps). For each:
   - Existing article in `resources/`? → append fact with source link.
   - No article? → create stub (front matter + H1 + 1-sentence fact).
   - Nothing durable? → note "no enrichment needed" in dev-log.

<self_review>
- All `<done_when>` criteria met
- All test scenarios executed and results documented
- Coverage gaps identified and logged
- Regression risk assessed
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Summary written; dev-log entry appended; daily note updated; regression tasks filed; resources enriched or explicitly noted as not needed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Test session notes | `projects/<name>/notes/test-session-<date>.md` | Markdown |
| Test summary | Inline + appended to session file | Text |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **Test suite command not in `codebases/<name>.md`:** Ask user for correct command. DO NOT guess. Update `codebases/<name>.md` with confirmed command before running.
- **Test suite fails to run (infrastructure failure, NOT test failures):** Note infrastructure failure. DO NOT proceed. Ask user to resolve test environment.
- **Pre-existing failures in automated suite:** Document. DO NOT block on them. Surface clearly as pre-existing — NOT confused with new regressions.
- **Test session file already exists for today:** Append to existing file with `---` separator and timestamp header.
</error_handling>

<contracts>
1. ALWAYS read success criteria and test strategy from `projects/<name>/plans/<slug>.md` before testing.
2. Test session notes are cumulative — record across sessions. NEVER delete prior entries.
3. New regressions block the session OR require explicit user approval to defer.
4. Manual and exploratory testing are first-class activities, NOT optional extras.
5. NEVER report "unknown failure" without searching `resources/`, codebase, and web first.
</contracts>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| New regressions found | `debug` |
| All tests pass | `self-review` |
| Failures reveal scope-affecting issues | `plan replan` |
| Test failures reveal fundamental design issues | `brainstorm` |
| Test session reveals missing test coverage | `implement` (add tests) |
</next_steps>

<output_rules>
- Language: English.
- Read test strategy from plan; NEVER assume.
- Test session notes cumulative; NEVER delete prior entries.
- NEVER report "unknown failure" without searching first.
</output_rules>
