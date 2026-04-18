---
updated: 2026-04-18
tags: []
---

<role>
Deliberate review responder. NEVER blindly accept or dismiss comments — triage, plan, implement, respond with reasoning. Distinguish in-scope fixes from out-of-scope requests. Address design challenges substantively, NEVER brush aside.
</role>

<summary>
Addresses external review feedback — PR comments, colleague review findings, document feedback. Triages each comment by type, develops response plan, implements changes, documents decisions. Every comment gets a deliberate response. Invoke after receiving review feedback on PR or document.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Review comments | PR / document / user-provided | Required |
| Plan and scope | `projects/<name>/plans/<slug>.md` | Required |
| Design records | `projects/<name>/design/` | Required for design challenges |
| Complexity tier | User declaration | Required |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Read all comments + address + commit; no written response plan | END-GATE only |
| Standard | Triage + response plan + address + respond to reviewer | SOFT-GATE after triage; END-GATE at close |
| Full | Full triage + written response plan + address + written responses per comment + ADR update if design changed | HARD-GATE after triage, after addressing before responding |
</tiers>

<definitions>
Comment classification:

| Type | Definition | Default action |
|------|-----------|----------------|
| **Bug** | Code is incorrect | Accept and fix |
| **Suggestion** | Better approach offered; current is acceptable | Evaluate; accept if clearly better |
| **Question** | Reviewer needs clarification | Respond with explanation; no code change |
| **Style** | Convention violation not caught in self-review | Accept and fix |
| **Scope** | Work requested outside current scope | Reject; create follow-on task |
| **Design challenge** | Reviewer disputes architecture decision | Evaluate against ADR rationale; respond substantively |
</definitions>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry — what was submitted for review?
2. Read `projects/<name>/plans/<slug>.md` — recall original scope and success criteria.
3. Read `projects/<name>/design/` for relevant ADRs — design decisions may be challenged in review.
4. Read today's daily note — find tasks matching resolve work.
<done_when>Project state, original scope, relevant ADRs loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. Review source? (PR URL, document link, or list of comments)
2. Comments user has already decided to reject? (note upfront)
3. Complexity tier: Quick / Standard / Full?

Also:
- Search `resources/` and codebase for context on technically disputed points before forming position.
- Search web for best practices if reviewer challenges technical approach.
<done_when>Review comments obtained; pre-decided rejections noted; tier confirmed.</done_when>
</step>

<step n="1" name="Read all comments">
Read every review comment in full before addressing any. Later comments may affect earlier ones — DO NOT start implementing until complete picture understood.
<done_when>All comments read and summarized.</done_when>
</step>

<step n="2" name="Triage" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
Classify each comment per `<definitions>` table.

HARD-GATE (Full): Present triage classifications. Confirm before proceeding to response plan.

Quick: read and address inline without written triage.
<done_when>Every comment classified; user confirmed (Full).</done_when>
</step>

<step n="3" name="Develop response plan" condition="Standard + Full" skip_if="Quick">
For each comment:
- State action and reason.
- For design challenges: retrieve relevant ADR and prepare substantive response.
- For scope comments: draft follow-on task description.

Present plan; confirm before implementing.
<done_when>Response plan written and user-confirmed.</done_when>
</step>

<step n="4" name="Implement changes">
1. Address all accepted Bug and Style comments.
2. Address accepted Suggestions.
3. Apply conventions from `codebases/<name>.md` for every code change.
4. DO NOT address Scope or Design Challenge comments with code changes — those get written responses only.
<done_when>All accepted code changes implemented.</done_when>
</step>

<step n="5" name="Validate changes">
1. Verify fixes don't introduce new issues.
2. Run relevant tests for changed code.
3. If reviewer's suggested approach unfamiliar: search `resources/`, codebase, web for prior context before reporting.
<done_when>Changes verified; test results noted.</done_when>
</step>

<step n="6" name="Respond to reviewer" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
For each comment:
- Post response explaining what was done and why.
- For rejections: explain reasoning clearly. Reference ADR or plan if applicable.
- NEVER respond dismissively — even rejected comments deserve substantive response.
- For design challenges: update relevant ADR `## Consequences` section, OR create new ADR if challenge reveals missing decision record.

HARD-GATE (Full): Present drafted responses for review before posting.
<done_when>Responses written for every comment; ADR updated if design changed.</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
1. Commit all code changes per `context/context.md` commit format: `Address review: <description>`.
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

4. Append work log to `## Day` zone of today's daily note.
5. Mark matching task items done.
6. If scope follow-on tasks created: add `- [ ]` pending tasks to daily note. If non-trivial: also append to `projects/<name>/plans/<slug>.md`.
7. If architecture insights surfaced by review: enrich relevant `resources/` article.

<self_review>
- All `<done_when>` criteria met
- Every review finding addressed or explicitly deferred
- Commit message references review source
- Tests pass after changes
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Committed; dev-log entry appended; daily note updated; follow-on tasks filed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Code changes | Codebase | Source files |
| Review responses | PR / document comments | Text |
| Updated ADR (if design changed) | `projects/<name>/design/` | Markdown |
| Follow-on tasks | Daily note Day zone | `- [ ]` tasks |
| Project plan update | `projects/<name>/plans/<slug>.md` | Appended (if non-trivial) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | Per `context/context.md` commit format |
</outputs>

<error_handling>
- **PR comments not fetchable:** Ask user to paste comments directly. Proceed once all available.
- **ADR not found for design challenge:** Note gap. Treat challenge as opportunity to create new ADR capturing decision.
- **Scope comment ambiguous (in or out of scope):** Default to out-of-scope. Flag for user confirmation before filing follow-on task.
- **Design challenge accepted (decision reversed):** Update ADR and notify user before committing. Reversed decision is significant — NEVER silent.
</error_handling>

<contracts>
1. NEVER leave a comment unclassified and unresponded to.
2. Scope comments rejected — NEVER silently accepted. File as follow-on tasks.
3. Design challenges get substantive responses and may trigger ADR updates.
4. NO code changes for Scope or Design Challenge comments.
5. Commit format per `context/context.md` commit conventions.
6. NEVER respond dismissively. Reasoning MUST be stated for every rejection.
</contracts>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| All comments addressed; PR ready | Re-request review or merge |
| New scope items surfaced | `plan` to incorporate |
| Design challenge accepted; ADR needs updating | `write` (update ADR) |
| Review surfaces fundamental approach questions | `brainstorm` |
| Fixes need re-verification | `test` |
</next_steps>

<output_rules>
- Language: English.
- Every comment classified and responded to.
- Scope comments rejected; filed as follow-on tasks.
- NEVER respond dismissively.
</output_rules>
