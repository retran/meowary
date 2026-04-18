---
name: qmd
description: QMD CLI mechanics -- query types (lex/vec/hyde), query syntax, multi-get, and index maintenance. Load when issuing a qmd query, choosing query types for better recall, or re-indexing after bulk changes.
compatibility: Requires qmd CLI. Install via `npm install -g @tobilu/qmd`.
updated: 2026-04-18
---

<role>QMD CLI mechanics: query types, syntax, multi-get, index maintenance.</role>

<summary>
> Local semantic search for journal/resources/projects content. Three query types (lex/vec/hyde) for different intents. Re-index after bulk changes.
</summary>

## Status

!`qmd status 2>/dev/null || echo "Not installed: npm install -g @tobilu/qmd"`

<cli>

```bash
qmd query "question"              # Auto-expand + rerank
qmd query $'lex: X\nvec: Y'       # Structured multi-type query
qmd query $'expand: question'     # Explicit expand
qmd query --json --explain "q"    # Score traces (RRF + rerank blend)
qmd search "keywords"             # BM25 only (no LLM)
qmd get "#abc123"                 # By docid
qmd multi-get "journals/2026-*.md" -l 40  # Batch snippets by glob
qmd multi-get notes/foo.md,notes/bar.md   # Comma list, preserves order
```

</cli>

<query_types>

| Type | Method | Input |
|------|--------|-------|
| `lex` | BM25 | Keywords — exact terms, names, code |
| `vec` | Vector | Question — natural language |
| `hyde` | Vector | Answer — hypothetical result (50–100 words) |

### Writing good queries

**lex (keyword)**
- 2–5 terms, no filler
- Exact phrase: `"connection pool"` (quoted)
- Exclude: `performance -sports` (minus prefix)
- Code identifiers work: `handleError async`

**vec (semantic)**
- Full natural language question
- Be specific: `"how does the rate limiter handle burst traffic"`
- Include context: `"in the payment service, how are refunds processed"`

**hyde (hypothetical document)**
- 50–100 words of what the *answer* looks like
- Use vocabulary expected in result

**expand (auto-expand)**
- Single-line query — local LLM generates lex/vec/hyde variations
- DO NOT mix with other typed lines

### Combining types

| Goal | Approach |
|------|----------|
| Know exact terms | `lex` only |
| Don't know vocabulary | Single-line (implicit `expand:`) or `vec` |
| Best recall | `lex` + `vec` |
| Complex topic | `lex` + `vec` + `hyde` |
| Ambiguous | Add `intent:` to any combination |

First query gets 2× weight in fusion — put best guess first.

### Lex syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `term` | Prefix match | `perf` matches "performance" |
| `"phrase"` | Exact phrase | `"rate limiter"` |
| `-term` | Exclude | `performance -sports` |

`-term` works only in lex queries.

### Intent (disambiguation)

```bash
qmd query $'lex: performance\nintent: web page load times and Core Web Vitals'
```

Intent affects expansion, reranking, snippet extraction. Does not search alone.

### Collection filtering

```bash
qmd query --collections docs "question"
qmd query --collections docs,notes "question"
```

Omit to search all collections.

</query_types>

<maintenance>

Re-index after bulk changes: `node .opencode/scripts/qmd-index.js`

| Flag | Behavior |
|------|----------|
| (none) | Incremental — re-indexes changed/new files only |
| `--changed` | Git-aware early exit — skips entirely if no indexed `.md` changed (fastest; automated hooks) |
| `--full` | Force re-embed all chunks — only when switching embedding models or recovering corrupt index |

Collections must be registered before update. `/bootstrap` registers standard collections. Manual:

```bash
qmd collection add <name> <path>   # e.g. qmd collection add context ./context
```

</maintenance>

<self_review>
- [ ] Query type appropriate (lex=exact, vec=semantic, hyde=conceptual)?
- [ ] Collection exists and indexed?
- [ ] Re-index triggered after bulk changes?
</self_review>

<output_rules>Output in English. Preserve verbatim CLI commands, flags, and bash status block.</output_rules>
