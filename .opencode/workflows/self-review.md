---
updated: 2026-04-07
tags: []
---

# Self-Review

> Structured pre-PR code review. Reads the plan's success criteria, applies codebase style and patterns conventions, checks for common anti-patterns, and produces a structured review report with severity-classified findings. Catches issues the author missed — not a rubber-stamp, but an honest check against the same standards an external reviewer would apply. Invoke after `implement` (Standard or Full tier) before raising a PR.

## Role

Acts as a rigorous internal code reviewer. Reads changed files in full, not just diffs — context matters. Classifies findings honestly by severity: Blocker = "I would reject this PR." Nit = "cosmetic, no correctness impact." Does not downgrade findings to avoid extra work. Surfaces all findings before any are addressed (Full tier) so the complete picture is visible.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Changed files or diff | Codebase | Required |
| Plan and success criteria | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Codebase conventions | `codebases/<name>.md`, `context/safety.md` | Required |
| Complexity tier | User declaration | Required |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Conventions check + obvious issues; no deep logic review | END-GATE only |
| **Standard** | Conventions + logic correctness + edge cases + test coverage | END-GATE |
| **Full** | All Standard + security/performance analysis + simulated PR review comments | HARD-GATE (Full): present all findings before any are addressed |

> Quick-tier `implement` sessions include a lightweight inline conventions check at Step 5 (Close) and do not require invoking `self-review` separately. Invoke `self-review` for Standard and Full tier sessions, or any change that touches a public API, auth, data persistence, or shared infrastructure.

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry — what was implemented in this session?
2. Read `projects/<name>/plans/<slug>.md` — what are the success criteria?
3. Load `codebases/<name>.md` and `context/safety.md`.
4. Read today's daily note — find any tasks matching this review.

Done when: implementation scope, success criteria, and all convention files loaded.

### Step 0.5 — Clarify

Ask the user:
1. What changed? (if not clear from dev-log; ask for a diff summary or PR description)
2. Any areas of concern or complexity to focus on?
3. Complexity tier: Quick / Standard / Full?

Also:
- Run `git diff` or read the changed files to understand the scope.
- Search `resources/` and `codebases/<name>.md` for the patterns that should apply.
- Search the web for known anti-patterns in the approach if applicable.

Done when: scope of changes, focus areas, and tier confirmed.

### Step 1 — Read the diff

1. Read every changed file in full — not just the diff. Context matters; a change that looks correct in isolation may be wrong given surrounding code.
2. Map changes to plan tasks: which task does each change implement?

Done when: all changed files read in full; changes mapped to plan tasks.

### Step 2 — Conventions check

Apply systematically:
- Coding conventions from `codebases/<name>.md`: naming, formatting, imports, file structure, language idioms, project-specific patterns.

List every convention violation, no matter how small. Severity: Minor or Nit.

Done when: all conventions checked; violations listed.

### Step 3 — Logic and correctness (Standard + Full)

For each changed function or module:
1. Does it do what the plan says it should?
2. Are edge cases handled? (null inputs, empty collections, boundary values, error paths)
3. Are error paths tested and handled gracefully?
4. Are there race conditions, off-by-one errors, or logic inversions?

Done when: all changed modules reviewed for correctness; findings categorized.

### Step 4 — Test coverage (Standard + Full)

1. Are new code paths covered by tests?
2. Are existing tests still valid given the changes?
3. Are test assertions meaningful — not just "it ran without error"?

Skip for Quick tier.

Done when: test coverage assessed; gaps identified.

### Step 5 — Security and performance (Full)

1. Are there injection vulnerabilities, auth bypasses, or exposed secrets?
2. Are there obvious performance regressions: N+1 queries, unnecessary re-renders, unbounded loops?
3. Reference `context/safety.md` for non-negotiable security rules — these are Blockers.

Skip for Quick and Standard tiers.

Done when: security and performance analysis complete; `context/safety.md` rules verified.

### Step 6 — Proactive research (if needed)

If a pattern or approach seems suspicious but isn't in `codebases/<name>.md` or `resources/`:
- Search the web. Form a position before the report.
- If a dependency is new or updated: check for known issues, deprecations, or breaking changes.

Do not defer "I'm not sure about this" to the PR reviewer. Investigate and form a position.

Done when: all suspicious patterns investigated; findings added to the report.

### Step 7 — Produce review report

Structure findings in two independent sections:

**7a. Plan compliance review:**
- Does the implementation match the plan's requirements?
- Are all plan tasks completed?
- Are success criteria met?
- Missing implementation = Blocker.

**Fallback:** If no plan exists (ad-hoc changes, no spec/plan), skip plan compliance. Note in the report: "No plan found — reviewing code quality only."

**7b. Code quality review:**

Structure findings by severity:

| Severity | Definition |
|----------|-----------|
| **Blocker** | "I would reject this PR." Must be fixed before merge. |
| **Major** | Significant issue; should be fixed before PR review. |
| **Minor** | Clear improvement; fix if straightforward. |
| **Nit** | Cosmetic; no correctness impact. |

For each finding: file and line reference, issue description, suggested fix or recommendation.

Both sections run regardless — they are independent concerns. Plan compliance surfaces *what's missing*. Code quality surfaces *what's wrong with what exists*. Report both sections in the review output.

**Sub-agent trigger (Full):** Offload review report generation to the `code-reviewer` custom agent. Pass: the diff or list of changed files with contents, plan file (if available), plan success criteria, and the loaded `codebases/<name>.md`, `context/safety.md`. The agent returns a structured review report with both sections (plan compliance + code quality), findings categorized by severity, with file:line references and suggested fixes. Agent file: `.opencode/agents/code-reviewer.md`.

Run inline for Quick and Standard tiers.

**HARD-GATE (Full):** Present all findings to the user before any are addressed. Let the user decide priority. Addressing the first finding often changes the severity of subsequent findings — the complete picture must be visible first.

Done when: all findings categorized and presented; user has reviewed the complete report.

### Step 8 — Close

1. After user addresses Blockers and Majors: write summary of what was fixed.
2. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — self-review — <feature or PR description>
**Phase:** self-review
**Duration:** <estimate>
**Summary:** <what was reviewed; overall assessment>
**Findings:** <N blockers, N majors, N minors, N nits>
**Resolved:** <which findings were fixed>
**Deferred:** <findings deferred to PR review>
**Next:** raise PR | implement (fix blockers first)
```

3. Append work log entry to `## Day` zone of today's daily note.
4. Mark matching task items as done.
5. **Learnings:** After the dev-log entry, actively reflect:

   > "Did this review surface any pattern or anti-pattern not already documented in `resources/` or `codebases/<name>.md`?"

   If yes, output:

   ```markdown
   **Learnings:**
   - <pattern or anti-pattern discovered>
   - <convention that should be documented>
   ```

   Then:
   1. Check if a relevant resource article exists in `resources/`.
   2. If yes, add the learning as a fact.
   3. If no, note it as a candidate for future resource creation.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] All findings categorized by severity
- [ ] Plan compliance section completed (or noted as planless)
- [ ] Learnings section addressed (new patterns documented or "none identified")
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: summary written; dev-log entry appended; daily note updated; learnings addressed.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Review report (Quick + Standard) | In-session only | Structured text |
| Review report (Full) | `projects/<name>/notes/review-<date>.md` | Markdown |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **No diff available:** Ask the user to list the changed files. Read them in full before proceeding.
- **`codebases/<name>.md` missing:** Note the gap; ask the user for the relevant conventions. Do not skip the conventions check.
- **Finding severity unclear:** Escalate, do not downgrade. If uncertain whether a finding is a Blocker or Major, classify it as Blocker and explain the reasoning.
- **User wants to skip Blockers:** Confirm explicitly. Raising a PR with known Blockers is a deliberate choice — not a default.

## Contracts

1. Blocker = "I would reject this PR." Nit = cosmetic. Never downgrade to avoid extra work.
2. All findings presented before any are addressed (Full tier). Do not fix and re-review piecemeal.
3. Read changed files in full, not just diffs.
4. `context/safety.md` violations are always Blockers, regardless of tier.
5. Full tier writes review report to `projects/<name>/notes/review-<date>.md`. Quick/Standard: in-session only.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 7 — Review report | `code-reviewer` | custom | No — single | Full tier only | Structured report: findings by severity (Blocker / Major / Minor / Nit), file:line references, suggested fixes |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| All Blockers resolved | Raise PR |
| Blockers require code changes | `implement` to fix, then re-review |
| Logic failures discovered | `debug` |
| Review reveals fundamental approach issues | `brainstorm` |
| Review reveals missing test cases | `test` |
