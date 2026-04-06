---
name: resources/ref-maintenance
description: Resources maintenance procedures — triggers, Confluence tracking, transformation rules, graph health
compatibility: opencode
---

## When to Act

| Trigger | Required actions |
|---------|-----------------|
| New resource article created | Register any new tags in `tags.md` |
| Confluence page fetched for enrichment | Add page ID to article's `confluence:` front matter; add to `confluence-sync.json` if monitoring |
| Confluence sync detects new/stale pages | Run `node scripts/confluence-ingest.js` — see [sync.md](sync.md) |
| Resource article edited | Update `updated` front matter; append to `## Changelog` |
| New tag introduced | Add to correct table in `tags.md` with link |
| New person/team encountered | Create resource entry from template; register tag |
| Resource article deleted or moved | Fix all inbound links in the repo |

## Confluence Tracking

There are two separate tracking mechanisms:

| Artifact | Purpose | Format |
|----------|---------|--------|
| `confluence-sync.json` | Operational monitoring registry — pages we actively track for changes | JSON at repo root |
| Article `confluence: [PAGE_IDs]` | Provenance — which pages informed this article | Front matter list |

These are independent. An article may cite pages not in the monitoring registry; a monitored page may inform many articles.

**When to add a page to `confluence-sync.json`:**
- You want to be notified when it changes (ongoing monitoring)
- Use `node scripts/confluence-missing.js` to discover untracked pages in a space

**When to add a page ID to `confluence:` front matter:**
- You fetched the page and extracted facts into this article
- Add the ID every time a new Confluence page informs the article's content

**Re-fetch cadence.** No fixed schedule. Re-fetch when:
- `node scripts/confluence-updates.js YYYY-MM-DD` reports the page was modified
- A daily workflow reveals that a resource article's facts are stale
- The user explicitly asks to refresh a topic

## Confluence → Resources Transformation

Confluence pages are raw material. Resource articles are refined output.

**What to extract:** Durable facts only — decisions, process definitions, architecture, ownership, team structure. Discard meeting logistics, ephemeral status updates, changelogs, and formatting boilerplate.

**Condensing:** A resource article is shorter than its source. Use tables and bullets. Quote specific numbers, dates, and names. A 5-page Confluence document might become 30 lines.

**One page → multiple articles:** Split when the page covers distinct topics belonging in different resource subfolders. Each article links to the other.

**Multiple pages → one article:** Merge when several pages describe aspects of one topic. Track all source page IDs in the article's `confluence:` front matter.

**Source attribution:** Each resource article's `## Sources` section lists every Confluence page used. See [ref-sources.md](ref-sources.md) for format.

## Maintaining `tags.md`

- Check existing tags before creating to avoid duplicates.
- Which table: `#p-` (projects), `#t-` (teams), `#person-` (people), or Topic.
- Naming: lowercase kebab-case. Prefixes are mandatory for project, team, and person tags.
- Every tag must link to an existing file.
- `#person-` slug must match the resource filename exactly.

Full tag format: see [ref-tags.md](ref-tags.md).

## Resources Graph Health

The knowledge graph degrades silently. These checks catch problems early.

**On demand / after bulk operations:**
```
node scripts/health-all.js
```
Reports: orphaned articles, missing frontmatter, tag inconsistencies, stale articles, overly long articles.

**Orphan check:** Articles with no inbound links from other resource files are orphans — invisible in the graph. Fix by adding a cross-reference from a related article. Run `node scripts/find-backlinks.js <path>` to check. People files are exempt.

**Staleness heuristic:** An article with `actualized` (or `updated`) older than 90 days and `status: current` is potentially stale. During sync, if the corresponding Confluence page was modified after the article's `actualized` date, flag for review. Set `status: outdated` if facts have drifted.

**Tag consistency:** Front matter `tags` must exist in `tags.md`. Inline `#tags` in the body should match front matter tags. Mismatches cause search failures.
