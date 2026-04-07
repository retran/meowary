---
title: "Unlinked Mentions Scanner"
status: draft
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Unlinked Mentions Scanner

## Problem

Any file in the journal — daily notes, meeting notes, project dashboards, and
resource articles themselves — may mention a concept that has a resource article,
without linking to it. A daily note may say "service mesh" ten times without ever
linking to `resources/platform/istio.md`. A resource article on Kubernetes may
reference Istio concepts without linking across. There is no mechanism to surface
these missed connections.

The result: the knowledge graph stays sparse, cross-navigation is harder, and the
value of resource articles is lower than it should be.

The desired behaviour: a weekly script run produces a report of "file X mentions
topics covered by resource article Y but doesn't link to it — want to link?"
The author reviews and decides which links to add.

## Constraints

- No new npm dependencies. Existing scripts use only `dotenv`; new scripts follow
  the same pattern. [VERIFIED — scripts/package.json]
- ESM, no TypeScript, no build step. Node.js run directly. [VERIFIED]
- Read-only output (report only — no auto-editing of files). [VERIFIED — same
  convention as all health/report scripts]
- Exit 0 always for report scripts. [VERIFIED — health-all.js convention]
- QMD must be installed (`npm install -g @tobilu/qmd`). Already a documented
  prerequisite in AGENTS.md. [VERIFIED]
- QMD already indexes **all collections** — journal/, resources/, projects/,
  areas/, inbox/, drafts/, archive/, and root .md files. [VERIFIED — qmd.yml
  confirmed 8 collections]
- The full index must be reasonably current for accurate results. `node scripts/
  qmd-index.js --changed` re-indexes only git-changed files and runs in seconds.
  This should be a documented prerequisite step before running the scanner. [VERIFIED]
- `discover-connections.js` and `report-resources.js` both import the deleted
  `lib/graph.js` and are currently broken. Fixing those is **out of scope** for
  this spec. [VERIFIED — confirmed by code inspection]

## Options

### Option A: Keyword matching against article titles and filenames

Build an index from resource article filename stems (`istio`, `kubectl`) and H1
titles. Scan all .md files in the repo for regex matches. Cross-reference against
`extractLinks()` to identify unlinked mentions.

**Pros:**
- No new dependencies, zero latency [VERIFIED — uses existing lib/links.js]
- Fully deterministic — no threshold tuning [VERIFIED]
- Very fast — pure in-process string matching [VERIFIED]

**Cons:**
- Low recall — "service mesh" does not match `istio.md` unless the text says
  "istio" literally [ASSUMED — needs empirical confirmation]
- False positives from short/generic article names (e.g., `api.md`, `go.md`)
  [VERIFIED — discover-connections.js comment notes same issue]
- Cannot detect synonym or semantic relationships [VERIFIED]

**Effort:** small
**Risk:** Low technical risk; but may miss the most valuable connections — the
non-obvious ones — producing a sparse and low-value report

---

### Option B: Title + `aliases:` frontmatter matching

Same as A, but also reads an `aliases:` frontmatter list from each resource
article. If `istio.md` declares `aliases: [service mesh, envoy, data plane]`,
any file mentioning those terms is surfaced.

**Pros:**
- Higher recall than A as aliases are populated [ASSUMED — depends on author
  filling them in]
- Author-controlled precision — no false positives from unexpected matches [VERIFIED]
- Zero new dependencies; gracefully degrades to A when aliases are sparse [VERIFIED]

**Cons:**
- Recall depends entirely on aliases being filled in — cold-start problem [ASSUMED]
- Still keyword-based — cannot catch paraphrases or concept references [VERIFIED]
- Requires establishing `aliases:` as a new frontmatter convention [ASSUMED]

**Effort:** small
**Risk:** Low technical risk; adoption risk (aliases stay empty, report stays
sparse until articles are manually annotated)

---

### Option C: QMD semantic search, resource-article-centric

Iterate over resource articles as the "known" side. For each article, compose a
query from its title and tags, then invoke `qmd query "<query>"` (which searches
**all indexed collections**). For each result file, check if it already links to
the resource article using `extractLinks()`. Report files that score above the
threshold but have no link.

**Architecture:**

```
for each resource article R:
  query = R's H1 title + top tags
  results = qmd query "<query>"      ← searches all collections
  for each result file D (D ≠ R):
    if D does not link to R:
      emit suggestion: D → R
```

**Call count:** N_resources × 1 query each. With ~200 resource articles at
~200ms/call that is ~40 seconds — well within acceptable range for a weekly
report. [ASSUMED — 200ms/call is a rough estimate; needs empirical timing]

**QMD indexation and cadence:**
- All collections (journal, resources, projects, areas, etc.) are already indexed
  by QMD. [VERIFIED — qmd.yml]
- Journal notes change daily; resources change during enrichment sessions.
- Re-indexation via `qmd-index.js --changed` is incremental (seconds). [VERIFIED]
- Recommended cadence: run `qmd-index.js --changed` immediately before the weekly
  scanner run. This can be a documented prerequisite or an explicit step in the
  `/r-sync` and `/evening` command workflows.
- No auto-watch needed — the `--changed` flag makes the cost trivial. [VERIFIED]

**Pros:**
- Catches semantic/synonym matches without any aliases needed [ASSUMED — depends
  on embedding model quality]
- Leverages existing QMD investment — no new infrastructure [VERIFIED]
- Zero cold-start problem — works immediately on day one [ASSUMED]
- Covers all file types: journal notes, resource articles, project files, areas
  [VERIFIED — all are in QMD index]
- Fewer QMD calls than a note-centric chunk approach (~200 vs potentially thousands)
  [VERIFIED — arithmetic above]
- Naturally surfaces bidirectional gaps: resource A doesn't link to resource B
  and vice versa [VERIFIED — both are sources and targets]

**Cons:**
- Threshold calibration required — what QMD score or top-N cutoff separates
  signal from noise is unknown until tested empirically [ASSUMED]
- QMD CLI output format is designed for human consumption; parsing it
  programmatically adds fragility [ASSUMED — needs prototyping]
- Results depend on embedding model quality for the specific domain [ASSUMED]
- A resource article will likely appear as a top result for itself — need to
  suppress self-matches [VERIFIED — trivial to implement but must be handled]

**Effort:** medium
**Risk:** Medium — threshold tuning and output parsing are real risks, both
mitigable through prototyping before committing to full implementation

---

## Recommendation

**Option C — QMD semantic search, resource-article-centric.**

Keyword matching (A/B) systematically misses the most valuable connections: the
non-obvious ones the author didn't know to look for. Semantic search finds them.
The resource-article-centric inversion (iterate over articles, not notes) keeps
call count low (~200) and makes each result immediately interpretable — you know
exactly which concept is unlinked and in which file.

The two real risks:
- **Threshold:** Start conservative, lower after reviewing the first real run.
  One-time calibration, not ongoing maintenance.
- **Output parsing:** Prototype `qmd query` output format first (30 minutes of
  exploration) before writing the full script.

QMD indexation is not a new operational burden — `qmd-index.js --changed` already
runs in the `/r-sync` and `/r-enrich` workflows. Adding it as a prerequisite step
to the weekly scanner adds seconds, not complexity.

The scanner remains standalone (`node scripts/unlinked-mentions.js`). Integration
into `health-all.js` is deferred — QMD latency makes it unsuitable for the fast
health suite.

---

## Open Questions

1. **QMD output parsing:** What is the exact output format of `qmd query`? Does
   it include file paths and scores in a machine-parseable form, or does it need
   regex extraction? Needs a short prototyping session before planning begins.

2. **Threshold / cutoff strategy:** Use a similarity score threshold (e.g., ≥ 0.7)
   or a top-N cutoff per article (e.g., top 5 results)? Score threshold is more
   principled; top-N is simpler. Requires empirical testing with real notes.

3. **Output grouping:** Group suggestions by resource article ("these files should
   link to `istio.md`") or by source file ("this daily note should add these links")?
   Article-grouped is more natural given the resource-centric architecture; file-
   grouped is more actionable when the author is editing a specific note.

4. **Self-referential and already-related suppression:** Besides self-matches,
   should results where R already appears in D's `## Related` section be suppressed
   even without a hard link? Or is the absence of a markdown link always reportable?

5. **Index staleness detection:** Should the script check if `qmd-index.js` was
   run recently (compare index mtime against newest .md file mtime) and warn if
   stale? Or document the prerequisite and trust the user?

6. **`discover-connections.js` and `report-resources.js` are broken** (import
   deleted `lib/graph.js`). Should fixing them be bundled into this implementation
   or tracked separately as a deferred item?
