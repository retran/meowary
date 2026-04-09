---
type: reference
updated: 2026-04-09
tags: [p-meowary]
---

# Workflow Conventions

Canonical structure, format, and vocabulary for all workflow files in `.opencode/workflows/`. Every workflow must conform. Load this reference when writing or editing workflows.

---

## 1. Step Numbering

- Format: `### Step N — Name`
- Step 0 is always `### Step 0 — Load context`
- Step 0.5 is always `### Step 0.5 — Clarify`
- The final step is always named `Close`: `### Step N — Close`
- Every step ends with a `Done when:` line
- Sub-steps: see §5 for decimal vs letter-suffix formats

## 2. Gate Vocabulary

Three gate types. Every workflow that uses gates must use these exact formats:

| Gate | Behavior | Format | When |
|------|----------|--------|------|
| **HARD-GATE** | Stop. Present output. Wait for explicit user confirmation before continuing. | `**HARD-GATE (Tier):**` | Before irreversible actions or scope commitments |
| **SOFT-GATE** | Output intermediate results. Run self-check. Continue without pausing. | `**SOFT-GATE (Tier):**` | Mid-workflow quality checkpoints |
| **END-GATE** | Present final deliverables at Close step. | `**END-GATE:**` | Always present at Close step |

- Tier annotation is required for HARD-GATE and SOFT-GATE: `(Full)`, `(Standard + Full)`, etc.
- END-GATE has no tier annotation — it applies to all tiers.
- No other gate terms (Mid-gate, End gate, "hard contract") are valid.

## 3. Structural Sections

Every workflow file must include these sections in this order:

1. YAML front matter (`updated`, `tags`)
2. `# Title` — workflow name as H1
3. `> Blockquote` — one-sentence purpose
4. `## Role` — who the agent acts as
5. `## Inputs` — table: `Input | Source | Required`
6. `## Complexity Tiers` — table or `Not applicable. Fixed-procedure workflow.`
7. `## Steps` — all steps as `### Step N — Name`
8. `## Outputs` — table: `Output | Location | Format`
9. `## Error Handling` — bullet list of failure scenarios and responses
10. `## Contracts` — numbered list of non-negotiable rules
11. `## Sub-Agents` — table: `Step | Agent | Type | Parallel? | Trigger | Output` (include only when the workflow uses agents; omitting means no agents)
12. `---` horizontal rule
13. `*Suggested next steps (present, do not run):*` — italic (asterisk), then table: `Condition | Suggested next workflow`

## 4. Workflow Modes

When a workflow has multiple modes (e.g., initial plan + replan, Monday + Friday), each mode has its own step sequence under a `## Steps — <Mode>` heading. Step numbering restarts at Step 0 within each mode.

When a workflow has multiple discrete operation types that share contracts but differ in sub-steps (e.g., resource-ops: create, rename, merge, split, delete, archive), use `## Steps — <Operation>` headings with prefixed step names (e.g., `### Create Step 0 — Clarify`). A shared Close section is valid but must be a numbered step.

## 5. Sub-Step Numbering

Two sub-step formats are valid:

- **Decimal:** `### Step 3.1 — Name` — for sub-steps that are separate procedural steps with their own `Done when:` line.
- **Letter-suffix:** `**2a. Name**` / `**2b. Name**` — for parallel or grouped sub-activities within a single step that share one `Done when:` line.

Do not mix formats within the same step.

## 6. Self-Review Checklist

Every workflow must include a self-review checklist as the **second-to-last sub-step of the Close step**, before the END-GATE. Format:

```markdown
**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] <workflow-specific check 1>
- [ ] <workflow-specific check 2>
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist
```

The agent runs this checklist and outputs results as a visible mini-report. Failed checks must be fixed before the END-GATE presents final deliverables.

## 7. Language

- American English throughout. No British spellings (analyze, not analyse; organize, not organise).
- Imperative voice for instructions.
- No filler words, no marketing language.

## 8. Formatting

- Asterisk italic for emphasized text: `*text*`, not `_text_`
- Compact pipe tables (no extra whitespace padding)
- 3-column Outputs table: `Output | Location | Format`
- Code blocks with language identifiers

## 9. Dev-Log and Daily Note

Lifecycle workflows (those with a `## Complexity Tiers` table declaring Quick/Standard/Full) write dev-log and daily note entries at Close. All other workflows (fixed-procedure, daily) do not write dev-log entries.

Do not include a `## dev-log Update` section. Handle dev-log writes inside the Close step.
