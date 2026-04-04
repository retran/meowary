---
description: Check journal repo for convention violations
---

Scan the journal repo for convention violations and report findings as a checklist. No files are modified — this is a read-only audit.

## Checks

Run each check below. For each violation found, add it to a report checklist.

### 1. Front Matter

Scan all `.md` files (except `AGENTS.md`). Flag files that:
- Have no YAML front matter (`---` block)
- Are missing the `updated` field
- Are missing the `tags` field

### 2. Orphan Tags

- Collect all tags from front matter `tags:` arrays across all files.
- Compare against tags registered in `tags.md`.
- Flag tags used in files but not in `tags.md` (orphans).
- Flag tags in `tags.md` not used in any file (dead registrations).

### 3. Broken Internal Links

Scan all `.md` files for relative links (`[text](relative/path.md)`). Flag links where the target file does not exist.

### 4. Stale Projects

Scan `projects/*/README.md` files. Flag projects that:
- Have `status: Active` but no dev log entry in the last 30 days
- Have `status: Active` but all tasks are completed

### 5. Empty Sections

Scan daily notes, project dashboards, and area dashboards. Flag standard sections (`## Log`, `## Tasks`, `## Notes`, `## Dev Log`) that exist but have no content below them.

### 6. Knowledge Graph Gaps

- Check that every file in `resources/` has an entry in `knowledge-graph.md`.
- Flag resource files missing from the graph.

## Output

Present results grouped by check category:

```
## Lint Report

### Front Matter (N issues)
- [ ] `path/to/file.md` — missing `updated` field
- [ ] `path/to/file.md` — no front matter

### Orphan Tags (N issues)
- [ ] `#tag-name` — used in 3 files, not in tags.md
...

### No Issues
Broken Links, Empty Sections — all clean.
```

If no violations found, say so: "All checks passed — repo is clean."

$ARGUMENTS
