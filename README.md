# Meowary

A second brain template for software developers — built on plain Markdown and an AI coding agent that maintains it with you. The name is a portmanteau of *meow* and *diary*.

## What It Does

Meowary gives your AI coding agent persistent, searchable memory. Decisions, trade-offs, architecture rationale, team context — captured once, reused every session. The agent reads your notes before acting, so it stops asking things you already documented.

Clone the repo, run `setup.sh`, run `/bootstrap`, start your first day with `/morning`.

## Supported Agents

| Agent | Status |
|-------|--------|
| [OpenCode](https://opencode.ai) | Full support |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Full support |

Both agents share the same workflows, skills, scripts, and reference material. `generate.sh` produces each agent's configuration directory from a single canonical source (`.shared/`). You choose your agent during setup; switching later costs one command.

## Design Philosophy

### Decisions evaporate without a system

Meowary borrows **Zettelkasten** staged understanding: raw capture → source notes → atomic cross-linked articles. [QMD](https://github.com/tobi/qmd) semantic search surfaces the right context before every action.

### Capture must be frictionless

**Bullet Journal** rapid logging: dump everything into today's Inbox during the day. `/evening` sorts it. One command opens the day; one closes it.

### Notes must develop, not accumulate

**Evergreen Notes** and **Digital Gardening**: articles are never finished, only more developed. Health scripts flag staleness.

### Tools must compound, not fight

The same agent that writes your daily notes also reviews your pull requests — reading architecture decisions, team structure, and project history first. Organized by **PARA** (Projects, Areas, Resources, Archive).

### Architectural choices

- **Progressive disclosure.** The agent loads only what the current task needs. Morning routine and implementation session load entirely different context.
- **CLI tools over MCP.** Standalone tools (`jira`, `confluence`, `gh`, `glab`, `qmd`, `repomix`) — visible, reproducible, no server lifecycle.
- **Human control.** Slash commands are atomic. HARD-GATE checkpoints pause for your confirmation. Tiered execution (`quick`/`standard`/`full`) controls depth.
- **Knowledge graph feeds coding.** The agent reads architecture decisions before reviewing code and writes new conventions back after coding.
- **Agent-agnostic content.** All workflows, skills, and scripts live in `.shared/` and work with any supported agent.

## Quick Start

### 1. Clone and setup

```sh
git clone https://github.com/retran/meowary my-journal
cd my-journal
bash setup.sh
```

`setup.sh` installs [mise](https://mise.jdx.dev), uses it to install all required tools, asks which agent you use, and runs `generate.sh` to produce the agent configuration. Works on macOS, Linux, and WSL. Safe to re-run.

### 2. Configure credentials

`setup.sh` creates `.env` from `.env.example`. Three required values:

```sh
ATLASSIAN_EMAIL=you@example.com
ATLASSIAN_API_TOKEN=your-atlassian-api-token
ATLASSIAN_INSTANCE=your-instance.atlassian.net
```

mise loads `.env` automatically when you enter the directory.

### 3. Optional integrations

Re-run `setup.sh` or uncomment tools in `mise.toml` and run `mise install`:

```toml
# gh = "latest"        # GitHub CLI
# glab = "latest"      # GitLab CLI
# "ubi:ankitpokhrel/jira-cli[exe=jira]" = "latest"
# "npm:confluence-cli" = "latest"
```

After installing, authenticate each tool (`gh auth login`, `glab auth login`, `jira init`).

### 4. First day

Start your agent from the Meowary root directory, then:

```
/bootstrap     # set up your identity and context (once)
/morning       # start your first day
```

## Agent Generation

All shared content lives in `.shared/` (canonical source, committed to git). Agent-specific directories (`.opencode/`, `.claude/`) are **generated** and gitignored.

```sh
bash generate.sh opencode        # generate OpenCode config
bash generate.sh claude          # generate Claude Code config
bash generate.sh opencode claude # generate both
```

`generate.sh` copies workflows, skills, scripts, commands, agents, and reference material into each agent's expected directory structure. For Claude Code, it also transforms agent frontmatter (OpenCode's permission model → Claude's tools/disallowedTools).

To switch agents: edit `.agent-config` (one agent name per line), run `mise run generate`.

## Daily Workflow

Three-zone structure per day:

| Zone | Command | Purpose |
|------|---------|---------|
| Morning | `/morning` | Set Focus + MITs, create daily note, review carry-overs |
| Day | `/capture` | Rapid-log into Inbox; `/meeting` for meeting notes |
| Evening | `/evening` | Mark done, migrate undone, promote insights to resources |

On Mondays, `/morning` adds weekly planning. On Fridays, `/evening` adds weekly wrap-up.

## Weekly Workflow

Weekly notes at `journal/weekly/YYYY-WNN.md`. Monday: set weekly focus and goals from carry-overs. Friday: compile accomplishments, identify failures, run resource scan, review waiting-for items. `/weekly` for manual review.

## The Knowledge Graph

`resources/` is the knowledge graph. Articles are nodes; cross-references are edges. Grows via:

- **Daily capture** — `/evening` promotes durable facts from the day's notes
- **Deliberate ingestion** — `/r ingest <url>` processes sources into articles
- **Enrichment** — `/r enrich <article>` deepens from Confluence, Jira, codebase

Articles start as stubs and develop over time. Health scripts flag orphans, stale articles, broken links.

## Lifecycle Workflows

`/do <phase> [project-slug] [tier]` dispatches lifecycle work. Tiers: `quick` (fast), `standard` (default), `full` (comprehensive).

| Phase | Purpose |
|-------|---------|
| `scout` | Explore what exists — resources, codebase, prior decisions |
| `research` | Deep dive with provenance tags (`[VERIFIED]`, `[CITED]`, `[ASSUMED]`) |
| `brainstorm` | Socratic exploration → problem spec |
| `plan` | Spec → implementation plan with milestones and risks |
| `design` | Architecture decision → ADR |
| `write` | Draft proposals, RFCs, ADRs, postmortems |
| `implement` | Execute plan in small verifiable increments |
| `test` | Structured verification against success criteria |
| `debug` | Hypothesis-driven failure investigation |
| `self-review` | Pre-PR review of your own changes |
| `peer-review` | Review someone else's PR/MR |
| `resolve` | Address review feedback systematically |

## Commands

### Daily rhythm

| Command | Purpose |
|---------|---------|
| `/bootstrap` | Create identity context, register QMD collections (once) |
| `/morning` | Open the day: Focus, MITs, Calendar |
| `/evening` | Close the day: done/carried/dropped, promote insights |
| `/standup` | Generate standup from yesterday + today |
| `/meeting` | Record meeting, cross-link to daily note |
| `/capture` | Quick-capture to `inbox/` |
| `/weekly` | Manual weekly review |

### Knowledge graph — `/r <operation>`

| Operation | Purpose |
|-----------|---------|
| `enrich` | Deepen article from multiple sources |
| `sync` | Batch-sync tracked Confluence pages |
| `plan` | Plan graph operations (merge, split, create) |
| `discover` | Find gaps and cross-connections |
| `ops` | Execute structural operations |
| `ingest` | Ingest URL or file into resources |

## Skills

Skills are domain-specific instruction sets loaded on demand. Both agents use the same skill files from `.shared/skills/`.

| Skill | Domain |
|-------|--------|
| `journal` | Daily/weekly/meeting note format |
| `projects` | Project dashboards, dev-log, specs, plans |
| `areas` | Area dashboards, ongoing responsibilities |
| `inbox` | Capture and source-note processing |
| `resources` | Knowledge graph philosophy, health, maintenance |
| `query` | Multi-source retrieval, citation format |
| `qmd` | QMD CLI — query types, syntax, indexing |
| `writing` | Prose quality — active voice, concision |
| `confluence` | Read Confluence pages, sync registry |
| `jira` | Read Jira issues, extract facts |
| `scm` | PR/MR lifecycle via `gh`/`glab` |
| `codebases` | Per-repo context format |
| `repomix` | Pack repos for analysis |
| `worktrunk` | Git worktree management |

## Structure

Files marked `†` are created by `/bootstrap` or on first use.

```
meowary/
├── .shared/                  # Canonical source (committed)
│   ├── workflows/            # Step-by-step procedures (24 files)
│   ├── skills/               # Domain-specific instruction sets
│   ├── scripts/              # Health checks, sync, indexing
│   ├── commands/             # Slash command definitions
│   ├── agents/               # Sub-agent definitions
│   ├── reference/            # Structure, security, conventions
│   ├── context-templates/    # Templates for context/ files
│   ├── meta-templates/       # Templates for meta/ files
│   ├── opencode/             # OpenCode-specific config (package.json)
│   ├── claude/               # Claude Code-specific config (settings.json, mcp.json)
│   ├── AGENTS.md.template    # OpenCode memory file template
│   └── CLAUDE.md.template    # Claude Code memory file template
├── .opencode/                # Generated — gitignored
├── .claude/                  # Generated — gitignored
├── journal/
│   ├── daily/                # YYYY-MM-DD.md
│   ├── weekly/               # YYYY-WNN.md
│   ├── meetings/             # YYYY-MM-DD-<slug>.md
│   ├── recurring-events.md †
│   ├── waiting-for.md †
│   └── reading-list.md †
├── projects/                 # Time-bound work
│   └── <slug>/
│       ├── README.md         # Dashboard (status, tasks)
│       ├── dev-log.md        # Cross-session work log
│       ├── specs/            # Problem specs
│       ├── plans/            # Implementation plans
│       └── drafts/           # Proposals, RFCs, ADRs
├── areas/                    # Ongoing responsibilities
│   └── <slug>/README.md
├── resources/                # Knowledge graph
│   ├── <domain>/
│   └── synthesis/
├── archive/                  # Completed projects/areas
├── inbox/                    # Captures and source notes
├── context/
│   ├── context.md †          # Identity, team, projects
│   ├── safety.md             # Security rules
│   └── env-snapshot.md †
├── codebases/
│   └── <name>.md †           # Per-repo: stack, build, test, conventions
├── meta/
│   ├── tags.md †
│   ├── confluence-sync.json †
│   └── resources-log.md †
├── generate.sh               # Produce agent dirs from .shared/
├── setup.sh                  # First-run installer
├── update.sh                 # Framework updater
├── mise.toml                 # Tool dependencies
├── VERSION
├── qmd.yml                   # Semantic search config
└── .env.example              # Credentials template
```

## Updating

```sh
bash update.sh                      # update to latest release
bash update.sh --check              # check if newer release exists
bash update.sh --version 0.2.0     # specific version
bash update.sh --non-interactive    # skip prompts
```

Updates `.shared/`, `generate.sh`, `setup.sh`, `update.sh`, `mise.toml`, and `VERSION`. Never modifies `journal/`, `projects/`, `areas/`, `resources/`, `archive/`, `inbox/`, `context/`, `codebases/`, `meta/`, or `.env`. Re-runs `generate.sh` after updating.

## Using with Obsidian

Open the repo as an Obsidian vault. Apply these settings for cross-editor compatibility:

| Setting | Value |
|---------|-------|
| Files & Links → Use [[Wikilinks]] | Off |
| Files & Links → New link format | Relative path to file |
| Files & Links → Auto update internal links | On |
| Files & Links → Excluded files | `node_modules` |
| Editor → Properties in document | Visible or Source |

Useful plugins: Dataview (query by property), Calendar (navigate daily notes), Periodic Notes (alternative to `/morning`).

## Source Code Access

In `opencode.json` (or equivalent Claude Code config), set the external directory permission to your repos:

```json
"external_directory": {
  "~/workspace/**": "allow"
}
```

This lets the agent review and modify code in your projects while using journal context.

## Inspirations

| Framework | Contribution |
|-----------|-------------|
| [Superpowers](https://github.com/obra/superpowers) | Mandatory brainstorm phase, spec checklist |
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | Scope-tiered questioning, learning loop |
| [GSD](https://github.com/gsd-build/get-shit-done) | Quality gates, cross-session persistence |
| [Spec Kit](https://github.com/github/spec-kit) | Specify/plan/implement separation |

Knowledge management: PARA, Bullet Journal, Zettelkasten, Evergreen Notes, Digital Gardening.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — Copyright (c) 2026 Andrew Vasilyev
