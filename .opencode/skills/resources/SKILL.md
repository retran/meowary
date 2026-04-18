---
name: resources
description: Knowledge graph philosophy, tag conventions, health scripts, operation log, and maintenance rules for resource articles. Load when creating, enriching, merging, splitting, or deleting a resource article, or at the start of any /r workflow.
compatibility: opencode
updated: 2026-04-18
---

<role>Knowledge graph authority — philosophy, tags, health scripts, operation log, maintenance rules.</role>

<summary>
> `resources/` is the permanent knowledge graph. Articles = nodes; cross-references = edges. Concept-driven structure (NOT source-driven). One concept per article. Split/merge/restructure freely. Confluence is raw material; resources are refined output.
</summary>

<philosophy>
- **Concept-first.** Boundaries drawn around ideas, NOT source pages. Confluence hierarchy is irrelevant.
- **One concept per article.** Two concepts? Split. Two articles, same concept? Merge.
- **Actively extract nodes.** Every read scans for topics, entities, components, people, decisions, processes deserving own article. Create them.
- **Restructure freely.** Split, merge, rename, move whenever it clarifies the graph.
- **Cross-references build value.** Every link = path through graph. Prefer many short linked articles over few long ones.
- **Confluence = raw material.** Distill durable facts. Discard meeting logistics, formatting boilerplate, expiring status.
- **Jira and codebase verify and enrich.** Confirm current state, add concrete details, remove stale claims.
- **Synthesis articles are first-class.** `resources/synthesis/` answers recurring questions by compiling sources. `status: synthesis`. Cite all sources.
- **Living documents.** Every revisit deepens. If re-read adds no facts: sharpen one claim, make one link explicit, expand one section.
- **Progressive maturity.** Start `status: stub`; graduate to `status: current`.
</philosophy>

<proactive_enrichment>

Every session — regardless of primary task — scan for gaps and fill immediately.

| Trigger | Action |
|---------|--------|
| Meeting reveals role/team/org change | Update or create person/team article |
| Architectural decision mentioned | Update architecture resource or create ADR |
| Component ownership / technical knowledge surfaces | Capture in domain article |
| Concept/tool/process/system mentioned with no article | Create article (real content, NOT stub) |
| Confluence page referenced not in `meta/confluence-sync.json` | Add to sync registry; fetch and extract durable facts |
| Jira issue contradicts article | Update article with current facts |
| Daily/weekly log contains durable facts | Extract to relevant article |

</proactive_enrichment>

<tags>

<pre_check>Verify `meta/tags.md` exists. If missing, copy from `.opencode/meta-templates/tags-template.md`.</pre_check>

`meta/tags.md` is canonical tag registry. Read before assigning or creating.

| Prefix | Scope | Example |
|--------|-------|---------|
| `#p-` | Projects (match folder slug) | `#p-my-project` |
| `#t-` | Teams (match team article filename) | `#t-my-team` |
| `#person-` | People (match person article filename) | `#person-alice` |
| *(none)* | Topics, domains, technologies | `#architecture` |

- Lowercase kebab-case. NO `#` prefix in front matter YAML; `#` prefix in inline body text.
- Every article needs ≥1 tag.
- **Register new tag:** lowercase kebab-case name, add row to correct table in `meta/tags.md` with tag/link/description, then use in front matter.

</tags>

<sources_format>

`## Sources` lists external sources used to build/enrich.

**Confluence:**
```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```

**Jira:**
```
- [PROJ-123](<jira-url>/browse/PROJ-123) — reason (e.g. decision recorded, deadline set)
```

**Journal (daily/weekly/project):**
```
- [daily/2026-03-15.md](../journal/daily/2026-03-15.md) — reason
```

Rules:
- Always state why source was used.
- Journal: relative path from article location.
- Remove entry when article no longer contains any fact from it.

</sources_format>

<scripts>

All deterministic operations live in `.opencode/scripts/`.

### Find inbound links
```
node .opencode/scripts/find-backlinks.js <article-path>
```
USE after every rename, move, split, delete. Searches entire repo. Zero results = orphan.

### Health checks
```
node .opencode/scripts/health-all.js
```
Runs all checks: orphans, stale, tag inconsistencies, broken links, empty sections.

| Script | Checks |
|--------|--------|
| `health-orphans.js` | Articles with zero inbound links |
| `health-tags.js` | Tags used but not in `meta/tags.md`; registered tags unused |
| `health-stale.js` | Articles not actualized recently (`--days N`, default 90) |
| `health-links.js` | Broken links + missing bidirectional back-links |
| `health-lengths.js` | Articles exceeding line limit — split candidates (`--lines N`, default 80) |
| `health-frontmatter.js` | Files missing `updated` or `tags` |

### Report on all articles
```
node .opencode/scripts/report-resources.js [--sort actualized|lines|inlinks]
```
Table: path, lines, tags, actualized, inlinks, outlinks. USE before planning pass.

### Discover connections
```
node .opencode/scripts/discover-connections.js [--scope <path>] [--limit N]
```
Scores pairs: shared tags +1, shared sources +2, entity co-occurrence +1, structural proximity +1. Pairs ≥3 are strong cross-reference candidates.

### Fix broken links
```
node .opencode/scripts/fix-links.js
```
Interactive prompts for broken link fixes across `resources/`.

### Generate operation plan
```
node .opencode/scripts/plan-resources.js
```
Structured candidate operations: delete, merge, split, create, actualize.

</scripts>

<maintenance>

### When to act

| Trigger | Required actions |
|---------|------------------|
| New article created | Register new tags in `meta/tags.md` |
| Confluence page fetched for enrichment | Add page ID to article's `confluence:`; add to `meta/confluence-sync.json` if monitoring |
| Article edited | Update `updated` front matter; append to `## Changelog` |
| New tag introduced | Add to correct table in `meta/tags.md` with link |
| New person/team encountered | Create article from template; register tag |
| Article deleted/moved | Fix all inbound links in repo |

### Confluence tracking

<pre_check>Verify `meta/confluence-sync.json` exists. If missing, copy from `.opencode/meta-templates/confluence-sync-template.json`.</pre_check>

Two separate mechanisms:

| Artifact | Purpose | Format |
|----------|---------|--------|
| `meta/confluence-sync.json` | Operational monitoring registry | JSON at `meta/` |
| Article `confluence: [PAGE_IDs]` | Provenance — pages informing article | Front matter list |

- Add to `sync.json` to monitor changes.
- Add to `confluence:` front matter every time page informs article.
- Re-fetch when `node .opencode/scripts/confluence-updates.js YYYY-MM-DD` reports change.

### Confluence → resources transformation

- **Extract:** durable facts only — decisions, process definitions, architecture, ownership, team structure. Discard meeting logistics, status updates, formatting boilerplate.
- **Condense:** 5-page Confluence → ~30-line article.
- **Split:** one page → multiple articles when distinct topics. Cross-link.
- **Merge:** multiple pages → one article when describing one topic. Track all IDs in `confluence:`.

### Graph health

Graph degrades silently. Run `health-all.js` on demand and after bulk operations.

- **Orphans:** zero inbound links from other resources. Fix by adding cross-reference. People files exempt.
- **Staleness:** `actualized` >90 days + `status: current` = potentially stale. Set `status: outdated` if drifted.
- **Tag consistency:** front matter `tags` MUST exist in `meta/tags.md`. Inline `#tags` in body should match front matter.

</maintenance>

<resources_log>

Operation log lives at `meta/resources-log.md`. Append-only log of every knowledge graph operation.

<pre_check>Verify `meta/resources-log.md` exists. If missing, copy from `.opencode/meta-templates/resources-log-template.md`.</pre_check>

### Format

```markdown
- **YYYY-MM-DD:** <operation> | <subject> — <one-line summary>
```

Examples:
- `- **2026-04-08:** enrich | resources/tools/opencode.md — added MCP integration facts`
- `- **2026-04-08:** r-plan | 14 operations planned`
- `- **2026-04-08:** Confluence sync — 3 pages ingested; 0 deleted, 0 merged, 1 created, 2 actualized`

### Append rules
- Append only — NEVER edit/delete past entries.
- One entry per workflow invocation at **Close** step.
- Drives "last run" date lookups in `resource-discover` and `resource-sync`.

</resources_log>

<rules>
- One operation at a time. NEVER process multiple articles or operations in parallel.
- Structure follows concepts, NEVER sources. Confluence hierarchy has no authority.
- Default is to create. Substantial concept without article? Create one.
- Restructure freely — split/merge/rename/move/delete whenever graph improves. No approval needed.
- Merge aggressively. Two articles, same concept = defect. Fix.
- Split proactively. Article covering two concepts = two articles waiting.
- Delete without hesitation. Stubs, duplicates, obsolete = noise.
- Append-only changelog. NEVER remove entries.
- Mandatory `updated`. Set every edit.
- Bidirectional links. Every A → B requires B → A (except people → topic noise).
- NO stubs. New article needs real Overview + ≥1 substantive section.
- Distill, never copy. Confluence/Jira are sources, not mirrors.
- Read-only externals. NEVER write to Jira/Confluence. Codebase read-only.
- Fix all inbound links after delete/merge/reclassify/split/rename: run `node .opencode/scripts/find-backlinks.js <old-path>`. Update or remove all matches. Broken links unacceptable.
</rules>

<self_review>
- [ ] Front matter complete: `type: resource`, `status`, `actualized`, `updated`, `tags`, `confluence`?
- [ ] `updated` set to today?
- [ ] `## Changelog` entry appended with today's date?
- [ ] Every outbound link has corresponding inbound link in target?
- [ ] All tags in `meta/tags.md`?
- [ ] No stubs: Overview and ≥1 substantive section?
- [ ] `## Sources` lists all contributing pages?
- [ ] No verbatim Confluence content — distilled only?
</self_review>

<output_rules>Output in English. Preserve verbatim file paths, script names, and front matter keys.</output_rules>
