---
type: meta
updated: {{DATE}}
tags: []
---

# Resources Log

Running log of automated resource operations. Entries are appended by:
- `node .opencode/scripts/health-all.js` (lint runs)
- Workflow B (`/r-sync`) — sync operations
- Workflow E (`/r-discover`) — discovery runs
- Workflow F (`/r-ingest`) — ingest operations
- Workflow G (`/ask`) — query and synthesis runs

Format per entry:
```
- **YYYY-MM-DD:** <operation> | <scope> — <summary>
```

---
