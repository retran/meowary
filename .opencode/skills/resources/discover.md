---
name: resources/discover
description: Surface hidden connections, generate backlink reports, and find serendipitous links between resource articles using tags, shared references, and content similarity
depends_on: resources
compatibility: opencode
---

## Workflow E: Discover Connections

**Purpose:** Surface hidden relationships between resource articles that manual browsing misses. Produces a connections report and optionally patches articles with new cross-references.

**When to run:**
- After a batch of enrichments (Workflow A) or structural operations (Workflow D).
- When exploring a new topic and wanting to see what existing resources relate.
- On a regular cadence (e.g., weekly) as part of graph hygiene.

### Step 1: Choose a Scope

Pick one of:

- **Single article** — discover connections for one article.
- **Tag cluster** — discover connections across all articles sharing a tag.
- **Subfolder** — discover connections within a domain (e.g., `resources/studio-pro/`).
- **Full graph** — scan the entire `resources/` directory (expensive; prefer smaller scopes).

### Step 2: Build the Connection Index

For each article in scope:

#### 2a. Backlink Scan

Search all `resources/` files for inbound links to the article:
```
rg "\(<relative-path-to-article>\)" resources/
```
Record every file that links to it.

#### 2b. Shared Tag Analysis

Read the article's `tags` from front matter. For each tag:
- Query `knowledge-graph.md` for all articles with the same tag.
- These are **tag siblings** — articles that share a concept but may not link to each other.

#### 2c. Shared Source Analysis

Read the article's `## Sources` section. For each Confluence page ID or Jira issue key:
- Search `resources/` for other articles referencing the same source.
- These are **source siblings** — articles that draw from the same evidence but may cover different facets.

#### 2d. Entity Co-occurrence

Extract named entities from the article (people, teams, components, services, Jira projects). Search for each entity across other articles in scope:
```
rg -l "<entity-name>" resources/
```
Articles mentioning the same entities are **entity neighbors**.

#### 2e. Structural Proximity

Check articles in the same subfolder. Articles in the same domain that share zero cross-references are **proximity gaps** — likely related but disconnected.

### Step 3: Score and Rank

For each pair of articles (A, B) found in Step 2, compute a connection strength:

| Signal | Weight |
|--------|--------|
| Direct link exists (A→B or B→A) | Already connected — skip |
| Shared tag | +1 per shared tag |
| Shared source (same Confluence page or Jira issue) | +2 per shared source |
| Entity co-occurrence | +1 per shared entity |
| Same subfolder, zero cross-references | +1 |

Rank pairs by total score. Pairs scoring 3+ are **strong candidates** for new cross-references.

### Step 4: Generate Connections Report

Output a markdown report with three sections:

#### Missing Cross-References (score >= 3)

| Article A | Article B | Score | Signals | Suggested Action |
|-----------|-----------|-------|---------|-----------------|

For each pair, suggest which article should link to the other (or both).

#### Isolated Articles (zero inbound links)

List articles with no backlinks from other resources. People files are exempt.

#### Cluster Map

Group articles by their strongest tag cluster. For each cluster, list the articles and note which pairs are connected vs disconnected. This reveals the shape of knowledge neighborhoods.

### Step 5: Patch (Optional)

If the user approves, add cross-references for the top-ranked missing connections:

1. Add a link in the `## Related` section of one or both articles.
2. Update `## Changelog` with: `- **YYYY-MM-DD:** Added cross-reference to <article> (discovered via connection scan).`
3. Update `updated` date.
4. Commit: `Resources: discover connections — add N cross-references`

If the user does not approve patching, save the report to `discovery-report.md` (repo root) for manual review.

### Step 6: Synthesis Opportunities

Scan the cluster map for groups of 3+ articles that are all interconnected. These are candidates for:

- A **synthesis note** in each article's summary (Layer 3 from progressive summarization in `resources/enrich`).
- A **hub article** that ties the cluster together (flag as a `create` candidate for the next plan).

Report these opportunities but do not act on them without user approval.

---

## Quick Discovery Commands

For ad-hoc exploration without running the full workflow:

### Find what links to an article
```
rg "\(.*<filename>\)" resources/
```

### Find tag siblings
```
rg "^tags:.*<tag-name>" resources/ -l
```

### Find articles mentioning a person or component
```
rg -l "<name>" resources/
```

### Find orphan articles (no inbound links)
```bash
for f in resources/**/*.md; do
  name=$(basename "$f")
  count=$(rg -c "\($name\)" resources/ 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
  [ "$count" -eq 0 ] && echo "ORPHAN: $f"
done
```

---

## Rules

- **Read-only by default.** Do not add cross-references without user approval. The report is the primary output.
- **People files are exempt** from orphan checks — they do not need inbound links.
- **Do not force connections.** A low-scoring pair is not a connection — it's a coincidence. Only suggest cross-references where a reader would genuinely benefit from the link.
- **Run after enrichment, not during.** Discovery is a separate pass. Do not mix it into Workflow A.
- **Keep reports in repo root.** If saving a report, use `discovery-report.md` (overwrite on each run).
