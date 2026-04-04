---
name: glab/address-review
description: "Address unresolved MR review comments — fetch threads, plan fixes, apply, commit, push, resolve."
compatibility: opencode
depends_on:
  - glab
---

# Address MR Review Comments

Structured workflow for working through unresolved discussion threads on a GitLab MR.

## When to Use

- User asks to "address review comments", "fix reviewer feedback", or "resolve MR threads"
- Before marking an MR as ready after a round of review

## Workflow

### Step 1: Fetch Unresolved Threads

Run the helper script to list all unresolved discussion threads:

```bash
python3 .opencode/skills/glab/scripts/mr_discussions.py list <mr-id>
```

Or using `glab` directly:

```bash
glab mr view <mr-id>           # Overview including review status
```

For detailed thread content, use the MR discussions script — it fetches all threads with their notes and resolved status.

If no `mr-id` is given, check the current branch:
```bash
glab mr view --output json | python3 -c "import sys,json; print(json.load(sys.stdin)['iid'])"
```

### Step 2: Display Threads

Show the user a numbered list of unresolved threads:

```
[1] path/to/file.ts:42 — Alice: "This should handle the null case"
[2] path/to/other.ts:17 — Bob: "Consider extracting this to a helper"
[3] (general) — Alice: "Missing tests for the error path"
```

Include:
- Thread number (for reference)
- File and line (if applicable)
- Reviewer name
- Comment text (full, not truncated)

### Step 3: Plan Fixes

Before touching any code:
1. Group related threads (e.g., multiple comments about the same function)
2. For each thread, state the proposed fix in one sentence
3. Flag any threads where the reviewer's intent is unclear — ask the user before guessing

**`<HARD-GATE>`** — present the plan and wait for user approval before making changes.

### Step 4: Apply Fixes

Address threads one at a time, in the order planned. After each fix:
- Verify the change matches what was agreed
- Do not bundle unrelated changes — keep fixes scoped to the thread

### Step 5: Commit

One commit per logical group of fixes (not one per thread unless they're unrelated).

Load the `conventions` skill for the required format. Quick reference:

```bash
git commit -m "[PROJ-123] address review comments from <reviewer>"
```

Use the Jira issue key from the branch name or MR title. If unclear, load the `jira` skill to find it. Commit message should reference the review round if helpful (e.g., "address round 2 review comments").

### Step 6: Push

```bash
git push
```

Monitor CI after pushing:
```bash
glab ci view
```

### Step 7: Resolve Threads

After pushing, reply to each resolved thread and mark it resolved:

```bash
python3 .opencode/skills/glab/scripts/mr_discussions.py reply <mr-id> <discussion-id> "Fixed in <commit-sha>"
python3 .opencode/skills/glab/scripts/mr_discussions.py resolve <mr-id> <discussion-id>
```

Or use `glab mr note` for a general summary comment:
```bash
glab mr note <mr-id> --message "Addressed all review comments from @alice — see commits <sha1>, <sha2>"
```

**Do not resolve threads without explicit user confirmation** if the fix is non-trivial or the reviewer's concern was architectural.

## Rules

- **Never guess reviewer intent.** If a comment is ambiguous, ask the user before fixing.
- **One concern at a time.** Fix what was asked, not what you think should also change.
- **Always commit before resolving.** The commit is the evidence the concern was addressed.
- **Do not resolve threads on behalf of the reviewer** for architectural concerns — leave those for the reviewer to close.
- **Hard gate before code changes.** Always present the plan before touching files.
