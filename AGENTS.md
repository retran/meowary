# AGENTS.md

This repository is a personal work journal managed as Markdown files with supporting shell scripts. The structure follows **PARA** (Projects, Areas, Resources, Archive). The system uses **progressive disclosure**: AGENTS.md provides the rules, skills provide workflows, context files provide project-specific details — load only what the current task requires.

## Author & Context

Author identity, team, tooling, and other instance-specific details live in [`context.md`](context.md).

**On first use:** If `context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

**Keep context current:** If the user shares new information — a new project, role change, team update, tool adoption, or any fact that belongs in `context.md` or the coding context files — update the appropriate file immediately during the session.

## Session Start

### Tier 0 — every session

Read `context.md` (author identity, team, active projects, tooling). Skip if already loaded this session.

### Tier 1 — when the task involves writing, resources, people, teams, or projects

Search `resources/` with `qmd query "<topic>"` or browse the directory tree to identify articles relevant to the task by topic, team, person, or project tag. Read specific resource articles that directly bear on the task. If an article should exist but doesn't, create a stub before proceeding.

### Tier 2 — when doing coding work in external repos

Load the relevant coding context files before starting any workflow via `/do`. See the table in **Coding Context Files** below.

## Coding Context Files

Six files at repo root describe the author's external development environment. They are filled in by `/bootstrap` and updated as the environment changes.

| File               | Purpose                                                             | Load when                          |
| ------------------ | ------------------------------------------------------------------- | ---------------------------------- |
| `architecture.md`  | Repo structure, tech stack, build system, CI, source control        | Brainstorming, planning, debugging |
| `patterns.md`      | Language-specific idioms and project conventions for external repos | All coding workflow phases         |
| `style.md`         | Code style rules per language, linter/formatter config              | Implementing, reviewing            |
| `testing.md`       | Test frameworks, file structure, coverage policy per language       | Planning, implementing, reviewing  |
| `safety.md`        | Non-negotiable rules: secrets, destructive ops, approval gates      | Implementing, reviewing            |
| `conventions.md`   | Commit message format, Jira key prefix, MR title rules              | Implementing, reviewing, committing |

Read before acting. Never invent conventions — if a file is empty, ask the user before assuming any convention. These files describe external repos, not the journal. Update them immediately when you learn something new about the codebase.

## Repository Structure

Full directory tree and "What Goes Where" table: [`.opencode/reference/structure.md`](.opencode/reference/structure.md).

Top-level directories: `journal/`, `projects/`, `areas/`, `resources/`, `archive/`, `inbox/`, `.opencode/scripts/`, `.opencode/`.

Workflow prompts live in `.opencode/workflows/` (23 files). Commands live in `.opencode/commands/`.

## Automation Tools

### Slash Commands

**Lifecycle workflows** — `/do <phase>` dispatches to `.opencode/workflows/`:
`scout`, `research`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`

**Knowledge graph workflows** — `/r <operation>` dispatches to `.opencode/workflows/`:
`enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`

**Daily workflows** — direct dispatch: `/morning`, `/evening`, `/standup`, `/weekly`, `/capture`, `/meeting`

**Utility commands** — `/bootstrap`

### QMD — Semantic Search

- Index: `node .opencode/scripts/qmd-index.js` (`--changed` for fast early-exit, `--full` to force re-embed)
- Query: `qmd query "<question>"`
- Re-index after any bulk create/actualize, `/r ingest`, or `/r sync` run.

## Conventions

### Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. Surface gaps as you work and fill them immediately.

## Editing Rules

Non-negotiable constraints:

1. **Never delete or overwrite past daily notes.** Append-only.
2. **Maintain links.** Every link must point to an existing target. Update all inbound links when renaming, moving, or deleting files.
3. **Never write to Jira or Confluence without explicit user approval.**

## Security & GDPR

These rules are non-negotiable in all sessions. Full detail: [`.opencode/reference/security-rules.md`](.opencode/reference/security-rules.md).

**Security:**

- Never mutate production systems without explicit user approval.
- Never write secrets, tokens, or API keys into source files, commit messages, or log statements.
- Never pass secrets as inline shell arguments — use environment variables.
- Never add `sudo` to application code without flagging the user.
- Never force-push to `main` or `master`.
- Never bypass security controls (`--no-verify`, disabled hooks) without explicit approval.
- Verify before any destructive operation (`rm -rf`, `DROP TABLE`, bulk updates) — show scope and confirm.

**GDPR:**

- Never commit PII (email addresses, phone numbers, home addresses) to git.
- In resource articles and notes, use professional context only — name + role, not personal contact data.
- Confirm before writing personal data beyond name + role to Confluence or Jira.
- When ingesting Confluence/Jira content, strip personal contact info before storing in resources.
