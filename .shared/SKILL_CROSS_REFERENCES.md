# Skill Cross-Reference Audit

Generated: 2026-05-07

## Suggested cross-references

### confluence
**Should reference:** resources (for article format), query (for when to use Confluence tier)
**Rationale:** Confluence skill transforms pages into resource articles, follows resource format

### jira
**Should reference:** resources (for article format), query (for when to use Jira tier)
**Rationale:** Jira skill extracts facts for resource articles, follows resource format

### logging
**Should reference:** writing (for prose quality)
**Rationale:** Dev-log entries are prose — concision, active voice apply

### projects
**Should reference:** logging (dev-log format), areas (similar dashboard pattern)
**Rationale:** Project dashboards include dev-logs, share structure with area dashboards

### areas
**Should reference:** projects (similar dashboard pattern), logging (log entry format)
**Rationale:** Area dashboards mirror project dashboards, include log entries

### journal
**Should reference:** logging (daily note format), inbox (capture routing)
**Rationale:** Daily notes contain work logs; journal routes captures to inbox

### inbox
**Should reference:** resources (stub creation during processing), query (duplicate checks)
**Rationale:** Inbox processing creates resource stubs, checks for duplicates via QMD

### resources
**Should reference:** writing (article prose quality), query (gap checks), confluence, jira (source integrations)
**Rationale:** Resource articles are prose; gap checks use multi-source query; Confluence/Jira are common sources

### query
**Current related:** none
**Should reference:** qmd (Tier 1 mechanic), confluence (Tier 3), jira (Tier 4)
**Rationale:** Query skill orchestrates multi-source retrieval; each tier has its own skill

### codebases
**Should reference:** scm (PR/MR conventions), worktrunk (worktree patterns), writing (documentation quality)
**Rationale:** Codebase files document SCM workflows, worktree usage, include prose

### scm
**Should reference:** worktrunk (worktree for branch isolation), codebases (repository-specific conventions)
**Rationale:** SCM operations often use worktrees; conventions stored in codebase files

### repomix
**Should reference:** codebases (codebase context files), scm (repository detection)
**Rationale:** Repomix prepares codebases for analysis; codebase files provide context

### writing
**Current related:** none
**Should reference:** None (foundational)
**Rationale:** Writing skill is foundational — other skills reference it, not the reverse

### qmd
**Current related:** none
**Should reference:** None (foundational)
**Rationale:** QMD skill is CLI mechanics — other skills reference it, not the reverse

### worktrunk
**Should reference:** scm (PR/MR checkout), codebases (multi-worktree patterns)
**Rationale:** Worktrees used for PR/MR review; multi-worktree patterns documented in codebase files

## Priority

**High priority** (foundational skills widely used):
1. query → qmd, confluence, jira
2. resources → writing, query, confluence, jira
3. logging → writing
4. projects → logging, areas
5. areas → projects, logging

**Medium priority** (operational skills):
6. journal → logging, inbox
7. inbox → resources, query
8. confluence → resources, query
9. jira → resources, query
10. codebases → scm, worktrunk, writing

**Low priority** (specialized):
11. scm → worktrunk, codebases
12. worktrunk → scm, codebases
13. repomix → codebases, scm

## Action plan

1. Add `related:` front matter field to skills that don't have it (13 skills)
2. Update skill summaries to mention related skills with "See also" or "Load with" language
3. Create skill dependency diagram for visualization
4. Update workflows to load skill clusters (e.g., "Load context-gathering + qmd + query")
