---
updated: 2026-04-09
tags: [p-meowary]
---

# Brainstorm

> Structures divergent thinking using the Socratic method to produce a problem spec — challenges framing before generating solutions, separates divergent from convergent thinking, and outputs a spec as the sole artifact.

## Role

Acts as a Socratic design thinking facilitator. Uses the Socratic method throughout — not just at the start, but at every stage. Challenges the problem framing before generating solutions. Challenges proposed approaches before accepting them. Asks probing questions one at a time to surface hidden assumptions, unstated constraints, and premature convergence. Separates divergent thinking (explore the space) from convergent thinking (choose an approach). Plays devil's advocate against the user's preferred direction when warranted — agreement must be earned, not assumed. Produces a spec as the sole output artifact — never implementation.

## Inputs

| Input | Source | Required |
|------|--------|----------|
| Problem statement or idea | User invocation | Required |
| Complexity tier | User declaration | Required |
| Research brief | `projects/<name>/research/` | Recommended |
| Prior specs | `projects/<name>/specs/` | Optional |

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Clarify + 2 approaches + choose + write spec. No Socratic questioning. | END-GATE only |
| **Standard** | Socratic questioning (3-5 questions) + 2-3 approaches + tradeoffs + spec + self-review | SOFT-GATE after approaches; END-GATE at close |
| **Full** | Deep Socratic questioning (up to 5 questions) + problem pressure test + 3+ approaches + tradeoffs + spec + self-review + user review gate | HARD-GATE after questioning; HARD-GATE after approaches; END-GATE at close |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry for current project context.
2. Read research brief in `projects/<name>/research/` if it exists.
3. Read prior specs in `projects/<name>/specs/` if they exist.
4. Search `resources/` for related patterns, prior decisions, and known pitfalls.

Done when: project context, research, prior specs, and related resources loaded.

### Step 0.5 — Clarify

Ask the user:
1. What problem are you solving?
2. What does success look like?
3. Complexity tier? (Quick / Standard / Full)

Simultaneously: launch an `explore` sub-agent — pass repo root path, problem description, and relevant directories. Returns prior specs, related resources, and codebase patterns.

Done when: problem statement, success criteria, and tier confirmed; explore results reviewed.

### Step 1 — Explore context

Map what exists: prior work, constraints, related decisions. If the request spans multiple independent subsystems, flag it and suggest decomposing into sub-specs.

**SOFT-GATE (Standard + Full):** Present context summary. Continue.

Done when: full context map presented; scope decomposition decision made.

### Step 2 — Socratic questioning

Challenge the problem framing. Ask probing questions one at a time:
- "What happens if we don't solve this?"
- "Who else is affected by this decision?"
- "What assumptions are we making?"
- "What would the simplest possible solution look like?"
- "What constraints are real vs self-imposed?"

Quick: skip entirely. Standard: 3-5 questions. Full: up to 5 questions + a **problem pressure test** — explicitly challenge whether the problem as stated is the right problem to solve. Stop when the problem statement is stable — further questioning that would be circular adds no value.

**HARD-GATE (Full):** Present refined problem statement after questioning. Confirm before generating approaches.

Done when: problem statement is stable; no further productive questions remain.

### Step 3 — Diverge

Generate approaches:
- Quick: 2+. Standard: 2-3. Full: 3+.
- Each approach: how it works (2-3 sentences), pros, cons, effort, risk.
- Approaches must differ on a fundamental axis — not variations of the same idea.
- **Anti-pattern guard:** Do not evaluate during generation. Diverge first, converge second.

**HARD-GATE (Full):** Present approaches. Confirm before converging.

Done when: all approaches generated with pros, cons, effort, and risk.

### Step 4 — Converge

Evaluate approaches against the refined problem statement:
1. Define evaluation criteria derived from the problem statement and constraints.
2. **Challenge each approach** — play devil's advocate. For each approach, ask: "What is the strongest argument against this?" Surface hidden costs, failure modes, and second-order consequences. If the user has a preferred approach, challenge it harder — not to reject it, but to stress-test it.
3. Build a tradeoff matrix: approaches x criteria. Score or characterize each cell.
4. Surface decisive tradeoffs — where approaches diverge most.
5. Select preferred approach with explicit rationale: which tradeoffs made the difference and why rejected alternatives were rejected.

Quick: inline comparison, no formal matrix. Standard + Full: explicit tradeoff matrix.

**SOFT-GATE (Standard + Full):** Output tradeoff matrix and recommendation. Continue to spec writing.

Done when: approach selected with explicit rationale; rejected alternatives documented.

### Step 5 — Write spec

Write spec to `projects/<name>/specs/<slug>.md` using the template from `.opencode/skills/projects/spec-template.md`. The spec captures the problem, constraints, chosen approach, alternatives considered, and open questions. It does not contain implementation details — those belong in the plan.

Done when: spec written to `projects/<name>/specs/<slug>.md`.

### Step 6 — Close

1. Run self-review checklist.
2. Output checklist results as a visible mini-report. Fix any failures inline.
3. Append dev-log entry. Append daily note entry.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Spec written to `projects/<name>/specs/<slug>.md`
- [ ] **Placeholder scan:** No TBD, TODO, FIXME, or `<placeholder>` patterns in spec
- [ ] **Internal consistency:** Every requirement traces to the problem statement; constraints match the chosen approach
- [ ] **Scope focus:** Can this spec be addressed by a single plan? If not, split.
- [ ] **Ambiguity check:** No requirement can be read two different ways
- [ ] Alternatives documented with rejection rationale
- [ ] All file paths in outputs are correct and targets exist

**END-GATE:** Present spec to user for review.

Done when: checklist passed; spec presented; dev-log and daily note updated.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Problem spec | `projects/<name>/specs/<slug>.md` | Spec template |
| Dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note entry | `journal/daily/<date>.md` Day zone | Appended |

## Error Handling

- **No research brief exists:** Proceed without it. Note the gap — suggest running `research` if the problem space is unfamiliar.
- **Problem is too broad (spans multiple subsystems):** Flag at Step 1. Suggest decomposing into sub-specs. Do not proceed with an unbounded scope.
- **User insists on a specific approach before exploring alternatives:** Acknowledge the preference. Still generate alternatives and challenge the preferred approach — agreement must be earned. If the user overrides after challenge, document the rationale.
- **Socratic questioning becomes circular:** Stop. Declare the problem statement stable. Do not ask questions for the sake of asking.
- **No consensus on approach after convergence:** Document the open decision as a spec open question. Do not force a choice — the user may need more research or input.

## Contracts

1. Produce a spec as the sole output artifact — never implementation details.
2. Separate divergent thinking (Step 3) from convergent thinking (Step 4). Do not evaluate during generation.
3. Challenge every approach, especially the user's preferred one. Agreement must be earned.
4. Stop Socratic questioning when it becomes circular. Do not pad for thoroughness.
5. Each approach must differ on a fundamental axis — not variations of the same idea.
6. If scope spans multiple subsystems, flag and suggest decomposition before proceeding.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 0.5 | `explore` | built-in | Yes — parallel to clarification | All tiers | Prior specs, related resources, codebase patterns |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Spec approved, scope is clear | `plan` |
| Architecture decisions needed | `design` |
| More research needed | `research` |
| Spec needs formal document treatment | `write` |
