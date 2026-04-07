# Jira JQL Patterns

## Common JQL patterns

| Goal | JQL |
|------|-----|
| Open assigned issues | `assignee = currentUser() AND statusCategory != Done` |
| Current sprint | `assignee = currentUser() AND sprint in openSprints()` |
| Issues in a project | `project = PROJ AND statusCategory != Done` |
| High-priority | `assignee = currentUser() AND priority in (Blocker, Critical) AND statusCategory != Done` |
| Recently updated | `project = PROJ AND updated >= -7d ORDER BY updated DESC` |
| By label | `labels = "my-label" AND project = PROJ` |
| By epic | `parent = PROJ-123` |

## Sprint and Board Queries

```bash
# List all boards
jira board list --plain

# List sprints (explorer view — use --table for non-interactive)
jira sprint list --table --plain

# Current active sprint issues
jira sprint list --current --plain

# Current sprint, assigned to me
jira sprint list --current -a$(jira me) --plain

# Previous sprint
jira sprint list --prev --plain

# Issues in a specific sprint (get ID from sprint list)
jira sprint list SPRINT_ID --plain
```

## Morning Planning Queries

During `/morning` or `/week-plan`, run these to surface MIT candidates:

```bash
# Assigned open issues
jira issue list -q "assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC" --plain

# Current sprint
jira sprint list --current -a$(jira me) --plain

# Blockers
jira issue list -q "assignee = currentUser() AND priority = Blocker AND statusCategory != Done" --plain
```

Skip silently if `jira` is not installed or returns a config error.
