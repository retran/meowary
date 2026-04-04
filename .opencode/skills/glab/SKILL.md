---
name: glab
description: Work with GitLab via glab CLI — merge request lifecycle, CI monitoring, issue management
compatibility: opencode
---

`glab` is the GitLab CLI. Use it for merge requests, CI pipelines, and issues.

## Related Skills

Load these alongside `glab` when relevant:

| Skill | When to load |
|-------|-------------|
| `conventions` | Any time you create a commit or MR title — covers the `[PROJ-123] description` format (no type/scope prefix) |
| `jira` | When you need the Jira issue key (search by branch name, sprint, or keyword) |
| `security` | Before pushing to any shared or production-facing branch |
| `worktrunk` | When checking out an MR branch locally |

---

## Merge Requests (`glab mr`)

### MR Title and Commit Convention

MR titles and commits require a Jira issue key prefix. No Conventional Commits type prefix.
**Load the `conventions` skill for the full format and rules.**

Quick reference:
```
[PROJ-123] short description
```

If `--fill` produces a title that doesn't match this format, correct it:
```bash
glab mr update <id> --title "[PROJ-42] add short description"
```

If you don't have the Jira issue key, check the branch name or load the `jira` skill to find it.

### MR Description Template

When creating an MR with `--fill`, review the auto-generated description and ensure it includes:

```markdown
## Summary
<!-- 1-3 sentences: what this MR does and why -->

## Changes
<!-- Bullet list of significant changes -->

## Test Plan
<!-- How this was tested: manual steps, automated tests, CI checks -->
```

For simple MRs, `--fill` output is often sufficient. For complex changes, edit the description to add the Summary/Changes/Test Plan structure.

### Create an MR

```bash
glab mr create --fill          # Auto-fill title/description from commits; push branch
glab mr create --fill --label bugfix  # Add label
glab mr create --fill --assignee username
glab mr create --draft         # Open as draft (WIP)
```

`--fill` reads branch name and commit messages to populate title and description automatically. This is the preferred way to create MRs.

### View and list

```bash
glab mr view             # Current branch's MR
glab mr view 123         # MR by number
glab mr list             # Open MRs
glab mr list --all       # All states
glab mr diff 123         # View changes
```

### Approve and merge

```bash
glab mr approve          # Approve current branch's MR
glab mr approve 123      # Approve by number
glab mr merge 123        # Merge MR
glab mr revoke 123       # Revoke approval
```

### Update and comment

```bash
glab mr update 123 --title "New title"
glab mr update 123 --label bugfix --assignee username
glab mr note 123 --message "Review comment"
glab mr rebase 123       # Rebase source branch against target
```

### Close and reopen

```bash
glab mr close 123
glab mr reopen 123
```

---

## CI Pipelines (`glab ci`)

### Monitor pipelines

```bash
glab ci view             # Live pipeline view for current branch
glab ci view main        # Pipeline for a specific branch
glab ci status           # Quick status of current branch's pipeline
glab ci list             # List all pipelines
```

### Stream job logs

```bash
glab ci trace            # Stream logs of a running/failed job (interactive picker)
glab ci trace <job-id>   # Stream specific job by ID
glab ci trace <job-name> # Stream by job name
```

`glab ci trace` streams logs in real time — use this to monitor long-running jobs without waiting for completion.

### Jobs and retries

```bash
glab ci retry <job-id>   # Retry a failed job
glab ci trigger <job-id> # Trigger a manual job
glab ci cancel           # Cancel current pipeline
glab ci run              # Trigger a new pipeline
glab ci artifact <ref> <job>  # Download job artifacts
```

---

## Issues (`glab issue`)

### Create and view

```bash
glab issue create --title "Bug: ..." --label bug
glab issue list                    # Open issues
glab issue list --all              # All states
glab issue view 42                 # View issue
glab issue view --web 42           # Open in browser
```

### Update and close

```bash
glab issue update 42 --label "in progress"
glab issue close 42
glab issue reopen 42
glab issue note 42 --message "Comment"
```

---

## Common Workflows

### Standard MR lifecycle

```bash
# Create MR from current branch
glab mr create --fill

# Monitor CI
glab ci view
glab ci trace              # Stream failing job logs

# After CI passes and reviews done
glab mr merge 123
```

### Check MR before reviewing

```bash
glab mr view 123           # Summary, status, CI
glab mr diff 123           # Full diff
wt switch mr:123           # Check out the branch locally (see worktrunk skill)
```

### Fix MR review comments

See the `glab/address-review` sub-skill (`.opencode/skills/glab/address-review.md`) for a structured workflow to address unresolved MR discussion threads.

---

## Troubleshooting

### Authentication

```bash
glab auth status           # Check current auth — run this first if commands fail
glab auth login            # Re-authenticate (interactive — run manually, not in agent)
```

If `glab` commands return 401/403 errors, check:
1. `glab auth status` — is the token valid?
2. Is the token scoped for the target project? (Some tokens are project-scoped.)
3. For API-heavy operations, check rate limits.

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `could not find remote` | Branch not pushed or remote mismatch | `git push -u origin HEAD` first |
| `404 Project Not Found` | Wrong project context or insufficient permissions | `glab repo view` to verify project |
| `draft: true` blocking merge | MR is still in draft | `glab mr update <id> --draft=false` |
| `pipeline failed` | CI check failed | `glab ci trace` to see logs |
| `cannot merge: conflicts` | Branch has merge conflicts | Rebase locally, force-push, then retry |

### Pipeline debugging

When CI fails:
1. `glab ci status` — identify which pipeline and stage failed
2. `glab ci trace <job-name>` — stream the failing job's logs
3. Look for the first error, not the last — cascading failures obscure the root cause
4. If the job is flaky, `glab ci retry <job-id>` to re-run just that job

---

## Rules

- **Prefer `glab mr create --fill`** — it handles pushing and populates title/description automatically.
- **Always prefix MR titles and commit messages with the Jira issue key** — e.g. `[PROJ-42] short description`. No Jira key = incomplete title. Use the project key from `context.md`.
- **No Conventional Commits type prefix** (`feat:`, `fix:`, etc.) — see the `conventions` skill for the full format.
- **`glab ci view`** gives a live, interactive pipeline view. **`glab ci trace`** streams a specific job's logs.
- Use `glab mr view` and `glab issue view` to pull context into daily notes — do not copy issue descriptions verbatim, summarise and link.
- `glab` requires authentication. Run `glab auth status` to verify.
- **Never force-push to `main` or `master`** without explicit user approval.
- **Never delete remote branches** that have open MRs.
