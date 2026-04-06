---
description: Actualize a single resource article
---

Actualize a single resource article. Load the `resources` skill and then `resources/enrich.md` sub-skill before proceeding. Then execute Workflow A in full.

Arguments: `/r-enrich <article-path>` — path to the resource article to actualize (e.g. `resources/process/api-guidelines.md`).

If no argument is provided, ask the user which article to actualize. Show the current list from `knowledge-graph.md` if helpful.

Execute all steps of **Workflow A** as defined in `.opencode/skills/resources/enrich.md`:

0. Read the plan (if `resources-actualize-plan.md` exists, find this article's entry).
1. Read & understand the article — key terms, sources, outbound links, inbound links.
2. Gather data from all five sources: local resources, Confluence (use `confluence search "term"` / `confluence read PAGE_ID` — see `confluence` skill), Jira (use `jira issue list -q "..." --plain` / `PAGER=cat jira issue view ISSUE-KEY` — see `jira` skill), codebase, journal.
3. Enrich the article with new durable facts.
4. Remove outdated content.
5. Fix cross-references (outbound and inbound back-links).
6. Update metadata (`updated`, `actualized`, `## Changelog`, `## Sources`, `knowledge-graph.md`, `tags.md`, `confluence-map.md`).
7. Graph health check (orphan scan, tag consistency, staleness spot-check).
8. Commit: `Enrich resources: <subfolder>/<article-name>`.

**Stop after committing.** Process exactly one article per invocation.

$ARGUMENTS
