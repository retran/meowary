---
name: qmd
description: Search markdown knowledge bases, notes, and documentation using QMD. Use when searching notes, finding documents, or looking up information in the journal.
license: MIT
compatibility: Requires qmd CLI. Install via `npm install -g @tobilu/qmd`.
metadata:
  author: tobi
  version: "2.0.0"
allowed-tools: Bash(qmd:*)
---

# QMD — Quick Markdown Search

Local semantic search engine for journal content.

## Status

!`qmd status 2>/dev/null || echo "Not installed: npm install -g @tobilu/qmd"`

## CLI

```bash
qmd query "question"              # Auto-expand + rerank
qmd query $'lex: X\nvec: Y'       # Structured multi-type query
qmd query $'expand: question'     # Explicit expand
qmd query --json --explain "q"    # Show score traces (RRF + rerank blend)
qmd search "keywords"             # BM25 only (no LLM)
qmd get "#abc123"                 # By docid
qmd multi-get "journals/2026-*.md" -l 40  # Batch pull snippets by glob
qmd multi-get notes/foo.md,notes/bar.md   # Comma-separated list, preserves order
```

## Query Types

| Type | Method | Input |
|------|--------|-------|
| `lex` | BM25 | Keywords — exact terms, names, code |
| `vec` | Vector | Question — natural language |
| `hyde` | Vector | Answer — hypothetical result (50-100 words) |

### Writing Good Queries, Combining Types, Lex Syntax, Intent

See [qmd/reference/query-guide.md](reference/query-guide.md) for full query writing guidance, combining types table, lex syntax, and intent examples.

### Collection Filtering

```bash
qmd query --collections docs "question"
qmd query --collections docs,notes "question"
```

Omit to search all collections.

## Maintenance

Re-index after bulk changes: `node .opencode/scripts/qmd-index.js`
