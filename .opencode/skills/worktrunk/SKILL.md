---
name: worktrunk
description: Manage git worktrees with wt — create, switch, list, merge, and remove worktrees; check out MR/PR branches. Use when managing git worktrees.
compatibility: opencode
---

`wt` (worktrunk) is installed and available. Use it for all worktree operations.

## Commands

Full command reference: [`worktrunk/reference/commands.md`](reference/commands.md)

---

## Common Workflows

### Work on a feature branch

```bash
wt switch --create feature-xyz   # Create worktree + branch
# … do work …
wt merge                         # Squash, rebase, merge, cleanup
```

### Review a GitLab MR or GitHub PR

```bash
wt switch mr:101                 # Check out MR !101's branch
wt switch pr:42                  # Check out PR #42's branch
# … review, test …
wt remove                        # Clean up when done
```

### Run multiple agents in parallel

```bash
wt switch -x claude -c feature-a -- 'Add user authentication'
wt switch -x claude -c feature-b -- 'Fix the pagination bug'
wt switch -x claude -c feature-c -- 'Write tests for the API'
wt list --full                   # Monitor all worktrees with CI status
```

### See what's in flight

```bash
wt list --full                   # All worktrees with CI status
```

### Clean up merged worktrees

```bash
wt step prune --dry-run          # Preview
wt step prune                    # Remove all merged worktrees
```

---

## Rules

- **Use `wt` for worktree operations**, not raw `git worktree` commands.
- **`wt switch --create`** creates both the branch and worktree in one step.
- **`wt merge`** merges current → target (opposite direction from `git merge`).
- **`mr:<N>` / `pr:<N>` shortcuts** require the respective CLI (`glab` or `gh`) to be authenticated.
- **`-x` / `--execute`** runs a command after switching — useful for launching editors or agents. Arguments after `--` are forwarded to the command.
- **`wt step commit`** generates LLM commit messages — requires a commit generation command configured in `~/.config/worktrunk/config.toml`.
- **Shell integration** (`wt config shell install`) is required for `wt switch` to change directories.
