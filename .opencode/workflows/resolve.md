---
updated: 2026-04-07
tags: []
---

# Resolve

> Addresses external review feedback — PR comments, colleague review findings, or document feedback. Triages each comment by type, develops a response plan, implements changes, and documents decisions. Every comment gets a deliberate response. Invoke after receiving review feedback on a PR or document.

## Role

Acts as a deliberate review responder. Does not blindly accept or dismiss comments — triages, plans, implements, and responds with reasoning. Distinguishes in-scope fixes from out-of-scope requests. Ensures design challenges are addressed substantively, not brushed aside.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Review comments | PR / document / user-provided | Required |
| Plan and scope | `projects/<name>/plans/<slug>.md` | Required |
| Design records | `projects/<name>/design/` | Required for design challenges |
| Complexity tier | User declaration | Required |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Read all comments + address + commit; no written response plan | End gate only |
| **Standard** | Triage + response plan + address + respond to reviewer | Mid-gate after triage + end gate |
| **Full** | Full triage + written response plan + address + written responses per comment + ADR update if design changed | HARD-GATE after triage; HARD-GATE after addressing before responding |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry — what was submitted for review?
2. Read `projects/<name>/plans/<slug>.md` — recall original scope and success criteria.
3. Read `projects/<name>/design/` for relevant ADRs — design decisions may be challenged in review.
4. Read today's daily note — find any tasks matching this resolve work.

Done when: project state, original scope, and relevant ADRs loaded.

### Step 0.5 — Clarify

Ask the user:
1. What is the review source? (PR URL, document link, or list of comments)
2. Are there any comments the user has already decided to reject? (note these upfront)
3. Complexity tier: Quick / Standard / Full?

Also:
- Search `resources/` and codebase for context on any technically disputed points before forming a position.
- Search the web for best practices if a reviewer challenges a technical approach.

Done when: review comments obtained; pre-decided rejections noted; tier confirmed.

### Step 1 — Read all comments

Read every review comment in full before addressing any. Later comments may affect earlier ones — do not start implementing until the complete picture is understood.

Done when: all comments read and summarised.

### Step 2 — Triage (Standard + Full)

Classify each comment into one of these types:

| Type | Definition | Default action |
|------|-----------|----------------|
| **Bug** | Code is incorrect | Accept and fix |
| **Suggestion** | Better approach offered; current is acceptable | Evaluate; accept if clearly better |
| **Question** | Reviewer needs clarification | Respond with explanation; no code change |
| **Style** | Convention violation not caught in self-review | Accept and fix |
| **Scope** | Work requested is outside current scope | Reject; create follow-on task |
| **Design challenge** | Reviewer disputes an architecture decision | Evaluate against ADR rationale; respond substantively |

**HARD-GATE (Full):** Present triage classifications to the user. Confirm before proceeding to the response plan.

Skip for Quick tier — read and address inline without a written triage.

Done when: every comment classified; user confirmed (Full).

### Step 3 — Develop response plan (Standard + Full)

For each comment:
- State what action will be taken and why.
- For design challenges: retrieve the relevant ADR and prepare a substantive response.
- For scope comments: draft the follow-on task description.

Present the plan to the user and confirm before implementing.

Done when: response plan written and user-confirmed.

### Step 4 — Implement changes

1. Address all accepted Bug and Style comments.
2. Address accepted Suggestions.
3.    Apply conventions from `codebases/<name>.md` for every code change.
4. Do not address Scope or Design Challenge comments with code changes — those get written responses only.

Done when: all accepted code changes implemented.

### Step 5 — Validate changes

1. Verify fixes don't introduce new issues.
2. Run relevant tests for changed code.
3. If a reviewer's suggested approach is unfamiliar: search `resources/`, codebase, and the web for prior context before reporting.

Done when: changes verified; test results noted.

### Step 6 — Respond to reviewer (Standard + Full)

For each comment:
- Post a response explaining what was done and why.
- For rejections: explain the reasoning clearly; reference the ADR or plan if applicable.
- Never respond dismissively — even rejected comments deserve a substantive response.
- For design challenges: update the relevant ADR `## Consequences` section, or create a new ADR if the challenge reveals a missing decision record.

**HARD-GATE (Full):** Present drafted responses to the user for review before posting.

Done when: responses written for every comment; ADR updated if design changed.

### Step 7 — Close

1. Commit all code changes: `Address review: <description>`.
2. Mark resolve tasks done in `projects/<name>/plans/<slug>.md`.
3. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — resolve — <PR or doc title>
**Phase:** resolve
**Duration:** <estimate>
**Summary:** <what comments were addressed>
**Accepted:** <N comments fixed>
**Rejected:** <N comments; reasons>
**Design changes:** <any ADR updates triggered, or "none">
**Follow-on tasks:** <out-of-scope items deferred, or "none">
**Next:** re-request review | merge | implement (if new scope added)
```

4. Append work log entry to `## Day` zone of today's daily note.
5. Mark matching task items as done.
6. If scope follow-on tasks were created: add `- [ ]` pending tasks to the daily note. If non-trivial, also append to `projects/<name>/plans/<slug>.md`.
7. If architecture insights were surfaced by the review: enrich the relevant `resources/` article.

Done when: committed; dev-log entry appended; daily note updated; follow-on tasks filed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Code changes | Codebase | Source files |
| Review responses | PR / document comments | Text |
| Updated ADR (if design changed) | `projects/<name>/design/` | Markdown |
| Follow-on tasks | Daily note Day zone | `- [ ]` tasks |
| Project plan update | `projects/<name>/plans/<slug>.md` | Appended (if non-trivial) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | `Address review: <description>` |

## Error Handling

- **PR comments not fetchable:** Ask the user to paste the comments directly. Proceed once all comments are available.
- **ADR not found for a design challenge:** Note the gap; treat the challenge as an opportunity to create a new ADR capturing the decision.
- **Scope comment is ambiguous (could be in or out of scope):** Default to out-of-scope; flag for user confirmation before filing the follow-on task.
- **Design challenge accepted (decision reversed):** Update the ADR and notify the user before committing. A reversed decision is significant and should not be silent.

## Contracts

1. Never leave a comment unclassified and unresponded to.
2. Scope comments are rejected — never silently accepted. File as follow-on tasks.
3. Design challenges get substantive responses and may trigger ADR updates.
4. No code changes for Scope or Design Challenge comments.
5. Commit format: `Address review: <description>`.
6. Never respond dismissively. Reasoning must be stated for every rejection.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| All comments addressed; PR ready | Re-request review or merge |
| New scope items surfaced | `plan` to incorporate them |
| Design challenge accepted; ADR needs updating | `write` (update ADR) |
| Fixes need re-verification | `test` |
