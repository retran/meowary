---
description: Query all journal data and synthesize a cited answer; optionally file to resources/synthesis/
---

Query all journal data with a question and synthesize a cited answer. Load the `resources` skill and then `resources/query` sub-skill before proceeding. Then execute Workflow G in full.

Arguments: `/ask <question>` — the question to answer. Searches across `resources/`, `journal/`, and `inbox/` via QMD.

If no argument is provided, ask the user what question to answer before proceeding.

Execute all steps of **Workflow G** as defined in `.opencode/skills/resources/query.md`:

1. Search all collections via `qmd query "<question>"` (fallback: search key terms manually across `resources/`, `journal/`, `inbox/`).
2. Read cited sources — up to 10 highest-relevance files.
3. Synthesize a cited answer: direct answer first, then supporting facts with inline links.
4. Assess filing criteria — file if the synthesis has lasting value and compiles 3+ sources.
5. If filing: create `resources/synthesis/<slug>.md`, update `knowledge-graph.md`, re-index, commit.
6. Append to `resources-log.md` (whether or not filing).

$ARGUMENTS
