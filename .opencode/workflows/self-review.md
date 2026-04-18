---
updated: 2026-04-18
tags: []
---

<role>
Rigorous internal code reviewer. Read changed files in full, NOT just diffs — context matters. Classify findings honestly by severity: Blocker = "I would reject this PR." Nit = "cosmetic, no correctness impact." NEVER downgrade findings to avoid extra work. Surface all findings before any are addressed (Full tier) so complete picture is visible.
</role>

<summary>
Structured pre-PR code review. Reads plan's success criteria, applies codebase style and patterns conventions, checks for common anti-patterns, produces structured review report with severity-classified findings. Catches issues author missed — NOT a rubber-stamp, but honest check against same standards external reviewer would apply. Invoke after `implement` (Standard or Full tier) before raising PR.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Changed files or diff | Codebase | Required |
| Plan and success criteria | `projects/<name>/plans/<slug>.md` | Required |
| Codebase context | `codebases/<name>.md` | Required |
| Codebase conventions | `codebases/<name>.md`, `context/safety.md` | Required |
| Complexity tier | User declaration | Required |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Conventions check + obvious issues; no deep logic review | END-GATE only |
| Standard | Conventions + logic correctness + edge cases + test coverage | END-GATE |
| Full | All Standard + security/performance analysis + simulated PR review comments | HARD-GATE (Full): present all findings before any addressed |

> Quick-tier `implement` sessions include lightweight inline conventions check at Step 5 (Close) and DO NOT require invoking `self-review` separately. Invoke `self-review` for Standard and Full tier sessions, OR any change touching public API, auth, data persistence, or shared infrastructure.
</tiers>

<definitions>
Severity:

| Severity | Definition |
|----------|-----------|
| **Blocker** | "I would reject this PR." Must fix before merge. |
| **Major** | Significant issue; should fix before PR review. |
| **Minor** | Clear improvement; fix if straightforward. |
| **Nit** | Cosmetic; no correctness impact. |
</definitions>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry — what was implemented?
2. Read `projects/<name>/plans/<slug>.md` — success criteria?
3. Load `codebases/<name>.md` and `context/safety.md`.
4. Read today's daily note — find tasks matching review.
<done_when>Implementation scope, success criteria, all convention files loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. What changed? (if unclear from dev-log: ask for diff summary or PR description)
2. Areas of concern or complexity to focus on?
3. Complexity tier: Quick / Standard / Full?

Also:
- Run `git diff` or read changed files to understand scope.
- Search `resources/` and `codebases/<name>.md` for patterns that should apply.
- Search web for known anti-patterns in the approach if applicable.
<done_when>Scope of changes, focus areas, tier confirmed.</done_when>
</step>

<step n="1" name="Read the diff">
1. Read every changed file in full — NOT just diff. Context matters; change correct in isolation may be wrong given surrounding code.
2. Map changes to plan tasks: which task does each change implement?
<done_when>All changed files read in full; changes mapped to plan tasks.</done_when>
</step>

<step n="2" name="Conventions check">
Apply systematically:
- Coding conventions from `codebases/<name>.md`: naming, formatting, imports, file structure, language idioms, project-specific patterns.

List every convention violation, no matter how small. Severity: Minor or Nit.
<done_when>All conventions checked; violations listed.</done_when>
</step>

<step n="3" name="Logic and correctness" condition="Standard + Full" skip_if="Quick">
For each changed function or module:
1. Does it do what plan says?
2. Edge cases handled? (null inputs, empty collections, boundary values, error paths)
3. Error paths tested and handled gracefully?
4. Race conditions, off-by-one errors, logic inversions?
<done_when>All changed modules reviewed for correctness; findings categorized.</done_when>
</step>

<step n="4" name="Test coverage" condition="Standard + Full" skip_if="Quick">
1. New code paths covered by tests?
2. Existing tests still valid given changes?
3. Test assertions meaningful — NOT just "it ran without error"?
<done_when>Test coverage assessed; gaps identified.</done_when>
</step>

<step n="5" name="Security and performance" condition="Full" skip_if="Quick OR Standard">
1. Injection vulnerabilities, auth bypasses, exposed secrets?
2. Obvious performance regressions: N+1 queries, unnecessary re-renders, unbounded loops?
3. Reference `context/safety.md` for non-negotiable security rules — these are Blockers.
<done_when>Security and performance analysis complete; `context/safety.md` rules verified.</done_when>
</step>

<step n="6" name="Proactive research" condition="suspicious pattern not in codebases or resources">
- Search web. Form position before report.
- If dependency new or updated: check for known issues, deprecations, breaking changes.

DO NOT defer "I'm not sure about this" to PR reviewer. Investigate and form position.
<done_when>All suspicious patterns investigated; findings added to report.</done_when>
</step>

<step n="7" name="Produce review report" gate="HARD-GATE (Full)">
Structure findings in two independent sections:

**7a. Plan compliance review:**
- Implementation matches plan requirements?
- All plan tasks completed?
- Success criteria met?
- Missing implementation = Blocker.

**Fallback:** If no plan exists (ad-hoc changes, no spec/plan): skip plan compliance. Note in report: "No plan found — reviewing code quality only."

**7b. Code quality review:**

Structure findings by severity per `<definitions>` table.

For each finding: file and line reference, issue description, suggested fix or recommendation.

Both sections run regardless — independent concerns. Plan compliance surfaces *what's missing*. Code quality surfaces *what's wrong with what exists*. Report both sections in review output.

<subagent_trigger agent="code-reviewer" condition="Full tier">
Offload review report generation to `code-reviewer` custom agent. Pass: diff or list of changed files with contents, plan file (if available), plan success criteria, loaded `codebases/<name>.md`, `context/safety.md`. Returns structured review report with both sections (plan compliance + code quality), findings categorized by severity, with file:line references and suggested fixes. Agent file: `.opencode/agents/code-reviewer.md`. Run inline for Quick and Standard tiers.
</subagent_trigger>

HARD-GATE (Full): Present all findings before any addressed. User decides priority. Addressing first finding often changes severity of subsequent findings — complete picture MUST be visible first.
<done_when>All findings categorized and presented; user has reviewed complete report.</done_when>
</step>

<step n="8" name="Close" gate="END-GATE">
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

3. Append work log to `## Day` zone of today's daily note.
4. Mark matching task items done.
5. **Learnings:** After dev-log entry, actively reflect:

   > "Did this review surface any pattern or anti-pattern not already documented in `resources/` or `codebases/<name>.md`?"

   If yes, output:

   ```markdown
   **Learnings:**
   - <pattern or anti-pattern discovered>
   - <convention that should be documented>
   ```

   Then:
   1. Check if relevant resource article exists in `resources/`.
   2. If yes: add learning as fact.
   3. If no: note as candidate for future resource creation.

<self_review>
- All `<done_when>` criteria met
- All findings categorized by severity
- Plan compliance section completed (or noted as planless)
- Learnings section addressed (new patterns documented or "none identified")
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Summary written; dev-log entry appended; daily note updated; learnings addressed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Review report (Quick + Standard) | In-session only | Structured text |
| Review report (Full) | `projects/<name>/notes/review-<date>.md` | Markdown |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **No diff available:** Ask user to list changed files. Read in full before proceeding.
- **`codebases/<name>.md` missing:** Note gap. Ask user for relevant conventions. DO NOT skip conventions check.
- **Finding severity unclear:** ESCALATE, DO NOT downgrade. If uncertain Blocker or Major: classify as Blocker and explain reasoning.
- **User wants to skip Blockers:** Confirm explicitly. Raising PR with known Blockers is deliberate choice — NOT default.
</error_handling>

<contracts>
1. Blocker = "I would reject this PR." Nit = cosmetic. NEVER downgrade to avoid extra work.
2. All findings presented before any addressed (Full tier). DO NOT fix and re-review piecemeal.
3. Read changed files in full, NOT just diffs.
4. `context/safety.md` violations ALWAYS Blockers, regardless of tier.
5. Full tier writes review report to `projects/<name>/notes/review-<date>.md`. Quick/Standard: in-session only.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 7 | `code-reviewer` | custom | No — single | Full tier only | Structured report: findings by severity (Blocker / Major / Minor / Nit), file:line references, suggested fixes |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| All Blockers resolved | Raise PR |
| Blockers require code changes | `implement` to fix, then re-review |
| Logic failures discovered | `debug` |
| Review reveals fundamental approach issues | `brainstorm` |
| Review reveals missing test cases | `test` |
</next_steps>

<output_rules>
- Language: English.
- Read changed files in full, NOT just diffs.
- NEVER downgrade severity.
- `context/safety.md` violations ALWAYS Blockers.
</output_rules>
