---
name: resources/query
description: Query all journal data with a question and synthesize a cited answer; optionally file the synthesis to resources/synthesis/
depends_on: resources
compatibility: opencode
---

## Workflow G: Query and Synthesize

**Purpose:** Answer a question by searching across all journal collections (resources, journal, inbox), synthesize a cited answer, and optionally file it as a durable synthesis article.

**Input:** A natural language question.

**Output:** A cited answer synthesizing content from matched articles. Optionally: a new `resources/synthesis/<slug>.md` article.

### Step 1: Search All Collections

Run the QMD semantic search across all configured collections:

```
qmd query "<question>"
```

If `qmd` is not installed, run `node scripts/qmd-index.js` first for installation instructions. As a fallback, search `resources/`, `journal/`, `inbox/`, `projects/`, `areas/`, `drafts/`, `archive/`, and root-level meta files (e.g. `context.md`, `knowledge-graph.md`, `tags.md`) for key terms manually.

QMD returns a ranked list of matching passages with their source files.

### Step 2: Read Cited Sources

For each file cited in the QMD results (up to the top 10 by relevance score):

- Read the relevant passages from `resources/` articles.
- Read matching sections from `journal/daily/`, `journal/weekly/`, and `journal/meetings/`.
- Read matching content from `inbox/` notes.

Note each source's path and the key fact it contributes.

### Step 3: Synthesize the Answer

Write a synthesis that:

- **Directly answers the question** in the first 1–3 sentences.
- **Supports the answer** with specific facts from the sources — numbers, dates, decisions, names.
- **Cites each claim** with a relative link: `([Source](../resources/path/article.md))` or `([Date](../journal/daily/YYYY-MM-DD.md))`.
- **Notes conflicts** if sources contradict each other — do not paper over disagreements.
- **Flags gaps** if the question cannot be fully answered from available sources.

### Step 4: Assess Filing Criteria

Determine whether this synthesis is worth filing as a permanent `resources/synthesis/` article. File it if **two or more** of the following are true:

- The question is likely to recur (architectural, process, team, or technical question).
- The synthesis compiles facts from 3+ distinct sources that would otherwise require repeated searches.
- The answer reveals a cross-cutting insight not captured in any single existing article.
- The answer took significant effort to produce (multiple sources reconciled, conflicts resolved).

Do **not** file:
- One-off or highly time-sensitive questions.
- Questions whose answers are already in a single resource article (just link to it).

### Step 5: File the Synthesis (if criteria met)

If Step 4 says to file, create `resources/synthesis/<slug>.md` following the `synthesis-template.md` template:

1. Choose a slug that reads as a question or concept: e.g. `who-owns-the-build-system.md`.
2. Fill front matter: `title`, `question` (the original question), `status: synthesis`, `sources: [<paths>]`, `created`, `updated`, `tags`.
3. Write the body:
   - `## Question` — the original question verbatim.
   - `## Synthesis` — the synthesized answer with inline citations.
   - `## Sources` — list every source file used with a brief note on what it contributed.
4. Add a row to `knowledge-graph.md`.
5. Register any new tags in `tags.md`.
6. Add back-links from the most relevant source articles (`## Related` section).
7. Run `node scripts/qmd-index.js` to index the new file.
8. Commit: `Resources: synthesis — <slug>`
9. Append to `resources-log.md`:
   ```
   - **YYYY-MM-DD:** synthesis | <slug> — filed from question: "<question>"
   ```

### Step 6 (if not filing): Append to resources-log.md

Even when not filing a synthesis article, record the query:

```
- **YYYY-MM-DD:** query | "<question>" — answered; not filed
```

---

## Rules

- **Cite every fact.** Unsupported claims in a synthesis are unacceptable. If a fact has no source, remove it.
- **Answer first.** Do not bury the answer in preamble. State it directly, then support it.
- **Synthesis, not summary.** Combine sources to produce insight that no single source contains alone.
- **Don't force filing.** Most queries don't need a permanent article. File only when the synthesis has lasting value.
- **Synthesis articles are first-class resources.** Once filed, they are subject to the same enrichment and maintenance rules as any other resource article.
