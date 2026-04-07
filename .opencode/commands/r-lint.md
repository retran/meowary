---
description: Check journal repo for convention violations
---

Audit the journal repo for convention violations and report findings as a checklist. No files are modified — this is a read-only audit.

## Run Health Checks

Execute the full health suite:

```
node .opencode/scripts/health-all.js
```

This runs all checks and produces a grouped report:

- **Front Matter** — files missing `updated` or `tags` front matter
- **Orphaned Articles** — resources with no inbound links (excl. `people/`)
- **Tag Registry** — tags used but not registered in `tags.md`; registered tags not in use
- **Stale Articles** — articles not actualized in 90+ days
- **Article Lengths** — articles over 80 body lines (split candidates)
- **Link Health** — broken links and missing bidirectional back-links
- **Project Health** — active projects with no recent dev log or all tasks done
- **Empty Sections** — standard sections with no content below them

## Output

Present the script output to the user as the lint report. If total issues = 0, say: "All checks passed — repo is clean."

## Append to resources-log.md

After presenting the report, append a dated summary line to `resources-log.md`:

```
- **YYYY-MM-DD:** Lint run — N issues (front-matter: X, tags: Y, links: Z, ...)
```

$ARGUMENTS
