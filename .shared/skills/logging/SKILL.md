---
type: skill
skill: logging
description: Canonical logging rules for dev-log and daily note entries — formats, enforcement, and contracts. Load when any workflow closes with work completion.
updated: 2026-05-06
tags: []
---

<role>Logging steward — ensures continuity via atomic dev-log + daily note updates.</role>

<summary>
> Every workflow that does work MUST log. Dev-log is the continuity layer; daily note is the episodic record. Logging is atomic (both or neither) and verifiable (consistent format). Workflows that read-only or update non-project state DO NOT log to dev-logs.
</summary>

<principles>
1. **Work = log.** If a workflow changes project state (code, docs, plans, specs), it MUST append dev-log + daily note.
2. **Atomic.** Dev-log entry and daily note entry are written together or not at all.
3. **Format consistency.** Machine-parseable structure enables tooling, search, and continuity checks.
4. **Append-only.** NEVER edit past dev-log entries. Add new entry if correction needed.
</principles>

<contracts>

## Workflows that MUST log

| Workflow | Dev-log | Daily note | Reason |
|----------|---------|------------|--------|
| `implement` | ✅ | ✅ | Changes code/artifacts |
| `design` | ✅ | ✅ | Creates design artifacts |
| `plan` | ✅ | ✅ | Creates/updates plan |
| `research` | ✅ | ✅ | Creates research artifacts |
| `brainstorm` | ✅ | ✅ | Creates spec |
| `self-review` | ✅ | ✅ | Creates review report |
| `resolve` | ✅ | ✅ | Applies changes |
| `debug` | ✅ | ✅ | Creates debug notes/fixes |
| `test` | ✅ | ✅ | Creates test artifacts |
| `write` | ✅ | ✅ | Creates documents |
| `resource-enrich` | ✅ | ✅ | Modifies knowledge graph |
| `resource-sync` | ✅ | ✅ | Syncs external sources |
| `resource-ingest` | ✅ | ✅ | Creates resource articles |
| `resource-discover` | ✅ | ✅ | Maps knowledge graph |
| `resource-plan` | ✅ | ✅ | Creates KG operation plan |

## Workflows that MUST NOT log to dev-logs

| Workflow | Dev-log | Daily note | Reason |
|----------|---------|------------|--------|
| `morning` | ❌ | ✅ (creates) | Reads dev-logs, creates daily note |
| `evening` | ❌ | ✅ (updates) | Processes daily note, updates context.md |
| `standup` | ❌ | ❌ | Read-only summary |
| `weekly` | ❌ | ✅ (creates) | Wrapper, creates weekly note |
| `capture` | ❌ | ✅ (appends Inbox) | Fast capture, no project work |
| `scout` | ❌ | ❌ (optional) | Read-only navigation |
| `peer-review` | ❌ | ✅ (optional) | External PR, may comment but not internal dev-log |
| `meeting` | ❌ | ✅ (links) | Creates meeting note, cross-links to daily |
| `resource-ops` | ❌ | ❌ | Meta-workflow, dispatches to others |

</contracts>

<formats>

## Dev-log entry format

**Location:** `projects/<name>/dev-log.md`

**Action:** Append to TOP (after heading comment), newest-first

**Required structure:**
```markdown
## YYYY-MM-DD — <workflow> — <topic>

**Phase:** <workflow-name>
**Summary:** <1-3 sentences describing what was done>
**Next:** <suggested-next-workflow | monitor | none>
```

**Optional fields** (add if applicable, in this order):
```markdown
**Key findings:** <bullet list> (research, scout)
**Key decisions:** <bullet list> (design, implement)
**Findings:** N blockers, N majors, N minors, N nits (self-review)
**Resolved:** <which findings fixed> (self-review, resolve)
**Deferred:** <tasks pushed out; reason> (any workflow)
**Artifacts:** <file paths created/modified> (any workflow)
**Commit:** <commit-hash> — "<message>" (implement, resolve, self-review)
```

**Example:**
```markdown
## 2026-05-06 — implement — OAuth callback server

**Phase:** implement
**Summary:** Implemented OAuth callback server with port-range support (5 fixed ports). Created IMcpOAuthCallbackServer interface, MonolithicOAuthCallbackServer class, integrated with handler. Tests pass 100%.
**Key decisions:** Monolithic server class following McpDedicatedHttpServer precedent. Interface for testability.
**Deferred:** C# unit tests (defer to follow-up PR)
**Artifacts:** `McpOAuthCallbackServer.cs`, `IMcpOAuthCallbackServer.cs`, `CallbackResult.cs`, `McpHandler.cs` (modified)
**Commit:** a1b2c3d — "Implement OAuth callback server with port-range support"
**Next:** self-review
```

## Daily note entry format

**Location:** `journal/daily/YYYY-MM-DD.md` in `## Day` zone

**Action:** Append one-liner (not in a sub-section unless specified)

**Format:**
```markdown
- /<workflow> <project> — <one-line summary>
```

**Example:**
```markdown
- /implement mcp-client — OAuth callback server with 5-port range, tests pass
```

**Special cases:**
- `/capture` → appends to `## Day > ### Inbox` with just content (no workflow prefix)
- `/morning` → creates `## Morning` section with MITs and calendar
- `/evening` → updates `## Evening` section with completed/carried/dropped
- `/meeting` → creates meeting note, appends cross-link to `## Day > ### Events`

</formats>

<enforcement>

## Self-review checklist (Close step)

Every workflow that logs MUST include this checklist in Close step's `<self_review>` block:

```markdown
<self_review>
- [ ] All `<done_when>` criteria met
- [ ] Dev-log entry appended to `projects/<name>/dev-log.md`
- [ ] Work log appended to today's daily note `## Day` zone
- [ ] Task items marked done (if applicable)
- [ ] Resources enriched or explicitly noted as not needed
- [ ] No placeholders (TBD, TODO, FIXME) in outputs
- [ ] All output file paths correct, targets exist
</self_review>
```

## Workflow Close step template

```markdown
<step n="N" name="Close" gate="END-GATE">
1. Append dev-log entry per logging skill:

   File: `projects/<name>/dev-log.md` (append to top, after heading comment)

   ```markdown
   ## YYYY-MM-DD — <workflow> — <topic>
   **Phase:** <workflow-name>
   **Duration:** ~<estimate>
   **Summary:** <1-3 sentences>
   **Next:** <suggested-next>
   ```

2. Append work log to `## Day` zone of today's daily note: `journal/daily/YYYY-MM-DD.md`

   ```markdown
   - /<workflow> <project> — <one-line summary>
   ```

3. Mark matching task items done in project README or daily note.

4. **Resource enrichment** — scan session for durable knowledge. For each:
   - Existing article in `resources/`? → append fact with source link.
   - No article? → create stub (front matter + H1 + 1-sentence fact).
   - Nothing durable? → note "no enrichment needed" in dev-log entry.

<self_review>
- [ ] All `<done_when>` criteria met
- [ ] Dev-log entry appended to `projects/<name>/dev-log.md`
- [ ] Work log appended to today's daily note `## Day` zone
- [ ] Task items marked done (if applicable)
- [ ] Resources enriched or explicitly noted as not needed
- [ ] No placeholders (TBD, TODO, FIXME) in outputs
- [ ] All output file paths correct, targets exist
</self_review>

<done_when>Dev-log entry appended; daily note updated; tasks marked done; resources enriched or explicitly noted as not needed.</done_when>
</step>
```

</enforcement>

<error_handling>

**Missing dev-log file:**
- If `projects/<name>/dev-log.md` missing: create from template at `{{AGENT_DIR}}/skills/projects/dev-log-template.md` before appending

**Missing daily note:**
- If today's daily note missing: create from template at `{{AGENT_DIR}}/skills/journal/daily-template.md` before appending

**Duplicate entries:**
- NEVER append duplicate dev-log entries (same date + workflow + topic)
- Check last entry before appending; if match, skip or update `**Summary:**` inline

**Logging after error:**
- If workflow fails mid-execution, still append dev-log with `**Summary:** Failed — <reason>` and `**Next:** debug | replan`

</error_handling>

<validation>

## Post-session validation

Users can run validation script to check logging completeness:

```bash
node {{AGENT_DIR}}/scripts/validate-logs.js
```

Checks:
- Every active project in `context/context.md` has dev-log
- Last dev-log entry date ≤ today
- Today's daily note exists
- Daily note `## Day` zone has ≥1 entry (or Inbox populated)

</validation>

<output_rules>
- Language: English (dev-log and daily note entries)
- Date format: `YYYY-MM-DD`
- Duration format: `~N min` or `~N hr` (approximate, human-readable)
- Commit format: `<hash> — "<message>"` (if applicable)
</output_rules>
