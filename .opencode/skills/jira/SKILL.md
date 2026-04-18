---
name: jira
description: Read Jira issues — query assigned issues, sprint boards, and epics; extract facts for daily notes and resource articles. Load when pulling Jira context for a standup, daily note, or resource enrichment, or when looking up a Jira issue key.
compatibility: opencode
updated: 2026-04-18
---

<role>Jira read CLI authority. Read-only by default; writes require explicit approval.</role>

<summary>
> Use `--plain` for list output, `--no-input` for create/edit, `PAGER=cat` before `jira issue view`. NEVER write without explicit user approval.
</summary>

<agent_flags>
- `--plain` — non-interactive list output
- `--no-input` — non-interactive create/edit
- `PAGER=cat` — disables `less` pager on `jira issue view`
</agent_flags>

<write_policy>
**NEVER create, edit, delete, or transition Jira issues without explicit user approval.**

Default: read-only. Before any write: ask "Should I write this to Jira?" Proceed only on explicit yes.

### Safety rules
- NEVER transition without showing current status and confirming target.
- NEVER edit description without showing current content first.
- NEVER create without confirming project key, type, summary, description.
- ALWAYS show comment text before adding.
</write_policy>

<steps>

<step n="1" name="search_issues" condition="finding issues">

Project key: read `context/context.md → Conventions → Jira project key`.

```bash
jira issue list -a$(jira me) --plain                          # Open issues
jira sprint list --current -a$(jira me) --plain               # Current sprint
jira issue list -q "<JQL>" --plain                            # Raw JQL
```

### Common JQL

| Goal | JQL |
|------|-----|
| Open assigned | `assignee = currentUser() AND statusCategory != Done` |
| Current sprint | `assignee = currentUser() AND sprint in openSprints()` |
| In project | `project = PROJ AND statusCategory != Done` |
| High priority | `assignee = currentUser() AND priority in (Blocker, Critical) AND statusCategory != Done` |
| Recently updated | `project = PROJ AND updated >= -7d ORDER BY updated DESC` |
| By label | `labels = "my-label" AND project = PROJ` |
| By epic | `parent = PROJ-123` |

### Topic search — try ≥2 strategies
```bash
jira issue list -q "text ~ \"keyword\"" --plain
jira issue list -q "labels = \"keyword\"" --plain
jira issue list -q "summary ~ \"keyword\"" --plain
```
</step>

<step n="2" name="get_issue_details">
```bash
PAGER=cat jira issue view PROJ-123                # Non-interactive
PAGER=cat jira issue view PROJ-123 --comments 5   # With recent comments
```
</step>

<step n="3" name="sprint_board" condition="sprint queries">
```bash
jira board list --plain
jira sprint list --table --plain                   # Non-interactive sprint list
jira sprint list --current --plain                 # Active sprint
jira sprint list --current -a$(jira me) --plain    # My current sprint
jira sprint list --prev --plain                    # Previous sprint
jira sprint list SPRINT_ID --plain                 # Specific sprint
```
</step>

<step n="4" name="extract_facts" condition="building daily notes or resources">

**Extract (durable):**
- Decisions in descriptions/comments
- Deadlines, milestones
- Ownership changes (assignee, team)
- Acceptance criteria clarifying requirements
- Epic-level goals/scope

**Discard:**
- Current status (link, don't copy)
- Meeting logistics
- Speculative discussion
- Verbatim descriptions

**Daily note format:**
```markdown
- Investigated PROJ-456 (short description) — decision or outcome. #p-project-tag
```

**Resource `## Sources`:**
```
- [PROJ-456](<jira-url>/browse/PROJ-456) — decision or outcome
```

`<jira-url>` from `context/context.md → Tooling → Jira URL`.
</step>

<step n="5" name="morning_planning" condition="/morning or /week-plan">
```bash
jira issue list -q "assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC" --plain
jira sprint list --current -a$(jira me) --plain
jira issue list -q "assignee = currentUser() AND priority = Blocker AND statusCategory != Done" --plain
```
Skip silently if `jira` not installed or config error.
</step>

<step n="6" name="write_with_approval" condition="user explicitly approved" gate="HARD-GATE">

- **Comment:** `jira issue comment add PROJ-123 "Comment text"` — show text first.
- **Edit:** `jira issue edit PROJ-123 -s"New summary" --no-input` — show field changes.
- **Transition:** `jira issue move PROJ-123 "In Progress"` — confirm target status (project-specific).
- **Create:** `jira issue create -tStory -s"Summary" -yHigh -b"Description" --no-input` — confirm project/type/summary/description.
- **Assign:** `jira issue assign PROJ-123 $(jira me)`

After write: note issue key in daily note log.
</step>

</steps>

<rules>
- Read-only by default. Ask before any write.
- ALWAYS `--plain` for list commands.
- ALWAYS `PAGER=cat` before `jira issue view`.
- ALWAYS `--no-input` for create/edit.
- Summarize, never copy. Daily notes = summary + issue key link.
- USE issue key (`PROJ-123`) in references — not search URLs.
- Search before suggesting new issues.
- Extract durable architectural decisions to resources.
</rules>

<self_review>
- [ ] Issue key format `PROJ-123`?
- [ ] No writes without explicit user approval?
- [ ] Sprint/board names match team context?
- [ ] PII stripped before storing?
</self_review>

<output_rules>Output in English. Preserve verbatim CLI commands, JQL, and issue key formats.</output_rules>
