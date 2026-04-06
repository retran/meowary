---
name: resources/ingest
description: Ingest an external source (URL or file) into resources — fetch, identify concepts, create or actualize articles, re-index
depends_on: resources
compatibility: opencode
---

## Workflow F: Ingest an External Source

**Purpose:** Bring content from a URL or local file into `resources/` as one or more resource articles. Fetches the source, identifies concepts, executes the minimum set of resource operations (create or actualize), updates the knowledge graph, and re-indexes.

**Input:** A URL or local file path.

**Output:** One or more new or updated resource articles, updated `knowledge-graph.md`, semantic index rebuilt, log entry in `resources-log.md`.

### Step 1: Fetch and Read the Source

**If the input is a URL:**

```
node scripts/fetch-source.js <url>
```

The script fetches the HTML, strips navigation and boilerplate, and outputs clean markdown with a `<!-- Source: <url> -->` header. Read the output.

**If the input is a local file path:**

Read the file directly.

### Step 2: Identify Concepts

Scan the source material for:

- **Named entities:** people, teams, components, systems, services, Jira projects.
- **Concepts:** processes, patterns, decisions, standards, frameworks, methodologies.
- **Relationships:** ownership, dependencies, supersessions, replacements.

For each concept found, check `knowledge-graph.md`:

- **Exists** → mark as `actualize` candidate.
- **Does not exist** → mark as `create` candidate (if the concept is substantial — more than a one-liner).

Group related concepts that would naturally belong in the same article.

### Step 3: Decide Operation Type

**Single clear topic:** One `create` or one `actualize` operation.

**Multiple concepts:**
- If they belong together (one coherent article): one `create` or `actualize`.
- If they are distinct: multiple `create` operations, one per concept.

Prefer `actualize` over `create` when a matching article already exists — enrich it rather than duplicate it.

### Step 4: Execute Operations

For each operation decided in Step 3, load `resources/operations` ([operations.md](operations.md)) and follow the appropriate procedure:

**`create`:** Follow the Create procedure. Skip the "Gather data from Confluence, Jira, codebase" sub-step — the source material from Step 1 is already the primary data source. Use it directly for content, `## Sources`, and tags.

**`actualize`:** Follow Workflow A in [enrich.md](enrich.md). In Step 2 (Gather Data), treat the fetched source as the primary data source — run the remaining sub-steps as normal to find corroborating or conflicting evidence.

### Step 5: Update Metadata

After all operations:

- Update `knowledge-graph.md` rows for every created or modified article.
- Register any new tags in `tags.md`.
- Update `confluence-map.md` if the source was a Confluence page.

### Step 6: Re-index

```
node scripts/qmd-index.js
```

Rebuilds the semantic index so new articles are queryable by `/ask`.

### Step 7: Commit

```
git add resources/ knowledge-graph.md tags.md
git commit -m "Ingest: <source-title> — <operation summary>"
```

### Step 8: Append to resources-log.md

```
- **YYYY-MM-DD:** ingest | <url-or-path> — <operation-summary>
```

Example: `- **2026-04-04:** ingest | https://example.com/api-guidelines — created resources/process/api-guidelines.md`
