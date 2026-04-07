---
name: github
description: Work with GitHub via gh CLI — pull request lifecycle, Actions CI, issue management, repo operations. Use when creating or managing GitHub PRs, Actions, or issues.
compatibility: opencode
---

## Related Skills

Load these alongside `github` when relevant:

| Skill | When to load |
|-------|-------------|
| `conventions` | Any time you create a commit or PR title — covers the required `[PROJ-123] description` format |
| `jira` | When you need the Jira issue key (search by branch name, sprint, or keyword) |
| `security` | Before pushing to any shared or production-facing branch |

---

`gh` is the GitHub CLI. Use it for pull requests, Actions workflows, issues, and repo operations.

## Pull Requests (`gh pr`)

### Create a PR

```bash
gh pr create --fill              # Auto-fill title/body from commits; push branch
gh pr create --fill --label bugfix
gh pr create --fill --assignee username
gh pr create --draft             # Open as draft
gh pr create --title "Title" --body "Description"
```

`--fill` reads branch name and commit messages to populate title and body automatically. This is the preferred way to create PRs.

### View and list

```bash
gh pr view              # Current branch's PR
gh pr view 123          # PR by number
gh pr list              # Open PRs
gh pr list --state all  # All states
gh pr diff 123          # View changes
gh pr checks 123        # View CI check status
```

### Review and merge

```bash
gh pr review 123 --approve
gh pr review 123 --comment --body "Looks good"
gh pr review 123 --request-changes --body "Please fix..."
gh pr merge 123                    # Merge (auto-selects strategy)
gh pr merge 123 --squash           # Squash merge
gh pr merge 123 --rebase           # Rebase merge
gh pr merge 123 --delete-branch    # Delete branch after merge
```

### Update and comment

```bash
gh pr edit 123 --title "New title"
gh pr edit 123 --add-label bugfix --add-assignee username
gh pr comment 123 --body "Review comment"
gh pr ready 123          # Mark draft as ready for review
```

### Close and reopen

```bash
gh pr close 123
gh pr reopen 123
```

---

## Actions Workflows (`gh run` / `gh workflow`)

### Monitor runs

```bash
gh run list                       # Recent workflow runs
gh run list --workflow build.yml  # Filter by workflow
gh run view 12345                 # View specific run details
gh run view 12345 --log           # View full logs
gh run view 12345 --log-failed    # View only failed step logs
gh run watch 12345                # Live-watch a running workflow
```

### Jobs and retries

```bash
gh run rerun 12345                # Rerun all jobs
gh run rerun 12345 --failed       # Rerun only failed jobs
gh run cancel 12345               # Cancel a run
gh workflow run build.yml         # Trigger a workflow dispatch
gh workflow list                  # List workflows
gh workflow view build.yml        # View workflow details
```

### Artifacts

```bash
gh run download 12345             # Download all artifacts
gh run download 12345 -n artifact-name  # Download specific artifact
```

---

## Issues (`gh issue`)

### Create and view

```bash
gh issue create --title "Bug: ..." --label bug
gh issue list                     # Open issues
gh issue list --state all         # All states
gh issue view 42                  # View issue
gh issue view 42 --web            # Open in browser
```

### Update and close

```bash
gh issue edit 42 --add-label "in progress"
gh issue close 42
gh issue reopen 42
gh issue comment 42 --body "Comment"
```

---

## Repository Operations (`gh repo`)

```bash
gh repo list <your-github-username> --limit 10      # List user repos
gh repo view owner/repo             # View repo info
gh repo clone owner/repo            # Clone a repo
gh repo fork owner/repo             # Fork a repo
```

---

## API Access (`gh api`)

For anything not covered by built-in commands:

```bash
gh api /user                                    # Current user
gh api repos/owner/repo/pulls                  # List PRs via API
gh api repos/owner/repo/actions/runs           # List workflow runs
gh api repos/owner/repo/issues/42/comments     # Issue comments
gh api --method POST repos/owner/repo/dispatches -f event_type=deploy  # Trigger dispatch
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

### Investigate CI failure

```bash
gh run list --branch my-branch        # Find the run
gh run view 12345 --log-failed        # View failed logs
gh run rerun 12345 --failed           # Retry failed jobs
```

---

## Rules

- **Prefer `gh pr create --fill`** -- it handles pushing and populates title/body automatically.
- **PR titles and commits must follow `[PROJ-123] description` format.** No Conventional Commits type prefix. Load the `conventions` skill for the full reference. If you don't have the Jira issue key, check the branch name or load the `jira` skill.
- **`gh pr checks`** shows CI status. **`gh run view --log-failed`** shows failure details.
- Use `gh pr view` and `gh issue view` to pull context into daily notes -- do not copy issue descriptions verbatim, summarise and link.
- `gh` requires authentication. Run `gh auth status` to verify.
- The user's GitHub username and auth status can be checked with `gh auth status`.
