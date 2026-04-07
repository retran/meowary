# QMD Query Guide

## Writing Good Queries

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
- Write 50–100 words of what the *answer* looks like
- Use the vocabulary you expect in the result

**expand (auto-expand)**
- Single-line query — lets the local LLM generate lex/vec/hyde variations
- Do not mix with other typed lines

## Combining Types

| Goal | Approach |
|------|----------|
| Know exact terms | `lex` only |
| Don't know vocabulary | Single-line query (implicit `expand:`) or `vec` |
| Best recall | `lex` + `vec` |
| Complex topic | `lex` + `vec` + `hyde` |
| Ambiguous query | Add `intent:` to any combination |

First query gets 2× weight in fusion — put your best guess first.

## Lex Query Syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `term` | Prefix match | `perf` matches "performance" |
| `"phrase"` | Exact phrase | `"rate limiter"` |
| `-term` | Exclude | `performance -sports` |

Note: `-term` only works in lex queries.

## Intent (Disambiguation)

Add an `intent:` line to steer results when a term is ambiguous:

```bash
qmd query $'lex: performance\nintent: web page load times and Core Web Vitals'
```

Intent affects expansion, reranking, and snippet extraction. It does not search on its own.
