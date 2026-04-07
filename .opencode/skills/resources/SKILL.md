---
name: resources
description: Maintain and actualize resources — single-article enrichment, Confluence sync, graph review and operation planning, and structural operations (create, delete, merge, split, reclassify)
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
| Execute a structural operation (delete, merge, split, create, reclassify) | `resources/operations` ([operations.md](operations.md)) |
| Ingest an external source (URL or file) into resources | `resources/ingest` ([ingest.md](ingest.md)) |
| Query all journal data and synthesize a cited answer | `resources/query` ([query.md](query.md)) |

## Related Skills

Load these alongside `resources` when their domain is involved:

| Domain | Skill |
|--------|-------|
| Fetching Confluence pages, tracking in `confluence-sync.json`, write to Confluence with approval | `confluence` |
| Searching Jira issues, extracting facts for resource articles, write to Jira with approval | `jira` |

Workflow D (structural operations: delete, merge, split, create, reclassify) is defined in [operations.md](operations.md) — load it when executing any structural operation.

## Resources Philosophy

`resources/` is the **knowledge graph** — the permanent, evolving layer of the second brain. Articles are nodes; cross-references are edges. The graph grows and deepens over time: new articles are created as concepts emerge, existing articles are enriched as understanding develops, synthesis articles form where multiple nodes connect into an insight. There is no "finished" state — only more developed. The graph's structure is driven entirely by concepts — never by how Confluence happens to organize its pages.

- **Concept-first structure.** Resource article boundaries are drawn around ideas, not around source pages. One Confluence page may feed three resource articles. Three Confluence pages may feed one. The Confluence hierarchy is irrelevant.
- **One concept per article.** Two distinct concepts in one file? Split immediately. Two files covering the same concept? Merge without hesitation.
- **Actively extract new nodes.** Every time you read source material — Confluence, Jira, codebase, existing resource articles — scan for topics, entities, components, people, decisions, and processes that deserve their own article. Create them. Don't wait for an article to reference a concept before giving that concept a home.
- **Freely restructure.** Split, merge, rename, and move articles whenever doing so makes the graph clearer. There is no penalty for restructuring. The only wrong state is a cluttered article or a missing node.
- **Cross-references build value.** Every link added is a path through the graph. Prefer many short linked articles over few long ones.
- **Confluence is raw material.** Distill durable facts. Discard meeting logistics, formatting boilerplate, and expiring status updates. A 5-page Confluence document might become 30 lines across two resource articles.
- **Jira and codebase verify and enrich.** Confirm current state, add concrete details, remove stale claims.

- **Synthesis articles are first-class nodes.** `resources/synthesis/` holds articles produced by Workflow G that answer recurring questions by compiling multiple sources. They have `status: synthesis` in front matter, cite all sources, and are cross-linked from the articles they draw on.
- **Articles are living documents.** Every revisit should deepen an article, not just bump its timestamp. If re-reading adds no new facts, find one claim to sharpen, one implied link to make explicit, or one thin section to expand. An article that is touched should be meaningfully different afterward.
- **Cross-links generate synthesis.** When two articles are linked, ask whether they together suggest an insight that neither expresses alone. If yes, flag it as a synthesis candidate in the article's `## Changelog`. The `resources/synthesis/` folder is for exactly this — but flag first, create synthesis articles only on a planning pass.
- **Articles mature progressively.** New articles start thin; that is normal. Use `status: stub` for brand-new articles with minimal content; graduate to `status: current` as facts accumulate. Maturity is visible through link density and the `actualized` date — not a badge. The goal is a dense, well-connected graph, not a collection of polished standalone documents.

---

## Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. Do not wait for an explicit resources task. Surface gaps as you work and fill them immediately.

| Trigger | Action |
|---------|--------|
| Meeting reveals a person's role, team change, or org structure update | Update or create the person/team resource article |
| Discussion or document mentions an architectural decision | Update the relevant architecture resource or create an ADR |
| Work session produces component ownership facts or technical knowledge | Capture in the appropriate domain resource article |
| A concept, tool, process, or system is mentioned with no resource article | Create a new resource article (not a stub — real content) |
| Confluence page is referenced that's not in `confluence-sync.json` | Add to `confluence-sync.json`; fetch and extract durable facts to resources |
| Jira issue reveals current state contradicting a resource article | Update the resource article with current facts |
| Daily/weekly note log entry contains durable facts | Extract to the relevant resource article |

**Scanning discipline:** At the end of every writing or editing session, do a quick mental scan: "Did I encounter any durable facts not yet captured in resources?" If yes, act immediately.

---

## References

- **Tags** — naming conventions, prefixes, registration procedure: load [ref-tags.md](ref-tags.md).
- **Sources** — `## Sources` section format per source type: load [ref-sources.md](ref-sources.md).
- **Confluence tracking** — `confluence-sync.json` format and article `confluence:` frontmatter: load the `confluence` skill.
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
- **Fix all inbound links.** After any delete, merge, reclassify, split, or rename: run `node scripts/find-backlinks.js <old-path>` from the repo root to find every inbound link (not just in `resources/` — daily notes and project files link in too). Update or remove all matches. Broken links are unacceptable.
