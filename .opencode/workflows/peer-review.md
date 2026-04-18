---
updated: 2026-04-18
tags: []
---

<role>
Rigorous, constructive peer reviewer. Understand intent before analyzing for issues. Grade every finding by severity — "here are some thoughts" without severity labels is NOT a review. Produce findings author can act on: location, issue, suggested fix. DO NOT review for scope creep unless explicitly asked. Separate from `self-review` (own work) and `resolve` (incoming comments on own work).
</role>

<summary>
Structured review of external work — PRs, MRs, specs, RFCs, ADRs. Produces findings organized by severity (Blocker / Major / Minor / Nit), written review response for Standard and Full tiers, persisted review file for Full tier. Invoke when asked to review someone else's work.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Review target (PR number, URL, file path) | User invocation | Required |
| PR diff or document content | `gh pr diff` or Read tool | Required |
| Complexity tier | User declaration | Required |
| Active project context | `context/context.md`, `dev-log.md` | Optional |
| Architecture and patterns context | `codebases/<name>.md` | Optional (Full tier) |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Conventions check + obvious issues only; in-session comment | END-GATE only |
| Standard | Full findings by severity + written review response | END-GATE |
| Full | Standard + security, performance, design analysis; formal written review + persisted file | HARD-GATE: present all findings before posting |

Default tier: **Standard**.

> Quick tier is NOT a shortcut — it is a scoped review. Appropriate when: author blocked waiting for approval, PR trivial/mechanical, or urgency high. Communicate scope limitation to author.
</tiers>

<definitions>
Severity:

| Severity | Meaning |
|----------|---------|
| **Blocker** | Must fix before merge/approval. Correctness, security, or fundamental design. |
| **Major** | Should fix before merge/approval. Significant quality or clarity. |
| **Minor** | Improve if easy; non-blocking. Small readability, style, or consistency. |
| **Nit** | Take it or leave it. Cosmetic or personal preference. |
</definitions>

<steps>

<step n="0" name="Load context">
1. Read `context/context.md` for active projects and team context (understand code/spec domain).
2. Read `projects/<name>/dev-log.md` last entry if review relates to active project.
3. Check `projects/<name>/notes/` for prior review of same PR/spec (re-review after changes): if found, load as context.
<done_when>Team context loaded; any prior review of this target surfaced.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. What is being reviewed? (PR number, URL, or file path)
2. Context? (Draft review? Final review? Specific concerns to focus on?)

Maximum 2 questions. If tier not specified: default to Standard. Confirm if Full seems warranted (large diff, security-sensitive change, major design decision).

If review target is PR/MR: infer repo from context or ask.
<done_when>Review target, context, tier confirmed.</done_when>
</step>

<step n="1" name="Fetch review material">
**For PRs/MRs:**
1. Run `gh pr view <number> --json title,body,additions,deletions,files` (or `glab` equivalent).
2. Run `gh pr diff <number>` to fetch diff.
3. Note PR description, linked issues, stated purpose.

**For specs, docs, ADRs, RFCs:**
1. Read file directly.
2. If previous version or related document exists: read for context.
<done_when>Diff or document content in hand; PR description and purpose noted.</done_when>
</step>

<step n="2" name="Understand intent">
Before analyzing for issues, answer: "What is this change or document trying to achieve?"

Summarize intent in 1–2 sentences. This becomes opening of review response.

DO NOT evaluate for scope creep or gold-plating unless user explicitly asks.
<done_when>Intent summary written.</done_when>
</step>

<step n="3" name="Analyze">
**Code review mode** (PRs/MRs):
- Correctness: does code do what PR description says?
- Edge cases and error handling.
- Test coverage: new paths covered? Existing tests still valid?
- Naming, readability, consistency with existing patterns (from `codebases/<name>.md`).
- Full tier: security implications, performance implications, design coherence.

**Document review mode** (specs, RFCs, ADRs, docs):
- Clarity of problem statement, completeness of solution, internal consistency.
- Open questions left unaddressed, missing edge cases, underspecified contracts.
- Full tier: design tradeoffs, alternatives considered, long-term maintainability.
- Alignment with established architecture and patterns (from `codebases/<name>.md`).

<subagent_trigger agent="general" condition="Full tier">
Offload Steps 3–4 to `general` built-in agent. Pass: PR diff or document content, intent summary from Step 2, loaded `codebases/<name>.md`, `context/safety.md`. Returns findings by severity with file:line refs and draft review response. Run inline for Quick and Standard tiers.
</subagent_trigger>

<done_when>All analysis complete; issues identified with location and description.</done_when>
</step>

<step n="4" name="Produce findings">
Organize findings by severity per `<definitions>` table.

For each finding: severity label, location (file:line or section name), description, and — where possible — suggested fix or alternative. Group by severity, most to least severe. OMIT severity level with zero findings.
<done_when>All findings listed with severity, location, description, suggested fix.</done_when>
</step>

<step n="5" name="Draft review response" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
Write review in comment/response form:
- Open: 1–2 sentences on intent (from Step 2) and overall impression.
- Findings: grouped by severity.
- Close: clear recommendation:
  - **Approve** — no issues, ready to merge.
  - **Approve with nits** — cosmetic only, can merge.
  - **Request changes** — Blockers or Majors must be addressed first.
  - **Needs discussion** — fundamental question before review can proceed.

For PRs/MRs: format as PR review comments suitable for `gh pr review --body` or inline comment format.
For specs/docs: format as structured comment block to share with author.

HARD-GATE (Full): Present all findings and draft review before posting anything.
<done_when>Review response drafted; user has seen full findings.</done_when>
</step>

<step n="6" name="Persist review file" condition="Full" skip_if="Quick OR Standard">
Write findings to `projects/<name>/notes/review-<date>-<slug>.md`:

```yaml
---
type: review
date: YYYY-MM-DD
subject: "<PR title or document title>"
reviewer: <author slug>
recommendation: approve | approve-with-nits | request-changes | needs-discussion
updated: YYYY-MM-DD
tags: [peer-review]
---
```

Body: full findings from Step 4 + review response from Step 5.
<done_when>Review file written (Full only).</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
1. Append work log to `## Day` zone of today's daily note.
2. Mark any matching task items done.
3. NO dev-log entry required unless this review is part of active project's lifecycle.
   - If dev-log entry warranted:

```markdown
## <YYYY-MM-DD> — peer-review — <subject>
**Phase:** review
**Duration:** <estimate>
**Summary:** <what was reviewed and recommendation>
**Blockers:** <blocker count, or "none">
**Next:** <suggested action for author or yourself>
```

<self_review>
- All `<done_when>` criteria met
- All findings categorized by severity
- No Blocker findings left unresolved
- Review summary posted to MR/PR
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Daily note updated; dev-log entry appended if applicable.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| In-session findings summary | Inline | Text |
| Written review comments | PR/MR or inline in document | Markdown |
| Persisted review file | `projects/<name>/notes/review-<date>-<slug>.md` | Markdown |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **PR not found or inaccessible:** Ask user to confirm PR number/URL or repo. DO NOT proceed without diff.
- **No PR description or stated purpose:** DO NOT assume intent. Ask user what change is trying to do before analyzing.
- **Prior review found for same target:** Surface it. Ask: full re-review or incremental review of changes since last review?
- **User requests Quick review for security-sensitive change:** Warn that Quick tier does NOT include security pass. Ask to confirm scope.
- **Findings unclear in severity:** ESCALATE, NOT downgrade. If uncertain Blocker or Major: classify as Blocker and explain.
</error_handling>

<contracts>
1. Every finding MUST have severity label. Ungraded feedback is NOT a review.
2. Blocker = "I would reject this." Nit = cosmetic. NEVER downgrade to avoid extra work.
3. Understand intent before analyzing. DO NOT review for scope creep unless asked.
4. HARD-GATE (Full): present all findings before posting. User sees complete picture first.
5. `context/safety.md` violations are ALWAYS Blockers, regardless of tier.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 3–4 | `general` | built-in | No — single | Full tier only | Full findings by severity (Blocker / Major / Minor / Nit) + draft review response |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Review has Blockers | Author needs `resolve` before re-review |
| Review is Approve or Approve with nits | Merge or proceed |
| Review surfaces architectural questions | `design` or `research` to dig deeper |
| Review uncovered bug outside PR scope | `debug` to investigate |
</next_steps>

<output_rules>
- Language: English.
- Every finding has severity label.
- NEVER downgrade severity to avoid extra work.
- `context/safety.md` violations ALWAYS Blockers.
</output_rules>
