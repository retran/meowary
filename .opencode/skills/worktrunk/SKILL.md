---
name: worktrunk
description: Manage git worktrees via wt — create, switch, list, merge, and remove worktrees; check out MR/PR branches in isolation. Load when working on multiple branches simultaneously, checking out a PR/MR branch for review, or managing worktree lifecycle.
compatibility: opencode
updated: 2026-04-18
---

<role>`wt` (worktrunk) authority for all git worktree operations.</role>

<summary>
> USE `wt` for all worktree operations, NOT raw `git worktree`. `wt switch --create` makes branch + worktree in one step. `wt merge` merges current → target (opposite of `git merge`).
</summary>

## Commands

### `wt switch` — switch/create worktree

```bash
wt switch <branch>            # Switch (creates if absent)
wt switch --create <branch>   # New branch + worktree
wt switch --create <branch> --base <base>
wt switch -                   # Previous worktree
wt switch ^                   # Default branch worktree
wt switch mr:<N>              # GitLab MR !N branch (requires glab)
wt switch pr:<N>              # GitHub PR #N branch (requires gh)
```

| Flag | Effect |
|------|--------|
| `--create` / `-c` | Create new branch |
| `--base <branch>` / `-b` | Base for `--create` (default: default branch) |
| `--execute <cmd>` / `-x` | Run command after switching (replaces `wt` process) |
| `--branches` | Include branches without worktrees in picker |
| `--clobber` | Remove stale path at target |
| `-y` | Skip approval prompts |

Args after `--` forwarded to `--execute`:

```bash
wt switch -x claude -c feature-a -- 'Add user authentication'
```

**Picker:** `wt switch` no args opens interactive picker. Preview tabs (`1`–`5`): HEAD diff, log, diff vs main, remote diff, LLM summary. `Alt-c` creates new from query.

### `wt list` — worktree status

```bash
wt list             # Table
wt list --full      # CI status, line diffs, LLM summaries
wt list --branches  # Include branches without worktrees
wt list --format=json
```

| Symbol | Meaning |
|--------|---------|
| `+` | Staged files |
| `!` | Modified (unstaged) |
| `?` | Untracked |
| `⊂` | Content integrated into default branch (safe remove) |
| `_` | Same commit as default branch (safe remove) |
| `↑` | Ahead of default |
| `↓` | Behind default |

Rows dimmed when safe to delete (`_` or `⊂`).

### `wt merge` — merge current → target

```bash
wt merge            # Into default (squash + rebase + FF + cleanup)
wt merge develop    # Into different branch
wt merge --no-squash   # Keep individual commits
wt merge --no-ff       # Merge commit (semi-linear)
wt merge --no-remove   # Keep worktree after merge
```

**Pipeline:** squash → rebase → pre-merge hooks → FF merge → pre-remove hooks → cleanup → post-merge hooks.

Cleanup removes worktree + branch. Branch deletion only when merging adds nothing (checks: same commit, ancestor, no added changes, trees match).

### `wt remove`

```bash
wt remove                    # Current worktree
wt remove <branch>
wt remove --no-delete-branch # Keep branch
wt remove -D                 # Force-delete unmerged
wt remove -f                 # Force (ignore untracked)
```

Background by default. Logs at `.git/wt/logs/<branch>-remove.log`.

### `wt step` — individual operations

```bash
wt step commit                  # Stage all + commit with LLM message
wt step commit --stage=tracked  # Stage only tracked
wt step squash                  # Squash branch commits with LLM message
wt step rebase                  # Rebase onto target
wt step push                    # FF target to current
wt step diff                    # All changes since branching
wt step diff -- --stat          # Pass args to git diff
wt step copy-ignored            # Copy gitignored files from primary
wt step prune                   # Remove worktrees+branches merged into default
wt step prune --dry-run         # Preview
wt step for-each -- git status --short  # Run command in every worktree
```

| `--stage` | Behavior |
|-----------|----------|
| `all` (default) | Stage all including untracked |
| `tracked` | Only modified tracked |
| `none` | Only what's already staged |

### `wt hook` — lifecycle hooks

```bash
wt hook pre-merge           # Run all pre-merge manually
wt hook pre-start --yes     # Skip approval (CI)
wt hook show
```

| Event | `pre-` (blocking) | `post-` (background) |
|-------|-------------------|----------------------|
| switch | `pre-switch` | `post-switch` |
| start (create) | `pre-start` | `post-start` |
| commit | `pre-commit` | `post-commit` |
| merge | `pre-merge` | `post-merge` |
| remove | `pre-remove` | `post-remove` |

**Config (`.config/wt.toml` in project root, committed):**

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

| Variable | Value |
|----------|-------|
| `{{ branch }}` | Active branch |
| `{{ worktree_path }}` | Active worktree path |
| `{{ primary_worktree_path }}` | Primary worktree path |
| `{{ repo }}` | Repo directory name |
| `{{ branch \| hash_port }}` | Deterministic port 10000–19999 |
| `{{ branch \| sanitize }}` | `/` replaced by `-` |
| `{{ branch \| sanitize_db }}` | DB-safe identifier with hash suffix |

### `wt config`

```bash
wt config shell install     # Required for cd-on-switch
wt config create            # User config with examples
wt config create --project  # .config/wt.toml
wt config show
```

| File | Location | Purpose |
|------|----------|---------|
| User | `~/.config/worktrunk/config.toml` | Personal preferences, LLM commit setup |
| Project | `.config/wt.toml` | Hooks, dev URL — committed |

---

## Common Workflows

### Feature branch
```bash
wt switch --create feature-xyz
# … work …
wt merge
```

### Review GitLab MR / GitHub PR
```bash
wt switch mr:101    # or pr:42
# … review, test …
wt remove
```

### Parallel agents
```bash
wt switch -x claude -c feature-a -- 'Add user authentication'
wt switch -x claude -c feature-b -- 'Fix the pagination bug'
wt switch -x claude -c feature-c -- 'Write tests for the API'
wt list --full
```

### See in-flight
```bash
wt list --full
```

### Clean up merged
```bash
wt step prune --dry-run
wt step prune
```

<rules>
- USE `wt` for worktree operations, NOT raw `git worktree`.
- `wt switch --create` makes branch + worktree in one step.
- `wt merge` merges current → target (opposite of `git merge`).
- `mr:<N>` / `pr:<N>` require `glab` / `gh` authenticated.
- `-x` / `--execute` runs command after switching. Args after `--` forwarded.
- `wt step commit` LLM messages require commit-gen command in `~/.config/worktrunk/config.toml`.
- Shell integration (`wt config shell install`) required for `wt switch` to change directories.
</rules>

<output_rules>Output in English. Preserve verbatim CLI commands, flags, and config TOML.</output_rules>
