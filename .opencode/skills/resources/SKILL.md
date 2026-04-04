---
name: resources
description: Maintain and actualize resources — single-article enrichment, batch Confluence map sync, graph review and operation planning, and structural operations (create, delete, merge, split, reclassify)
compatibility: opencode
---

Load the `writing` skill alongside this one — it governs style and formatting for all resource content.

## Sub-skills

Load these on top of `resources` for specific workflows:

| Task | Sub-skill to load |
|------|------------------|
| Actualize a single resource article (enrich with new facts, fix cross-references, update metadata) | `resources/enrich` ([enrich.md](enrich.md)) |
| Sync Confluence map and enrich resources in batch (detect new/modified pages, produce operation plan, execute) | `resources/sync` ([sync.md](sync.md)) |
| Review all resources and plan graph restructuring (identify merges, splits, deletes, creates, reclassifies) | `resources/plan` ([plan.md](plan.md)) |
| Discover hidden connections between articles (backlinks, shared tags/sources, entity co-occurrence) | `resources/discover` ([discover.md](discover.md)) |

## Related Skills

Load these alongside `resources` when their domain is involved:

| Domain | Skill |
|--------|-------|
| Fetching Confluence pages, recording in confluence-map, write to Confluence with approval | `confluence` |
| Searching Jira issues, extracting facts for resource articles, write to Jira with approval | `jira` |

Workflow D (structural operations: delete, merge, split, create, reclassify) is defined in this file and called by all three sub-skills.

## Resources Philosophy

Resources form a **concept graph**, not a mirror of Confluence. Articles are nodes; cross-references are edges. The graph's structure is driven entirely by concepts — never by how Confluence happens to organize its pages.

- **Concept-first structure.** Resource article boundaries are drawn around ideas, not around source pages. One Confluence page may feed three resource articles. Three Confluence pages may feed one. The Confluence hierarchy is irrelevant.
- **One concept per article.** Two distinct concepts in one file? Split immediately. Two files covering the same concept? Merge without hesitation.
- **Actively extract new nodes.** Every time you read source material — Confluence, Jira, codebase, existing resource articles — scan for topics, entities, components, people, decisions, and processes that deserve their own article. Create them. Don't wait for an article to reference a concept before giving that concept a home.
- **Freely restructure.** Split, merge, rename, and move articles whenever doing so makes the graph clearer. There is no penalty for restructuring. The only wrong state is a cluttered article or a missing node.
- **Cross-references build value.** Every link added is a path through the graph. Prefer many short linked articles over few long ones.
- **Confluence is raw material.** Distill durable facts. Discard meeting logistics, formatting boilerplate, and expiring status updates. A 5-page Confluence document might become 30 lines across two resource articles.
- **Jira and codebase verify and enrich.** Confirm current state, add concrete details, remove stale claims.

---

## Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. Do not wait for an explicit resources task. Surface gaps as you work and fill them immediately.

| Trigger | Action |
|---------|--------|
| Meeting reveals a person's role, team change, or org structure update | Update or create the person/team resource article |
| Discussion or document mentions an architectural decision | Update the relevant architecture resource or create an ADR |
| Work session produces component ownership facts or technical knowledge | Capture in the appropriate domain resource article |
| A concept, tool, process, or system is mentioned with no resource article | Create a new resource article (not a stub — real content) |
| Confluence page is referenced that's not in `confluence-map.md` | Fetch, record in confluence-map, extract durable facts to resources |
| Jira issue reveals current state contradicting a resource article | Update the resource article with current facts |
| Daily/weekly note log entry contains durable facts | Extract to the relevant resource article |

**Scanning discipline:** At the end of every writing or editing session, do a quick mental scan: "Did I encounter any durable facts not yet captured in resources?" If yes, act immediately.

---

## Workflow D: Execute a Structural Operation

**Purpose:** Execute a single structural operation from the plan (`delete`, `merge`, `split`, `create`, `reclassify`). Each operation runs in its own session.

**Input:** Operation type and details from `resources-actualize-plan.md`.

### Delete

1. Read the article to confirm it should be deleted.
   2. Use `rg` to search `resources/` for all inbound links to the article (see [ref-search.md](ref-search.md)).
3. Remove or redirect every inbound link.
4. Delete the file.
5. Remove the row from `knowledge-graph.md`.
6. Check `confluence-map.md`: for each page ID listed in the article's `## Sources`, search whether any other resource article references that same page ID. If no other article references it, remove the row from `confluence-map.md` (or annotate it as orphaned if you prefer to keep it for historical record).
7. Commit: `Resources: delete <path> — <reason>`

### Merge

1. Read both articles (surviving and absorbed).
2. Identify unique content in the absorbed article not present in the survivor.
3. Merge unique content into the surviving article — do not just concatenate. Restructure sections to flow naturally.
4. Update the surviving article's `## Sources`, `## Related`, `## Changelog`, `updated`. Set `actualized: ""` — the article is structurally complete but not yet enriched by Workflow A.
   5. Use `rg` to search `resources/` for all inbound links to the absorbed article. Redirect them to the surviving article.
6. Delete the absorbed article.
7. Update `knowledge-graph.md`: update the surviving row, remove the absorbed row.
8. Register any new tags in `tags.md`.
9. Commit: `Resources: merge <absorbed> into <surviving>`

### Split

1. Read the source article.
2. Identify the sections/content to extract into each new article.
3. Create new articles from `.opencode/templates/resources-template.md`. Fill all front matter. Set `updated` to today. Set `actualized: ""` — new articles are structurally complete but not yet enriched by Workflow A. Write real content — no stubs.
4. Remove the extracted content from the source article. Replace with a link to the new article. Update the source article's `updated`. Set `actualized: ""` on the source article as well.
5. Update the source article's `## Related`, `## Changelog`.
6. Add bidirectional cross-references between source and new articles.
   7. Use `rg` to search `resources/` for inbound links to the source article that reference the extracted content. Redirect to the new article where appropriate.
8. Add rows for new articles to `knowledge-graph.md`. Update the source article's row.
9. Register any new tags in `tags.md`.
10. Commit: `Resources: split <source> → <new1>, <new2>`

### Create

1. Gather data about the concept: search Confluence, Jira, codebase, and existing resource articles.
2. Create the article from the appropriate template. Place in the correct subfolder by concept domain.
3. Fill all front matter. Set `updated` to today. Set `actualized: ""` — the article is structurally complete but not yet enriched by Workflow A. Assign tags.
4. Write a real Overview and at least one substantive section. No stubs.
5. Add `## Sources` listing every source used.
6. Add `## Related` with cross-references to articles that mention this concept.
7. Add back-links in all referenced articles.
8. Add a row to `knowledge-graph.md`.
9. Register any new tags in `tags.md`.
10. Update `confluence-map.md` if new Confluence pages were fetched.
11. Commit: `Resources: create <path>`

### Reclassify (move/rename)

1. Read the article.
2. Move/rename the file to the new path.
   3. Use `rg` to search `resources/` for all inbound links to the old path. Update them to the new path.
4. Update the article's front matter if tags or content need adjustment for the new subfolder. Set `actualized: ""` — the article is structurally complete but not yet enriched by Workflow A.
5. Update `## Changelog` and `updated`.
6. Update the row in `knowledge-graph.md` (file path and summary if needed).
7. Commit: `Resources: reclassify <old-path> → <new-path>`

---

## References

- **Tags** — naming conventions, prefixes, registration procedure: load [ref-tags.md](ref-tags.md).
- **Resources Map** — row format and update rules for `knowledge-graph.md`: load [ref-knowledge-graph.md](ref-knowledge-graph.md).
- **Sources** — `## Sources` section format per source type: load [ref-sources.md](ref-sources.md).
- **Confluence Map** — format and update rules for `confluence-map.md`: load the `confluence` skill.
- **Searching resources** — ripgrep patterns for inbound links, concept search, tag listing: load [ref-search.md](ref-search.md).
- **Maintenance procedures** — triggers, fetch/record protocol, transformation rules, graph health: load [ref-maintenance.md](ref-maintenance.md).

---

## Rules

- **All Workflow D procedures mandatory.** Every sub-step for the operation type must complete. Never skip a step.
- **One operation at a time.** Never process multiple articles or operations in parallel.
- **Operation ordering matters.** When executing a plan: delete → merge → reclassify → split → create → actualize. Structural cleanup before enrichment.
- **Load the `writing` skill** before editing. Run its editor checklist on every edit.
- **Structure follows concepts, never sources.** Confluence page hierarchy has no authority over resources structure.
- **Default is to create.** When a substantial concept has no article, create one. Do not stuff it into an existing article.
- **Freely restructure.** Split, merge, rename, move, and delete articles whenever it improves the graph. No approval needed. The graph is a living structure, not an archive.
- **Merge aggressively.** Two articles covering the same concept is a defect. Fix immediately.
- **Split proactively.** An article covering two concepts is two articles waiting to be born.
- **Delete without hesitation.** Stubs, duplicates, and obsolete articles are noise. Remove them.
- **Append-only changelog.** Never remove changelog entries.
- **Mandatory `updated`.** Set on every edit.
- **Bidirectional links.** Every A → B requires B → A (except people → topic noise).
- **No stubs.** Every new article needs a real Overview and at least one substantive section.
- **Distill, don't copy.** Confluence and Jira are sources, not mirrors.
- **Read-only externals.** Never write to Jira or Confluence. Codebase is read-only.
- **Fix all inbound links.** After any delete, merge, reclassify, split, or rename: use `rg "<old-filename>" .` from the repo root to find every inbound link (not just in `resources/` — daily notes and project files link in too). Update or remove all matches. Broken links are unacceptable.
