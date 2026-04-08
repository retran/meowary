---
name: resources
description: Knowledge graph philosophy, tag conventions, health scripts, operation log, and maintenance rules for resource articles. Load when creating, enriching, merging, splitting, or deleting a resource article, or at the start of any /r workflow.
compatibility: opencode
---

## Philosophy

`resources/` is the **knowledge graph** — the permanent, evolving layer of the second brain. Articles are nodes; cross-references are edges. The graph grows and deepens over time: new articles are created as concepts emerge, existing articles are enriched as understanding develops, synthesis articles form where multiple nodes connect into an insight. There is no "finished" state — only more developed. The graph's structure is driven entirely by concepts — never by how Confluence organizes its pages.

- **Concept-first structure.** Article boundaries are drawn around ideas, not around source pages. One Confluence page may feed three articles; three pages may feed one. The Confluence hierarchy is irrelevant.
- **One concept per article.** Two distinct concepts in one file? Split immediately. Two files covering the same concept? Merge without hesitation.
- **Actively extract new nodes.** Every time you read source material, scan for topics, entities, components, people, decisions, and processes that deserve their own article. Create them.
- **Freely restructure.** Split, merge, rename, and move articles whenever doing so makes the graph clearer. The only wrong state is a cluttered article or a missing node.
- **Cross-references build value.** Every link added is a path through the graph. Prefer many short linked articles over few long ones.
- **Confluence is raw material.** Distill durable facts. Discard meeting logistics, formatting boilerplate, and expiring status updates.
- **Jira and codebase verify and enrich.** Confirm current state, add concrete details, remove stale claims.
- **Synthesis articles are first-class nodes.** `resources/synthesis/` holds articles that answer recurring questions by compiling multiple sources. They have `status: synthesis` in front matter and cite all sources.
- **Articles are living documents.** Every revisit should deepen an article. If re-reading adds no new facts, sharpen one claim, make one implied link explicit, or expand one thin section.
- **Articles mature progressively.** New articles start thin — use `status: stub`; graduate to `status: current` as facts accumulate.

---

## Proactive Enrichment

During every session — regardless of primary task — scan for resource gaps and fill them immediately.

| Trigger | Action |
|---------|--------|
| Meeting reveals a person's role, team change, or org update | Update or create the person/team resource article |
| Discussion or document mentions an architectural decision | Update the relevant architecture resource or create an ADR |
| Work session produces component ownership or technical knowledge | Capture in the appropriate domain resource article |
| A concept, tool, process, or system is mentioned with no resource article | Create a new resource article (not a stub — real content) |
| Confluence page referenced that's not in `meta/confluence-sync.json` | Add to `meta/confluence-sync.json`; fetch and extract durable facts |
| Jira issue reveals current state contradicting a resource article | Update the resource article with current facts |
| Daily/weekly note log entry contains durable facts | Extract to the relevant resource article |

---

## Tags

> **Before using this file:** Check that `meta/tags.md` exists. If not, copy from `.opencode/meta-templates/tags-template.md`.

`meta/tags.md` is the canonical tag registry. Read it before assigning or creating tags.

| Prefix | Scope | Example |
|--------|-------|---------|
| `#p-` | Projects (match folder slug) | `#p-my-project` |
| `#t-` | Teams (match team resource filename) | `#t-my-team` |
| `#person-` | People (match person resource filename) | `#person-alice` |
| *(none)* | Topics, domains, technologies | `#architecture` |

- Lowercase kebab-case. No `#` prefix in front matter YAML; `#` prefix in inline body text.
- Every article needs at least one tag.
- **Registering a new tag:** pick a lowercase kebab-case name, add a row to the correct table in `meta/tags.md` with tag, link, and description, then use it in the article's front matter.

---

## Sources Format

The `## Sources` section in every resource article lists the external sources used to build or enrich it.

**Confluence page:**
```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```

**Jira issue:**
```
- [PROJ-123](<jira-url>/browse/PROJ-123) — reason (e.g. decision recorded, deadline set)
```

**Journal entry (daily note, weekly note, or project):**
```
- [daily/2026-03-15.md](../journal/daily/2026-03-15.md) — reason
```

Rules:
- Always state why the source was used.
- Journal: use a relative path from the resource article's location.
- Remove a source entry when the article no longer contains any fact drawn from it.

---

## Scripts

All deterministic operations on resource files are handled by scripts in `.opencode/scripts/`.

### Find inbound links
```
node .opencode/scripts/find-backlinks.js <article-path>
```
Use after every rename, move, split, or delete. Searches the entire repo (not just `resources/`). Zero results = orphaned article.

### Health checks
```
node .opencode/scripts/health-all.js
```
Runs every health check and outputs a unified report: orphans, stale articles, tag inconsistencies, broken links, empty sections.

| Script | What it checks |
|--------|---------------|
| `health-orphans.js` | Articles with zero inbound links |
| `health-tags.js` | Tags used but not in `meta/tags.md`; registered tags with no usage |
| `health-stale.js` | Articles not actualized recently (`--days N`, default 90) |
| `health-links.js` | Broken links and missing bidirectional back-links |
| `health-lengths.js` | Articles exceeding line limit — split candidates (`--lines N`, default 80) |
| `health-frontmatter.js` | Files missing `updated` or `tags` front matter |

### Report on all articles
```
node .opencode/scripts/report-resources.js [--sort actualized|lines|inlinks]
```
Table output: path, lines, tags, actualized date, inlinks, outlinks. Use before a planning pass.

### Discover connections
```
node .opencode/scripts/discover-connections.js [--scope <path>] [--limit N]
```
Scores article pairs by shared tags (+1), shared sources (+2), entity co-occurrence (+1), structural proximity (+1). Pairs scoring 3+ are strong cross-reference candidates.

### Fix broken links
```
node .opencode/scripts/fix-links.js
```
Identifies and interactively prompts for broken link fixes across `resources/`.

### Generate an operation plan
```
node .opencode/scripts/plan-resources.js
```
Produces a structured candidate operation list (delete, merge, split, create, actualize).

---

## Maintenance

### When to Act

| Trigger | Required actions |
|---------|-----------------|
| New resource article created | Register any new tags in `meta/tags.md` |
| Confluence page fetched for enrichment | Add page ID to article's `confluence:` front matter; add to `meta/confluence-sync.json` if monitoring |
| Resource article edited | Update `updated` front matter; append to `## Changelog` |
| New tag introduced | Add to correct table in `meta/tags.md` with link |
| New person/team encountered | Create resource entry from template; register tag |
| Resource article deleted or moved | Fix all inbound links in the repo |

### Confluence Tracking

> **Before using this file:** Check that `meta/confluence-sync.json` exists. If not, copy from `.opencode/meta-templates/confluence-sync-template.json`.

Two separate tracking mechanisms:

| Artifact | Purpose | Format |
|----------|---------|--------|
| `meta/confluence-sync.json` | Operational monitoring registry — pages actively tracked for changes | JSON at `meta/` |
| Article `confluence: [PAGE_IDs]` | Provenance — which pages informed this article | Front matter list |

- Add to `meta/confluence-sync.json` when you want to be notified of changes (ongoing monitoring).
- Add a page ID to `confluence:` front matter every time a Confluence page informs an article's content.
- Re-fetch when `node .opencode/scripts/confluence-updates.js YYYY-MM-DD` reports the page was modified.

### Confluence → Resources Transformation

- **Extract:** Durable facts only — decisions, process definitions, architecture, ownership, team structure. Discard meeting logistics, ephemeral status updates, and formatting boilerplate.
- **Condense:** A resource article is shorter than its source. A 5-page Confluence document might become 30 lines.
- **One page → multiple articles:** Split when the page covers distinct topics. Each article links to the other.
- **Multiple pages → one article:** Merge when several pages describe aspects of one topic. Track all source page IDs in `confluence:` front matter.

### Graph Health

The knowledge graph degrades silently. Run `health-all.js` on demand and after bulk operations.

- **Orphans:** Articles with no inbound links from other resource files. Fix by adding a cross-reference from a related article. People files are exempt.
- **Staleness:** An article with `actualized` older than 90 days and `status: current` is potentially stale. Set `status: outdated` if facts have drifted.
- **Tag consistency:** Front matter `tags` must exist in `meta/tags.md`. Inline `#tags` in the body should match front matter tags.

---

## Resources Log

The operation log lives at `meta/resources-log.md`. It is an append-only log of every knowledge graph operation — enrichments, syncs, plan runs, ingests, and structural operations.

> **Before using this file:** Check that `meta/resources-log.md` exists. If not, copy from `.opencode/meta-templates/resources-log-template.md`.

### Format

Each entry is one line appended to the log:

```markdown
- **YYYY-MM-DD:** <operation> | <subject> — <one-line summary>
```

Examples:
- `- **2026-04-08:** enrich | resources/tools/opencode.md — added MCP integration facts`
- `- **2026-04-08:** r-plan | 14 operations planned`
- `- **2026-04-08:** Confluence sync — 3 pages ingested; 0 deleted, 0 merged, 1 created, 2 actualized`

### Append rules

- Append only — never edit or delete past entries.
- One entry per workflow invocation at the **Close** step.
- The log is the audit trail for all `/r` operations; it drives the "last run" date lookups in `resource-discover` and `resource-sync`.

---

## Rules

- **One operation at a time.** Never process multiple articles or operations in parallel.
- **Structure follows concepts, never sources.** Confluence page hierarchy has no authority over resources structure.
- **Default is to create.** When a substantial concept has no article, create one.
- **Freely restructure.** Split, merge, rename, move, and delete articles whenever it improves the graph. No approval needed.
- **Merge aggressively.** Two articles covering the same concept is a defect. Fix immediately.
- **Split proactively.** An article covering two concepts is two articles waiting to be born.
- **Delete without hesitation.** Stubs, duplicates, and obsolete articles are noise. Remove them.
- **Append-only changelog.** Never remove changelog entries.
- **Mandatory `updated`.** Set on every edit.
- **Bidirectional links.** Every A → B requires B → A (except people → topic noise).
- **No stubs.** Every new article needs a real Overview and at least one substantive section.
- **Distill, don't copy.** Confluence and Jira are sources, not mirrors.
- **Read-only externals.** Never write to Jira or Confluence. Codebase is read-only.
- **Fix all inbound links.** After any delete, merge, reclassify, split, or rename: run `node .opencode/scripts/find-backlinks.js <old-path>` to find every inbound link across the entire repo. Update or remove all matches. Broken links are unacceptable.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: resource`, `status`, `actualized`, `updated`, `tags`, `confluence`?
- [ ] `updated` set to today?
- [ ] `## Changelog` entry appended with today's date?
- [ ] Every outbound link has a corresponding inbound link in the target article?
- [ ] All tags present in `meta/tags.md`?
- [ ] No stubs: Overview and at least one substantive section present?
- [ ] `## Sources` section lists all pages that contributed facts?
- [ ] No content copied verbatim from Confluence — distilled only?
