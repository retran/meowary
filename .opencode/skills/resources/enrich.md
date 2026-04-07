---
name: resources/enrich
description: Actualize a single resource article — gather data from all sources, enrich content, fix cross-references, update metadata
depends_on: resources
compatibility: opencode
---

## Create-If-Not-Exists

If the article path passed to `/r-enrich` **does not exist**, run Workflow D Create for that concept first:

- Use the path slug as the concept name (e.g. `resources/people/alice-smith.md` → concept: "Alice Smith").
- Gather available context from Confluence, Jira, and journal before creating.
- Follow all Workflow D Create steps in [operations.md](operations.md).

After the file is created, proceed with **Step 0** below on the newly created file.

This enables `/r-enrich resources/people/<slug>.md` and `/r-enrich resources/teams/<slug>.md` to create new person or team articles without a dedicated create command.

---

## Workflow A: Actualize a Single Article

**Input:** article file path (e.g. `resources/process/ci-pipeline.md`).

**All 9 steps are mandatory. Do not skip any step. Process one article at a time.**

### Step 0: Read the Plan

If `resources-actualize-plan.md` exists:
- Read the operation queue.
- Find the `actualize` row for this article.
- Read the `Details` column — it describes what needs enrichment.
- Check the `Missing Cross-References` table for pairs involving this article.
- Check `Notes` for any observations relevant to this article.
- Use this context throughout the remaining steps.

If the plan file does not exist, proceed without it — Steps 1–8 are self-sufficient.

### Step 1: Read & Understand

- Read the article fully: front matter, body, `## Related`, `## Changelog`.
- Note `status`, `updated`, `tags`, `confluence: [...]` (source page IDs), outbound links.
- Identify 3–8 **key terms** (nouns, component names, concepts) to drive searches.
- Note any concepts, people, components, or decisions mentioned in the article that have no resource article yet — these are candidate new nodes.

### Step 2: Gather Data

Run all five sub-steps. Use multiple search strategies per sub-step — do not stop after the first hit.

**When the article is a person file** (`resources/people/`), use these source priorities:
- **2b (Confluence):** Search the person's full name; check their team's roster and org chart pages.
- **2c (Jira):** Search by assignee or reporter. Note current role, active projects, and work focus.
- **2e (Journal):** Search for the person's name across `journal/daily/`, `journal/meetings/`, and `projects/`. Extract role updates, team changes, and collaboration patterns.
- Codebase (2d) is less relevant for most person files — skip unless the article covers technical ownership.

#### 2a. Local Resources

- Search key terms across `resources/` (use `qmd query "<term>"` or `rg`).
- Check same-subfolder articles for overlap or missing cross-references.
- Check articles sharing the same tags (search `tags:` front matter with `rg`).
- Read related articles to avoid duplicating existing facts.
- Identify gaps: unlinked mentions, outdated cross-references, missing back-links.

#### 2b. Confluence

Load the `confluence` skill for search strategies and fetch procedures.

Search using at least three strategies:

- Exact article title
- Key domain terms and synonyms
- Names of people, teams, or components
- Related product or project names
- Front matter tags as search terms

For each relevant page:
- Extract durable facts (decisions, ownership, dates, metrics, architecture).
- Compare against current article content — note gaps and contradictions.
- Add the page ID to the article's `confluence:` front matter if not already present.
- Add the page to `confluence-sync.json` if it should be monitored going forward (see `confluence` skill).

#### 2c. Jira

Load the `jira` skill for search strategies and fact extraction rules.

Search using at least two strategies:

- Component or feature names from the article
- Team name (e.g. `project = PROJ` or `labels = my-label`) — use the project key from `context.md`
- Epics or recent issues on the topic
- People mentioned as assignees or reporters

Extract durable facts only: decisions, deadlines, ownership changes. Summarize and note the issue key — do not copy issue descriptions.

#### 2d. Codebase

Check `context.md` for the local codebase path.

- Search for types, namespaces, classes, interfaces mentioned in the article.
- Verify file paths, component names, architecture descriptions.
- Check READMEs, doc comments, config files for additional facts.
- Look for renamed classes, moved namespaces, removed features, new modules.

Correct stale technical details from current code state.

#### 2e. Journal (daily notes, weekly logs, projects)

- Search key terms across `journal/daily/`, `journal/weekly/`, and `projects/`.
- Read matching daily note entries and project dev log sections — focus on Log & Notes, decisions recorded, blockers resolved.
- Extract durable facts: architectural decisions made during work sessions, ownership changes, process observations, concrete numbers or dates not yet captured in resources.
- Check project READMEs (`projects/*/README.md`) for current status, open tasks, and dev log entries that reveal facts the article should reflect.
- Discard transient content (today's task state, meeting logistics, personal reflections) — extract only facts that remain true beyond the day they were written.

#### 2f. Entity & Topic Extraction

Scan all material gathered in 2a–2e. For each piece of source material, identify:

- **Named entities:** people, teams, components, systems, services, namespaces, Jira projects.
- **Concepts:** processes, patterns, decisions, standards, frameworks, methodologies.
- **Relationships:** ownership, dependencies, supersessions, replacements.

For each entity or concept found, check `resources/` (or use `qmd query "<concept>"`) to see if an article exists. If no article exists and the topic is substantial (more than a one-liner), note it in `## Changelog` as a candidate for a future `create` operation in Workflow C. Do not create articles — just flag them.

### Step 3: Enrich the Article

Add new durable facts gathered in Step 2 to the current article:

- Add concrete details: numbers, dates, component names, ownership, versions.
- Fill thin sections with substantive content.
- Replace inline explanations of other concepts with links to their resource articles.
- Do **not** split, merge, rename, move, or create new articles — those are Workflow D operations planned in Workflow C. If you identify candidates for those operations, note them in `## Changelog` for the next planning pass (e.g. `- **YYYY-MM-DD:** Candidate split: <topic> growing large`).

### Step 3b: Progressive Summarization

After enriching, apply layered distillation to make the article progressively more useful on re-reads. This step refines signal density — it does not add new facts (that was Step 3).

**Layer 1 — Highlight.** Bold the most important phrases and sentences in each section. A reader skimming only the bold text should grasp the core message. Target roughly 10–20% of body text.

**Layer 2 — Summarize.** If the article is longer than ~80 lines of body content, add or update a `## Summary` section immediately after the H1 heading. Write 3–5 bullet points capturing the essential facts. Each bullet should be self-contained and link to the section it distills.

**Layer 3 — Synthesize.** When the article connects to three or more other resource articles on a shared theme, add a synthesis note at the end of `## Summary` (or `## Overview` if no summary exists). State the cross-cutting insight in one sentence and link to the related articles. Example: *"Together with [X](x.md) and [Y](y.md), this defines the three-tier extension model for Studio Pro."*

**Rules:**
- Do not highlight entire paragraphs — highlight key phrases within them.
- Do not create a summary for short articles (< 80 lines body). Highlights alone suffice.
- Layer 3 is optional — add it only when a genuine cross-cutting insight exists. Do not force connections.
- Revisit layers on subsequent enrichments: update highlights if facts changed, refresh the summary if sections were rewritten.

### Step 3c: Evolution Check

Has this article grown substantively since it was last actualized? Compare the current content against the `actualized` date. If the only change would be a timestamp bump, make at least one real improvement before proceeding:

- Sharpen a claim with more precise language or a concrete example.
- Make an implied link explicit: text mentions a concept that has a resource article but no link.
- Expand a thin section by one sentence of context or one concrete fact.

An article that is touched should be meaningfully different afterward.

### Step 3d: Synthesis Check

After cross-referencing in Step 3b: do any two articles you just linked express ideas that together suggest an insight neither contains alone? If yes, append to `## Changelog`:

```
- **YYYY-MM-DD:** Synthesis candidate: [ArticleA](link) × [ArticleB](link) → <one sentence describing the cross-cutting insight>.
```

Do not create a synthesis article now. This flags the candidate for a future `/r-plan` pass, which reviews the graph and decides which candidates warrant a new synthesis article.

### Step 4: Remove Outdated Content

- Remove facts contradicted by Confluence, Jira, or codebase.
- Remove references to disbanded teams, deprecated processes, renamed components.
- Remove speculative content since resolved (decided, shipped, or abandoned).
- If the entire article is obsolete: set `status: outdated` or `archived`, add a blockquote at top: `> **Outdated:** <reason>. Needs review.`
- If a section is now covered by a separate article, replace with a link.

### Step 5: Fix Cross-References

**Outbound links:**
- Verify every link targets an existing file. Fix or remove broken links.
- Add links to resource articles when the text mentions their topics.

**Inbound back-links:**
- For every new link A → B, add a back-link in B's `## Related`.
- Exception: topic articles need not link back to every person who mentions them.

**Stale links:**
- Drop links to archived or deleted articles (unless historical context).
- Fix links to renamed or moved files.

### Step 6: Update Metadata

- Set `updated` to today.
- Set `actualized` to today. This field tracks when Workflow A was last run on this article — distinct from `updated`, which changes on any edit.
- Append to `## Changelog` (newest first): `- **YYYY-MM-DD:** <what changed>.`
- Create `## Changelog` if missing.
- Update `## Sources`: add links for any new sources used; remove links to sources no longer referenced. See [ref-sources.md](ref-sources.md) for format by source type.
- Update `confluence:` front matter: add any new Confluence page IDs used as sources.
- Verify `tags` in front matter match inline tags.
- Register new tags in `tags.md` (see [ref-tags.md](ref-tags.md)).

### Step 7: Graph Health Check

#### 7a. Orphan scan

Check whether the article has at least one inbound link from another resource file. Run:

```
node .opencode/scripts/find-backlinks.js <article-path>
```

Zero results means the article is orphaned — invisible in the knowledge graph. Fix by adding a link from the most closely related article's `## Related` section.

People files (`resources/people/`) are exempt from the orphan check — they do not need inbound links. They are **not** exempt from actualization: every person file goes through Workflow A in full.

#### 7b. Tag consistency

For the article and any articles edited during this iteration:

- All tags must exist in `tags.md`. Common mistakes: `spam` instead of `t-spam`, unregistered tags.
- Inline `#tags` in the body should match front matter tags.

#### 7c. Staleness spot-check

Check articles in the same subfolder that share tags with the current article:

- If `actualized` is older than **2 weeks** and `status: current`, flag as potentially stale.
- **Confluence** — for each page ID in `confluence:` front matter, check `confluence-sync.json` for its last-synced date. Flag if the page was modified in Confluence after `actualized`.
- **Jira** — for any Jira issue keys mentioned in the article, check if the issue was updated after `actualized`.
- **Journal** — search `journal/daily/` and `projects/` for the article's key terms. If recent entries (after `actualized`) contain facts not reflected in the article, flag it.
- **Codebase** — if the article references specific files, namespaces, or components, check whether they changed after `actualized`.
- Do not fix stale articles now — report them in the commit message.

### Step 8: Commit

Stage only files touched in this iteration:

- The article itself
- Articles where back-links were added
- Newly created articles
- `tags.md`, `confluence-sync.json` (if changed)

Commit message: `Enrich resources: <subfolder>/<article-name>`

If the health check (Step 7) found stale neighbor articles, append their paths to the commit message body.

### Stop

**After committing, stop.** Do not pick up the next article from `resources-actualize-plan.md` or any other source. Report completion to the user and wait for the next instruction. Workflow A processes exactly one article per invocation.
