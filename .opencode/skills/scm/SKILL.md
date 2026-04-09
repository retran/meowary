---
name: scm
description: PR/MR lifecycle, CI monitoring, and issue management via gh/glab CLIs — title and commit conventions, authentication, and platform-specific subskill routing. Load when creating or reviewing a PR/MR, monitoring CI, managing issues, or pushing code changes; then also load the platform-specific subskill.
compatibility: opencode
---

`gh` (GitHub CLI) and `glab` (GitLab CLI) handle pull requests, merge requests, CI pipelines, issues, and repo operations.

## Sub-skills

Load the appropriate subskill alongside this one for platform-specific commands:

| Subskill | When to load |
|----------|-------------|
| `scm/github.md` | Working in a GitHub repository — PRs, Actions CI, issues, repo API |
| `scm/gitlab.md` | Working in a GitLab repository — MRs, pipeline CI, issues |

---

## Title and Commit Convention

PR/MR titles and commits require a Jira issue key prefix. No Conventional Commits type prefix.

Quick reference: `[PROJ-123] short description` — read `context/context.md` for the actual project key.

If you don't have the Jira issue key, check the branch name or load the `jira` skill to find it.

---

## Related Skills

| Skill | When to load |
|-------|-------------|
| Commit conventions | Any time you create a commit or PR/MR title — read `context/context.md` for the project key |
| `jira` | When you need the Jira issue key (search by branch name, sprint, or keyword) |
| `worktrunk` | When checking out a PR/MR branch locally |

---

## Rules

- **PR/MR titles and commits must follow `[PROJ-123] description` format.** No Conventional Commits type prefix. Read `context/context.md` for the project key.
- **Never force-push to `main` or `master`** without explicit user approval.
- **Never delete remote branches** that have open MRs or PRs.
- Use `pr view` / `mr view` and `issue view` to pull context into daily notes — summarize and link, do not copy verbatim.
- Both CLIs require authentication. Run `gh auth status` / `glab auth status` to verify before any operation.

## Editor Checklist (run silently before every output)

- [ ] Commit format matches `context/context.md` conventions?
- [ ] PR/MR title follows `[PROJ-123] description` format?
- [ ] No force-push to main/master without explicit approval?
- [ ] Authentication verified before CLI operations?
