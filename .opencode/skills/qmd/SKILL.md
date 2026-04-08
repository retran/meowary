---
name: qmd
description: QMD CLI mechanics — query types (lex/vec/hyde), query syntax, multi-get, and index maintenance. Load when issuing a qmd query, choosing query types for better recall, or re-indexing after bulk changes.
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

| Type   | Method | Input                                       |
| ------ | ------ | ------------------------------------------- |
| `lex`  | BM25   | Keywords — exact terms, names, code         |
| `vec`  | Vector | Question — natural language                 |
| `hyde` | Vector | Answer — hypothetical result (50-100 words) |

### Writing Good Queries

**lex (keyword)**

- 2–5 terms, no filler words
- Exact phrase: `"connection pool"` (quoted)
- Exclude terms: `performance -sports` (minus prefix)
- Code identifiers work: `handleError async`

**vec (semantic)**

- Full natural language question
- Be specific: `"how does the rate limiter handle burst traffic"`
- Include context: `"in the payment service, how are refunds processed"`

**hyde (hypothetical document)**

- Write 50–100 words of what the _answer_ looks like
- Use the vocabulary you expect in the result

**expand (auto-expand)**

- Single-line query — lets the local LLM generate lex/vec/hyde variations
- Do not mix with other typed lines

### Combining Types

| Goal                  | Approach                                        |
| --------------------- | ----------------------------------------------- |
| Know exact terms      | `lex` only                                      |
| Don't know vocabulary | Single-line query (implicit `expand:`) or `vec` |
| Best recall           | `lex` + `vec`                                   |
| Complex topic         | `lex` + `vec` + `hyde`                          |
| Ambiguous query       | Add `intent:` to any combination                |

First query gets 2× weight in fusion — put your best guess first.

### Lex Query Syntax

| Syntax     | Meaning      | Example                      |
| ---------- | ------------ | ---------------------------- |
| `term`     | Prefix match | `perf` matches "performance" |
| `"phrase"` | Exact phrase | `"rate limiter"`             |
| `-term`    | Exclude      | `performance -sports`        |

Note: `-term` only works in lex queries.

### Intent (Disambiguation)

Add an `intent:` line to steer results when a term is ambiguous:

```bash
qmd query $'lex: performance\nintent: web page load times and Core Web Vitals'
```

Intent affects expansion, reranking, and snippet extraction. It does not search on its own.

### Collection Filtering

```bash
qmd query --collections docs "question"
qmd query --collections docs,notes "question"
```

Omit to search all collections.

## Maintenance

Re-index after bulk changes: `node .opencode/scripts/qmd-index.js`

- Default (no flag): incremental update — re-indexes changed/new files only
- `--changed`: git-aware early exit — skips entirely if no indexed `.md` files changed (fastest; use in automated hooks)
- `--full`: force re-embed all chunks — use only when switching embedding models or recovering a corrupt index

Collections must be registered in the qmd index before they can be updated. The `/bootstrap` command registers all standard collections. To register a new collection manually:

```bash
qmd collection add <name> <path>   # e.g. qmd collection add context ./context
```
