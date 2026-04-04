---
name: resources/ref-search
description: Ripgrep search patterns for resources operations — inbound links, concept search, tag listing, cross-folder references
compatibility: opencode
---

## Searching Resources

Use **ripgrep (`rg`)** for all resource searches. It is faster and more precise than glob or `find`.

### Find all inbound links to a file

```bash
rg "adr-conventions" resources/ --type md
```

Use this after every rename, move, split, or delete to catch every broken link before committing.

### Search resource content by concept or keyword

```bash
rg "tool execution context" resources/ --type md -i
```

Use before creating a new article to check if the concept already exists somewhere.

### List files containing a tag

```bash
rg "t-spam" resources/ --type md -l
```

### Find all articles in a subfolder referencing another subfolder

```bash
rg "\.\./people/" resources/process/ --type md -l
```

### Locate where a person or team is mentioned across resources

```bash
rg "person-alice" resources/ --type md
```

### Rules for search

- **Always search before creating.** Run `rg "<concept>"` across `resources/` before creating a new article — the article may already exist under a different name.
- **Always search after rename/move.** Run `rg "<old-filename>"` across the whole repo (not just `resources/`) to catch inbound links in daily notes, project READMEs, meta files, and AGENTS.md.
- **Search the whole repo for cross-cutting renames.** Use `rg "old-name" .` (repo root) rather than `rg "old-name" resources/` — daily notes and project files link into resources too.
