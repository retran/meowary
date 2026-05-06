---
name: context-gathering
description: Canonical context-gathering patterns for workflows -- QMD semantic search + web search in parallel, query construction, result handling, and resource anchoring. Load when implementing workflow Step 0.5 (Clarify) context-gathering logic. See also qmd skill for CLI mechanics.
compatibility: Requires qmd CLI and websearch capability
updated: 2026-05-07
related: [qmd, query, confluence, jira]
---

<role>Context-gathering authority. Owns how workflows gather internal + external knowledge before generating solutions.</role>

<summary>
> Parallel QMD + web search at workflow Step 0.5 (Clarify). Surface internal knowledge first, external knowledge second. Anchor durable web findings in resource articles. NEVER leave web search findings unanchored. For QMD CLI mechanics (query types, syntax), also load `qmd` skill. For multi-source retrieval (5-tier priority, citations), also load `query` skill.
</summary>

<contracts>

1. **Parallel execution** — `qmd query` and `websearch` run in parallel, never sequential (unless web search conditional on QMD results being sparse).
2. **Timing** — Context gathering happens at Step 0.5 (Clarify), BEFORE solution generation.
3. **Anchoring** — Durable web findings MUST be written to resource articles during or after workflow Close step.
4. **Query specificity** — Use workflow topic, not generic terms. "OAuth port-range error handling" not "error handling".
5. **Result handling** — Read top 3-5 QMD results; skim top 3 web results; note gaps explicitly.

</contracts>

<patterns>

## Pattern 1: Full parallel (default for work workflows)

**When:** All lifecycle workflows (implement, design, plan, research, brainstorm, self-review, resolve, debug, test, write) and resource workflows (enrich, sync, ingest, discover, plan).

**Step 0.5 addition:**
```markdown
Run `qmd query "<topic>"` and `websearch "<topic>"` in parallel to surface internal and external knowledge. Follow references in returned articles until context sufficient. Anchor durable web findings in resource articles.
```

**Example:**
```markdown
<step n="0.5" name="Clarify">
Ask user:
1. What are we building / solving?
2. Complexity tier?
3. Known constraints?

Run `qmd query "<planning topic>"` and `websearch "<planning topic>"` in parallel to surface internal and external knowledge. Follow references in returned articles until context sufficient. Anchor durable web findings in resource articles.

<done_when>Scope, tier, constraints confirmed; context gathered.</done_when>
</step>
```

## Pattern 2: QMD only (read-only workflows)

**When:** Temporal workflows (morning, evening, standup, weekly, capture, scout, meeting) and peer-review.

**Step 0.5 addition:**
```markdown
Run `qmd query "<topic>"` to surface relevant resource articles and prior context from the knowledge graph.
```

**Rationale:** Read-only workflows don't generate new artifacts, so web search less critical. QMD sufficient for discovering existing knowledge.

## Pattern 3: Conditional web search

**When:** QMD results are sparse (≤2 relevant results) or topic unfamiliar.

**Step 0.5 addition:**
```markdown
Run `qmd query "<topic>"` to surface internal knowledge. If results sparse (≤2 relevant) or topic unfamiliar, also run `websearch "<topic>"` for external context. Anchor durable web findings in resource articles.
```

**Example:**
```markdown
Run `qmd query "<design topic>"` to surface relevant resource articles and prior ADRs. If results sparse or topic unfamiliar, also run `websearch "<design topic>"` for external best practices. Anchor findings.
```

</patterns>

<query_construction>

## QMD query format

**Specific, not generic:**
- ✅ `qmd query "OAuth callback server port-range error handling"`
- ❌ `qmd query "error handling"`

**Include workflow context:**
- ✅ `qmd query "MCP client OAuth implementation patterns"`
- ❌ `qmd query "OAuth"`

**Use question form for semantic search:**
- ✅ `qmd query "How does the rate limiter handle burst traffic?"`
- ✅ `qmd query "What testing patterns exist for async handlers?"`

See `{{AGENT_DIR}}/skills/qmd/` for query type details (lex/vec/hyde).

## Web search query format

**Specific, include product/library names:**
- ✅ `websearch "C# HttpListener port-range configuration"`
- ❌ `websearch "port configuration"`

**Best practices and patterns:**
- ✅ `websearch "ADR decision record template best practices"`
- ✅ `websearch "OAuth 2.0 redirect_uri port selection RFC"`

</query_construction>

<result_handling>

## QMD results

1. **Read top 3-5 results** — snippets show relevance.
2. **Follow references** — related articles often have deeper context.
3. **Note gaps** — if ≤2 relevant results, escalate to conditional web search.
4. **Offload bulk reading** — when ≥5 relevant results, spawn `explore` sub-agent to summarize.

## Web search results

1. **Skim top 3 results** — look for authoritative sources (RFCs, official docs, established patterns).
2. **Extract durable facts** — decisions, constraints, known patterns, tradeoffs.
3. **Discard ephemeral** — blog post opinions, outdated tutorials, unverified claims.
4. **Anchor findings** — write to resource article during workflow Close step OR flag for `/r enrich` later.

## Gap reporting

If neither QMD nor web search yields sufficient context:
- **State explicitly:** "No prior work found on X. Proceeding without internal precedent."
- **Flag for later:** Add to workflow's Deferred section or daily note Inbox.

</result_handling>

<anchoring>

## When to anchor

**MUST anchor** (during workflow Close):
- Architecture patterns discovered
- Design tradeoffs from authoritative sources
- Known pitfalls or constraints
- Process decisions from external docs

**MAY defer** (flag for `/r enrich` later):
- Library documentation links
- Tutorial references
- Background concepts already documented elsewhere

## How to anchor

**During workflow Close step:**
1. Identify durable web findings.
2. Check if resource article exists (`qmd query` or browse `resources/`).
3. If exists: append fact with `[web: <url>]` citation.
4. If not: create stub (front matter + H1 + 1 fact sentence + citation).
5. Note anchoring action in dev-log entry.

**Example:**
```markdown
**Artifacts:**
- `projects/mcp-client/specs/oauth-port-error-handling.md`
- `resources/architecture/oauth-port-selection.md` (created stub from RFC 8252 guidance)
```

</anchoring>

<integration>

## Workflow Step 0.5 template

```markdown
<step n="0.5" name="Clarify">
Ask user:
1. [workflow-specific questions]

Run `qmd query "<topic>"` and `websearch "<topic>"` in parallel to surface internal and external knowledge. Follow references in returned articles until context sufficient. Anchor durable web findings in resource articles.

<done_when>[workflow-specific criteria]; context gathered.</done_when>
</step>
```

## Self-review checklist addition

Every workflow that gathers context SHOULD include:
```markdown
- [ ] Context gathered per context-gathering skill (QMD + web search)
```

Not blocking (unlike logging), but recommended for thoroughness.

</integration>

<error_handling>

- **QMD not installed** — Note gap; proceed with web search only. Recommend `npm install -g @tobilu/qmd`.
- **Web search unavailable** — Proceed with QMD only. Note limitation in dev-log.
- **Both unavailable** — Proceed with direct file browsing (`resources/`, `projects/`). Flag tool gap.

</error_handling>

<next_steps>

| Condition | Action |
|-----------|--------|
| Durable web findings | Anchor in resource article during Close OR flag for `/r enrich` |
| Gap in knowledge | Note explicitly; proceed without precedent |
| Sparse QMD results | Escalate to web search (conditional pattern) |
| Many QMD results (≥5) | Spawn `explore` sub-agent to summarize |

</next_steps>

<output_rules>

- Language: English.
- Parallel execution is default; sequential only when conditional.
- Anchoring is mandatory for durable findings.
- Query specificity: workflow topic + context, not generic terms.

</output_rules>
