---
type: reference
updated: 2026-04-18
tags: [p-meowary]
---

<role>Workflow conventions reference — canonical structure, gates, sections, and language for all `.opencode/workflows/` files.</role>

<summary>
> Canonical structure, format, and vocabulary for all workflow files in `.opencode/workflows/`. Every workflow MUST conform. Load when writing or editing workflows.
</summary>

# Workflow Conventions

<step_numbering>
- Format: `### Step N — Name`
- Step 0 ALWAYS `### Step 0 — Load context`
- Step 0.5 ALWAYS `### Step 0.5 — Clarify`
- Final step ALWAYS named `Close`: `### Step N — Close`
- Every step ENDS with `Done when:` line
- Sub-steps: see §5 for decimal vs letter-suffix formats
</step_numbering>

<gate_vocabulary>
Three gate types. Every workflow with gates MUST use these exact formats:

| Gate | Behavior | Format | When |
|------|----------|--------|------|
| **HARD-GATE** | Stop. Present output. Wait for explicit user confirmation before continuing. | `**HARD-GATE (Tier):**` | Before irreversible actions or scope commitments |
| **SOFT-GATE** | Output intermediate results. Run self-check. Continue without pausing. | `**SOFT-GATE (Tier):**` | Mid-workflow quality checkpoints |
| **END-GATE** | Present final deliverables at Close step. | `**END-GATE:**` | Always present at Close step |

- Tier annotation REQUIRED for HARD-GATE and SOFT-GATE: `(Full)`, `(Standard + Full)`, etc.
- END-GATE has NO tier annotation — applies to all tiers.
- NO other gate terms (Mid-gate, End gate, "hard contract") are valid.
</gate_vocabulary>

<structural_sections>
Every workflow file MUST include these sections in this order:

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
11. `## Sub-Agents` — table: `Step | Agent | Type | Parallel? | Trigger | Output` (include only when workflow uses agents; omitting means none)
12. `---` horizontal rule
13. `*Suggested next steps (present, do not run):*` — italic (asterisk), then table: `Condition | Suggested next workflow`
</structural_sections>

<workflow_modes>
When workflow has multiple modes (e.g., initial plan + replan, Monday + Friday), each mode has own step sequence under `## Steps — <Mode>` heading. Step numbering RESTARTS at Step 0 within each mode.

When workflow has multiple discrete operation types sharing contracts but differing in sub-steps (e.g., resource-ops: create, rename, merge, split, delete, archive), USE `## Steps — <Operation>` headings with prefixed step names (e.g., `### Create Step 0 — Clarify`). A shared Close section is valid but MUST be a numbered step.
</workflow_modes>

<sub_step_numbering>
Two valid formats:

- **Decimal:** `### Step 3.1 — Name` — for sub-steps that are separate procedural steps with own `Done when:` line.
- **Letter-suffix:** `**2a. Name**` / `**2b. Name**` — for parallel or grouped sub-activities within single step sharing one `Done when:` line.

DO NOT mix formats within same step.
</sub_step_numbering>

<self_review_checklist>
Every workflow MUST include self-review checklist as **second-to-last sub-step of Close step**, before END-GATE. Format:

```markdown
**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] <workflow-specific check 1>
- [ ] <workflow-specific check 2>
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist
```

The agent runs checklist and outputs results as visible mini-report. FAILED checks MUST be fixed before END-GATE presents final deliverables.
</self_review_checklist>

<language>
- American English throughout. NO British spellings (analyze, not analyse; organize, not organise).
- Imperative voice for instructions.
- NO filler words, NO marketing language.
</language>

<formatting>
- Asterisk italic for emphasized text: `*text*`, NOT `_text_`
- Compact pipe tables (no extra whitespace padding)
- 3-column Outputs table: `Output | Location | Format`
- Code blocks with language identifiers
</formatting>

<dev_log_daily_note>
Lifecycle workflows (those with `## Complexity Tiers` table declaring Quick/Standard/Full) write dev-log and daily note entries at Close. All other workflows (fixed-procedure, daily) DO NOT write dev-log entries.

DO NOT include `## dev-log Update` section. Handle dev-log writes inside the Close step.
</dev_log_daily_note>

<output_rules>
Output language: English. Headings, gate names, section labels remain literal.
</output_rules>
