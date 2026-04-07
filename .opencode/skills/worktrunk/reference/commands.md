# worktrunk Commands

## `wt switch` — Switch to a worktree; create if needed

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

Arguments after `--` are forwarded to the `--execute` command:

```bash
wt switch -x claude -c feature-a -- 'Add user authentication'
```

**Interactive picker:** `wt switch` with no arguments opens a picker. Preview tabs (toggle with `1`–`5`): HEAD diff, log, diff vs main, remote diff, LLM summary. `Alt-c` creates a new worktree from the query.

## `wt list` — List worktrees and their status

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

## `wt merge` — Merge current branch into target

```bash
wt merge            # Merge into default branch (squash + rebase + FF + cleanup)
wt merge develop    # Merge into a different branch
wt merge --no-squash   # Keep individual commits
wt merge --no-ff       # Create merge commit (semi-linear history)
wt merge --no-remove   # Keep worktree after merge
```

**Pipeline:** squash → rebase → pre-merge hooks → fast-forward merge → pre-remove hooks → cleanup → post-merge hooks.

Cleanup removes the worktree and branch. Branch deletion only happens when merging would add nothing (checks: same commit, ancestor, no added changes, trees match, merge adds nothing).

## `wt remove` — Remove worktree; delete branch if merged

```bash
wt remove                    # Remove current worktree
wt remove <branch>           # Remove specific worktree
wt remove --no-delete-branch # Keep branch after removal
wt remove -D                 # Force-delete unmerged branch
wt remove -f                 # Force removal (ignore untracked files)
```

Removal runs in the background by default. Logs at `.git/wt/logs/<branch>-remove.log`.

## `wt step` — Run individual operations

Building blocks of `wt merge`, plus standalone utilities.

```bash
wt step commit              # Stage all changes and commit with LLM-generated message
wt step commit --stage=tracked  # Stage only tracked files before committing
wt step squash              # Squash all branch commits into one with LLM message
wt step rebase              # Rebase onto target branch
wt step push                # Fast-forward target to current branch
wt step diff                # Show all changes since branching (committed + staged + unstaged + untracked)
wt step diff -- --stat      # Pass extra args to git diff
wt step copy-ignored        # Copy gitignored files (build caches, node_modules) from primary worktree
wt step prune               # Remove worktrees and branches merged into default branch
wt step prune --dry-run     # Preview what would be removed
wt step for-each -- git status --short  # Run a command in every worktree
```

**`wt step commit` staging options:**

| `--stage` | Behavior |
|-----------|----------|
| `all` (default) | Stage all changes including untracked files |
| `tracked` | Stage only modified tracked files |
| `none` | Commit only what's already staged |

## `wt hook` — Run configured hooks

Hooks are shell commands that run automatically at lifecycle events.

```bash
wt hook pre-merge           # Run all pre-merge hooks manually
wt hook pre-start --yes     # Skip approval prompts (for CI)
wt hook show                # Show all configured hooks
```

**Hook types:**

| Event | `pre-` (blocking) | `post-` (background) |
|-------|-------------------|----------------------|
| switch | `pre-switch` | `post-switch` |
| start (create) | `pre-start` | `post-start` |
| commit | `pre-commit` | `post-commit` |
| merge | `pre-merge` | `post-merge` |
| remove | `pre-remove` | `post-remove` |

**Configuration** (`.config/wt.toml` in project root, committed to repo):

```toml
[pre-start]
install = "npm ci"

[post-start]
copy = "wt step copy-ignored"
server = "npm run dev -- --port {{ branch | hash_port }}"

[pre-merge]
test = "npm test"

[post-remove]
kill-server = "lsof -ti :{{ branch | hash_port }} -sTCP:LISTEN | xargs kill 2>/dev/null || true"
```

**Template variables in hooks:**

| Variable | Value |
|----------|-------|
| `{{ branch }}` | Active branch name |
| `{{ worktree_path }}` | Active worktree path |
| `{{ primary_worktree_path }}` | Primary worktree path |
| `{{ repo }}` | Repository directory name |
| `{{ branch \| hash_port }}` | Deterministic port 10000–19999 for branch |
| `{{ branch \| sanitize }}` | Branch name with `/` replaced by `-` |
| `{{ branch \| sanitize_db }}` | Database-safe identifier with hash suffix |

## `wt config` — Configuration and shell integration

```bash
wt config shell install     # Install shell integration (required for cd on switch)
wt config create            # Create user config with documented examples
wt config create --project  # Create project config (.config/wt.toml)
wt config show              # Show current config and file locations
```

**Config files:**

| File | Location | Purpose |
|------|----------|---------|
| User config | `~/.config/worktrunk/config.toml` | Personal preferences, LLM commit setup |
| Project config | `.config/wt.toml` | Hooks, dev URL — committed to repo |
