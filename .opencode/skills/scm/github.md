---
name: scm/github
description: GitHub-specific commands — PR lifecycle (create, review, merge), Actions CI status, issue management, and repo API via gh CLI. Load alongside scm/SKILL.md when working in a GitHub repository.
compatibility: opencode
---

## Pull Requests

### Create a PR

```bash
gh pr create --fill              # Auto-fill title/body from commits; push branch
gh pr create --fill --label bugfix
gh pr create --fill --assignee username
gh pr create --draft             # Open as draft
gh pr create --title "Title" --body "Description"
```

`--fill` reads branch name and commit messages to populate title and body automatically. This is the preferred way to create PRs.

### PR Description Template

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

### View and list

```bash
gh pr view              # Current branch's PR
gh pr view 123          # PR by number
gh pr list              # Open PRs
gh pr list --state all  # All states
gh pr diff 123          # View changes
gh pr checks 123        # View CI check status
```

### Approve and merge

```bash
gh pr review 123 --approve
gh pr review 123 --comment --body "Looks good"
gh pr review 123 --request-changes --body "Please fix..."
gh pr merge 123                    # Merge (auto-selects strategy)
gh pr merge 123 --squash           # Squash merge
gh pr merge 123 --rebase           # Rebase merge
gh pr merge 123 --delete-branch    # Delete branch after merge
```

### Update, comment, close

```bash
gh pr edit 123 --title "New title"
gh pr edit 123 --add-label bugfix --add-assignee username
gh pr comment 123 --body "Review comment"
gh pr ready 123          # Mark draft as ready for review
gh pr close 123
gh pr reopen 123
```

### Fix review comments

Use `/do resolve` for a structured workflow to address unresolved PR discussion threads.

---

## CI / Actions

### Monitor runs

```bash
gh run list                       # Recent workflow runs
gh run list --workflow build.yml  # Filter by workflow
gh run view 12345                 # View specific run details
gh run view 12345 --log           # View full logs
gh run view 12345 --log-failed    # View only failed step logs
gh run watch 12345                # Live-watch a running workflow
```

### Jobs, retries, artifacts

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

---

## Issues

```bash
gh issue create --title "Bug: ..." --label bug
gh issue list                     # Open issues
gh issue list --state all         # All states
gh issue view 42                  # View issue
gh issue view 42 --web            # Open in browser
gh issue edit 42 --add-label "in progress"
gh issue close 42
gh issue reopen 42
gh issue comment 42 --body "Comment"
```

---

## Repository and API Operations

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

### Standard PR lifecycle

```bash
# Create PR from current branch
gh pr create --fill

# Monitor CI
gh pr checks
gh run watch                   # Live-watch current run

# After CI passes and reviews done
gh pr merge --squash --delete-branch
```

### Check PR before reviewing

```bash
gh pr view 123                 # Summary, status, CI
gh pr diff 123                 # Full diff
gh pr checkout 123             # Check out the branch locally
```

---

## Troubleshooting

### Authentication

```bash
gh auth status           # Check — run this first if commands fail
```

### CI failure

```bash
gh run list --branch my-branch        # Find the run
gh run view 12345 --log-failed        # View failed logs
gh run rerun 12345 --failed           # Retry failed jobs
```

---

## Rules

- **Prefer `--fill`** — handles pushing and populates title/body from commits automatically.
- **PR titles and commits must follow `[PROJ-123] description` format.** No Conventional Commits type prefix. Read `context/context.md` for the project key. If you don't have the Jira issue key, check the branch name or load the `jira` skill.
- **Never force-push to `main` or `master`** without explicit user approval.
- **Never delete remote branches** that have open PRs.
- Use `pr view` and `issue view` to pull context into daily notes — summarise and link, do not copy verbatim.
- `gh` requires authentication. Run `gh auth status` to verify.
