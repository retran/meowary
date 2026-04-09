---
updated: 2026-04-07
tags: []
---

# Resource-Plan

> Reviews the entire `resources/` knowledge graph and produces an ordered operation plan (`resources-actualize-plan.md`). Planning-only workflow — identifies problems (merges needed, splits needed, missing nodes, deletions, reclassifications, missing cross-references) but makes no changes to articles. The plan it produces is consumed by `resource-ops` and `resource-enrich`. Invoke before a batch actualization session, after a large `resource-sync`, or as part of periodic graph hygiene.

## Role

Acts as a rigorous knowledge graph planner. Reviews the full graph — not just problem articles — because structural decisions (merge, split, reclassify) require global visibility. Makes no edits during planning; records all decisions in the plan file. Every article surviving structural operations gets an `actualize` entry — no article escapes review.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| `resources/` directory | Repo | Required |
| `meta/tags.md` | `meta/` | Required |
| `meta/confluence-sync.json` | `meta/` | Optional |
| Health/report scripts | `.opencode/scripts/` | Required |

## Complexity Tiers

Not applicable. Fixed-procedure workflow — all steps are mandatory.

## Steps

### Step 0 — Load context

1. Read today's daily note — find any tasks matching this workflow.
2. Check `resources-actualize-plan.md` for the previous plan — note what was completed and what remains.

Done when: daily note checked; previous plan state noted.

### Step 0.5 — Clarify

1. If the scope is ambiguous (full graph vs. specific subfolder), ask the user.
2. If there is an existing unfinished plan, ask: full regeneration or append-only review?
3. If specific focus areas are known (e.g., "the people subfolder is overdue"), note them before scanning.

Done when: scope and regeneration mode confirmed.

### Step 1 — Orient

1. Browse the `resources/` directory tree to understand current coverage.
2. Read `meta/tags.md` — understand the tag taxonomy.
3. Check `meta/confluence-sync.json` for monitored pages and last-sync dates.

Done when: directory structure, tag taxonomy, and Confluence coverage understood.

### Step 2 — Scan all articles

Run automated reports first for an overview:
```
node .opencode/scripts/report-resources.js --sort actualized
node .opencode/scripts/health-all.js
```

Then build a mental model of every article — what it actually covers, not just its title.

**Sub-agent trigger:** Always spawn the `graph-auditor` agent (`.opencode/agents/graph-auditor.md`) for this step. Pass: repo root path, staleness threshold in days (default: 90), and paths to health report scripts in `.opencode/scripts/`. The agent returns a structured health report with counts for stale, orphaned, tag-issue, and missing-stub articles. Never run inline — Step 2 requires reading every article in `resources/` plus scanning inbound links across the entire journal and projects tree; isolating this keeps the main workflow context clean for planning and writing.

Done when: health report received from `graph-auditor`; article coverage understood.

### Step 3 — Identify graph problems

Check systematically for all six problem types:

**a. Merges** — two or more articles covering the same concept with significant overlap.

**b. Splits** — articles covering two or more distinct concepts. Symptoms: >80 lines, sections on unrelated subtopics, linked only for one section. (>80 lines is a length signal, not a hard rule; judgment required on topic coherence.)

**c. New nodes** — concepts mentioned in multiple articles but with no dedicated article. Also search `journal/daily/`, `journal/weekly/`, `projects/` for recurring concepts. Use `qmd query "<concept>"` to check. Only list concepts appearing in 2+ sources or substantial enough for a dedicated article. (2+ sources as a signal that the concept has breadth beyond one context.)

**d. Deletions/archiving** — stubs with no useful content, duplicates fully covered elsewhere, topics no longer relevant.

**e. Reclassifications** — articles in the wrong subfolder, incorrect/missing tags, filenames that don't match content.

**f. Missing cross-references** — pairs of articles that clearly relate but don't link to each other.

Done when: all six problem types checked; findings documented for Step 4.

### Step 4 — Produce the operation plan

Write `resources-actualize-plan.md`:

```markdown
---
type: meta
updated: YYYY-MM-DD
tags: []
---

# Resources Actualize Plan

Generated: YYYY-MM-DD HH:MM
Scope: <all resources | resources/subfolder/>

## Operation Queue

| # | Op | Target | Details |
|---|-----|--------|---------|
| 1 | delete | resources/path/article.md | Reason |
| 2 | merge | resources/path/keep.md ← resources/path/absorb.md | Why they overlap |
| 3 | reclassify | resources/old/path.md → resources/new/path.md | Why it belongs elsewhere |
| 4 | split | resources/path/big.md → resources/path/new1.md + new2.md | What concepts to extract |
| 5 | create | resources/subfolder/new-concept.md | What concept; mentioned in X, Y, Z |
| 6 | actualize | resources/path/article.md | What needs enrichment |

## Missing Cross-References

| Article A | Article B | Relationship |
|---|---|---|
| path/a.md | path/b.md | How they relate |

## Notes

Free-form observations about structure, coverage gaps, strategic recommendations.
```

**Operation ordering rule:** delete → merge → reclassify → split → create → actualize. (This order ensures: no dead content is enriched; merges happen before creates to avoid redundant new articles; structural moves happen before enrichment.)

**Exhaustive actualize coverage:** every article surviving structural operations must have an `actualize` entry. No article left un-actualized — including every `resources/people/` file.

Done when: `resources-actualize-plan.md` written with all operations ordered correctly.

### Step 5 — Commit

```
git add resources-actualize-plan.md
git commit -m "Generate resources actualize plan: N operations"
```

Done when: commit created.

### Step 6 — Close

1. Append to `meta/resources-log.md`:
   ```
   - **YYYY-MM-DD:** r-plan | N operations planned
   ```
2. Append work log entry to `## Day` zone of today's daily note.
3. Mark any matching task items as done.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Plan covers all identified gaps
- [ ] Priority order is justified
- [ ] Health metrics baseline documented
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: log entry appended; daily note updated.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| `resources-actualize-plan.md` | Repo root | Markdown |
| `meta/resources-log.md` entry | `meta/` | Append entry |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | Git commit |

## Error Handling

- **`report-resources.js` or `health-all.js` fail:** Note the failure; proceed with manual browse of `resources/` directory. Do not block on script failure.
- **Existing unfinished plan:** Ask the user: full regeneration or append-only? Never silently overwrite a plan with unresolved operations.
- **`resources/` is empty or very sparse:** Note the state; produce a minimal plan with `create` entries for obvious missing nodes. The plan file must exist even if it contains only a few entries.

## Contracts

1. Read-only during Steps 1–3. No edits to any article during planning.
2. Full graph review; no partial scans unless explicitly scoped by user.
3. Every article surviving structural operations must have an `actualize` entry.
4. Operation ordering is mandatory: delete → merge → reclassify → split → create → actualize.

## Sub-Agents

| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| Step 2 — Scan all articles | `graph-auditor` | custom | No — single | Always | Structured health report: stale, orphaned, tag issues, missing stubs, summary counts |

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Plan generated; structural ops are first in queue | `resource-ops` |
| Plan generated; actualize entries ready | `resource-enrich` (one article at a time) |
| Confluence sync is overdue before enriching | `resource-sync` |
