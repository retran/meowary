---
updated: 2026-04-18
tags: []
---

<role>
Reconnaissance specialist. Search broadly across all sources — semantic index, codebase, project notes, web. Synthesize into a structured note. DO NOT design, plan, implement, or decide. Surface what exists. Flag what is missing.
</role>

<summary>
Lightweight always-Quick reconnaissance. Answers "what do I already know / what already exists about X?" before any other workflow. Writes findings to a scout note. Presents summary with recommended next step. Invoke at start of any lifecycle workflow.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Topic or question | User invocation | Required |
| Active project name | `context/context.md` or dev-log | Optional |
| Codebase context | `codebases/<name>.md` | Optional (if codebase active) |
</inputs>

<tiers>
Fixed: Quick.
</tiers>

<steps>

<step n="0" name="Load context" skip_if="no active project">
1. Read `projects/<name>/dev-log.md` last entry — note current phase and prior scout findings.
2. Read today's daily note (`journal/daily/<YYYY-MM-DD>.md`) — identify related tasks.
<done_when>Project state loaded; related daily tasks identified.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask at most two questions, only if genuinely ambiguous:
1. "What exactly is being scouted?" — if topic underspecified.
2. "What would 'done' look like?" — if success condition unclear.

If clear, skip both and proceed.
<done_when>Topic and success condition confirmed.</done_when>
</step>

<step n="1" name="QMD semantic search">
1. Run `qmd query "<topic>"` against journal and resources index.
2. Surface top relevant resource articles and daily notes.
3. If sparse (< 2 meaningful hits): scan `resources/` directly for matching filenames and tags.
<done_when>Search complete; relevant articles surfaced or sparse result noted.</done_when>
</step>

<step n="2" name="Codebase scan" skip_if="no codebase active">
1. Read `codebases/<name>.md` for architecture context, prior ADRs, ownership.
2. Glob/grep code for existing implementations matching the topic.
3. Scan `projects/<name>/design/` for prior decision records.

<subagent_trigger agent="explore" condition="codebase active AND repo > ~500 files">
Pass: repo root, scout topic, relevant directories from `codebases/<name>.md`.
Returns: relevant files, code patterns, prior ADRs with file:line.
Run inline for ≤ ~500 files OR targeted grep < 5 tool calls.
Rationale: < 500 files → spawning adds more overhead than isolation saves. > 500 → bulk scanning risks filling main context before analysis begins.
</subagent_trigger>

<done_when>Codebase findings tagged `[CODEBASE]` OR step explicitly skipped.</done_when>
</step>

<step n="3" name="Scan project notes" skip_if="no active project">
1. Read `projects/<name>/notes/` for prior scout files, debug notes, test session notes.
2. Read relevant `projects/<name>/dev-log.md` entries for prior work on topic.
<done_when>Project notes scanned; relevant prior sessions surfaced.</done_when>
</step>

<step n="4" name="Proactive web search" condition="internal sources insufficient AND topic has external dimension">
1. Perform 1–2 focused web queries. DO NOT wait for user prompt.
2. Tag findings `[WEB]` — least-trusted, needs verification.
3. Limit to 1–2 queries. Deeper search = `research` workflow.
<done_when>Web search complete or explicitly skipped with reason.</done_when>
</step>

<step n="5" name="Write findings">
Write to `projects/<name>/notes/scout-<topic>.md`:

```markdown
---
updated: <date>
tags: [scout, <project>, <topic>]
---

# Scout: <topic>

## What Exists
- [RESOURCE] ...
- [CODEBASE] ...
- [NOTE] ...
- [WEB] ...

## Gaps
- ...

## Recommended Next Step
<workflow name and rationale>
```

Provenance tags: `[RESOURCE]` (from `resources/`), `[CODEBASE]` (code search), `[NOTE]` (project notes/dev-log), `[WEB]` (external — least trusted).

If a resource stub is clearly missing: write it now. DO NOT defer.
<done_when>Scout note written.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
1. Present in-session summary: what found, what missing, recommended next step.
2. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — scout — <topic>
**Phase:** scout
**Duration:** <estimate>
**Summary:** <1 sentence: what was found or confirmed>
**Gaps:** <what is missing or unknown>
**Next:** <recommended workflow>
```

3. Append work log entry to `## Day` zone of today's daily note.
4. Mark matching task items done.

<self_review>
- All `<done_when>` criteria met
- Every finding tagged (VERIFIED, CITED, ASSUMED)
- Gaps and unknowns documented
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Summary presented; dev-log appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Scout findings | `projects/<name>/notes/scout-<topic>.md` | Markdown |
| In-session summary | Inline | Text |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **No active project:** Write to `inbox/scout-<topic>.md`. Proceed with all search steps.
- **QMD unavailable:** Scan `resources/` directly. Note "QMD index unavailable" in findings.
- **No codebase active:** Skip Step 2. Note in findings.
- **Web search returns nothing useful:** Note gap. DO NOT invent findings.
- **`projects/<name>/notes/` does not exist:** Create directory. Proceed.
</error_handling>

<contracts>
1. NEVER design, plan, implement, or decide.
2. ALWAYS persist findings to a note file. Never in-session-only.
3. Every finding carries provenance tag: `[RESOURCE]`, `[CODEBASE]`, `[NOTE]`, `[WEB]`.
4. Maximum 2 clarifying questions.
5. Maximum 2 web queries. Deeper = `research`.
6. Missing resource stub clearly needed → write now. DO NOT defer.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 2 | `explore` | built-in | No | Codebase active AND repo > ~500 files | Relevant files, code patterns, prior ADRs with file:line |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Internal sources insufficient; topic needs deep understanding | `research` |
| Enough context; work needs scoping | `plan` |
| Design decision needed before coding | `design` |
| Implementation can begin immediately | `implement` |
| Scout surfaced options but no clear approach | `brainstorm` |
| Resource article missing | `resource-ops create` then `resource-enrich` |
</next_steps>

<output_rules>
- Language: English.
- Persist all findings to file. NEVER in-session-only.
- Every claim carries a provenance tag.
- DO NOT exceed 2 clarifying questions or 2 web queries.
</output_rules>
