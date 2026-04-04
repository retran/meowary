---
name: worktrunk
description: Manage git worktrees with wt — create, switch, list, merge, and remove worktrees; check out MR branches
compatibility: opencode
---

`wt` (worktrunk) is installed and available. Use it for all worktree operations.

## Commands

### `wt switch` — Switch to a worktree; create if needed

```bash
wt switch <branch>            # Switch to existing worktree (creates one if absent)
wt switch --create <branch>   # Create new branch and worktree
wt switch --create <branch> --base <base>  # New branch from specific base
wt switch -                   # Previous worktree (like cd -)
wt switch ^                   # Default branch worktree
wt switch mr:<N>              # Check out GitLab MR !N's branch
wt switch pr:<N>              # Check out GitHub PR #N's branch
```

`mr:<N>` and `pr:<N>` require `glab` (GitLab) or `gh` (GitHub) CLI to be authenticated.

**Useful flags:**

| Flag | Effect |
|------|--------|
| `--create` / `-c` | Create a new branch |
| `--base <branch>` / `-b` | Base branch for `--create` (default: default branch) |
| `--execute <cmd>` / `-x` | Run a command after switching (replaces `wt` process) |
| `--branches` | Include branches without worktrees in picker |
| `--clobber` | Remove stale path at target |
| `-y` | Skip approval prompts |

**Interactive picker:** `wt switch` with no arguments opens a picker. Preview tabs (toggle with `1`–`5`): HEAD diff, log, diff vs main, remote diff, LLM summary. `Alt-c` creates a new worktree from the query.

### `wt list` — List worktrees and their status

```bash
wt list             # Table of all worktrees
wt list --full      # Include CI status, line diffs, LLM summaries
wt list --branches  # Include branches without worktrees
wt list --format=json  # JSON output for scripting
```

**Status symbols:**

| Symbol | Meaning |
|--------|---------|
| `+` | Staged files |
| `!` | Modified files (unstaged) |
| `?` | Untracked files |
| `⊂` | Content integrated into default branch (safe to remove) |
| `_` | Same commit as default branch (safe to remove) |
| `↑` | Ahead of default branch |
| `↓` | Behind default branch |

Rows dimmed when safe to delete (`_` or `⊂`).

### `wt merge` — Merge current branch into target

```bash
wt merge            # Merge into default branch (squash + rebase + FF + cleanup)
wt merge develop    # Merge into a different branch
wt merge --no-squash   # Keep individual commits
wt merge --no-ff       # Create merge commit (semi-linear history)
wt merge --no-remove   # Keep worktree after merge
```

**Pipeline:** squash → rebase → pre-merge hooks → fast-forward merge → pre-remove hooks → cleanup → post-merge hooks.

Cleanup removes the worktree and branch. Branch deletion only happens when merging would add nothing (checks: same commit, ancestor, no added changes, trees match, merge adds nothing).

### `wt remove` — Remove worktree; delete branch if merged

```bash
wt remove                    # Remove current worktree
wt remove <branch>           # Remove specific worktree
wt remove --no-delete-branch # Keep branch after removal
wt remove -D                 # Force-delete unmerged branch
wt remove -f                 # Force removal (ignore untracked files)
```

Removal runs in the background by default. Logs at `.git/wt/logs/<branch>-remove.log`.

---

## Common Workflows

### Work on a feature branch

```bash
wt switch --create feature-xyz   # Create worktree + branch
# … do work …
wt merge                         # Squash, rebase, merge, cleanup
```

### Review a GitLab MR

```bash
wt switch mr:101                 # Check out MR !101's branch
# … review, test …
wt remove                        # Clean up when done
```

### See what's in flight

```bash
wt list --full                   # All worktrees with CI status
```

---

## Rules

- **Use `wt` for worktree operations**, not raw `git worktree` commands.
- **`wt switch --create`** creates both the branch and worktree in one step.
- **`wt merge`** merges current → target (opposite direction from `git merge`).
- **`mr:<N>` / `pr:<N>` shortcuts** require the respective CLI (`glab` or `gh`) to be authenticated.
- **`-x` / `--execute`** runs a command after switching — useful for launching editors or other tools. It replaces the `wt` process with the command, giving it full terminal control.
