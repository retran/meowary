# AGENTS.md

This repository is a personal work journal managed as Markdown files with supporting shell scripts. The structure follows **PARA** (Projects, Areas, Resources, Archive). The system uses **progressive disclosure**: AGENTS.md provides the rules, skills provide workflows, context files provide project-specific details — load only what the current task requires.

## Author & Context

Author identity, team, tooling, and other instance-specific details live in [`context.md`](context.md).

**On first use:** If `context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

**Keep context current:** If the user shares new information — a new project, role change, team update, tool adoption, or any fact that belongs in `context.md` or the coding context files — update the appropriate file immediately during the session.

## Session Start

### Tier 0 — every session

Read `context.md` (author identity, team, active projects, tooling). Skip if already loaded this session.

Run `/check-env` if a CLI tool fails unexpectedly, after updating Node.js, or after installing a new tool.

### Tier 1 — when the task involves writing, resources, people, teams, or projects

Search `resources/` with `qmd query "<topic>"` or browse the directory tree to identify articles relevant to the task by topic, team, person, or project tag.

### Tier 2 — on demand

Read specific resource articles that directly bear on the task. If the task mentions a person, team, tool, process, or architectural concept, look it up before writing about it. If an article should exist but doesn't, create a stub before proceeding.

### Tier 3 — when doing coding work in external repos

Load the relevant coding context files before starting any workflow (brainstorm, plan, implement, review, debug). See the table in **Coding Context Files** below.

## Coding Context Files

Five files at repo root describe the author's external development environment. They are filled in by `/bootstrap` and updated as the environment changes.

| File | Purpose | Load when |
|------|---------|-----------|
| `architecture.md` | Repo structure, tech stack, build system, CI, source control | Brainstorming, planning, debugging |
| `patterns.md` | Language-specific idioms and project conventions for external repos | All coding workflow phases |
| `style.md` | Code style rules per language, linter/formatter config | Implementing, reviewing |
| `testing.md` | Test frameworks, file structure, coverage policy per language | Planning, implementing, reviewing |
| `safety.md` | Non-negotiable rules: secrets, destructive ops, approval gates | Implementing, reviewing |

Read before acting. Never invent conventions — if a file is empty, ask the user before assuming any convention. These files describe external repos, not the journal. Update them immediately when you learn something new about the codebase.

## Repository Structure

Full directory tree and "What Goes Where" table: [`.opencode/reference/structure.md`](.opencode/reference/structure.md).

Top-level directories: `journal/`, `projects/`, `areas/`, `resources/`, `drafts/`, `archive/`, `inbox/`, `scripts/`, `.opencode/`.

## Automation Tools

### CLI-First Integration

CLIs are preferred over MCP for all external service integrations.

| Tool | Install | One-time setup |
|------|---------|----------------|
| `confluence` | `npm install -g confluence-cli` | Set env vars (see `.env.example`) |
| `jira` | `brew install ankitpokhrel/tap/jira-cli` | `jira init` |
| `ctx7` | `npm install -g ctx7` | Optional: set `CONTEXT7_API_KEY` |
| `gh` | `brew install gh` | `gh auth login` |
| `glab` | `brew install glab` | `glab auth login` |
| `repomix` | `npm install -g repomix` | None |

To snapshot installed tools and versions: `node scripts/env-context.js` → writes `env-snapshot.md` (gitignored).

### QMD — Semantic Search

Full documentation: load the `qmd` skill.

- Index: `node scripts/qmd-index.js` (`--changed` for fast early-exit, `--full` to force re-embed)
- Query: `qmd query "<question>"`
- Re-index after any bulk create/actualize, `/r-ingest`, or `/r-sync` run.

### Scripts — `scripts/`

- Language: JavaScript (ESM). Run from repo root: `node scripts/<name>.js [args]`
- Scripts are read-only (stdout only) except: `fix-links.js`, `run-operation.js`, `plan-resources.js`, `migrate-daily-notes.js`, `confluence-ingest.js`.
- Confluence ingestion workflow: load `resources/sync` sub-skill.

## YAML Front Matter

Every Markdown file must begin with a YAML front matter block (exceptions: `AGENTS.md`, skill files). Full rules: load `writing` skill.

Key constraints:
- `updated` and `tags` are mandatory in every file.
- `tags`: lowercase kebab-case, no `#` prefix, registered in `tags.md`.

## Conventions

For format details on each content type, load the referenced skill.

| Content type | Skill to load |
|---|---|
| Daily notes | `writing` + `writing/daily` |
| Weekly notes | `writing` + `writing/weekly` |
| Meeting notes | `writing` + `writing/meeting` |
| Project dashboards | `project` |
| Area dashboards | `project` + `writing/area` |
| Resources | `resources` |
| ADRs | `writing` + `writing/adr` |

### Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. Full trigger-action table: load `resources` skill. Surface gaps as you work and fill them immediately.

## Editing Rules

Full rules: load `writing` skill. Non-negotiable constraints:

1. **Never delete or overwrite past daily notes.** Append-only.
2. **Maintain links.** Every link must point to an existing target. Update all inbound links when renaming, moving, or deleting files.
3. **Never write to Jira or Confluence without explicit user approval.**
