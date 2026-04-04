---
name: resources/ref-sources
description: Format rules for the Sources section in resource articles
compatibility: opencode
---

## Sources Reference

The `## Sources` section in every resource article lists the external sources used to build or enrich it. Use a consistent format per source type.

**Confluence page:**
```
- [Page Title](<confluence-url>/spaces/SPACE/pages/PAGE_ID) — reason this page was used
```

**Jira issue:**
```
- [PROJ-123](<jira-url>/browse/PROJ-123) — reason (e.g. decision recorded, deadline set)
```

**Journal entry (daily note, weekly note, or project):**
```
- [daily/2026-03-15.md](../journal/daily/2026-03-15.md) — reason (e.g. architectural decision recorded here)
```

Rules:
- Always state why the source was used — do not list sources without context.
- Jira: reference the issue key, not a search URL.
- Journal: use a relative path from the resource article's location (e.g. `../../journal/daily/` from `resources/subfolder/`).
- A single article may mix source types.
- Remove a source entry when the article no longer contains any fact drawn from it.
