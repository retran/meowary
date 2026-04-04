---
name: resources/ref-maintenance
description: Resources and Confluence maintenance procedures — triggers, fetch/record protocol, Confluence→resources transformation rules, graph health checks, tag registry maintenance
compatibility: opencode
---

## When to Act

| Trigger | Required actions |
|---------|-----------------|
| New resource article created | Add row to `knowledge-graph.md`; register any new tags in `tags.md` |
| Confluence page fetched | Add/update row in `confluence-map.md`; if resource article created, link it in `knowledge-graph.md` |
| Confluence map updated (new or modified pages) | For each new/modified page, check if it contains durable facts; create or update resource articles accordingly; update `knowledge-graph.md` and `tags.md` |
| Resource article edited | Update `updated` front matter; append to `## Changelog` |
| New tag introduced | Add to correct table in `tags.md` with link |
| New person/team encountered | Create resource entry from template; register tag |
| Resource article deleted or moved | Remove/update row in `knowledge-graph.md`; fix all links in the repo |

## Maintaining `knowledge-graph.md`

`knowledge-graph.md` has three columns: `File` (relative link to the resource article), `Summary` (one-line description), `Tags` (backtick-quoted tag names).

Steps when adding or updating a row:

1. Identify the resources subfolder for the article. Create a new section if the folder is new.
2. Add the row under the correct section header.
3. After a batch of changes, append a dated changelog entry to `knowledge-graph.md`.

Full row format and summary rules: see [ref-knowledge-graph.md](ref-knowledge-graph.md).

## Fetching and Tracking Confluence Pages

**When to fetch.** Fetch a Confluence page when:

- Writing about a topic and the local resource article may be stale or missing.
- A meeting or planning session references a Confluence page.
- The user explicitly asks.
- The `resources` skill (Workflow B) reports new or modified pages.

The trigger table above covers all fetch conditions.

**How to fetch and record:**

1. Check `confluence-map.md` for an existing row — the Summary may be enough.
2. If the Summary is insufficient or no row exists, fetch the page.
3. Add or update the row with all six fields:
   - `Page ID` — Confluence numeric ID (from the page URL).
   - `Title` — exact page title, linked to the Confluence URL.
   - `Parent` — parent page ID (`root` for top-level pages).
   - `Last Modified` — date from `version.when` in the API response (`YYYY-MM-DD`).
   - `Summary` — one to three sentences. Name decisions made, key numbers, named components. Do not write "this page describes" — state the facts directly.
   - `Tags` — registered tags only (from `tags.md`), backtick-quoted inline. Every row needs at least one tag.
4. If the fetch is the source for a new resource article, link it in `knowledge-graph.md`.
5. For bulk map maintenance, use the `resources` skill (Workflow B).

Write policy: never create, edit, or delete Confluence pages without explicit user approval.

## Confluence → Resources Transformation

Confluence pages are raw material. Resource articles are refined output.

**What to extract.** Durable facts only — decisions, process definitions, architecture descriptions, ownership, team structure. Discard meeting logistics, ephemeral status updates, change logs, and formatting boilerplate.

**How much to condense.** A resource article is shorter than its Confluence source. Use tables and bullet lists. Quote specific numbers, dates, and names. Drop narrative filler. A 5-page Confluence document might become 30 lines of resources.

**One page → multiple articles.** Split when a Confluence page covers distinct topics that belong in different resources subfolders. Each article links to the others.

**Multiple pages → one article.** Merge when several Confluence pages describe aspects of one topic. Track all source page IDs in `confluence-map.md`.

**Source attribution.** Each resource article includes a `## Sources` section listing every Confluence page it draws from. See [ref-sources.md](ref-sources.md) for format.

**Re-fetch cadence.** No fixed schedule. Re-fetch when:

- Workflow B detects a modified page.
- A daily workflow reveals that a resource article's facts are stale.
- The user explicitly asks to refresh a topic.

## Maintaining `tags.md`

- Check existing tags before creating to avoid duplicates.
- Which table: `#p-` (projects), `#t-` (teams), `#person-` (people), or Topic.
- Naming: lowercase kebab-case. Prefixes are mandatory for project, team, and person tags.
- Every tag must link to an existing file.
- `#person-` slug must match the resource filename exactly.

Full tag format: see [ref-tags.md](ref-tags.md).

## Resources Graph Health

The knowledge graph degrades silently. These checks catch problems early.

**During Workflow B:** After Step 7, scan for orphan articles — articles with no inbound links from other resource files. Orphans are either missing cross-references or candidates for archiving. Report them in the commit message.

**During `/week-wrap`:** If resource articles were created or heavily edited during the week, verify bidirectional links are intact. Check that new articles appear in `knowledge-graph.md`.

**Staleness heuristic:** An article with `updated` older than 6 months and `status: current` is potentially stale. During Workflow B, if the corresponding Confluence source page was modified after the article's `updated` date, flag the article for review. Set `status: outdated` if the facts have drifted.

**Tag consistency:** When reviewing an article, verify its front matter `tags` match the inline tags and the row in `knowledge-graph.md`. Mismatches cause search failures.
