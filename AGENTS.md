# AGENTS.md

This repository is a personal work journal managed as Markdown files with supporting shell scripts. The structure follows **PARA** (Projects, Areas, Resources, Archive). The system uses **progressive disclosure**: AGENTS.md provides the rules, skills provide workflows, context files provide project-specific details — load only what the current task requires.

## Author & Context

Author identity, team, tooling, and other instance-specific details live in [`context/context.md`](context/context.md).

**On first use:** If `context/context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

**Keep context current:** If the user shares new information — a new project, role change, team update, tool adoption, or any fact that belongs in `context/context.md` or `codebases/<name>.md` — update the appropriate file immediately during the session.

## Session Start

### Tier 0 — every session

Read `context/context.md` (author identity, team, active projects, tooling). Skip if already loaded this session.

### Tier 1 — when the task involves writing, resources, people, teams, or projects

Search `resources/` with `qmd query "<topic>"` or browse the directory tree to identify articles relevant to the task by topic, team, person, or project tag. Read specific resource articles that directly bear on the task. If an article should exist but doesn't, create a stub before proceeding.

### Tier 2 — when doing coding work in external repos

Read `context/context.md` `## Codebases` to identify the active codebase. Read `codebases/<name>.md` for that codebase — it contains architecture, tech stack, build commands, test commands, coding conventions, CI context, and key decisions. If no `codebases/<name>.md` exists for the codebase you're working in, create one before proceeding.

Never invent conventions. If `codebases/<name>.md` is missing or a field is empty, ask the user before assuming anything.

## Repository Structure

Full directory tree and "What Goes Where" table: [`.opencode/reference/structure.md`](.opencode/reference/structure.md).

Top-level directories: `journal/`, `projects/`, `areas/`, `resources/`, `archive/`, `inbox/`, `context/`, `codebases/`, `.opencode/`.

Workflow prompts live in `.opencode/workflows/` (24 files). Commands live in `.opencode/commands/`. Sub-agent definitions live in `.opencode/agents/`. Reference files (conventions, structure, security rules) live in `.opencode/reference/`.

## Automation Tools

### Slash Commands

**Lifecycle workflows** — `/do <phase>` dispatches to `.opencode/workflows/`:
`scout`, `research`, `brainstorm`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`

**Knowledge graph workflows** — `/r <operation>` dispatches to `.opencode/workflows/`:
`enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`

**Daily workflows** — direct dispatch: `/morning`, `/evening`, `/standup`, `/weekly`, `/capture`, `/meeting`

**Utility commands** — `/bootstrap`

### QMD — Semantic Search

- Index: `node .opencode/scripts/qmd-index.js` (`--changed` for fast early-exit, `--full` to force re-embed)
- Query: `qmd query "<question>"`
- Re-index after any bulk create/actualize, `/r ingest`, or `/r sync` run.
- Collections are registered in `~/.cache/qmd/index.sqlite` via `qmd collection add`. The `/bootstrap` command registers all standard collections on first setup.

## Conventions

### Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. When you encounter a person, team, process, or concept that should have a resource article but doesn't, create a stub immediately. Surface gaps as you work and fill them.

### Proactive Codebase Enrichment

During any coding session, update `codebases/<name>.md` immediately whenever you learn something new about the codebase: a build command, architecture component, coding convention, CI step, or key decision. Do not defer these updates to the end of the session.

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
