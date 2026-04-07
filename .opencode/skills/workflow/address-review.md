---
name: workflow/address-review
description: Address review comments — GitHub PRs, GitLab MRs, or pasted comments on local changes. Use when addressing unresolved MR or PR review comments.
compatibility: opencode
depends_on:
  - workflow
  - scm
---

# Address Review Comments

Structured workflow for addressing review feedback. Works for GitHub PRs, GitLab MRs, pasted review text, and local (pre-PR/MR) changes. No Python required.

## Input Modes

| Mode | When to use | Step 1 | Push | Resolve threads |
|------|-------------|--------|------|-----------------|
| **API** | PR/MR number provided, or current branch has an open PR/MR | Fetch threads via API | Yes | Yes |
| **Paste** | Review comments pasted directly into the prompt | Parse pasted text | Yes (if PR/MR exists) | No |
| **Local** | Local changes, no open PR/MR yet | Parse pasted text | No | No |

**Mode detection:**
- PR/MR number in argument → API mode
- User pastes review comment text → Paste mode
- Working tree has uncommitted changes and no PR/MR argument → Local mode
- Ambiguous → ask: "Do you have an open PR/MR, or should I work from what you've pasted?"

---

## Step 0: Detect Mode and Platform

**Detect mode** per the table above.

**Detect platform** (API mode only):

```bash
git remote get-url origin
```

- Contains `github.com` → **GitHub**
- Contains `gitlab` or a self-hosted hostname → **GitLab**
- Ambiguous → ask: "Is this a GitHub or GitLab repo?"

---

## Step 1: Gather Threads

### API / GitLab

```bash
# MR IID from argument, or detect from current branch:
MR_IID=$(glab mr view --output json | jq -r '.iid')

# Fetch all discussions:
glab api "/projects/:fullpath/merge_requests/$MR_IID/discussions"
```

`:fullpath` is a `glab api` path variable — automatically replaced with the URL-encoded project path from the current git remote.

**Fallback if `:fullpath` is unsupported:**
```bash
PROJECT_ID=$(glab repo view --output json | jq -r '.id')
glab api "/projects/$PROJECT_ID/merge_requests/$MR_IID/discussions"
```

A thread is **unresolved** when it has at least one note where `resolvable: true` AND `resolved: false`. Extract per unresolved thread:

| Field | JSON path | Used for |
|-------|-----------|----------|
| Discussion ID | `.id` | Reply and resolve calls |
| File | `.notes[0].position.new_path` (or `old_path`) | Display |
| Line | `.notes[0].position.new_line` (or `old_line`) | Display |
| Reviewer | `.notes[0].author.username` | Display |
| Comment | `.notes[0].body` | Display and fix planning |

---

### API / GitHub

```bash
# PR number from argument, or detect from current branch:
PR_NUMBER=$(gh pr view --json number -q .number)

# Owner and repo:
OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
OWNER=${OWNER_REPO%%/*}
REPO=${OWNER_REPO##*/}

# Fetch unresolved review threads:
gh api graphql -f query='{
  repository(owner:"'"$OWNER"'", name:"'"$REPO"'") {
    pullRequest(number: '"$PR_NUMBER"') {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          comments(first: 10) {
            nodes {
              databaseId
              body
              path
              line
              author { login }
            }
          }
        }
      }
    }
  }
}'
```

Filter for nodes where `isResolved: false`. Extract per unresolved thread:

| Field | JSON path | Used for |
|-------|-----------|----------|
| Thread node ID | `.id` (e.g. `PRRT_kwDO...`) | GraphQL resolve mutation |
| Comment integer ID | `.comments.nodes[0].databaseId` | REST reply endpoint |
| File | `.comments.nodes[0].path` | Display |
| Line | `.comments.nodes[0].line` | Display |
| Reviewer | `.comments.nodes[0].author.login` | Display |
| Comment | `.comments.nodes[0].body` | Display and fix planning |

> **ID disambiguation:** `id` is the global node ID (used with GraphQL). `databaseId` is the integer REST ID (used for posting replies). Never mix them.

---

### Paste / Local

Parse the user's provided text. For each comment item extract: file and line (if given), reviewer name (if given), comment body. Number items sequentially: [1], [2], [3]...

---

## Step 2: Display Threads

Show a numbered list:

```
[1] src/auth/token.ts:42 — @alice: "This should handle the null case"
[2] src/auth/token.ts:58 — @alice: "Consider extracting this to a helper"
[3] (general) — @bob: "Missing tests for the error path"
```

Include: thread number, file:line (if applicable), reviewer, full comment text (not truncated). If a thread has follow-up replies, show the count: `(2 follow-up notes)`.

---

## Step 3: Plan Fixes

**`<HARD-GATE>`**

Before touching any file:

1. Group related threads (e.g., multiple comments about the same function).
2. State the proposed fix in one sentence per thread or group.
3. Flag any thread where reviewer intent is unclear — **ask the user before guessing**.

Present the plan. Wait for approval.

---

## Step 4: Apply Fixes

Address one thread (or group) at a time, in the agreed order. After each fix:

- Verify the change matches the agreement.
- Do not bundle unrelated changes — keep fixes scoped to the thread.

---

## Step 5: Commit

See `.opencode/reference/conventions.md` for the required format.

- **Project/code repo:** `[PROJ-123] address review comments from @reviewer`
  Use the Jira issue key from the branch name or PR/MR title. Load the `jira` skill if unclear.
- **Journal repo:** `address review comments`

One commit per logical group of fixes. If addressing multiple rounds, name the round: `address round 2 review comments`.

---

## Step 6: Push *(skip in Local mode)*

```bash
git push
```

Monitor CI after pushing:

- GitLab: `glab ci view`
- GitHub: `gh run watch`

---

## Step 7: Resolve Threads *(skip in Paste and Local modes)*

After pushing, reply to each resolved thread and mark it resolved.

### GitLab

**Reply:**
```bash
glab api -X POST \
  "/projects/:fullpath/merge_requests/$MR_IID/discussions/$DISCUSSION_ID/notes" \
  -f body="Fixed in $COMMIT_SHA"
```

**Resolve:**
```bash
glab api -X PUT \
  "/projects/:fullpath/merge_requests/$MR_IID/discussions/$DISCUSSION_ID" \
  -f resolved=true
```

### GitHub

**Reply** (REST — uses integer `databaseId`):
```bash
gh api --method POST \
  "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_DATABASE_ID/replies" \
  -f body="Fixed in $COMMIT_SHA"
```

**Resolve** (GraphQL — uses node `id`):
```bash
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {threadId: "'"$THREAD_NODE_ID"'"}) {
      thread { isResolved }
    }
  }'
```

**Do not resolve threads** without user confirmation if the fix is non-trivial or the concern was architectural. Leave architectural threads for the reviewer to close.

---

## Rules

- **Never guess reviewer intent.** Ambiguous comment → ask the user before fixing.
- **One concern at a time.** Fix what was asked, not what you think should also change.
- **Always commit before resolving.** The commit is the evidence the concern was addressed.
- **Do not resolve architectural threads.** Leave those for the reviewer to close.
- **Hard gate before code changes.** Always present the plan before touching files.
- **Local mode:** commit only. No push, no resolve.
