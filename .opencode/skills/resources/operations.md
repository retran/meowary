---
name: resources/operations
description: Execute a structural resource operation — delete, merge, split, create, or reclassify
compatibility: opencode
---

## Workflow D: Execute a Structural Operation

**Purpose:** Execute a single structural operation from the plan (`delete`, `merge`, `split`, `create`, `reclassify`). Each operation runs in its own session.

**Input:** Operation type and details from `node scripts/plan-resources.js` or a manually described operation.

To see all operations and their interactive prompts, run: `node scripts/run-operation.js`

### Delete

1. Read the article to confirm it should be deleted.
2. Run `node scripts/find-backlinks.js <article-path>` to find all inbound links.
3. Remove or redirect every inbound link.
4. Delete the file.
5. Register any affected tags cleanup in `tags.md` if tags become unused.
6. Commit: `Resources: delete <path> — <reason>`

### Merge

1. Read both articles (surviving and absorbed).
2. Identify unique content in the absorbed article not present in the survivor.
3. Merge unique content into the surviving article — do not just concatenate. Restructure sections to flow naturally.
4. Update the surviving article's `## Sources`, `## Related`, `## Changelog`, `updated`, `confluence:`. Set `actualized: ""` — the article is structurally complete but not yet enriched by Workflow A.
5. Run `node scripts/find-backlinks.js <absorbed-path>` to find all inbound links to the absorbed article. Redirect them to the surviving article.
6. Delete the absorbed article.
7. Register any new tags in `tags.md`.
8. Commit: `Resources: merge <absorbed> into <surviving>`

### Split

1. Read the source article.
2. Identify the sections/content to extract into each new article.
3. Create new articles from `.opencode/templates/resources-template.md`. Fill all front matter. Set `updated` to today. Set `actualized: ""` — new articles are structurally complete but not yet enriched by Workflow A. Write real content — no stubs.
4. Remove the extracted content from the source article. Replace with a link to the new article. Update the source article's `updated`. Set `actualized: ""` on the source article as well.
5. Update the source article's `## Related`, `## Changelog`.
6. Add bidirectional cross-references between source and new articles.
7. Run `node scripts/find-backlinks.js <source-path>` to find inbound links referencing the extracted content. Redirect to the new article where appropriate.
8. Register any new tags in `tags.md`.
9. Commit: `Resources: split <source> → <new1>, <new2>`

### Create

1. Gather data about the concept: search Confluence, Jira, codebase, and existing resource articles.
2. Run `node scripts/health-orphans.js` to check for related orphaned articles that should be connected.
3. Create the article from the appropriate template. Place in the correct subfolder by concept domain.
4. Fill all front matter. Set `updated` to today. Set `actualized: ""`. Set `confluence: [PAGE_IDs]` for any Confluence pages used. Assign tags.
5. Write a real Overview and at least one substantive section. No stubs.
6. Add `## Sources` listing every source used.
7. Add `## Related` with cross-references to articles that mention this concept.
8. Add back-links in all referenced articles.
9. Register any new tags in `tags.md`.
10. Update `confluence-sync.json` if new Confluence pages were fetched and should be monitored.
11. Commit: `Resources: create <path>`

### Reclassify (move/rename)

1. Read the article.
2. Move/rename the file to the new path.
3. Run `node scripts/find-backlinks.js <old-path>` to find all inbound links. Update them to the new path.
4. Update the article's front matter if tags or content need adjustment for the new subfolder. Set `actualized: ""` — the article is structurally complete but not yet enriched by Workflow A.
5. Update `## Changelog` and `updated`.
6. Commit: `Resources: reclassify <old-path> → <new-path>`

---

## Rules

- **All steps mandatory.** Every sub-step for the operation type must complete. Never skip a step.
- **One operation at a time.** Never process multiple articles or operations in parallel.
- **Operation ordering matters.** When executing a plan: delete → merge → reclassify → split → create → actualize. Structural cleanup before enrichment.
- **Fix all inbound links.** After any delete, merge, reclassify, split, or rename: run `node scripts/find-backlinks.js <old-path>` to find every inbound link (not just in `resources/` — daily notes and project files link in too). Update or remove all matches. Broken links are unacceptable.
