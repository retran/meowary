---
name: workflow/debug
description: "Investigate bugs and errors — form hypotheses, trace execution, find root cause."
compatibility: opencode
depends_on:
  - workflow
---

# Debug Phase

Systematically investigate bugs, errors, and unexpected behavior. Find the root cause before proposing a fix.

**Note:** Debug is code-only. There is no document equivalent.

## When to Use

- User reports an error, exception, or unexpected behavior
- Test failures with unclear cause
- Performance issues or regressions
- "It used to work and now it doesn't"

## Workflow

### Step 0: Load Context

1. Read `architecture.md` and `patterns.md`
2. Understand the system's structure before diving into code

### Step 1: Gather Evidence

Collect everything available:
- **Debug log** — check `projects/<project>/debug-log.md` for prior entries matching the symptom or affected code area.
- **Error message** — exact text, not paraphrased. Copy it verbatim.
- **Stack trace** — full trace. Identify the **originating frame** (deepest frame in application code, not library code). The top of the trace is often a library; look for the first frame that's in the project's own code.
- **Reproduction steps** — what triggers it, is it consistent or intermittent?
- **Recent changes** — what changed since it last worked? (`git --no-pager log --oneline -20`)
- **Environment** — local/CI/production? OS? Node/runtime version? Config differences?

Ask the user for missing evidence. Do not guess.

### Stack Trace Anatomy

When a stack trace is provided, parse it before forming hypotheses:

1. **Error type** — what class of error is this? (null ref, type error, network timeout, assertion failure)
2. **Error message** — what does the message say literally?
3. **Originating frame** — the deepest frame in **project code** (not `node_modules`, not standard library). This is where control entered the error path.
4. **Call chain** — trace backwards from the originating frame to understand how execution reached that point.
5. **Symptom vs cause** — the error message describes the symptom. The originating frame and call chain point toward the cause.

### Step 2: Form Hypotheses

Generate at least 2 hypotheses for the root cause. For each:
- **Hypothesis** — one sentence describing the suspected cause
- **Evidence for** — what supports this hypothesis
- **Evidence against** — what contradicts it
- **How to verify** — specific action to confirm or rule out

Rank hypotheses by likelihood. Investigate the most likely first.

### Step 3: Investigate

For each hypothesis (most likely first):

1. **Read the code** at the suspected location
2. **Trace the execution** — follow the call chain from entry point to error
3. **Check assumptions** — are types correct? Is data in expected shape? Are dependencies available? Are config values what they should be?
4. **Search for patterns** — has this type of bug occurred elsewhere in the codebase? Are there related issues in git log?
5. **Check recent changes** — `git --no-pager log --oneline -20` and `git --no-pager diff HEAD~5..HEAD -- <file>` to see what changed near the error site
6. **Confirm or reject** the hypothesis with evidence

If the first hypothesis is wrong, move to the next. If all are wrong, step back and reconsider the problem.

### Step 4: Root Cause Analysis

When the root cause is found, document it:
- **What** — the specific bug (e.g., "null reference in `getUser` when session expires")
- **Why** — how it came to be (e.g., "session middleware doesn't set user on expired tokens, but `getUser` assumes it's always present")
- **Where** — exact file and line
- **When** — conditions that trigger it

### Step 5: Propose Fix

Design the fix:
- **Change** — what to modify
- **Why this fix** — why this approach over alternatives
- **Side effects** — what else might be affected
- **Test** — how to verify the fix works and doesn't break other things

### Step 6: Hard Gate

**`<HARD-GATE>`**

Present the diagnosis:
1. Root cause (1-2 sentences)
2. Evidence that confirms it
3. Proposed fix
4. Risk assessment

Ask: "Does this diagnosis make sense? Should I apply the fix?"

**Do not apply the fix until the user approves.** The investigation itself is valuable — the user may want to handle the fix differently.

## Red Flags — Hard Stops

If any of these are true, **stop and reassess** before continuing:

| Red flag | What it means |
|----------|---------------|
| Fix is larger than 10 lines | Root cause is probably wrong. Step back to Phase 2. |
| Fix requires changes in 3+ files | The bug is architectural, not local. Declare an architectural review. |
| Fix breaks another test | The original design contract was violated. Re-examine assumptions. |
| Same bug recurs after fixing | The fix addressed a symptom, not the cause. Restart from Phase 1. |
| 3+ failed fix attempts on the same bug | Architectural problem. Stop adding fixes. Restart from Phase 1 with fresh eyes. |

Three or more failed fix attempts indicate an **architectural problem**. Stop patching. Declare an architectural review and present findings to the user before trying again.

## Debug Principles

- **Evidence over intuition.** Read the code. Do not assume you know what it does.
- **Reproduce first.** If you cannot reproduce it, you cannot verify the fix.
- **One change at a time.** Do not fix multiple things simultaneously — you will not know which fix worked.
- **Check the obvious.** Typos, wrong variable names, off-by-one errors, missing imports. Check these before building complex theories.
- **Bisect when stuck.** If recent changes are suspect, use `git log` to narrow down when the bug was introduced.
- **Do not patch symptoms.** If the error is a null reference, do not just add a null check. Find out why it is null.
- **Validate the fix.** Run the full test suite. An unvalidated fix is a guess, not a solution.

## Debug Knowledge Base

After resolving a bug, append an entry to `projects/<project>/debug-log.md` (create if missing). Use the template at `.opencode/templates/debug-log.md`. One entry per bug, flat append-only format.

Before investigating a new bug, scan `debug-log.md` for prior entries matching the symptom, affected code area, or error pattern. This builds institutional memory across sessions and prevents re-investigating known issues.
