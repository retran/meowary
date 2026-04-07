---
name: scm
description: Work with GitHub and GitLab via gh/glab CLIs — PR/MR lifecycle, CI/Actions monitoring, issue management, repo operations. Use when creating or managing GitHub PRs, GitLab MRs, CI pipelines, or issues.
compatibility: opencode
---

`gh` (GitHub CLI) and `glab` (GitLab CLI) handle pull requests, merge requests, CI pipelines, issues, and repo operations.

## Related Skills

| Skill | When to load |
|-------|-------------|
| Commit conventions | Any time you create a commit or PR/MR title — see `.opencode/reference/conventions.md` |
| `jira` | When you need the Jira issue key (search by branch name, sprint, or keyword) |
| `worktrunk` | When checking out a PR/MR branch locally |

---

## Pull Requests / Merge Requests

### [GitHub] Create a PR

```bash
gh pr create --fill              # Auto-fill title/body from commits; push branch
gh pr create --fill --label bugfix
gh pr create --fill --assignee username
gh pr create --draft             # Open as draft
gh pr create --title "Title" --body "Description"
```

`--fill` reads branch name and commit messages to populate title and body automatically. This is the preferred way to create PRs.

### [GitLab] Create an MR

```bash
glab mr create --fill          # Auto-fill title/description from commits; push branch
glab mr create --fill --label bugfix
glab mr create --fill --assignee username
glab mr create --draft         # Open as draft (WIP)
```

### Title and Commit Convention

PR/MR titles and commits require a Jira issue key prefix. No Conventional Commits type prefix.
**See `.opencode/reference/conventions.md` for the full format and rules.**

Quick reference: `[PROJ-123] short description`

If you don't have the Jira issue key, check the branch name or load the `jira` skill to find it.

### [GitHub] MR Description Template

When using `--fill`, review the auto-generated body and ensure it includes:

```markdown
## Summary
<!-- 1-3 sentences: what this PR does and why -->

## Changes
<!-- Bullet list of significant changes -->

## Test Plan
<!-- How this was tested: manual steps, automated tests, CI checks -->
```

For simple PRs, `--fill` output is often sufficient. For complex changes, edit to add the Summary/Changes/Test Plan structure.

### [GitLab] MR Description Template

Same structure as above. `--fill` auto-populates from commits.

Correct MR title if `--fill` doesn't match the required format:
```bash
glab mr update <id> --title "[PROJ-42] add short description"
```

### View and list

```bash
# GitHub
gh pr view              # Current branch's PR
gh pr view 123          # PR by number
gh pr list              # Open PRs
gh pr list --state all  # All states
gh pr diff 123          # View changes
gh pr checks 123        # View CI check status

# GitLab
glab mr view             # Current branch's MR
glab mr view 123         # MR by number
glab mr list             # Open MRs
glab mr list --all       # All states
glab mr diff 123         # View changes
```

### Approve and merge

```bash
# GitHub
gh pr review 123 --approve
gh pr review 123 --comment --body "Looks good"
gh pr review 123 --request-changes --body "Please fix..."
gh pr merge 123                    # Merge (auto-selects strategy)
gh pr merge 123 --squash           # Squash merge
gh pr merge 123 --rebase           # Rebase merge
gh pr merge 123 --delete-branch    # Delete branch after merge

# GitLab
glab mr approve          # Approve current branch's MR
glab mr approve 123      # Approve by number
glab mr merge 123        # Merge MR
glab mr revoke 123       # Revoke approval
```

### Update, comment, close

```bash
# GitHub
gh pr edit 123 --title "New title"
gh pr edit 123 --add-label bugfix --add-assignee username
gh pr comment 123 --body "Review comment"
gh pr ready 123          # Mark draft as ready for review
gh pr close 123
gh pr reopen 123

# GitLab
glab mr update 123 --title "New title"
glab mr update 123 --label bugfix --assignee username
glab mr note 123 --message "Review comment"
glab mr rebase 123       # Rebase source branch against target
glab mr close 123
glab mr reopen 123
```

### Fix review comments

Load the `workflow/address-review` sub-skill for a structured workflow to address unresolved PR/MR discussion threads.

---

## CI / Actions

### [GitHub] Monitor runs

```bash
gh run list                       # Recent workflow runs
gh run list --workflow build.yml  # Filter by workflow
gh run view 12345                 # View specific run details
gh run view 12345 --log           # View full logs
gh run view 12345 --log-failed    # View only failed step logs
gh run watch 12345                # Live-watch a running workflow
```

### [GitHub] Jobs, retries, artifacts

```bash
gh run rerun 12345                # Rerun all jobs
gh run rerun 12345 --failed       # Rerun only failed jobs
gh run cancel 12345               # Cancel a run
gh workflow run build.yml         # Trigger a workflow dispatch
gh workflow list                  # List workflows
gh workflow view build.yml        # View workflow details
gh run download 12345             # Download all artifacts
gh run download 12345 -n artifact-name
```

### [GitLab] Monitor pipelines

```bash
glab ci view             # Live pipeline view for current branch
glab ci view main        # Pipeline for a specific branch
glab ci status           # Quick status of current branch's pipeline
glab ci list             # List all pipelines
```

### [GitLab] Stream logs, retries

```bash
glab ci trace            # Stream logs of a running/failed job (interactive picker)
glab ci trace <job-id>   # Stream specific job by ID
glab ci trace <job-name> # Stream by job name
glab ci retry <job-id>   # Retry a failed job
glab ci trigger <job-id> # Trigger a manual job
glab ci cancel           # Cancel current pipeline
glab ci run              # Trigger a new pipeline
glab ci artifact <ref> <job>  # Download job artifacts
```

`glab ci trace` streams logs in real time — use this to monitor long-running jobs without waiting for completion.

---

## Issues

```bash
# GitHub
gh issue create --title "Bug: ..." --label bug
gh issue list                     # Open issues
gh issue list --state all         # All states
gh issue view 42                  # View issue
gh issue view 42 --web            # Open in browser
gh issue edit 42 --add-label "in progress"
gh issue close 42
gh issue reopen 42
gh issue comment 42 --body "Comment"

# GitLab
glab issue create --title "Bug: ..." --label bug
glab issue list                    # Open issues
glab issue list --all              # All states
glab issue view 42                 # View issue
glab issue view --web 42           # Open in browser
glab issue update 42 --label "in progress"
glab issue close 42
glab issue reopen 42
glab issue note 42 --message "Comment"
```

---

## [GitHub] Repository and API Operations

```bash
gh repo list <username> --limit 10
gh repo view owner/repo
gh repo clone owner/repo
gh repo fork owner/repo
```

For anything not covered by built-in commands:

```bash
gh api /user
gh api repos/owner/repo/pulls
gh api repos/owner/repo/actions/runs
gh api repos/owner/repo/issues/42/comments
gh api --method POST repos/owner/repo/dispatches -f event_type=deploy
```

Use `gh api` with `--jq` for filtering:
```bash
gh api repos/owner/repo/pulls --jq '.[].title'
gh api /user/repos --jq '.[] | {name, visibility}'
```

---

## Common Workflows

See [`scm/reference/workflows.md`](reference/workflows.md) for full workflow examples.

---

## Troubleshooting

### Authentication

```bash
# GitHub
gh auth status           # Check — run this first if commands fail

# GitLab
glab auth status         # Check current auth
# glab auth login — interactive, run manually, not in agent
```

### [GitLab] Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `could not find remote` | Branch not pushed or remote mismatch | `git push -u origin HEAD` first |
| `404 Project Not Found` | Wrong project context or insufficient permissions | `glab repo view` to verify project |
| `draft: true` blocking merge | MR is still in draft | `glab mr update <id> --draft=false` |
| `pipeline failed` | CI check failed | `glab ci trace` to see logs |
| `cannot merge: conflicts` | Branch has merge conflicts | Rebase locally, force-push, then retry |

### [GitLab] Pipeline debugging

1. `glab ci status` — identify which pipeline and stage failed
2. `glab ci trace <job-name>` — stream the failing job's logs
3. Look for the first error, not the last — cascading failures obscure the root cause
4. If the job is flaky, `glab ci retry <job-id>` to re-run just that job

### [GitHub] CI failure

```bash
gh run list --branch my-branch        # Find the run
gh run view 12345 --log-failed        # View failed logs
gh run rerun 12345 --failed           # Retry failed jobs
```

---

## Rules

- **Prefer `--fill`** — handles pushing and populates title/body from commits automatically.
- **PR/MR titles and commits must follow `[PROJ-123] description` format.** No Conventional Commits type prefix. See `.opencode/reference/conventions.md`. If you don't have the Jira issue key, check the branch name or load the `jira` skill.
- **Never force-push to `main` or `master`** without explicit user approval.
- **Never delete remote branches** that have open MRs.
- Use `pr view` / `mr view` and `issue view` to pull context into daily notes — summarise and link, do not copy verbatim.
- Both CLIs require authentication. Run `gh auth status` / `glab auth status` to verify.
