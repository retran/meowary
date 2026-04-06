---
name: resources/ref-search
description: Script reference card for resources operations — inbound links, health checks, analysis, and structural operations
compatibility: opencode
---

## Script Reference Card

All deterministic operations on resource files are handled by scripts in `scripts/`. Load this reference when you need to know which script to run for a given task.

### Find inbound links to an article

```
node scripts/find-backlinks.js <article-path>
```

- Use after every rename, move, split, or delete — catches all broken links before committing.
- Searches the **entire repo** (not just `resources/`), so daily notes and project files are included.
- Outputs one path per line. Zero results = orphaned article.

### Run all health checks

```
node scripts/health-all.js
```

- Runs every health script and outputs a unified grouped report.
- Run before planning (Workflow C) and before sync (Workflow B).
- Issues: orphans, stale articles, tag inconsistencies, broken links, project health, empty sections.

### Individual health checks

| Script | What it checks | Key flags |
|--------|---------------|-----------|
| `node scripts/health-orphans.js` | Articles in `resources/` (excl. `people/`) with zero inbound links | — |
| `node scripts/health-tags.js` | Tags used but not in `tags.md`; registered tags with no usage | — |
| `node scripts/health-stale.js` | Articles not actualized recently | `--days N` (default 90) |
| `node scripts/health-links.js` | Broken links and missing bidirectional back-links | `--scope resources\|journal\|all` |
| `node scripts/health-lengths.js` | Articles exceeding line limit (split candidates) | `--lines N` (default 80) |
| `node scripts/health-frontmatter.js` | Files missing `updated` or `tags` front matter | — |

### Report on all resource articles

```
node scripts/report-resources.js [--sort actualized|lines|inlinks]
```

- Table output: path, lines, tags, actualized date, inlinks, outlinks.
- Use before a planning pass to spot size outliers and stale coverage at a glance.

### Discover connections between articles

```
node scripts/discover-connections.js [--scope <path>] [--limit N]
```

- Scores article pairs by shared tags (+1), shared sources (+2), entity co-occurrence (+1), structural proximity (+1).
- Pairs scoring 3+ are strong candidates for new cross-references.
- Use at the start of Workflow E (discover.md).

### Fix broken links in bulk

```
node scripts/fix-links.js
```

- Identifies and interactively prompts for broken link fixes across `resources/`.
- Run after `find-backlinks.js` surfaces broken links.

### Generate a resource operation plan

```
node scripts/plan-resources.js
```

- Produces a structured candidate operation list (delete, merge, split, create, actualize).
- Use as input before Workflow C (plan.md) to see a machine-generated starting point.

### Execute a structural operation

```
node scripts/run-operation.js
```

- Interactive prompts for delete / merge / split / reclassify / create.
- Follows the procedures in [operations.md](operations.md).

---

## Migration: rg → scripts

| Old (rg) | New (script) |
|----------|-------------|
| `rg "filename" resources/` | `node scripts/find-backlinks.js <file>` |
| `rg "filename" .` (whole repo) | `node scripts/find-backlinks.js <file>` (searches entire repo) |
| Orphan scan bash loop | `node scripts/health-orphans.js` |
| `rg "^tags:.*<tag>" resources/ -l` | `node scripts/health-tags.js` |
