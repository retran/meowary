---
updated: 2026-04-07
tags: []
---

# Peer-Review

> Structured review of external work — PRs, MRs, specs, RFCs, and ADRs. Produces findings organised by severity (Blocker / Major / Minor / Nit), a written review response for Standard and Full tiers, and a persisted review file for Full tier. Invoke when asked to review someone else's work.

## Role

Acts as a rigorous, constructive peer reviewer. Understands intent before analysing for issues. Grades every finding by severity — "here are some thoughts" without severity labels is not a review. Produces findings the author can act on: location, issue, and suggested fix. Does not review for scope creep unless explicitly asked. Separate from `self-review` (which reviews your own work) and `resolve` (which addresses incoming review comments on your work).

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Review target (PR number, URL, or file path) | User invocation | Required |
| PR diff or document content | `gh pr diff` or Read tool | Required |
| Complexity tier | User declaration | Required |
| Active project context | `context/context.md`, `dev-log.md` | Optional |
| Architecture and patterns context | `codebases/<name>.md` | Optional (Full tier) |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Conventions check + obvious issues only; in-session comment | End gate only |
| **Standard** | Full findings by severity + written review response | End gate |
| **Full** | Standard + security, performance, and design analysis; formal written review + persisted file | HARD-GATE: present all findings before posting |

Default tier: **Standard**.

> Quick tier is not a shortcut — it is a scoped review. Appropriate when: the author is blocked waiting for approval, the PR is trivial/mechanical, or urgency is high. Communicate the scope limitation to the author.

## Steps

### Step 0 — Load context

1. Read `context/context.md` for active projects and team context (to understand the code/spec domain).
2. Read `projects/<name>/dev-log.md` last entry if this review relates to an active project.
3. Check `projects/<name>/notes/` for a prior review of the same PR/spec (re-review after changes): if found, load it as context.

Done when: team context loaded; any prior review of this target surfaced.

### Step 0.5 — Clarify

Ask the user:
1. What is being reviewed? (PR number, URL, or file path)
2. What is the context? (Draft review? Final review? Specific concerns to focus on?)

Maximum 2 questions. If tier was not specified: default to Standard. Confirm with user if Full seems warranted (large diff, security-sensitive change, major design decision).

If the review target is a PR/MR: infer the repo from context or ask.

Done when: review target, context, and tier confirmed.

### Step 1 — Fetch review material

**For PRs/MRs:**
1. Run `gh pr view <number> --json title,body,additions,deletions,files` (or `glab` equivalent).
2. Run `gh pr diff <number>` to fetch the diff.
3. Note the PR description, linked issues, and stated purpose.

**For specs, docs, ADRs, RFCs:**
1. Read the file directly.
2. If a previous version or related document exists, read that too for context.

Done when: diff or document content in hand; PR description and purpose noted.

### Step 2 — Understand intent

Before analysing for issues, answer: "What is this change or document trying to achieve?"

Summarise the intent in 1–2 sentences. This becomes the opening of the review response.

Do not evaluate for scope creep or gold-plating unless the user explicitly asks.

Done when: intent summary written.

### Step 3 — Analyse

**Code review mode** (PRs/MRs):
- Correctness: does the code do what the PR description says?
- Edge cases and error handling.
- Test coverage: are new paths covered? Are existing tests still valid?
- Naming, readability, consistency with existing patterns (from `codebases/<name>.md`).
- Full tier: security implications, performance implications, design coherence.

**Document review mode** (specs, RFCs, ADRs, docs):
- Clarity of problem statement, completeness of solution, internal consistency.
- Open questions left unaddressed, missing edge cases, underspecified contracts.
- Full tier: design tradeoffs, alternatives considered, long-term maintainability.
- Alignment with established architecture and patterns (from `codebases/<name>.md`).

**Sub-agent trigger (Full):** Offload Steps 3–4 to the `general` built-in agent. Pass: PR diff or document content, the intent summary from Step 2, and the loaded `codebases/<name>.md`, `context/safety.md`. The agent returns findings by severity with file:line refs and a draft review response. Run inline (no sub-agent) for Quick and Standard tiers.

Done when: all analysis complete; issues identified with location and description.

### Step 4 — Produce findings

Organise findings by severity:

| Severity | Meaning |
|----------|---------|
| **Blocker** | Must be fixed before merge/approval. Correctness, security, or fundamental design issue. |
| **Major** | Should be fixed before merge/approval. Significant quality or clarity issue. |
| **Minor** | Improve if easy; non-blocking. Small readability, style, or consistency issue. |
| **Nit** | Take it or leave it. Cosmetic or personal preference. |

For each finding: severity label, location (file:line or section name), description, and — where possible — a suggested fix or alternative. Group by severity, most to least severe. Omit a severity level if there are no findings at that level.

Done when: all findings listed with severity, location, description, and suggested fix.

### Step 5 — Draft review response (Standard + Full)

Write the review in comment/response form:
- Open: 1–2 sentences on intent (from Step 2) and overall impression.
- Findings: grouped by severity.
- Close: a clear recommendation:
  - **Approve** — no issues, ready to merge.
  - **Approve with nits** — cosmetic only, can merge.
  - **Request changes** — Blockers or Majors must be addressed first.
  - **Needs discussion** — fundamental question before the review can proceed.

For PRs/MRs: format as PR review comments suitable for `gh pr review --body` or inline comment format.
For specs/docs: format as a structured comment block to share with the author.

**HARD-GATE (Full):** Present all findings and the draft review to the user before posting anything.

Skip for Quick tier (surface findings in-session only).

Done when: review response drafted; user has seen the full findings.

### Step 6 — Persist review file (Full only)

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

Skip for Quick and Standard tiers.

Done when: review file written (Full only).

### Step 7 — Close

1. Append work log entry to `## Day` zone of today's daily note.
2. Mark any matching task items as done.
3. No dev-log entry required unless this review is part of an active project's lifecycle.
   - If dev-log entry is warranted:

```markdown
## <YYYY-MM-DD> — peer-review — <subject>
**Phase:** review
**Duration:** <estimate>
**Summary:** <what was reviewed and recommendation>
**Blockers:** <blocker count, or "none">
**Next:** <suggested action for the author or yourself>
```

Done when: daily note updated; dev-log entry appended if applicable.

## Outputs

| Output | Location | Tier |
|--------|----------|------|
| In-session findings summary | Inline | All |
| Written review comments | PR/MR or inline in document | Standard, Full |
| Persisted review file | `projects/<name>/notes/review-<date>-<slug>.md` | Full only |
| Daily note work log | `journal/daily/<date>.md` Day zone | All |

## Error Handling

- **PR not found or inaccessible:** Ask the user to confirm the PR number/URL or repo. Do not proceed without the diff.
- **No PR description or stated purpose:** Do not assume intent. Ask the user what the change is trying to do before analysing.
- **Prior review found for the same target:** Surface it. Ask: full re-review or incremental review of changes since last review?
- **User requests a Quick review for a security-sensitive change:** Warn that Quick tier does not include a security pass. Ask to confirm scope.
- **Findings unclear in severity:** Escalate, not downgrade. If uncertain whether a finding is a Blocker or Major, classify it as Blocker and explain.

## Contracts

1. Every finding must have a severity label. Ungraded feedback is not a review.
2. Blocker = "I would reject this." Nit = cosmetic. Never downgrade to avoid extra work.
3. Understand intent before analysing — do not review for scope creep unless asked.
4. HARD-GATE (Full): present all findings before posting anything. Let the user see the complete picture first.
5. `context/safety.md` violations are always Blockers, regardless of tier.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Steps 3–4 — Analyse + Findings | `general` | built-in | No — single | Full tier only | Full findings by severity (Blocker / Major / Minor / Nit) + draft review response |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Review has Blockers | Author needs `resolve` before re-review |
| Review is Approve or Approve with nits | Merge or proceed |
| Review surfaces architectural questions | `design` or `research` to dig deeper |
| Review uncovered a bug outside the PR scope | `debug` to investigate |
