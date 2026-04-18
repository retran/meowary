---
updated: 2026-04-18
tags: []
---

# Resource-Plan

<summary>
> Reviews entire `resources/` graph and produces ordered operation plan (`resources-actualize-plan.md`). Planning-only — identifies problems (merges, splits, missing nodes, deletions, reclassifications, missing cross-refs) but makes no changes. Plan consumed by `resource-ops` and `resource-enrich`.
</summary>

<role>
Rigorous knowledge graph planner. Reviews full graph — structural decisions need global visibility. NEVER edits during planning. Every surviving article gets an `actualize` entry — no article escapes review.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| `resources/` | Repo | Yes |
| `meta/tags.md` | `meta/` | Yes |
| `meta/confluence-sync.json` | `meta/` | Optional |
| Health/report scripts | `.opencode/scripts/` | Yes |
</inputs>

<tiers>Not applicable. All steps mandatory.</tiers>

<steps>

<step n="0" name="Load context">
1. READ today's daily note for matching tasks.
2. CHECK `resources-actualize-plan.md` — note completed and remaining.

<done_when>Daily note checked; previous plan state noted.</done_when>
</step>

<step n="0.5" name="Clarify">
1. If scope ambiguous (full vs subfolder): ASK.
2. If unfinished plan: ASK full regeneration or append-only.
3. If known focus areas: NOTE before scanning.

<done_when>Scope and regeneration mode confirmed.</done_when>
</step>

<step n="1" name="Orient">
1. BROWSE `resources/` tree for current coverage.
2. READ `meta/tags.md` taxonomy.
3. CHECK `meta/confluence-sync.json` for monitored pages and sync dates.

<done_when>Structure, taxonomy, Confluence coverage understood.</done_when>
</step>

<step n="2" name="Scan all articles">
RUN automated reports:
```
node .opencode/scripts/report-resources.js --sort actualized
node .opencode/scripts/health-all.js
```

Build mental model of every article — what it covers, not just title.

<subagent_trigger>ALWAYS spawn `graph-auditor` (`.opencode/agents/graph-auditor.md`). Pass: repo root, staleness threshold (default: 90 days), paths to health scripts. Returns structured health report with counts (stale, orphaned, tag-issue, missing-stub). NEVER inline — Step 2 reads every article + scans inbound across journal/projects; isolating keeps main context clean for planning.</subagent_trigger>

<done_when>Health report received; coverage understood.</done_when>
</step>

<step n="3" name="Identify graph problems">
Check all six problem types:

**a Merges** — multiple articles covering same concept with overlap.

**b Splits** — articles covering distinct concepts. Symptoms: > 80 lines, sections on unrelated subtopics, linked only for one section.

**c New nodes** — concepts mentioned in multiple articles but no dedicated article. Search `journal/daily/`, `journal/weekly/`, `projects/` for recurring. QMD-query to check. List concepts in ≥ 2 sources or substantial enough.

**d Deletions/archiving** — content-less stubs, duplicates fully covered elsewhere, irrelevant topics.

**e Reclassifications** — wrong subfolder, incorrect/missing tags, filenames mismatching content.

**f Missing cross-refs** — clearly related pairs not linking.

<done_when>All six checked; findings documented.</done_when>
</step>

<step n="4" name="Produce operation plan">
WRITE `resources-actualize-plan.md`:

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
| 2 | merge | resources/path/keep.md ← resources/path/absorb.md | Why overlap |
| 3 | reclassify | resources/old/path.md → resources/new/path.md | Why elsewhere |
| 4 | split | resources/path/big.md → resources/path/new1.md + new2.md | What concepts |
| 5 | create | resources/subfolder/new-concept.md | What concept; mentioned in X, Y, Z |
| 6 | actualize | resources/path/article.md | What needs enrichment |

## Missing Cross-References

| Article A | Article B | Relationship |

## Notes

Free-form observations.
```

**Operation ordering:** delete → merge → reclassify → split → create → actualize. (No dead content enriched; merges before creates avoid redundant new articles; structural before enrichment.)

**Exhaustive actualize:** every surviving article MUST have `actualize` entry — including every `resources/people/` file.

<done_when>Plan written with all ops correctly ordered.</done_when>
</step>

<step n="5" name="Commit">
```
git add resources-actualize-plan.md
git commit -m "Generate resources actualize plan: N operations"
```

<done_when>Committed.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
1. APPEND to `meta/resources-log.md`: `- **YYYY-MM-DD:** r-plan | N operations planned`
2. APPEND work log to today's daily note `## Day`.
3. MARK matching tasks done.

<self_review>
- [ ] All `Done when` met
- [ ] Plan covers identified gaps
- [ ] Priority order justified
- [ ] Health metrics baseline documented
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Log appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Plan | `resources-actualize-plan.md` | Markdown |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **Health scripts fail:** Note; proceed with manual browse. DO NOT block.
- **Existing unfinished plan:** ASK full regeneration vs append-only. NEVER silently overwrite plan with unresolved ops.
- **`resources/` empty/sparse:** Note; produce minimal plan with `create` entries for missing nodes. Plan file MUST exist.
</error_handling>

<contracts>
1. Read-only during 1–3. No edits during planning.
2. Full graph review; no partial scans unless explicitly scoped.
3. Every surviving article MUST have `actualize` entry.
4. Operation ordering MANDATORY: delete → merge → reclassify → split → create → actualize.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 2 Scan | `graph-auditor` | custom | No | Always | Health report: stale, orphaned, tag issues, missing stubs, counts |
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Structural ops queued | `resource-ops` |
| Actualize entries ready | `resource-enrich` (one at a time) |
| Confluence sync overdue | `resource-sync` first |
</next_steps>

<output_rules>Output language: English.</output_rules>
