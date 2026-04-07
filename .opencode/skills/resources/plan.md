---
name: resources/plan
description: Resources graph review — analyze all resource articles and produce an ordered operation plan
depends_on: resources
compatibility: opencode
---

## Workflow C: Graph Review

**Purpose:** Analyze all resources as a knowledge graph and produce an ordered operation plan. This is a **planning-only** workflow — it does not edit any resource articles.

**Output:** `resources-actualize-plan.md` — an ordered queue of operations.

**When to run:** Before a batch actualization pass. The plan file is consumed by [operations.md](operations.md) (structural operations) and Workflow A (single-article enrichment, in [enrich.md](enrich.md)).

### Step 1: Orient

- Browse `resources/` directory tree to understand current coverage.
- Read `tags.md` — understand the tag taxonomy.
- Note what Confluence pages are being monitored via `confluence-sync.json` and when they were last synced.

### Step 2: Scan All Articles

Start with a high-level overview — run `node .opencode/scripts/report-resources.js --sort actualized` to see all articles sorted by how recently they were enriched. This shows coverage gaps (long-stale articles) and size outliers (split candidates) at a glance.

Also run `node .opencode/scripts/health-all.js` to get a full health report: orphaned articles, tag inconsistencies, stale articles, and empty sections. Use this output as additional input for Step 3.

Then for each subfolder in `resources/`, read every article — including `resources/people/`. Person files are full resource nodes and must be reviewed. At minimum read:
- Full front matter (`status`, `updated`, `tags`)
- All headings and the first paragraph of each section
- `## Related` and `## Sources` sections in full

Build a mental model of what each article actually covers — not just its title.

### Step 3: Identify Graph Problems

Systematically check for:

**a. Merges** — Two or more articles covering the same concept with significant overlap. Both describe the same thing from slightly different angles or were created at different times.

**b. Splits** — Articles covering two or more distinct concepts that deserve independent nodes. Symptoms: article exceeds ~80 lines, has sections on unrelated subtopics, or is linked to only for one of its sections.

**c. New nodes** — Concepts, components, people, teams, processes, or decisions mentioned in multiple articles but with no dedicated article. These are missing nodes in the graph. Also search `journal/daily/`, `journal/weekly/`, and `projects/` for recurring concepts that have no resource article. Use `qmd query "<concept>"` to check. Only list concepts that appear in 2+ sources or are substantial enough to warrant a dedicated article.

**d. Deletions / archiving** — Articles that are stubs with no useful content, duplicates fully covered by another article, or topics no longer relevant.

**e. Reclassifications** — Articles in the wrong subfolder, or with incorrect/missing tags, or filenames that don't match their content.

**f. Missing cross-references** — Pairs of articles that clearly relate but don't link to each other.

### Step 4: Produce the Operation Plan

Write `resources-actualize-plan.md` with the following structure:

```markdown
---
type: meta
updated: YYYY-MM-DD
tags: []
---

# Resources Actualize Plan

Generated: YYYY-MM-DD HH:MM
Scope: <all resources articles | resources/subfolder/>

## Operation Queue

Ordered list of operations. Execute top to bottom. Structural operations
(delete, merge, reclassify) come first to clean up the graph before
enrichment. Then splits and creates to grow the graph. Then actualize
to enrich existing articles.

| # | Op | Target | Details |
|---|-----|--------|---------|
| 1 | delete | resources/path/article.md | Reason for deletion |
| 2 | merge | resources/path/keep.md ← resources/path/absorb.md | Why they overlap; keep.md survives |
| 3 | reclassify | resources/old/path.md → resources/new/path.md | Why it belongs elsewhere |
| 4 | split | resources/path/big.md → resources/path/new1.md + resources/path/new2.md | What concepts to extract |
| 5 | create | resources/subfolder/new-concept.md | What concept; mentioned in X, Y, Z |
| 6 | actualize | resources/path/article.md | What needs enrichment |

## Missing Cross-References

| Article A | Article B | Relationship |
|---|---|---|
| path/a.md | path/b.md | How they relate |

## Notes

Free-form observations about resources structure, coverage gaps, or strategic
recommendations for the actualization pass.
```

**Operation ordering rules:**
1. `delete` — remove dead nodes first
2. `merge` — consolidate duplicates before enriching
3. `reclassify` — move files to correct locations
4. `split` — break up overloaded articles
5. `create` — add missing nodes
6. `actualize` — enrich every surviving article (sorted by `actualized` date, oldest first; fall back to `updated` if `actualized` is absent)

**Exhaustive actualize coverage.** Every article that exists after all structural operations must have an `actualize` entry. This includes:
- Articles unchanged by structural operations (existing articles not deleted/absorbed)
- Surviving articles from merges (absorber)
- New articles from splits and creates
- Moved articles from reclassifies
- **All `resources/people/` files** — person articles are not exempt from actualization

The plan is exhaustive — no article is left un-actualized, including every person file.

### Step 5: Commit

```
git add resources-actualize-plan.md && git commit -m "Generate resources actualize plan: N operations"
```
