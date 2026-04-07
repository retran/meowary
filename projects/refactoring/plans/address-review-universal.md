---
title: "Universal address-review skill — Implementation Plan"
status: draft
spec: "specs/address-review-universal.md"
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Universal address-review skill — Implementation Plan

## End State

- `TRUE:` `/address-review` works for GitHub PRs, GitLab MRs, pasted review comments, and local (no PR/MR) changes. No Python required anywhere.
- `EXIST:` `.opencode/skills/address-review/SKILL.md` with three input modes and two platform sections. Updated command and `glab/SKILL.md`.
- `WIRED:` `AGENTS.md` dispatch table references the new skill. No file in the repo references `glab/address-review.md` or `mr_discussions.py`.

## Tasks

- [ ] 1. Delete `glab/address-review.md` and the `glab/scripts/` directory
  - **Files:** `.opencode/skills/glab/address-review.md`, `.opencode/skills/glab/scripts/mr_discussions.py`, `.opencode/skills/glab/scripts/` (dir)
  - **Changes:** Delete all three. The directory will be empty after the script is removed.

- [ ] 2. Write `.opencode/skills/address-review/SKILL.md`
  - **Files:** `.opencode/skills/address-review/SKILL.md` (create)
  - **Changes:** New standalone skill with the following sections:

    **a. Preamble** — what the skill does, three input modes table (API / Paste / Local), mode detection logic.

    **b. Step 0 — Detect mode and platform**
    - Mode detection: presence of PR/MR number → API; pasted comment text → Paste; local working tree, no PR/MR → Local. Ambiguous → ask.
    - Platform detection (API mode only): `git remote get-url origin` → contains `github.com` → GitHub; contains `gitlab` or self-hosted → GitLab. Ambiguous → ask.

    **c. Step 1 — Gather threads**
    - *API/GitLab:*
      ```bash
      MR_IID=<arg or: glab mr view --output json | jq -r '.iid'>
      glab api "/projects/:fullpath/merge_requests/$MR_IID/discussions"
      ```
      Parse output: threads where at least one `resolvable` note is `resolved: false`. Extract `id` (discussion ID), file/line from first note's `position`, author username, body.
    - *API/GitHub:*
      ```bash
      PR_NUMBER=<arg or: gh pr view --json number -q .number>
      OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
      OWNER=${OWNER_REPO%%/*}; REPO=${OWNER_REPO##*/}
      gh api graphql -f query='{
        repository(owner:"'"$OWNER"'",name:"'"$REPO"'"){
          pullRequest(number:'"$PR_NUMBER"'){
            reviewThreads(first:100){
              nodes{
                id isResolved
                comments(first:10){
                  nodes{ databaseId body path line author{login} }
                }
              }
            }
          }
        }
      }'
      ```
      Filter for `isResolved: false` nodes. Capture `id` (node ID for resolve mutation) and first comment's `databaseId` (for reply via REST).
    - *Paste/Local:* Parse the user's text. Extract file, line, reviewer, comment body for each item. Number them sequentially.

    **d. Step 2 — Display threads**
    Numbered list:
    ```
    [1] path/to/file.ts:42 — @alice: "This should handle the null case"
    [2] (general) — @bob: "Missing tests for the error path"
    ```

    **e. Step 3 — Plan fixes (HARD-GATE)**
    Group related threads. State proposed fix per thread. Flag ambiguous comments — ask before guessing. Present plan, wait for approval.

    **f. Step 4 — Apply fixes**
    Address one thread at a time. Verify each change matches the agreement. No scope creep.

    **g. Step 5 — Commit**
    Load `conventions` skill. One commit per logical group. For project repos: `[PROJ-123] address review comments from @reviewer`. For journal repo: `address review comments`.

    **h. Step 6 — Push** *(skip in Local mode)*
    ```bash
    git push
    ```
    Monitor CI: `glab ci view` (GitLab) or `gh run watch` (GitHub).

    **i. Step 7 — Resolve threads** *(skip in Paste and Local modes)*
    - *GitLab:*
      ```bash
      glab api -X POST "/projects/:fullpath/merge_requests/$MR_IID/discussions/$DISCUSSION_ID/notes" \
        -f body="Fixed in $COMMIT_SHA"
      glab api -X PUT "/projects/:fullpath/merge_requests/$MR_IID/discussions/$DISCUSSION_ID" \
        -f resolved=true
      ```
    - *GitHub — reply (REST):*
      ```bash
      gh api --method POST \
        "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_DATABASE_ID/replies" \
        -f body="Fixed in $COMMIT_SHA"
      ```
    - *GitHub — resolve (GraphQL):*
      ```bash
      gh api graphql -f query='
        mutation { resolveReviewThread(input:{threadId:"'"$THREAD_NODE_ID"'"}){
          thread{ isResolved }
        }}'
      ```
    Do not resolve threads for architectural concerns — leave those for the reviewer.

    **j. Rules** — preserve from original: never guess intent, one concern at a time, always commit before resolving, hard gate before code changes.

- [ ] 3. Update `.opencode/commands/address-review.md`
  - **Files:** `.opencode/commands/address-review.md`
  - **Changes:**
    - Update description: "Address review comments — GitHub PRs, GitLab MRs, or pasted comments on local changes"
    - Update arguments: `/address-review [pr-or-mr-number]` — optional; omit for paste/local mode
    - Update skill load: load `address-review` skill (not `glab` + `glab/address-review`)
    - Remove GitLab-only language

- [ ] 4. Update `.opencode/skills/glab/SKILL.md`
  - **Files:** `.opencode/skills/glab/SKILL.md`
  - **Changes:** Line 188 — update "Fix MR review comments" section: change reference from `glab/address-review` sub-skill to the new `address-review` skill. Remove the path to the old file.

- [ ] 5. Update `AGENTS.md`
  - **Files:** `AGENTS.md`
  - **Changes:**
    - Line 287 (sub-skills table): replace `glab/address-review` row with new `address-review` row pointing to `.opencode/skills/address-review/SKILL.md`. Update description: "Address unresolved review comments — GitHub PRs, GitLab MRs, or pasted comments on local changes"
    - Line 318 (trigger table): update trigger "Addressing unresolved MR review comments" → `address-review` skill only (remove `glab` dependency from this trigger)
    - Line 3 (opening sentence): remove "Python scripts" reference — no Python scripts remain in the system after this change. Change to: "...Markdown files with supporting JavaScript scripts..."

- [ ] 6. Verify — no remaining references to deleted files
  - **Files:** whole repo
  - **Changes:** `grep` for `glab/address-review`, `mr_discussions`, `python3` across `.opencode/` and `AGENTS.md`. All must return zero matches.

## Test Strategy

This is a document-only change (skill + command markdown files). Verification:

- [ ] `grep -r "glab/address-review\|mr_discussions\|python3" .opencode/ AGENTS.md` returns zero results
- [ ] `.opencode/skills/address-review/SKILL.md` exists and is well-formed YAML front matter + markdown
- [ ] Command file updated description no longer mentions "GitLab MR" only
- [ ] `glab api` pattern uses `:fullpath` (not hardcoded project ID) — works in any repo
- [ ] GitHub GraphQL list query uses `reviewThreads` with `id`, `isResolved`, and `comments.nodes.databaseId` fields
- [ ] GitHub GraphQL resolve mutation uses `resolveReviewThread(input:{threadId:...})`
- [ ] Skill clearly distinguishes which steps are skipped per mode (Paste skips resolve; Local skips push + resolve)
- [ ] Rules section preserved from original skill

## Risks

- **GitHub GraphQL field names.** The `reviewThreads` query must use the exact field names from GitHub's schema. The plan uses `databaseId` (not `id`) for comment integer IDs and `id` (node ID) for thread IDs. If either is wrong, the reply/resolve commands will fail silently or with a 404. Mitigation: the skill documents both IDs clearly so the agent knows which to use where.
- **`glab api :fullpath` substitution.** `glab api` supports `:fullpath` as a magic path variable. If a user's glab version is old and doesn't support it, the API call will fail. Mitigation: document the fallback (`glab repo view --output json | jq -r '.id'` for numeric ID) as a comment in the skill.
- **AGENTS.md line 3 Python mention.** Removing "Python" from the opening sentence is a small but visible change — verify the sentence still reads correctly after edit.
