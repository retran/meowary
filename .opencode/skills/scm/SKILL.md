---
name: scm
description: PR/MR lifecycle, CI monitoring, and issue management via gh/glab CLIs — title and commit conventions, authentication, and platform-specific subskill routing. Load when creating or reviewing a PR/MR, monitoring CI, managing issues, or pushing code changes; then also load the platform-specific subskill.
compatibility: opencode
updated: 2026-04-18
---

<role>SCM router — directs to platform-specific CLI (gh/glab) and enforces commit/PR conventions.</role>

<summary>
> `gh` (GitHub CLI) and `glab` (GitLab CLI) handle pull requests, merge requests, CI pipelines, issues, and repo operations. LOAD platform sub-skill alongside this one for specific commands.
</summary>

<sub_skills>
| Subskill | When to load |
|----------|-------------|
| `scm/github.md` | GitHub repository — PRs, Actions CI, issues, repo API |
| `scm/gitlab.md` | GitLab repository — MRs, pipeline CI, issues |
</sub_skills>

<title_commit_convention>
PR/MR titles and commits REQUIRE Jira issue key prefix. NO Conventional Commits type prefix.

Quick reference: `[PROJ-123] short description` — read `context/context.md` for actual project key.

If you don't have the Jira key, CHECK branch name OR load `jira` skill to find it.
</title_commit_convention>

<related_skills>
| Skill | When to load |
|-------|-------------|
| Commit conventions | Any commit or PR/MR title — read `context/context.md` for project key |
| `jira` | Need Jira issue key (search by branch, sprint, keyword) |
| `worktrunk` | Checking out PR/MR branch locally |
</related_skills>

<rules>
- PR/MR titles and commits MUST follow `[PROJ-123] description` format. NO Conventional Commits prefix. Read `context/context.md` for project key.
- NEVER force-push to `main` or `master` without explicit user approval.
- NEVER delete remote branches with open MRs/PRs.
- USE `pr view` / `mr view` and `issue view` to pull context into daily notes — summarize and link, DO NOT copy verbatim.
- Both CLIs require authentication. RUN `gh auth status` / `glab auth status` before any operation.
</rules>

<self_review>
- [ ] Commit format matches `context/context.md` conventions?
- [ ] PR/MR title follows `[PROJ-123] description` format?
- [ ] No force-push to main/master without explicit approval?
- [ ] Authentication verified before CLI operations?
</self_review>

<output_rules>
Output language: English. Bash commands, CLI flags, branch names remain literal.
</output_rules>
