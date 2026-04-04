---
description: Ingest a URL or file into resources
---

Ingest an external source into resources. Load the `resources` skill and then `resources/ingest` sub-skill before proceeding. Then execute Workflow F in full.

Arguments: `/r-ingest <url-or-file-path>` — URL to fetch or local file path to ingest.

If no argument is provided, ask the user for the URL or file path before proceeding.

Execute all steps of **Workflow F** as defined in `.opencode/skills/resources/ingest.md`:

1. Fetch the source (`node scripts/fetch-source.js <url>` for URLs; read directly for local files).
2. Identify concepts — people, teams, components, processes, decisions.
3. Decide operation type: `create` for new concepts, `actualize` for existing articles.
4. Execute operations using `resources/operations` sub-skill (create) or Workflow A (actualize).
5. Update `knowledge-graph.md`, `tags.md`, `confluence-map.md` as needed.
6. Re-index (`node scripts/qmd-index.js`).
7. Commit: `Ingest: <source-title> — <operation-summary>`.
8. Append to `resources-log.md`.

$ARGUMENTS
