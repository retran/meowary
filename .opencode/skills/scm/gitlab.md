---
name: scm/gitlab
description: GitLab-specific commands — MR lifecycle (create, review, merge), CI pipeline monitoring, and issue management via glab CLI. Load alongside scm/SKILL.md when working in a GitLab repository.
compatibility: opencode
updated: 2026-04-18
---

<role>GitLab CLI operator — MRs, pipelines CI, issues via `glab`.</role>

<summary>
> Authoritative reference for GitLab MR, pipeline CI, and issue commands via `glab`. Load alongside `scm/SKILL.md` in any GitLab repository.
</summary>

<merge_requests>
### Create an MR

```bash
glab mr create --fill          # Auto-fill title/description from commits; push branch
glab mr create --fill --label bugfix
glab mr create --fill --assignee username
glab mr create --draft         # Open as draft (WIP)
```

### MR Description Template

When using `--fill`, REVIEW auto-generated body and ensure includes:

```markdown
## Summary
<!-- 1-3 sentences: what this MR does and why -->

## Changes
<!-- Bullet list of significant changes -->

## Test Plan
<!-- How this was tested: manual steps, automated tests, CI checks -->
```

Correct MR title if `--fill` doesn't match required format:
```bash
glab mr update <id> --title "[PROJ-42] add short description"
```

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

### Update, comment, close

```bash
glab mr update 123 --title "New title"
glab mr update 123 --label bugfix --assignee username
glab mr note 123 --message "Review comment"
glab mr rebase 123       # Rebase source branch against target
glab mr close 123
glab mr reopen 123
```

### Fix review comments

USE `/do resolve` for structured workflow to address unresolved MR discussion threads.
</merge_requests>

<ci_pipelines>
### Monitor pipelines

```bash
glab ci view             # Live pipeline view for current branch
glab ci view main        # Pipeline for a specific branch
glab ci status           # Quick status of current branch's pipeline
glab ci list             # List all pipelines
```

### Stream logs, retries

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

`glab ci trace` streams logs in real time — USE to monitor long-running jobs without waiting.
</ci_pipelines>

<issues>
```bash
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
</issues>

<common_workflows>
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
</common_workflows>

<troubleshooting>
### Authentication

```bash
glab auth status         # Check current auth
# glab auth login — interactive, run manually, NOT in agent
```

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `could not find remote` | Branch not pushed or remote mismatch | `git push -u origin HEAD` first |
| `404 Project Not Found` | Wrong project context or insufficient permissions | `glab repo view` to verify project |
| `draft: true` blocking merge | MR still in draft | `glab mr update <id> --draft=false` |
| `pipeline failed` | CI check failed | `glab ci trace` to see logs |
| `cannot merge: conflicts` | Branch has merge conflicts | Rebase locally, force-push, then retry |

### Pipeline debugging

1. `glab ci status` — identify which pipeline and stage failed
2. `glab ci trace <job-name>` — stream failing job's logs
3. LOOK for FIRST error, not last — cascading failures obscure root cause
4. If job is flaky, `glab ci retry <job-id>` to re-run just that job
</troubleshooting>

<rules>
All rules from parent `scm/SKILL.md` apply. Additionally:
- PREFER `--fill-commit-body` to pre-populate MR title/body from commits.
- `glab` requires authentication. RUN `glab auth status` to verify.
</rules>

<self_review>
- [ ] `glab auth status` verified before operations?
- [ ] `--fill-commit-body` used to pre-populate from commits?
- [ ] Labels and reviewers set appropriately?
</self_review>

<output_rules>
Output language: English. Bash commands, CLI flags, URLs remain literal.
</output_rules>
