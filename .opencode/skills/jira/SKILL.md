---
name: jira
description: Search and read Jira issues — query assigned issues, sprint boards, epics, and extract facts for resources and daily notes. Use when querying or reading Jira issues.
compatibility: opencode
---

**Agent output flags:**
- Always use `--plain` for non-interactive list output.
- Always use `--no-input` for create/edit commands.
- `jira issue view` uses `less` pager by default — prefix with `PAGER=cat` for non-interactive use.

---

## Write Policy

**Never create, edit, delete, or transition Jira issues without explicit user approval.**

Default posture is read-only. Before any write operation, stop and ask: "Should I write this to Jira?" Proceed only if the user explicitly says yes. When in doubt, describe the change — let the user apply it.

### Safety rules

- **Never transition an issue** without first showing the current status and confirming the target status with the user.
- **Never edit a description** without showing the user the current content first.
- **Never create an issue** without confirming project key, issue type, summary, and description with the user.
- **Always show the comment text** before adding a comment.

---

## Searching Issues

**Project key:** Read `context.md` → **Conventions → Jira project key** to find your project key.

```bash
# Your open issues
jira issue list -a$(jira me) --plain

# Current sprint issues (assigned to me)
jira sprint list --current -a$(jira me) --plain

# Use raw JQL for complex queries
jira issue list -q "assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC" --plain
jira issue list -q "sprint in openSprints() AND assignee = currentUser()" --plain
jira issue list -q "assignee = currentUser() AND priority in (Blocker, Critical) AND statusCategory != Done" --plain
jira issue list -q "project = PROJ AND updated >= -7d ORDER BY updated DESC" --plain
jira issue list -q "assignee = currentUser() AND updated >= -1d" --plain
```

### Common JQL patterns

| Goal | JQL |
|------|-----|
| Open assigned issues | `assignee = currentUser() AND statusCategory != Done` |
| Current sprint | `assignee = currentUser() AND sprint in openSprints()` |
| Issues in a project | `project = PROJ AND statusCategory != Done` |
| High-priority | `assignee = currentUser() AND priority in (Blocker, Critical) AND statusCategory != Done` |
| Recently updated | `project = PROJ AND updated >= -7d ORDER BY updated DESC` |
| By label | `labels = "my-label" AND project = PROJ` |
| By epic | `parent = PROJ-123` |

### Search strategies

When looking for issues on a topic, try at least two strategies:

1. Text search: `jira issue list -q "text ~ \"keyword\"" --plain`
2. Label search: `jira issue list -q "labels = \"keyword\"" --plain`
3. Summary search: `jira issue list -q "summary ~ \"keyword\"" --plain`

---

## Getting Issue Details

```bash
# View issue (non-interactive — avoids less pager)
PAGER=cat jira issue view PROJ-123

# View with recent comments
PAGER=cat jira issue view PROJ-123 --comments 5
```

---

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

---

## Extracting Facts for Resources and Daily Notes

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

**Format for resource articles `## Sources` section:**
```
- [PROJ-456](<jira-url>/browse/PROJ-456) — decision or outcome
```

Replace `<jira-url>` with the Jira URL from `context.md` → **Tooling → Jira URL**.

---

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

---

## Writing to Jira (with approval)

When the user explicitly approves a write:

- **Add comment:**
  ```bash
  jira issue comment add PROJ-123 "Comment text here"
  ```
  Show the comment text to the user first.

- **Update issue:**
  ```bash
  jira issue edit PROJ-123 -s"New summary" --no-input
  jira issue edit PROJ-123 --label new-label --no-input
  ```
  Show what fields will change.

- **Transition status:**
  ```bash
  jira issue move PROJ-123 "In Progress"
  # With comment and resolution
  jira issue move PROJ-123 Done -RFixed --comment "Completed"
  ```
  Confirm the target status name before running (status names are project-specific).

- **Create issue:**
  ```bash
  jira issue create -tStory -s"Summary" -yHigh -b"Description" --no-input
  # Attach to epic
  jira issue create -tStory -s"Summary" -PEPIC-42 --no-input
  ```
  Confirm project key, type, summary, and description with the user first.

- **Assign:**
  ```bash
  jira issue assign PROJ-123 $(jira me)
  ```

After any write, note the issue key in the daily note log.

---

## Rules

- **Read-only by default.** Ask before any write.
- **Always use `--plain`** for list commands — avoids interactive TUI.
- **Always use `PAGER=cat`** before `jira issue view` — avoids `less` pager.
- **Always use `--no-input`** for create/edit — skips interactive prompts.
- **Summarise, don't copy.** Issue descriptions in daily notes are summaries + issue key links.
- **Use the issue key** (e.g. `PROJ-123`) in all references — not search URLs.
- **Check before creating.** Search for existing issues before suggesting a new one.
- **Extract facts to resources.** If a Jira issue contains a durable architectural decision or process, note it as a resource candidate.
