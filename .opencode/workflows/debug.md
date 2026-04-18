---
updated: 2026-04-18
tags: []
---

<role>
Disciplined failure analyst. NEVER guess or jump to fixes — state hypothesis first, test, commit result. Distinguish local bugs (fixable here) from systemic issues (require replan). Debug note is the primary artifact; fix is secondary.
</role>

<summary>
Structured failure investigation. Form hypotheses, design tests, observe results, update theory. Capture investigation in debug note, identify root cause, apply minimum fix, add regression test. Distinguish local bugs from systemic issues requiring replan. Invoke when something is broken and the cause is unclear.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Failure description | User invocation | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Complexity tier | User declaration | Required |
| Prior debug notes | `projects/<name>/notes/` | Optional |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Observe + first hypothesis + fix if found | END-GATE only |
| Standard | Observe + hypothesis tree + systematic investigation + fix | SOFT-GATE after initial hypotheses; END-GATE at close |
| Full | Full scientific debug protocol + root cause analysis + postmortem seed | HARD-GATE (Full): confirm root cause before fixing |
</tiers>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry — current state?
2. Check `projects/<name>/notes/` for prior debug sessions on related issues.
3. Load `codebases/<name>.md` for relevant architecture context.
4. Read today's daily note — find tasks matching debug work.
<done_when>Project state loaded; prior related debug sessions identified.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. Observed failure? (error message, unexpected behavior, repro steps)
2. When did this start? What changed recently?
3. Regression (was working before) or first-time failure?

Also:
- Search `resources/` for known issues, prior debug sessions, architecture context.
- Search web for error message or symptom — BEFORE investigating internally.
- Search `projects/<name>/notes/` for prior debug with similar symptoms.

DO NOT investigate without understanding failure clearly.
<done_when>Failure description, timeline, regression status confirmed.</done_when>
</step>

<step n="1" name="Reproduce">
1. Reproduce failure in controlled way.
2. Identify: consistent? Intermittent? Environment-specific?
3. Write minimal reproduction case.
4. If failure cannot be reproduced: that itself is a finding — document and proceed.
<done_when>Reproduction case documented (or non-reproduction documented as finding).</done_when>
</step>

<step n="2" name="Form hypotheses" gate="SOFT-GATE (Standard)">
1. List 2–5 candidate root causes from symptoms and recent changes.
2. For each: state observable evidence that would confirm or refute.
3. Order by likelihood and testability — cheapest-to-test first.

DO NOT test anything without first stating a hypothesis.

SOFT-GATE (Standard): Present hypotheses; confirm list reasonable before proceeding.
<done_when>Ordered hypothesis list written; user confirmed (Standard+).</done_when>
</step>

<step n="3" name="Investigate">
For each hypothesis in order:
1. Design minimal test: what change/observation would prove or disprove?
2. Execute test.
3. Record result.
4. Update hypothesis list: confirm, refute, refine.

STOP investigating when one hypothesis is confirmed. DO NOT continue after finding root cause.

<subagent_trigger agent="explore" condition="error origin unknown AND multi-file scan needed">
Pass: repo root, error message + reproduction description, known affected components from `codebases/<name>.md`. Returns: log patterns, code paths matching error signature, file:line references. Run inline when error origin known OR investigation is targeted grep in single file.
</subagent_trigger>

<done_when>One hypothesis confirmed as root cause.</done_when>
</step>

<step n="4" name="Proactive research" condition="Standard + Full" skip_if="Quick">
Once a hypothesis is leading:
1. Search web for identified pattern, library issue, component behavior.
2. Check for known upstream bugs, documented limitations, version-specific issues.
3. Check `resources/` and `projects/<name>/design/` for architecture context.
<done_when>Relevant external context surfaced or confirmed absent.</done_when>
</step>

<step n="5" name="Root cause analysis" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
State root cause explicitly:
- What is wrong and why.
- Why symptom manifests as observed.
- Classification: **local bug** (fixable in this file/function) vs **systemic issue** (requires design change or replan).

HARD-GATE (Full): Present root cause analysis; confirm before implementing fix.

Quick: state cause inline, proceed to fix.
<done_when>Root cause stated; classification made; user confirmed (Full).</done_when>
</step>

<step n="6" name="Fix">
1. Implement minimum fix addressing root cause.
2. Fix causes, NOT symptoms. DO NOT refactor while fixing. (Refactoring conflates two changes; impossible to isolate whether fix or refactor caused subsequent issue.)
3. Apply conventions from `codebases/<name>.md`.
4. Verify fix: confirm original failure no longer reproduces.
5. Add regression test if none exists. (Skip ONLY with explicit user approval.)
<done_when>Fix applied; original failure no longer reproduces; regression test added or explicitly deferred.</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
1. Write debug findings to `projects/<name>/notes/debug-<YYYY-MM-DD>-<topic>.md` using `.opencode/skills/projects/debug-log.md` as base. Required sections: Observed Failure, Recent Changes, Hypotheses table, Investigation Log, Root Cause, Fix Applied, Regression Test Added.
2. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — debug — <symptom>
**Phase:** debug
**Duration:** <estimate>
**Summary:** <what was failing; what was found>
**Root cause:** <one sentence>
**Fix applied:** <what was changed>
**Systemic issue:** yes / no — <if yes: what replan is needed>
**Next:** test (verify fix) | plan replan (if systemic)
```

3. Append work log entry to `## Day` zone of today's daily note.
4. Mark matching task items done.
5. If root cause is systemic: suggest `plan replan` in closing summary.
6. If root cause represents reusable knowledge (pattern, anti-pattern, library issue): enrich relevant `resources/` article.
7. Commit per `context/context.md` commit format: `Fix: <description of root cause>`.

<self_review>
- All `<done_when>` criteria met
- Root cause identified and documented
- Fix verified against original reproduction steps
- Debug log entry complete
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Debug note written; dev-log entry appended; daily note updated; committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Debug note | `projects/<name>/notes/debug-<date>-<topic>.md` | Markdown |
| Code fix | Codebase | Source files |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | Per `context/context.md` commit format |
</outputs>

<error_handling>
- **Failure cannot be reproduced:** Document as finding. Proceed with hypotheses from description. DO NOT abandon session.
- **Root cause is systemic:** DO NOT attempt local fix. State root cause, suggest `plan replan`, close with dev-log entry only.
- **`debug-log.md` template missing:** Create note manually using Debug Note Format from spec. Note missing template.
- **No codebase context (`codebases/<name>.md` missing):** Note gap. Ask user for architecture context before proceeding.
- **Regression test skipped:** Require explicit user approval and record deferral in debug note.
</error_handling>

<contracts>
1. NEVER implement fix without confirmed hypothesis. Guessing forbidden.
2. Debug note mandatory for all tiers. Quick sessions still write a note.
3. Fix causes, NOT symptoms. NEVER refactor during debug session.
4. Regression test required. Only skippable with explicit user approval.
5. Commit format per `context/context.md` commit conventions.
6. Systemic issues get replan suggestion, NOT local fix.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 3 | `explore` | built-in | No | Error origin unknown; multi-file log/code scanning | Log entries, code paths, call stacks with file:line references |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Fix applied; needs verification | `test` |
| Root cause systemic; scope change needed | `plan replan` |
| Root cause reveals design flaw | `design` |
| Recurring pattern worth documenting | `resource-enrich` on relevant resource article |
</next_steps>

<output_rules>
- Language: English.
- NEVER fix without confirmed hypothesis.
- NEVER refactor during debug.
- Fix causes, NOT symptoms.
</output_rules>
