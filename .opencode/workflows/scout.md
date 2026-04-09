---
updated: 2026-04-07
tags: []
---

# Scout

> Lightweight, always-Quick reconnaissance. Answers "what do I already know / what already exists about X?" before any other workflow begins. Searches resources, codebase, project notes, and the web; writes findings to a scout note; presents a summary with a recommended next step. Invoke at the start of any lifecycle workflow to avoid re-inventing existing knowledge.

## Role

Acts as a reconnaissance specialist. Searches broadly across all available sources — semantic index, codebase, project notes, web — then synthesizes findings into a structured note. Does not design, plan, or implement. Does not make decisions. Surfaces what exists and explicitly flags what is missing.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Topic or question | User invocation | Required |
| Active project name | `context/context.md` or dev-log | Optional |
| Codebase context | `codebases/<name>.md` | Optional (if codebase is active) |

## Complexity Tiers

Fixed tier: Quick

## Steps

### Step 0 — Load context

Skip if no active project.

1. Read `projects/<name>/dev-log.md` last entry — note current phase and any prior scout findings referenced.
2. Read today's daily note (`journal/daily/<YYYY-MM-DD>.md`) — identify any tasks related to this scout topic.

Done when: project state loaded; related daily tasks identified.

### Step 0.5 — Clarify

Ask at most two questions, only if genuinely ambiguous:

1. "What exactly is being scouted?" — if the topic is underspecified.
2. "What would 'done' look like for this scout?" — if the success condition is unclear.

If the topic is clear from the invocation, skip both questions and proceed.

Done when: topic and success condition confirmed.

### Step 1 — QMD semantic search

1. Run `qmd query "<topic>"` against the journal and resources index.
2. Surface top relevant resource articles and daily notes.
3. If QMD returns sparse results (fewer than 2 meaningful hits): also scan `resources/` directory tree directly for matching article filenames and tags.

Done when: semantic search complete; relevant articles surfaced or sparse result noted.

### Step 2 — Codebase scan (if codebase is active)

1. Read `codebases/<name>.md` for relevant architecture context, prior ADRs, and component ownership.
2. Glob/grep relevant code for existing implementations or patterns matching the topic.
3. Scan `projects/<name>/design/` for prior decision records on this topic.

**Sub-agent trigger:** If codebase is active AND repo size > ~500 files, offload to an `explore` agent. Pass: repo root path, scout topic, relevant directories from `codebases/<name>.md`. The agent returns: relevant files, code patterns, and prior ADRs — tagged with file paths and line numbers. Run inline for ≤ ~500 files or when the search is a targeted grep taking fewer than 5 tool calls.

(500-file threshold: below this, spawning `explore` adds more overhead than the isolation saves. Above it, bulk file scanning risks filling the main context window before analysis begins.)

Skip this step entirely if no codebase is active.

Done when: codebase findings tagged `[CODEBASE]` or step explicitly skipped.

### Step 3 — Scan project notes

Skip if no active project.

1. Read `projects/<name>/notes/` for prior scout files, debug notes, and test session notes related to the topic.
2. Read relevant entries in `projects/<name>/dev-log.md` — look for prior work on this topic.

Done when: project notes scanned; relevant prior sessions surfaced.

### Step 4 — Proactive web search

If internal sources are insufficient and the topic has an external dimension (library, technology, concept, error message):

1. Perform 1–2 focused web queries. Do not wait for the user to ask — search proactively if internal sources leave gaps.
2. Flag web findings as `[WEB]` — these are the least-trusted source type and need verification.
3. Limit to 1–2 queries; do not expand into a full research session. That is `research`.

Skip if internal sources are sufficient.

Done when: web search complete (or explicitly skipped with reason).

### Step 5 — Write findings

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

Provenance tags: `[RESOURCE]` (from `resources/`), `[CODEBASE]` (from code search), `[NOTE]` (from project notes/dev-log), `[WEB]` (from external search — least trusted).

If a resource stub is clearly missing: write it now rather than deferring.

Done when: scout note written to `projects/<name>/notes/scout-<topic>.md`.

### Step 6 — Close

1. Present in-session summary: what was found, what is missing, recommended next step.
2. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — scout — <topic>
**Phase:** scout
**Duration:** <estimate>
**Summary:** <1 sentence: what was found or confirmed>
**Gaps:** <what is missing or unknown>
**Next:** <recommended workflow>
```

3. Append a work log entry to `## Day` zone of today's daily note.
4. Mark any matching task items as done.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Every finding is tagged (VERIFIED, CITED, ASSUMED)
- [ ] Gaps and unknowns documented
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: summary presented; dev-log entry appended; daily note updated.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Scout findings | `projects/<name>/notes/scout-<topic>.md` | Markdown |
| In-session summary | Inline | Text |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **No active project:** Write scout note to `inbox/scout-<topic>.md` instead. Proceed with all search steps.
- **QMD unavailable:** Scan `resources/` directly. Note "QMD index unavailable" in the findings.
- **No codebase active:** Skip Step 2 entirely. Note in the findings.
- **Web search returns no useful results:** Note the gap; do not invent findings.
- **`projects/<name>/notes/` does not exist:** Create the directory; proceed.

## Contracts

1. Scout never designs, plans, implements, or makes decisions.
2. Scout always persists findings to a note file. Never in-session-only.
3. Every finding must carry a provenance tag: `[RESOURCE]`, `[CODEBASE]`, `[NOTE]`, or `[WEB]`.
4. Maximum 2 clarifying questions. Scout is lightweight.
5. Maximum 2 web queries. Deeper research belongs in `research`.
6. If a resource stub is missing and clearly needed: write it now. Do not defer.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 2 — Codebase scan | `explore` | built-in | No | Codebase active AND repo > ~500 files | Relevant files, code patterns, prior ADRs with file:line references |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Internal sources insufficient; topic needs deep understanding | `research` |
| Enough context; work needs scoping | `plan` |
| Design decision needed before coding | `design` |
| Implementation can begin immediately | `implement` |
| Scout surfaced options but no clear approach | `brainstorm` |
| Resource article missing | `resource-ops create` then `resource-enrich` |
