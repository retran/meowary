# Workflow-Skill Mapping

Generated: 2026-05-07

## Universal skill references (all work workflows)

**Already implemented:**
- `logging` — all 15 work workflows reference at Close step
- `context-gathering` — 14 workflows reference at Step 0.5

**All work workflows:** implement, design, plan, research, brainstorm, self-review, resolve, debug, test, write, resource-enrich, resource-sync, resource-ingest, resource-discover, resource-plan

## Lifecycle workflows

### brainstorm
**Current:** context-gathering (Step 0.5)
**Should add:** writing (spec output is prose), query (multi-source research)

### design
**Current:** context-gathering (Step 0.5)
**Should add:** writing (ADR output is prose)

### plan
**Current:** context-gathering (Step 0.5)
**Should add:** projects (plan file structure, task format)

### research
**Current:** context-gathering (Step 0.5)
**Should add:** query (multi-source retrieval is core), writing (brief output is prose)

### implement
**Current:** context-gathering (Step 0.5)
**Should add:** codebases (codebase-specific conventions), scm (commit format, PR lifecycle)

### test
**Current:** context-gathering (Step 0.5)
**Should add:** codebases (test commands, test patterns)

### self-review
**Current:** context-gathering (Step 0.5)
**Should add:** codebases (conventions, CI rules)

### resolve
**Current:** context-gathering (Step 0.5)
**Should add:** codebases (conventions), scm (PR/MR context)

### debug
**Current:** context-gathering (Step 0.5)
**Should add:** codebases (architecture, error patterns)

### write
**Current:** context-gathering (Step 0.5)
**Should add:** writing (prose quality is core), query (research for documents)

### peer-review
**Current:** qmd (Step 0)
**Should add:** codebases (conventions), scm (PR/MR mechanics)

## Resource workflows

### resource-enrich
**Current:** logging (Close)
**Should add:** resources (graph philosophy), writing (article prose), query (gap checks)

### resource-sync
**Current:** logging (Close)
**Should add:** resources (graph philosophy), confluence (Confluence sync is core), writing (article prose)

### resource-ingest
**Current:** logging (Close)
**Should add:** resources (graph philosophy), writing (article prose), query (duplicate checks), inbox (source-note format)

### resource-discover
**Current:** logging (Close)
**Should add:** resources (graph philosophy), query (gap analysis)

### resource-plan
**Current:** logging (Close)
**Should add:** resources (graph philosophy), query (health checks)

### resource-ops
**Current:** none (operational)
**Should add:** resources (graph philosophy), writing (article prose)

## Temporal workflows

### morning
**Current:** context-gathering (Step 1)
**Should add:** journal (daily note format), projects (project state reading)

### evening
**Current:** none
**Should add:** journal (daily note format), resources (enrichment during review)

### standup
**Current:** none
**Should add:** journal (daily note format), jira (issue context)

### weekly
**Current:** none
**Should add:** journal (weekly note format), projects (project state aggregation)

### capture
**Current:** context-gathering (Step 1)
**Should add:** inbox (capture format), journal (routing)

### meeting
**Current:** context-gathering (Step 0)
**Should add:** journal (meeting note format), resources (people articles)

## Read-only workflows

### scout
**Current:** none
**Should add:** query (multi-source search), qmd (semantic search)

## Implementation priority

**High (core skill for workflow purpose):**
1. research → query
2. write → writing
3. resource-sync → confluence
4. implement → codebases, scm
5. self-review → codebases
6. resource-enrich/ingest/discover/plan/ops → resources
7. morning/evening/standup/weekly/capture/meeting → journal

**Medium (enhances workflow):**
8. brainstorm/design → writing
9. test/debug/resolve → codebases
10. peer-review → codebases, scm
11. resource workflows → writing
12. plan → projects
13. scout → query, qmd

**Low (tangential):**
14. All resource workflows → query
15. capture → inbox
16. standup → jira

## Next steps

1. Add skill references to workflows per priority
2. Update Step 0 or Step 0.5 sections with "See also X skill" language
3. Test workflow execution with new references
