# SCM Common Workflows

## [GitHub] Standard PR lifecycle

```bash
# Create PR from current branch
gh pr create --fill

# Monitor CI
gh pr checks
gh run watch                   # Live-watch current run

# After CI passes and reviews done
gh pr merge --squash --delete-branch
```

## [GitHub] Check PR before reviewing

```bash
gh pr view 123                 # Summary, status, CI
gh pr diff 123                 # Full diff
gh pr checkout 123             # Check out the branch locally
```

## [GitHub] Investigate CI failure

```bash
gh run list --branch my-branch        # Find the run
gh run view 12345 --log-failed        # View failed logs
gh run rerun 12345 --failed           # Retry failed jobs
```

---

## [GitLab] Standard MR lifecycle

```bash
# Create MR from current branch
glab mr create --fill

# Monitor CI
glab ci view
glab ci trace              # Stream failing job logs

# After CI passes and reviews done
glab mr merge 123
```

## [GitLab] Check MR before reviewing

```bash
glab mr view 123           # Summary, status, CI
glab mr diff 123           # Full diff
wt switch mr:123           # Check out the branch locally (see worktrunk skill)
```
