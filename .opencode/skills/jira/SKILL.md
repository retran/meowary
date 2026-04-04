---
name: jira
description: Search and read Jira issues — query assigned issues, sprint boards, epics, and extract facts for KB and daily notes
compatibility: opencode
---

## Backend Detection

This skill uses the **MCP backend** (Atlassian MCP tools) by default when available. The MCP tools are available in this environment as `atlassian_jira_*` functions.

| Scenario | Backend | Notes |
|----------|---------|-------|
| MCP tools available | MCP (`atlassian_jira_*`) | Preferred — richer field access |
| MCP unavailable | `jira` CLI | Fallback — run `jira issue list` etc. |

When using MCP, **never assign by display name** — use account ID or email. To find an account ID:
```
atlassian_jira_search_user(query='user.fullname ~ "Alice Smith"')
```

---

## Write Policy

**Never create, edit, delete, or transition Jira issues without explicit user approval.**

Default posture is read-only. Before any write operation, stop and ask: "Should I write this to Jira?" Proceed only if the user explicitly says yes. When in doubt, describe the change — let the user apply it.

### Safety rules

- **Never transition an issue** without first fetching its current status with `atlassian_jira_get_transitions`. Transitions are ID-based and vary by project workflow.
- **Never assign by display name** in MCP — always resolve to account ID first.
- **Never edit a description** without showing the user the current content first. Use `atlassian_jira_get_issue` and display it before proposing changes.
- **Never create an issue** without confirming project key, issue type, summary, and description with the user.
- **Always show the comment text** before calling `atlassian_jira_add_comment`.

---

## Searching Issues

Use `atlassian_jira_search` with JQL. Prefer specific, targeted queries.

**Project key:** Read `context.md` → **Conventions → Jira project key** to find your project key.

### Common JQL patterns

```
# Your open issues
assignee = currentUser() AND statusCategory != Done

# Current sprint
assignee = currentUser() AND sprint in openSprints()

# Issues in a project
project = PROJ AND statusCategory != Done

# Issues on a topic
project = PROJ AND text ~ "keyword" ORDER BY updated DESC

# High-priority issues
assignee = currentUser() AND priority in (Blocker, Critical) AND statusCategory != Done

# Recently updated
project = PROJ AND updated >= -7d ORDER BY updated DESC

# By label
labels = "my-label" AND project = PROJ

# By epic
parent = PROJ-123
```

### Search strategies

When looking for issues on a topic, try at least two strategies:

1. Text search: `text ~ "keyword"`
2. Label search: `labels = "keyword"`
3. Component search: `component = "ComponentName"`
4. Epic/parent search: `parent = EPIC-KEY`

---

## Getting Issue Details

```
# Get a specific issue (summary, status, description, assignee, etc.)
atlassian_jira_get_issue("PROJ-123")

# Get issue with all fields
atlassian_jira_get_issue("PROJ-123", fields="*all")

# Get available transitions (e.g. to check what statuses are possible)
atlassian_jira_get_transitions("PROJ-123")
```

---

## Sprint and Board Queries

```
# Find the board for a project
atlassian_jira_get_agile_boards(project_key="PROJ")

# Get active sprints on a board
atlassian_jira_get_sprints_from_board(board_id="123", state="active")

# Get issues in a sprint
atlassian_jira_get_sprint_issues(sprint_id="456")
```

---

## Extracting Facts for KB and Daily Notes

When pulling Jira data into the journal:

**What to extract (durable facts):**
- Decisions recorded in issue descriptions or comments
- Deadlines and milestone dates
- Ownership changes (assignee, team)
- Acceptance criteria that clarify architectural requirements
- Epic-level goals and scope

**What to discard:**
- Current status (changes frequently — link, don't copy)
- Meeting logistics in comments
- Speculative discussion not yet resolved
- Full issue descriptions verbatim

**Format for daily notes:** Summarise and link. Use the issue key for traceability.

```markdown
- Investigated PROJ-456 (short description) — decision or outcome. #p-project-tag
```

**Format for KB `## Sources` section:**
```
- [PROJ-456](<jira-url>/browse/PROJ-456) — decision or outcome
```

Replace `<jira-url>` with the Jira URL from `context.md` → **Tooling → Jira URL**.

---

## Morning Planning Queries

During `/morning` or `/week-plan`, run these to populate the daily note:

```
# Assigned open issues
assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC

# Current sprint
assignee = currentUser() AND sprint in openSprints() ORDER BY priority DESC

# Blockers
assignee = currentUser() AND priority = Blocker AND statusCategory != Done
```

---

## Writing to Jira (with approval)

When the user explicitly approves a write:

- **Add comment:** Use `atlassian_jira_add_comment`. Show the comment text to the user first.
- **Update issue:** Use `atlassian_jira_update_issue`. Show what fields will change.
- **Transition status:** Use `atlassian_jira_get_transitions` first to get valid transition IDs, then `atlassian_jira_transition_issue`. Confirm the transition and any required fields.
- **Create issue:** Use `atlassian_jira_create_issue`. Confirm project, type, summary, and description.

After any write, note the issue key in the daily note log.

---

## Deep Dive Triggers

Load additional reference docs when the task requires it:

| Trigger | Action |
|---------|--------|
| Working with a specific project's workflow | Run `atlassian_jira_get_transitions` on a representative issue to map the workflow |
| Assigning issues via MCP | First resolve account ID with `atlassian_jira_search_user` or `atlassian_jira_get_user_profile` |
| Custom fields needed | Use `atlassian_jira_search_fields` to find field IDs before querying |
| Sprint capacity or velocity | Use board + sprint tools; note sprint IDs change frequently |

---

## Rules

- **Read-only by default.** Ask before any write.
- **Summarise, don't copy.** Issue descriptions in daily notes are summaries + issue key links.
- **Use the issue key** (e.g. `PROJ-123`) in all references — not search URLs.
- **Check before creating.** Search for existing issues before suggesting a new one.
- **Extract facts to KB.** If a Jira issue contains a durable architectural decision or process, note it as a KB candidate.
- **Never transition blind.** Always fetch available transitions first — IDs are project-specific.
- **Never assign by display name.** Resolve to account ID via user search.
