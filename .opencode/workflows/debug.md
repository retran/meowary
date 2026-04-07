---
updated: 2026-04-07
tags: []
---

# Debug

> Structured failure investigation. Forms hypotheses, designs tests, observes results, updates the theory. Captures investigation steps in a debug note, identifies root cause, applies a minimum fix, adds a regression test. Distinguishes local bugs from systemic issues requiring a replan. Invoke when something is broken and the cause is unclear.

## Role

Acts as a disciplined failure analyst. Does not guess or jump to fixes — states a hypothesis first, tests it, commits the result. Distinguishes between local bugs (fixable here) and systemic issues (requiring a replan). The debug note is the primary artifact; the fix is secondary.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Failure description | User invocation | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Complexity tier | User declaration | Required |
| Prior debug notes | `projects/<name>/notes/` | Optional |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Observe + first hypothesis + fix if found | End gate only |
| **Standard** | Observe + hypothesis tree + systematic investigation + fix | Mid-gate after initial hypotheses + end gate |
| **Full** | Full scientific debug protocol + root cause analysis + postmortem seed | HARD-GATE: confirm root cause before fixing |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry — what is the current state?
2. Check `projects/<name>/notes/` for prior debug sessions on related issues.
3. Load `codebases/<name>.md` for relevant architecture context.
4. Read today's daily note — find any tasks matching this debug work.

Done when: project state loaded; prior related debug sessions identified.

### Step 0.5 — Clarify

Ask the user:
1. What is the observed failure? (error message, unexpected behavior, reproduction steps)
2. When did this start? What changed recently?
3. Is this a regression (was working before) or a first-time failure?

Also:
- Search `resources/` for known issues, prior debug sessions, and relevant architecture context.
- Search the web for the error message or symptom — do this before investigating internally.
- Search `projects/<name>/notes/` for prior debug sessions with similar symptoms.

Do not start investigating without understanding the failure clearly.

Done when: failure description, timeline, and regression status confirmed.

### Step 1 — Reproduce

1. Reproduce the failure in a controlled way.
2. Identify: is the failure consistent? Intermittent? Environment-specific?
3. Write the minimal reproduction case.
4. If the failure cannot be reproduced: that is itself a finding — document it and proceed.

Done when: reproduction case documented (or non-reproduction documented as a finding).

### Step 2 — Form hypotheses

1. List 2–5 candidate root causes based on symptoms and recent changes.
2. For each hypothesis: state what observable evidence would confirm or refute it.
3. Order by likelihood and testability — cheapest-to-test hypothesis first.

Do not test anything without first stating a hypothesis.

**Mid-gate (Standard):** Present hypotheses to user before investigating. Confirm the list is reasonable before proceeding.

Done when: ordered hypothesis list written; user confirmed (Standard+).

### Step 3 — Investigate

For each hypothesis in order:
1. Design a minimal test: what change or observation would prove or disprove it?
2. Execute the test.
3. Record the result.
4. Update the hypothesis list: confirm, refute, or refine.

Stop investigating when one hypothesis is confirmed. Do not continue after finding the root cause.

**Sub-agent trigger:** If the error origin is unknown and investigation requires scanning logs or code across multiple files, offload to an `explore` agent. Pass: repo root path, error message and reproduction description, known affected components from `codebases/<name>.md`. The agent returns: relevant log patterns, code paths matching the error signature, and file:line references. Run inline when the error origin is already known, or the investigation is a targeted grep in a single file.

Done when: one hypothesis confirmed as root cause.

### Step 4 — Proactive research (Standard + Full)

Once a hypothesis is leading:
1. Search the web for the identified pattern, library issue, or component behavior.
2. Check for known upstream bugs, documented limitations, or version-specific issues.
3. Check `resources/` and `projects/<name>/design/` for architecture context that may explain the behavior.

Skip for Quick tier.

Done when: relevant external context surfaced or confirmed absent.

### Step 5 — Root cause analysis (Standard + Full)

State the root cause explicitly:
- What is wrong and why it is wrong.
- Why the symptom manifests as observed.
- Classification: **local bug** (fixable in this file/function) vs. **systemic issue** (requires design change or replan).

**HARD-GATE (Full):** Present root cause analysis to the user. Confirm before implementing any fix.

Skip formal analysis for Quick tier — state the cause inline and proceed to fix.

Done when: root cause stated; classification made; user confirmed (Full).

### Step 6 — Fix

1. Implement the minimum fix that addresses the root cause.
2. Fix causes, not symptoms. Do not refactor while fixing. (Refactoring conflates two changes and makes it impossible to isolate whether the fix or the refactor caused a subsequent issue.)
3.    Apply conventions from `codebases/<name>.md`.
4. Verify the fix: confirm the original failure no longer reproduces.
5. Add a regression test if one does not already exist. (Only skip with explicit user approval.)

Done when: fix applied; original failure no longer reproduces; regression test added or explicitly deferred.

### Step 7 — Close

1. Write debug findings to `projects/<name>/notes/debug-<YYYY-MM-DD>-<topic>.md` using `.opencode/skills/projects/debug-log.md` as the base. Required sections: Observed Failure, Recent Changes, Hypotheses table, Investigation Log, Root Cause, Fix Applied, Regression Test Added.

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
4. Mark matching task items as done.
5. If root cause is a systemic issue: suggest `plan replan` in closing summary.
6. If root cause represents reusable knowledge (pattern, anti-pattern, known library issue): enrich the relevant `resources/` article.
7. Commit: `Fix: <description of root cause>`.

Done when: debug note written; dev-log entry appended; daily note updated; committed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Debug note | `projects/<name>/notes/debug-<date>-<topic>.md` | Markdown |
| Code fix | Codebase | Source files |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | `Fix: <description>` |

## Error Handling

- **Failure cannot be reproduced:** Document as a finding; proceed with hypotheses based on the description. Do not abandon the session.
- **Root cause is systemic:** Do not attempt a local fix. State the root cause, suggest `plan replan`, and close with a dev-log entry only.
- **`debug-log.md` template missing:** Create the note manually using the Debug Note Format from the spec. Note the missing template.
- **No codebase context (`codebases/<name>.md` missing):** Note the gap; ask the user for the relevant architecture context before proceeding.
- **Regression test skipped:** Require explicit user approval and record the deferral in the debug note.

## Contracts

1. Never implement a fix without a confirmed hypothesis. Guessing is forbidden.
2. Debug note is mandatory for all tiers. Quick sessions still write a note.
3. Fix causes, not symptoms. Never refactor during a debug session.
4. Regression test required. Only skippable with explicit user approval.
5. Commit format: `Fix: <description of root cause>`.
6. Systemic issues get a replan suggestion, not a local fix.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 3 — Investigate | `explore` | built-in | No | Error origin unknown; log/code scanning across multiple files needed | Relevant log entries, code paths, call stacks with file:line references |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Fix applied; needs verification | `test` |
| Root cause is systemic; scope change needed | `plan replan` |
| Root cause reveals a design flaw | `design` |
| Root cause is a recurring pattern worth documenting | `resource-enrich` on relevant resource article |
