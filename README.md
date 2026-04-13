# Meowary

A second brain template for software developers — built on plain Markdown and an AI coding agent that maintains it with you.

## What Meowary Is

You absorb hundreds of decisions, trade-offs, and context fragments every week. Most of it evaporates. Six months later you can't remember why the team chose that architecture, who owns the billing service, or what you learned from that incident postmortem. You start every AI conversation from scratch because the AI has no memory of what you already know.

Meowary fixes this. It is a structured work journal template for [OpenCode](https://opencode.ai) that gives your AI agent persistent, searchable memory of everything you capture. Clone the repo, fill in your `.env`, run `/bootstrap`, and start your first day with `/morning`.

The repository is plain Markdown — you own every file, every note, every decision. The agent reads your notes before acting, so it stops asking you things you have already documented. Over time, your accumulated context makes every session more useful than the last.

## Design Philosophy

Most second brain systems fail at one of four points. Meowary's design addresses each one directly.

### You forget what you decided and why

Decisions evaporate because there is no habit of recording them and no system that resurfaces them at the right moment. Meowary borrows the **[Zettelkasten](https://zettelkasten.de/)** principle of staged understanding: raw capture flows through source notes into atomic, cross-linked resource articles. Each stage forces you to restate the idea in your own words — so it sticks — and the agent searches that graph before every action via [QMD](https://github.com/tobi/qmd) semantic search.

### You stop capturing because the overhead is too high

If writing things down takes longer than remembering them, you stop. Meowary borrows **[Bullet Journal](https://bulletjournal.com/)** rapid logging: during the day, dump everything into a single Inbox section without formatting or categorizing. The evening routine sorts it. One command (`/morning`) opens the day; one command (`/evening`) closes it. The agent handles the structure so you handle the thinking.

### Your notes accumulate but never develop

A folder of stale notes is worse than no notes — it erodes trust in the system. Meowary treats every article as a living document, following **[Evergreen Notes](https://notes.andymatuschak.org/Evergreen_notes)** and **[Digital Gardening](https://maggieappleton.com/garden-history)**: articles are never finished, only more developed. Each revisit sharpens a claim, adds a link, or expands a thin section. The `actualized` date tracks when each article was last substantively enriched. Health scripts flag articles that are going stale.

### Your tools fight each other instead of compounding

Most developers use one tool for notes, another for tasks, another for code, and an AI that knows about none of them. Meowary integrates the knowledge graph directly with the coding agent. The same agent that writes your daily notes also reviews your pull requests — and it reads your architecture decisions, team structure, and project history before doing so. Structured around **[PARA](https://fortelabs.com/blog/para/)** (Projects, Areas, Resources, Archive), every file has one clear home based on what it is, not what it's about.

### Architectural decisions that make this work

Four design choices hold the system together:

- **Progressive disclosure.** The agent loads only what the current task needs. `AGENTS.md` is always loaded; skills load on demand; workflows load via slash commands; codebase context loads only during coding. A morning routine loads ~400 lines of context. An implementation session loads entirely different content. This keeps the context window sharp instead of bloated.

- **CLI tools over MCP.** Meowary uses standalone CLI tools (`jira`, `confluence`, `gh`, `glab`, `qmd`, `repomix`) instead of MCP server integrations. Every command is visible in your terminal, reproducible, and independently installable. No server lifecycle to manage, no opaque middleware.

- **Human control with composable workflows.** The agent suggests but never auto-dispatches. Slash commands are atomic. HARD-GATE checkpoints require your explicit confirmation. Tiered execution (quick / standard / full) lets you control depth. The AI is a skilled collaborator, not an autonomous actor.

- **Knowledge graph integrated with coding agent.** Your accumulated context feeds both journal and coding workflows. The agent reads architecture decisions from `resources/` before reviewing code. Coding sessions produce knowledge back — new conventions, discovered patterns, resolved decisions — that enriches the graph for future sessions.

## How the System Works

Three layers, each more specific than the last:

**AGENTS.md** — the top-level contract. Defines session-start behavior (what to load and when), editing rules, security constraints, and how context flows. The agent reads this every session.

**Skills** (`.opencode/skills/`) — domain-specific instruction sets. Each skill covers one topic: journal formatting, resource graph rules, project lifecycle, QMD syntax, SCM commands. Skills carry the format rules, templates, and editor checklists for their domain. They load on demand — only when a workflow step needs them.

**Workflows** (`.opencode/workflows/`) — step-by-step procedures. Each workflow is a numbered sequence of actions for one task: morning routine, implement a feature, enrich a resource article. Workflows reference skills for domain rules but never duplicate them.

The agent dispatches workflows through slash commands. `/do <phase>` routes to lifecycle workflows (scout, plan, implement, review). `/r <operation>` routes to knowledge graph workflows (enrich, sync, discover). Daily commands (`/morning`, `/evening`, `/capture`) dispatch directly.

## Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| [Node.js](https://nodejs.org) | >= 22 | See platform instructions below |
| [OpenCode](https://opencode.ai) | latest | `npm install -g opencode` or [opencode.ai](https://opencode.ai) |
| [QMD](https://github.com/tobi/qmd) | latest | `npm install -g @tobilu/qmd` |
| [repomix](https://github.com/yamadashy/repomix) | latest | `npm install -g repomix` |

<details>
<summary>macOS (Homebrew)</summary>

```sh
# Node.js — pick one method:
brew install node@22          # Homebrew
mise install node@22          # or mise
nvm install 22                # or nvm

# Required tools
npm install -g opencode @tobilu/qmd repomix
```

</details>

<details>
<summary>WSL / Ubuntu</summary>

```sh
# Install nvm (recommended for WSL)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install 22

# Required tools
npm install -g opencode @tobilu/qmd repomix
```

</details>

### Clone and configure

```sh
git clone https://github.com/retran/meowary my-journal
cd my-journal
cp .env.example .env   # edit with your credentials
```

OpenCode reads credentials from the shell environment. Use [direnv](https://direnv.net) or [mise](https://mise.jdx.dev) to load `.env` automatically:

- **direnv:** add `dotenv` to `.envrc` in the repo root, then run `direnv allow`
- **mise:** `.env` loads automatically — no extra config

### Install script dependencies

```sh
cd .opencode/scripts && npm install && cd ../..
```

This installs `dotenv` (used by helper scripts) and `vitest` (for tests).

### First day

Open the directory in OpenCode, then:

```
/bootstrap     # set up your identity and context
/morning       # start your first day
```

`/bootstrap` creates `context/context.md` (your name, team, active projects, tooling) and registers QMD search collections. `/morning` creates today's daily note, sets your focus, and picks your most important tasks.

## Daily Workflow

Each day follows a three-zone structure:

```
## Morning     — intent
## Day         — capture
## Evening     — reflection
```

### Morning — set intent

Run `/morning`. The agent:

1. Reviews yesterday's unfinished items and surfaces carry-over candidates
2. Creates today's daily note from the template
3. Populates the calendar from your recurring events
4. Asks what would make today a success — sets the **Focus** line
5. Sets your **MITs** (Most Important Tasks): one primary `★` MIT that is non-negotiable, plus up to two secondary MITs

On **Mondays**, `/morning` also creates this week's note, reviews last week's carry-overs, and sets the weekly focus and goals.

### Day — capture as things happen

Three sub-sections accumulate throughout the day:

| Sub-section | What goes there |
|-------------|-----------------|
| **Inbox** | Raw thoughts, decisions, things learned — rapid logging, processed in the evening |
| **Events** | Meetings linked to meeting notes via `/meeting` |
| **Waiting** | Items delegated to others with follow-up dates |

For richer captures (URLs, articles, ideas to develop), use `/capture` — these go to `inbox/` and get processed via `/r ingest` or the evening routine.

### Evening — reflect and promote

Run `/evening`. The agent:

1. Marks completed MITs as done
2. Migrates each unfinished MIT — carry to a specific date or drop with a reason (nothing rolls forward silently)
3. Scans the day's Inbox, Events, and Waiting for durable facts worth keeping — promotes them to resource articles in the knowledge graph
4. Appends new waiting items to `waiting-for.md`
5. Writes a day summary with done/carried/dropped counts
6. Updates project and area dashboards

On **Fridays**, `/evening` also triggers the weekly wrap-up.

## Weekly Workflow

Weekly notes live in `journal/weekly/YYYY-WNN.md`. The weekly cycle adds two review moments the daily cycle cannot provide: planning at the start and retrospective at the end.

**Monday** — `/morning` creates the weekly note, sets the weekly focus and goals (seeded from last week's carry-overs).

**Friday** — `/evening` triggers the wrap-up:

- Compiles accomplishments from the week's completed MITs
- Identifies failures and setbacks — unmet goals, missed MITs
- Collects carry-over items — confirms what carries vs. drops
- Runs a resources scan — finds durable facts in the week's notes not yet in the knowledge graph
- Reviews `waiting-for.md` — flags overdue items as MIT candidates for next week

Run `/weekly` at any time for a manual review outside the Friday flow.

## The Knowledge Graph

`resources/` is an evolving knowledge graph. Articles are nodes; cross-references are edges. It grows through three mechanisms:

**Daily capture.** The `/evening` routine scans the day's Inbox, Events, and Waiting for durable facts and writes them into resource articles. Quick facts go directly. Richer sources (articles, books, talks) go through a source note first — you summarize what it argues in your own words and list candidate topics — then those concepts get promoted to the graph.

**Deliberate ingestion.** `/r ingest <url-or-file>` fetches and processes a source into resource articles. The same source-note-first principle applies for narrative content.

**Enrichment and synthesis.** `/r enrich <article>` deepens an existing article from Confluence, Jira, codebase, and journal sources. Each enrichment pass checks whether two newly-linked articles together express an insight neither contains alone — flagged candidates become synthesis articles in `resources/synthesis/`.

```
Source (article, book, Confluence, codebase)
        ↓ /r ingest or /evening
inbox/<source-note>.md         ← summarized in your own words; candidate topics listed
        ↓ promote
resources/<domain>/<topic>.md  ← atomic, cross-linked, deepens on every revisit
        ↓ /r enrich
resources/synthesis/<insight>.md ← cross-cutting insight from multiple articles
```

Articles start thin (`status: stub`) and develop into `status: current` as facts accumulate. The `actualized` date and link density show maturity — there is no "done" state. Health scripts (`node .opencode/scripts/health-all.js`) flag orphans, stale articles, broken links, and tag inconsistencies.

<details>
<summary><strong>Commands Reference</strong></summary>

### Daily rhythm

| Command | What it does |
|---------|-------------|
| `/bootstrap` | Create `context/context.md` and register QMD collections — run once on first use |
| `/morning` | Set daily intent: Focus, MITs, Calendar; weekly planning on Mondays |
| `/evening` | Close the day: Completed, Carried/Dropped, promote insights to resources; weekly wrap-up on Fridays |
| `/standup` | Generate a standup from yesterday's completed items and today's MITs |
| `/meeting` | Record a meeting and cross-link to today's daily note |
| `/capture` | Quick-capture a URL, idea, or reference to `inbox/` |
| `/weekly` | Manual weekly review outside the Friday flow |

### Lifecycle work — `/do <phase>`

`/do` parses your intent and dispatches to the matching workflow. Pass a project slug and optional tier (`quick`, `standard`, `full`).

| Phase | What it does |
|-------|-------------|
| `scout` | Explore what exists — codebase, resources, prior decisions |
| `research` | Deep dive into a topic — read sources, extract facts, update resources |
| `brainstorm` | Socratic exploration — diverge and converge into a spec |
| `plan` | Turn an approved spec into a step-by-step plan with dependencies and risks |
| `design` | Decide how to build something — produces an ADR or design doc |
| `write` | Draft any document: proposal, RFC, ADR, postmortem |
| `implement` | Execute an approved plan in small verifiable increments |
| `test` | Manual QA or verification pass |
| `self-review` | Review your own changes before requesting peer review |
| `resolve` | Address PR/MR feedback — fetch comments, fix, push, resolve threads |
| `debug` | Investigate a bug or error systematically |
| `peer-review` | Review someone else's PR/MR |

Examples: `/do scout payment-service`, `/do implement mcp-client full`, `/do write proposal`.

### Knowledge graph — `/r <operation>`

| Operation | What it does |
|-----------|-------------|
| `enrich` | Deepen a resource article from Confluence, Jira, codebase, and journal |
| `sync` | Batch-sync tracked Confluence pages into resource articles |
| `plan` | Review the graph and plan structural operations (merge, split, create) |
| `discover` | Find gaps and cross-connection opportunities |
| `ops` | Execute structural operations: delete, merge, split, create, reclassify |
| `ingest` | Ingest a URL or file into resources |

Examples: `/r enrich ci-pipeline`, `/r sync`, `/r ingest https://example.com/article`.

</details>

<details>
<summary><strong>Skills Reference</strong></summary>

Skills are domain-specific instruction sets in `.opencode/skills/`. The agent loads them on demand when a task requires domain rules.

| Skill | What it covers |
|-------|----------------|
| `journal` | Journal philosophy; routes to `daily`, `weekly`, `meeting` sub-skills |
| `journal/daily` | Daily note format — three-zone structure, MIT system, rapid logging |
| `journal/weekly` | Weekly note format — Monday planning, Friday wrap-up, carry-over migration |
| `journal/meeting` | Meeting note format — sections by type, action item routing |
| `projects` | Project dashboard format, dev-log protocol, Step 0 state reading |
| `projects/spec` | Problem spec format — options analysis and recommendation |
| `projects/plan` | Implementation plan format — phases, dependencies, risks |
| `projects/rfc` | RFC format — proposals seeking broader input |
| `projects/adr` | Architecture Decision Record format |
| `projects/dev-log` | Dev-log entry format and phase-specific fields |
| `areas` | Area dashboard format, task states, archiving |
| `inbox` | Capture and source-note formats, processing rules |
| `resources` | Knowledge graph philosophy, tag conventions, health scripts |
| `query` | Multi-source retrieval — citation format, confidence tags, staleness rules |
| `qmd` | QMD CLI mechanics — query types, syntax, index maintenance |
| `writing` | Prose quality — active voice, concision, formatting conventions |
| `confluence` | Read Confluence pages, maintain sync registry |
| `jira` | Read Jira issues, extract facts for notes and resources |
| `scm` | PR/MR lifecycle via `gh`/`glab`; routes to `github` or `gitlab` sub-skills |
| `repomix` | Pack external repos for analysis, review, or planning |
| `worktrunk` | Git worktree management via `wt` |

</details>

<details>
<summary><strong>Structure</strong></summary>

Files marked with `†` are created by `/bootstrap` or on first use — they do not ship with the template.

```
meowary/
├── journal/
│   ├── daily/                # YYYY-MM-DD.md — daily notes (Morning/Day/Evening)
│   ├── weekly/               # YYYY-WNN.md — weekly plan and wrap-up
│   ├── meetings/             # YYYY-MM-DD-<slug>.md — meeting notes
│   ├── recurring-events.md † # Standing meetings and recurring events
│   ├── waiting-for.md †      # Open delegations — appended by /evening
│   └── reading-list.md †     # Books, articles, papers to read
├── projects/                 # Active projects — one directory each
│   └── <name>/
│       ├── README.md         # Project dashboard (status, tasks)
│       ├── dev-log.md        # Append-only cross-session work log
│       ├── specs/            # Problem specs with options analysis
│       ├── plans/            # Implementation plans
│       └── drafts/           # Proposals, RFCs, ADRs
├── areas/                    # Ongoing responsibilities
│   └── <name>/
│       └── README.md         # Area dashboard (focus, tasks, log)
├── resources/                # Knowledge graph — one article per topic
│   ├── <domain>/             # Domain-specific articles
│   ├── tools/
│   ├── teams/
│   ├── people/
│   └── synthesis/            # Cross-cutting insight articles
├── archive/                  # Completed projects and areas
├── inbox/
│   ├── scratch.md            # Quick capture pad
│   └── <slug>.md             # Source notes and captures
├── context/
│   ├── context.md †          # Your identity, team, projects — filled by /bootstrap
│   ├── safety.md             # Non-negotiable rules: secrets, destructive ops, approval gates
│   └── env-snapshot.md †     # CLI environment probe (generated by env-context.js)
├── codebases/
│   └── <name>.md †           # Per-repo context: stack, build, test, CI, conventions
├── meta/
│   ├── tags.md †             # Tag registry
│   ├── confluence-sync.json †# Confluence page monitoring registry
│   └── resources-log.md †    # Append-only log of resource operations
├── .opencode/
│   ├── commands/             # Slash command definitions
│   ├── workflows/            # Step-by-step workflow procedures (24 files)
│   ├── skills/               # Domain-specific instruction sets (14 directories)
│   ├── scripts/              # Helper scripts: health checks, sync, indexing
│   ├── context-templates/    # Blank templates for context/ files
│   ├── meta-templates/       # Blank templates for meta/ and journal/ operational files
│   └── reference/            # Structure and security reference docs
├── AGENTS.md                 # Agent instructions — read every session
├── CONTRIBUTING.md           # How to contribute
├── CHANGELOG.md              # Release history
├── LICENSE                   # MIT
├── qmd.yml                   # QMD semantic search index config
└── .env.example              # Credentials template
```

</details>

<details>
<summary><strong>Integrations</strong></summary>

All integrations use CLI tools installed separately. Credentials go in `.env` (see `.env.example`). Every integration is optional — install what matches your workflow.

| Integration | Tool | What it gives you |
|-------------|------|-------------------|
| Confluence | [`confluence-cli`](https://www.npmjs.com/package/confluence-cli) | Read Confluence pages into resource articles |
| Jira | [`jira-cli`](https://github.com/ankitpokhrel/jira-cli) | Query issues, sprints, and epics for daily notes and resources |
| GitHub | [`gh`](https://cli.github.com) | PR lifecycle, Actions CI, code search |
| GitLab | [`glab`](https://gitlab.com/gitlab-org/cli) | MR lifecycle, CI pipelines, issues |
| Web search | Exa (built into OpenCode) | Real-time web search — set `OPENCODE_ENABLE_EXA=1` in `.env` |
| Library docs | Context7 (built into OpenCode) | Framework and library documentation lookup |
| Token optimization | [`rtk`](https://github.com/rtk-ai/rtk) | Compress shell output before it reaches the LLM — 60-90% token savings |

The Atlassian REST credentials (`ATLASSIAN_USERNAME`, `ATLASSIAN_API_TOKEN`, `JIRA_URL`, `CONFLUENCE_URL`) are also used by `.opencode/scripts/config.js` for direct API calls in automation scripts — set them even if you use the CLI tools.

</details>

## Source Code Access

The `external_directory` permission in `opencode.json` controls which directories outside the journal the agent can read and modify. Set it to the path where your source code repositories live:

```json
"external_directory": {
  "~/workspace/**": "allow"
}
```

This lets the agent act as a coding agent in your actual projects — reviewing files, making changes, addressing MR comments — while using your accumulated journal context.

## Inspirations

Meowary's workflow system draws from several AI agent frameworks:

| Framework | What it inspired |
|-----------|-----------------|
| [Superpowers](https://github.com/obra/superpowers) (obra) | Mandatory brainstorming phase, spec self-review checklist, brainstorm-to-plan pipeline |
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) (Every) | Scope-tiered questioning, problem pressure test, learning loop, multi-agent review |
| [GSD](https://github.com/gsd-build/get-shit-done) (gsd-build) | Quality gates, structured artifacts, cross-session state persistence |
| [Spec Kit](https://github.com/github/spec-kit) (GitHub) | Separation of specify / plan / implement, cross-artifact consistency checks |

The knowledge management design builds on PARA, Bullet Journal, Zettelkasten, Evergreen Notes, and Digital Gardening — described in the [Design Philosophy](#design-philosophy) section.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to report issues, propose changes, and what makes a good pull request.

## License

[MIT](LICENSE) — Copyright (c) 2026 Andrew Vasilyev
