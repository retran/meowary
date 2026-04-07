---
title: "Universal address-review skill — GitHub + GitLab, no Python"
status: approved
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Universal address-review skill — GitHub + GitLab, no Python

## Problem

The current `/address-review` command and `glab/address-review` sub-skill depend on a 243-line Python script (`mr_discussions.py`) to list, reply to, and resolve MR discussion threads on GitLab. Three problems:

1. **Python dependency.** The system is otherwise Python-free (scripts/ is all JavaScript ESM, CLI tools are installed via npm/brew). `mr_discussions.py` is an outlier that requires Python 3.10+ and carries its own env var config logic.
2. **GitLab-only.** There is no equivalent for GitHub PRs. The `github/SKILL.md` has no address-review sub-skill. The `/address-review` command says "GitLab MR" in its description.
3. **Redundant.** `glab api` and `gh api` can make the same REST/GraphQL calls the Python script makes. The script adds no logic the CLIs can't handle — it's pure API plumbing.

## Constraints

- No Python. Replacement must use `glab api` (GitLab) and `gh api` (GitHub) only. **[VERIFIED: both CLIs support raw API calls]**
- Must detect platform automatically from git remote (or accept explicit flag). **[ASSUMED: feasible via `git remote get-url origin`]**
- The workflow steps (display, plan, hard-gate, apply, commit, push, resolve) are correct and should be preserved. **[VERIFIED: current workflow is sound]**
- No new external tools. **[VERIFIED: `glab api` and `gh api` are already installed as part of glab/github skills]**
- **Must support three input modes** — API fetch, pasted comments, and local-only (no PR/MR yet). **[NEW — added post-approval]**

## Input Modes

Three modes the skill must handle:

| Mode | Trigger | API calls | Push/resolve step |
|------|---------|-----------|-------------------|
| **API** | User provides PR/MR number, or current branch has an open PR/MR | Yes — fetch threads via `glab api` / `gh api graphql` | Yes |
| **Paste** | User copies review comments into the prompt | No — parse user-provided text | Yes (if PR/MR exists) |
| **Local** | No PR/MR yet; user pastes comments on local changes | No | No — commit only |

**Mode detection:**
- If the prompt contains a PR/MR number (or `--pr`/`--mr` flag) → API mode
- If the user pastes text that looks like review comments → Paste mode
- If the working tree has uncommitted changes and no PR/MR argument → Local mode
- Ambiguous → ask the user: "Do you have a PR/MR open, or are these local changes?"

In Paste and Local modes: Step 1 (fetch threads) is replaced by parsing the provided text. Step 7 (resolve threads) is skipped. In Local mode, Step 6 (push) is also skipped.

## What the Python script does (VERIFIED by reading the source)

| Operation | GitLab REST endpoint | Equivalent CLI |
|---|---|---|
| List unresolved threads | `GET /projects/:id/merge_requests/:iid/discussions` | `glab api "/projects/:id/merge_requests/:iid/discussions"` |
| Reply to thread | `POST /projects/:id/merge_requests/:iid/discussions/:disc_id/notes` | `glab api -X POST ... -f body="..."` |
| Resolve thread | `PUT /projects/:id/merge_requests/:iid/discussions/:disc_id` body `resolved=true` | `glab api -X PUT ... -f resolved=true` |

GitHub equivalents:

| Operation | GitHub endpoint | Equivalent CLI |
|---|---|---|
| List review threads | GraphQL `reviewThreads` on PR | `gh api graphql -f query='...'` |
| Reply to comment | `POST /repos/:owner/:repo/pulls/:pr/comments/:id/replies` | `gh api --method POST ... -f body="..."` |
| Resolve thread | GraphQL `resolveReviewThread` mutation | `gh api graphql -f query='mutation { resolveReviewThread(...) }'` |

## Platform detection (VERIFIED)

```bash
git remote get-url origin
```

- Contains `gitlab` or matches a self-hosted GitLab pattern → use `glab`
- Contains `github.com` → use `gh`
- Ambiguous → ask user: "Is this a GitHub or GitLab repo?"

`glab api` requires project ID or path, obtainable via:
```bash
glab repo view --output json | jq -r '.id'
```

`gh api` uses owner/repo, obtainable via:
```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

## Options

### Option A: Inline CLI calls — no skill file, agent constructs commands from instructions

The skill documents the API endpoints and CLI patterns as a reference. The agent constructs the correct `glab api` or `gh api` command directly in each step of the workflow.

**Pros:**
- No helper script of any kind — pure CLI-first **[VERIFIED: both CLIs support this]**
- Minimal files: one updated skill, one updated command

**Cons:**
- Skill must document complex API patterns (GitLab project ID resolution, GitHub GraphQL for threads) — verbose reference section needed **[ASSUMED: required to avoid agent guessing]**
- Agent constructs multi-step shell commands (get project ID, then call API) — higher chance of command errors compared to a helper that encapsulates the steps
- GitHub review thread resolution requires GraphQL — non-trivial to express correctly inline **[VERIFIED: GitHub's REST API does not support thread resolution; must use GraphQL]**

**Effort:** small (mostly documentation updates)
**Risk:** Medium. GraphQL mutations are fragile — a wrong field name silently fails or errors. Agent must get the query exactly right each time.

---

### Option B: Replace Python with a Node.js script (ESM, same pattern as scripts/)

Write `scripts/address-review.js` (or `.opencode/skills/address-review/scripts/`) that handles both GitHub (via `gh api`) and GitLab (via `glab api`) for the three operations: list, reply, resolve. The skill invokes this script.

**Pros:**
- Hides API complexity from the skill — skill stays readable **[ASSUMED]**
- Node.js is already required (scripts/ is all ESM) — no new dependency **[VERIFIED]**
- Script can encapsulate platform detection and ID resolution once **[ASSUMED]**

**Cons:**
- Still a helper script — same structural problem as the Python script, just in a different language
- Lives in an odd place: `address-review.js` in `scripts/` is about journal automation, not code review; in `.opencode/skills/` is more appropriate but scripts/ is the established pattern for runnable code
- Adds a JS file the user must not delete; the Python script had the same fragility **[VERIFIED]**

**Effort:** medium
**Risk:** Low-medium. Node.js is reliable; the main risk is the script location being confusing.

---

### Option C: Pure CLI, single universal skill with platform-branching sections

Create `.opencode/skills/address-review/SKILL.md` — a standalone skill (not nested under `glab` or `github`). The skill has:
- A **shared workflow** section (steps that are identical regardless of platform)
- A **GitLab section** with exact `glab api` patterns for list/reply/resolve
- A **GitHub section** with exact `gh api` / `gh api graphql` patterns for the same
- A **platform detection** section the agent runs first

The skill documents a complete, copy-pasteable command for each operation. This is different from Option A: rather than general reference documentation, it provides exact patterns with placeholders (`$PROJECT_ID`, `$MR_IID`, `$PR_NUMBER`, `$OWNER_REPO`) that the agent fills in once and then reuses throughout the session.

Delete `glab/address-review.md`, delete `glab/scripts/mr_discussions.py`, delete `glab/scripts/` directory. Update `glab/SKILL.md` to reference the new skill. Update `AGENTS.md` trigger table. Update command to load the new skill.

**Pros:**
- No scripts of any kind — pure CLI-first **[VERIFIED]**
- One skill covers both platforms — no duplication **[ASSUMED]**
- Exact patterns with placeholders reduce agent error vs. constructing commands from scratch **[ASSUMED]**
- Cleaner than Option A (structured patterns vs. general reference), without the script overhead of Option B

**Cons:**
- Skill file will be longer than the current `glab/address-review.md` — two platform sections
- GitHub GraphQL for thread resolution is verbose; the skill must carry the full query text **[VERIFIED: no simpler REST alternative]**

**Effort:** medium
**Risk:** Low. The main risk is the GitHub GraphQL query being wrong — mitigated by testing the query pattern against real PRs before writing the skill.

## Recommendation

**Option C: Pure CLI, single universal skill.**

Option A has the same fragility as Option C but without the exact patterns — the agent guesses at command structure each time. Option B solves the right problem (API complexity) but in the wrong layer (a script is still a dependency). Option C gives the agent exact, tested patterns it can fill in mechanically, without any non-CLI dependency.

The skill structure: one file, two platform sections, shared workflow steps. The `/address-review` command becomes platform-aware.

## Files affected

| Action | File |
|---|---|
| Create | `.opencode/skills/address-review/SKILL.md` |
| Delete | `.opencode/skills/glab/address-review.md` |
| Delete | `.opencode/skills/glab/scripts/mr_discussions.py` |
| Delete | `.opencode/skills/glab/scripts/` (directory) |
| Update | `.opencode/commands/address-review.md` |
| Update | `.opencode/skills/glab/SKILL.md` (remove reference to sub-skill, add reference to new skill) |
| Update | `AGENTS.md` (skill dispatch table: `glab/address-review` → `address-review`) |

## Open Questions

1. Should the new skill live at `.opencode/skills/address-review/SKILL.md` (standalone) or `.opencode/skills/review/address-review.md` (grouped under a `review` parent)? The former is simpler; the latter anticipates future review-related sub-skills.
2. The GitHub GraphQL query for resolving a thread requires a `threadId` in node ID format (e.g., `PRRT_kwDO...`). Does `gh pr view --json reviewThreads` return node IDs, or do we need a separate GraphQL query to get them? **[NEEDS VERIFICATION before implementing]**
3. Should the command also accept `--github` / `--gitlab` flags to override auto-detection, or is auto-detection from the remote URL sufficient?
