---
updated: 2026-04-07
tags: []
---

# Design

> Architecture decision workflow. Answers "I need to decide how to build this before writing code." Produces a structured options exploration, a tradeoff matrix, and a decision record (ADR). Enforces genuine option diversity — at least three distinct options before any convergence — and requires explicit rationale for the chosen approach and all rejected alternatives. Invoke after `plan` when a design question needs resolution before implementation.

## Role

Acts as a rigorous architecture decision facilitator. Generates genuinely distinct options — not variations of the same approach. Evaluates tradeoffs honestly. Records the decision rationale and the rationale for rejected alternatives. If the decision reveals a new constraint that changes plan scope, surfaces the replan immediately.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Design question or problem statement | User / plan | Required |
| Complexity tier | User declaration | Required |
| Charter (constraints, non-negotiables) | `projects/<name>/plans/charter.md` | Recommended |
| Codebase context | `codebases/<name>.md` | If codebase is active |
| Research brief | `projects/<name>/research/` | Optional |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Frame + ≥2 options + choose; no formal ADR; inline decision note | END-GATE only |
| **Standard** | All steps; ≥3 options; tradeoff matrix; ADR draft | SOFT-GATE after options; END-GATE at close |
| **Full** | All steps; ≥3 options; full tradeoff matrix; ADR via `write`; replan suggestion if needed | HARD-GATE (Full): after frame; HARD-GATE (Full): after options; HARD-GATE (Full): before decide |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry for current project context.
2. Read `projects/<name>/plans/charter.md` for constraints and non-negotiables.
3. Check `projects/<name>/design/` for prior ADRs on this topic.
4. Load `codebases/<name>.md` for relevant architecture patterns.
5. Read today's daily note — find any tasks matching this design work.

Done when: project state, charter, prior ADRs, and architecture context loaded.

### Step 0.5 — Clarify

Ask the user:
1. What decision needs to be made? What does "chosen option" look like?
2. Complexity tier: Quick / Standard / Full?
3. What constraints apply? (pull from charter, ask if not documented)

Simultaneously: launch an `explore` sub-agent to search `resources/` for prior ADRs and architecture patterns, and scan the codebase for existing implementations and precedents. Pass: design topic and project name. Merge results before Step 2.

Also: search the web for best practices on this design problem if internal sources are sparse.

Do not proceed until the decision question is concrete.

Done when: decision question, constraints, and tier confirmed; `explore` results merged.

### Step 1 — Scout

1. If `scout` was already run for this topic this session: load its output.
2. Otherwise: run `scout` for prior ADRs, design patterns, and architecture resources on this topic.
3. Scan `resources/` for architecture patterns relevant to the decision.
4. Check external documentation or ADR repositories if relevant.

Done when: prior ADRs and relevant architecture patterns surfaced.

### Step 2 — Frame

Articulate the design problem explicitly:
- What decision needs to be made?
- What are the constraints? (from charter)
- What are the evaluation criteria?
- What does success look like?

**HARD-GATE (Full):** Present frame to user; confirm before exploring options.

Done when: decision question, constraints, evaluation criteria, and success criteria written.

### Step 3 — Explore

Generate options:
- Full/Standard: ≥3 genuinely distinct options. Quick: ≥2.
- Options must differ on a fundamental axis (different algorithms, architectural boundaries, data models) — not minor variations of the same approach. If genuinely only two approaches exist, state this explicitly rather than padding.

For each option:
- How it works (2–3 sentences)
- Pros (concrete benefits relative to evaluation criteria)
- Cons (concrete drawbacks)
- Effort: small / medium / large
- Risk: what could go wrong

**Anti-pattern:** Do not evaluate or rank options during this step. Generate first, evaluate second.

Research each option proactively — look up docs, examples, prior implementations.

**Sub-agent triggers (Standard + Full):**
- For each option, launch an `explore` agent (parallel) to search `resources/` and codebase for internal evidence — one agent per option.
- For options requiring external documentation: launch `url-fetcher` agents (parallel) — one per URL.
- Integrate all agent results before building the tradeoff matrix.

**HARD-GATE (Standard + Full):** Present options to user; confirm before building tradeoff matrix.

Done when: all options generated with pros/cons/effort/risk; sub-agent results integrated.

### Step 4 — Compare (Standard + Full)

1. Build tradeoff matrix: options × evaluation criteria.
2. Score or characterize each cell honestly.
3. Surface the decisive tradeoffs — where options diverge most.
4. Note criteria where all options perform similarly (non-decisive).

Skip for Quick tier.

Done when: tradeoff matrix written; decisive and non-decisive criteria identified.

### Step 5 — Decide

1. Select one option.
2. State the rationale explicitly: which tradeoffs made the difference.
3. Record rejected alternatives and why they were rejected — this is as important as the chosen option.
4. If the decision reveals a new constraint that changes plan scope: note it explicitly and suggest `plan replan`.

**HARD-GATE (Full):** Present decision + rationale to user; confirm before writing ADR.

Done when: chosen option stated with rationale; rejected alternatives documented with reasons.

### Step 6 — Close

- **Quick:** write inline decision note to `projects/<name>/notes/design-<topic>.md`. Use abbreviated ADR format.
- **Standard + Full:** write ADR draft to `projects/<name>/design/adr-<slug>.md` using the ADR format below. For Full tier, suggest chaining to `write` to finalize.

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
<What decision needs to be made and why. What constraints apply.>

## Options Considered
### Option A: <name>
<How it works. Pros. Cons. Effort. Risk.>

## Tradeoff Matrix
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|

## Decision
**Chosen:** Option <X>
**Rationale:** <Why this option. Which tradeoffs were decisive.>
**Rejected alternatives:**
- Option A: <why rejected>

## Consequences
<What changes as a result of this decision.>

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

2. Append work log entry to `## Day` zone of today's daily note.
3. Mark matching task items as done.
4. Enrich `resources/` with new architecture patterns discovered.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Decision record has clear rationale
- [ ] All considered options documented with trade-offs
- [ ] Cross-references to related resources added
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: decision record written; dev-log entry appended; daily note updated.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Options exploration and ADR | `projects/<name>/design/adr-<slug>.md` | Markdown (Standard + Full) |
| Inline decision note | `projects/<name>/notes/design-<topic>.md` | Markdown (Quick) |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **Only two genuinely distinct options exist:** State this explicitly; do not fabricate a third. Proceed with two options.
- **Charter missing:** Ask the user for constraints inline; proceed with those. Note the missing charter.
- **Decision reveals a blocking constraint not in the charter:** Stop. Surface the constraint; update the charter; suggest `plan replan` before proceeding.
- **Prior ADR conflicts with the proposed decision:** Surface the conflict explicitly; ask the user whether to supersede the prior ADR.

## Contracts

1. Options must be genuinely distinct. Padding with minor variations is forbidden.
2. Rejected alternatives must be documented with explicit reasons. This is non-negotiable.
3. ADRs are never deleted. Reversed decisions get a new ADR with `superseded-by:` on the old one.
4. If the decision changes plan scope: surface the replan. Do not silently absorb scope changes.
5. Evaluation criteria come before scoring — set them during Frame, not during Compare.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 0.5 — Clarify | `explore` | built-in | Yes — parallel to clarification | All tiers | Prior ADRs, codebase patterns, resource articles relevant to the decision |
| Step 3 — Explore | `explore` | built-in | Yes — one per option | ≥3 options; Standard + Full | Internal evidence for/against each option with file:line references |
| Step 3 — Explore | `url-fetcher` | custom | Yes — one per URL | External docs needed for an option | Source note in `resources/sources/` with extracted facts |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| ADR needs to be finalized as a formal document | `write` |
| Decision made; implementation can proceed | `implement` |
| New constraint discovered that changes plan scope | `plan replan` |
| Further research needed to validate chosen option | `research` |
| Design needs broader exploration of solution space | `brainstorm` |
