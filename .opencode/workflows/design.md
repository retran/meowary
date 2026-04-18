---
updated: 2026-04-18
tags: []
---

<role>
Rigorous architecture decision facilitator. Generate genuinely distinct options — NOT variations of same approach. Evaluate tradeoffs honestly. Record decision rationale and rejected alternatives. If decision reveals new constraint changing plan scope: surface replan immediately.
</role>

<summary>
Architecture decision workflow. Produces structured options exploration, tradeoff matrix, and decision record (ADR). Enforces genuine option diversity — ≥3 distinct options before convergence — with explicit rationale for chosen approach and rejected alternatives. Invoke after `plan` when design question needs resolution before implementation.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Design question or problem statement | User / plan | Required |
| Complexity tier | User declaration | Required |
| Charter (constraints, non-negotiables) | `projects/<name>/plans/charter.md` | Recommended |
| Codebase context | `codebases/<name>.md` | If codebase active |
| Research brief | `projects/<name>/research/` | Optional |
</inputs>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Frame + ≥2 options + choose; no formal ADR; inline decision note | END-GATE only |
| Standard | All steps; ≥3 options; tradeoff matrix; ADR draft | SOFT-GATE after options; END-GATE at close |
| Full | All steps; ≥3 options; full tradeoff matrix; ADR via `write`; replan suggestion if needed | HARD-GATE after frame, after options, before decide |
</tiers>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry.
2. Read `projects/<name>/plans/charter.md` for constraints and non-negotiables.
3. Check `projects/<name>/design/` for prior ADRs on topic.
4. Load `codebases/<name>.md` for relevant architecture patterns.
5. Read today's daily note — find tasks matching design work.
<done_when>Project state, charter, prior ADRs, architecture context loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. What decision needs to be made? What does "chosen option" look like?
2. Complexity tier: Quick / Standard / Full?
3. What constraints apply? (pull from charter; ask if not documented)

<subagent_trigger agent="explore" condition="all tiers">
Pass: design topic and project name. Search `resources/` for prior ADRs and architecture patterns; scan codebase for existing implementations and precedents. Merge results before Step 2.
</subagent_trigger>

Search web for best practices on this design problem if internal sources sparse.

DO NOT proceed until decision question concrete.
<done_when>Decision question, constraints, tier confirmed; `explore` results merged.</done_when>
</step>

<step n="1" name="Scout">
1. If `scout` already run for topic this session: load output.
2. Else: run `scout` for prior ADRs, design patterns, architecture resources.
3. Scan `resources/` for architecture patterns relevant to decision.
4. Check external documentation or ADR repositories if relevant.
<done_when>Prior ADRs and relevant architecture patterns surfaced.</done_when>
</step>

<step n="2" name="Frame" gate="HARD-GATE (Full)">
Articulate design problem explicitly:
- What decision needs to be made?
- What constraints apply? (from charter)
- What evaluation criteria?
- What does success look like?

HARD-GATE (Full): Present frame; confirm before exploring options.
<done_when>Decision question, constraints, evaluation criteria, success criteria written.</done_when>
</step>

<step n="3" name="Explore" gate="HARD-GATE (Standard + Full)">
Generate options:
- Full/Standard: ≥3 genuinely distinct options. Quick: ≥2.
- Options MUST differ on fundamental axis (different algorithms, architectural boundaries, data models) — NOT minor variations. If genuinely only two approaches exist: state explicitly. DO NOT pad.

For each option:
- How it works (2–3 sentences)
- Pros (concrete benefits relative to evaluation criteria)
- Cons (concrete drawbacks)
- Effort: small / medium / large
- Risk: what could go wrong

**Anti-pattern:** DO NOT evaluate or rank during this step. Generate first, evaluate second.

Research each option proactively — docs, examples, prior implementations.

<subagent_trigger agent="explore" condition="Standard + Full">
For each option: launch `explore` agent (parallel) — search `resources/` and codebase for internal evidence. One agent per option.
</subagent_trigger>

<subagent_trigger agent="url-fetcher" condition="external documentation needed">
For options requiring external docs: launch `url-fetcher` agents (parallel) — one per URL. Integrate results before tradeoff matrix.
</subagent_trigger>

HARD-GATE (Standard + Full): Present options; confirm before tradeoff matrix.
<done_when>All options generated with pros/cons/effort/risk; sub-agent results integrated.</done_when>
</step>

<step n="4" name="Compare" condition="Standard + Full" skip_if="Quick">
1. Build tradeoff matrix: options × evaluation criteria.
2. Score or characterize each cell honestly.
3. Surface decisive tradeoffs — where options diverge most.
4. Note criteria where all options perform similarly (non-decisive).
<done_when>Tradeoff matrix written; decisive and non-decisive criteria identified.</done_when>
</step>

<step n="5" name="Decide" gate="HARD-GATE (Full)">
1. Select one option.
2. State rationale explicitly: which tradeoffs decided.
3. Record rejected alternatives and why rejected — as important as chosen option.
4. If decision reveals new constraint changing plan scope: note explicitly and suggest `plan replan`.

HARD-GATE (Full): Present decision + rationale; confirm before writing ADR.
<done_when>Chosen option stated with rationale; rejected alternatives documented with reasons.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
- **Quick:** write inline decision note to `projects/<name>/notes/design-<topic>.md` using abbreviated ADR format.
- **Standard + Full:** write ADR draft to `projects/<name>/design/adr-<slug>.md` using format below. Full tier: suggest chaining to `write` to finalize.

ADR format:

```markdown
---
updated: <date>
status: proposed | accepted | superseded
superseded-by: <adr-slug>
tags: [adr, <topic>]
---

# ADR: <title>

## Context
<Decision needed and why. Constraints.>

## Options Considered
### Option A: <name>
<How it works. Pros. Cons. Effort. Risk.>

## Tradeoff Matrix
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|

## Decision
**Chosen:** Option <X>
**Rationale:** <Why this option. Decisive tradeoffs.>
**Rejected alternatives:**
- Option A: <why rejected>

## Consequences
<What changes as a result.>

## Status history
- <date>: proposed
```

Then:
1. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — design — <topic>
**Phase:** design
**Duration:** <estimate>
**Summary:** <what decision was made>
**Options considered:** <list>
**Chosen:** <option + one-line rationale>
**Replan needed:** yes / no — <reason if yes>
**Next:** write (ADR) | implement | plan (replan)
```

2. Append work log to `## Day` zone of today's daily note.
3. Mark matching task items done.
4. Enrich `resources/` with new architecture patterns discovered.

<self_review>
- All `<done_when>` criteria met
- Decision record has clear rationale
- All considered options documented with tradeoffs
- Cross-references to related resources added
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Decision record written; dev-log entry appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Options exploration and ADR | `projects/<name>/design/adr-<slug>.md` | Markdown (Standard + Full) |
| Inline decision note | `projects/<name>/notes/design-<topic>.md` | Markdown (Quick) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
</outputs>

<error_handling>
- **Only two genuinely distinct options exist:** State explicitly. DO NOT fabricate third. Proceed with two options.
- **Charter missing:** Ask user for constraints inline. Proceed with those. Note missing charter.
- **Decision reveals blocking constraint not in charter:** STOP. Surface constraint. Update charter. Suggest `plan replan` before proceeding.
- **Prior ADR conflicts with proposed decision:** Surface conflict explicitly. Ask user whether to supersede prior ADR.
</error_handling>

<contracts>
1. Options MUST be genuinely distinct. Padding with minor variations forbidden.
2. Rejected alternatives MUST be documented with explicit reasons. Non-negotiable.
3. ADRs NEVER deleted. Reversed decisions get new ADR with `superseded-by:` on old one.
4. If decision changes plan scope: surface replan. NEVER silently absorb scope changes.
5. Evaluation criteria come BEFORE scoring — set during Frame, NOT during Compare.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 0.5 | `explore` | built-in | Yes — parallel to clarification | All tiers | Prior ADRs, codebase patterns, resource articles relevant to decision |
| 3 | `explore` | built-in | Yes — one per option | ≥3 options; Standard + Full | Internal evidence for/against each option with file:line references |
| 3 | `url-fetcher` | custom | Yes — one per URL | External docs needed for option | Source note in `resources/sources/` with extracted facts |
</subagents>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| ADR needs to be finalized as formal document | `write` |
| Decision made; implementation can proceed | `implement` |
| New constraint discovered changing plan scope | `plan replan` |
| Further research needed to validate chosen option | `research` |
| Design needs broader exploration of solution space | `brainstorm` |
</next_steps>

<output_rules>
- Language: English.
- Options MUST differ on fundamental axis.
- Rejected alternatives ALWAYS documented with reasons.
- ADRs NEVER deleted — supersede via new ADR.
</output_rules>
