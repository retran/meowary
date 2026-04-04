# Meowary

An OpenCode-powered work journal template for software developers. Clone it, fill in your `.env`, run `/bootstrap` — done.

## The problem

Software development is a knowledge-intensive job. Every day you absorb decisions, context, trade-offs, people dynamics, and technical detail — and most of it evaporates. You forget why a decision was made six months ago. You can't remember who owns that service. You lose the thread between yesterday's spike and today's implementation. You start every AI conversation from scratch.

The classical solution is a **second brain**: an external system that stores what your head can't hold, so you can think at full capacity without losing context between sessions, meetings, or projects.

## What Meowary is

Meowary is a second brain template for software developers, built around a plain Markdown repository and an AI agent that maintains it for you.

The structure follows **PARA** — a proven method for organising working knowledge:

- **Projects** — active work with a defined end: features, bugs, spikes, proposals
- **Areas** — ongoing responsibilities with no end date: on-call, code quality, team health
- **Resources** — durable reference knowledge: architecture, processes, tools, people, teams
- **Archive** — completed or inactive items, kept for reference

Daily and weekly notes capture the ephemeral — what happened, what you decided, what's next. The `resources/` folder captures the permanent — facts that stay true across projects and quarters: architecture, processes, tools, people, teams. A `knowledge-graph.md` indexes all resource articles so the agent can surface relevant context before writing anything.

The agent's job is to maintain this system: write notes, update resources, connect new information to existing knowledge, and surface what's relevant. You provide the raw material; the agent keeps it organised and linked.

## What the agent does

The agent reads `AGENTS.md` for conventions and `context.md` for your personal details (filled in by `/bootstrap`). It operates in two modes at once.

**As a journal agent** it maintains the second brain:

- Write and update daily, weekly, and meeting notes
- Track project status, tasks, and dev log entries
- Maintain reference articles on people, teams, tools, processes, and architecture
- Pull context from Jira and Confluence into local notes without duplicating content

**As a coding agent** it uses the accumulated context to do real work:

- Run structured workflows: brainstorm → spec → plan → implement → review
- Draft external documents: proposals, RFCs, postmortems
- Review code, debug problems, address MR comments
- Look up architecture, team ownership, and prior decisions from your own notes before acting — so it doesn't ask you things you've already documented

You own the Markdown. The agent does the grunt work.

## Setup

```sh
git clone https://github.com/your-org/meowary my-journal
cd my-journal
cp .env.example .env   # fill in your credentials
```

OpenCode reads credentials from the shell environment. Use [direnv](https://direnv.net) or [mise](https://mise.jdx.dev) to load `.env` automatically when you enter the directory.

**direnv:** add `dotenv` to `.envrc` in the repo root, then run `direnv allow`.

**mise:** `.env` is loaded automatically — no extra steps.

Open the directory in [OpenCode](https://opencode.ai), then:

```
/bootstrap   # set up your identity and context
/morning     # start your first day
```

## Commands

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `/bootstrap`        | Create or refresh `context.md` with your identity        |
| `/morning`          | Start of day — open today's note, review yesterday       |
| `/evening`          | End of day — update log, mark tasks done                 |
| `/standup`          | Write standup from yesterday's note                      |
| `/meeting`          | Record a meeting                                         |
| `/new-project`      | Create a project dashboard                               |
| `/new-area`         | Create an area dashboard                                 |
| `/new-person`       | Add a person to resources                                |
| `/new-team`         | Add a team to resources                                  |
| `/new-adr`          | Draft an Architecture Decision Record                    |
| `/capture`          | Quick-capture something to inbox                         |
| `/archive`          | Archive a completed project or area                      |
| `/brainstorm`       | Brainstorm a problem, produce a spec with options        |
| `/plan`             | Turn an approved spec into an implementation plan        |
| `/implement`        | Execute an approved plan                                 |
| `/review`           | Review code or a document                                |
| `/debug`            | Debug a problem systematically                           |
| `/address-review`   | Address unresolved MR/PR comments                        |
| `/draft-proposal`   | Draft a proposal                                         |
| `/draft-rfc`        | Draft an RFC                                             |
| `/draft-postmortem` | Draft a postmortem                                       |
| `/resources-enrich` | Enrich a resource article from Confluence or other sources |
| `/resources-plan`   | Review the resource graph and plan restructuring           |
| `/resources-sync`   | Sync Confluence map and batch-update resource articles     |
| `/lint`             | Lint Markdown files                                      |

## Structure

```
<root>/
├── journal/
│   ├── daily/          # YYYY-MM-DD.md — append-only daily notes
│   ├── weekly/         # YYYY-WNN.md — weekly plan and wrap
│   └── meetings/       # YYYY-MM-DD-<slug>.md
├── projects/           # Active projects (README, specs, plans, drafts)
├── areas/              # Ongoing responsibilities
├── resources/          # Reference articles — one per topic
│   ├── <domain>/
│   ├── tools/
│   ├── teams/
│   ├── people/
│   └── adr/
├── drafts/             # External-facing docs (proposals, blog posts)
├── archive/            # Completed projects and areas
├── inbox/
│   └── scratch.md      # Quick capture pad
├── scripts/            # Confluence sync, link auditing
├── context.md          # Your identity, team, active projects — filled by /bootstrap
├── knowledge-graph.md  # Index of all resource articles
├── tags.md
├── recurring-events.md
├── reading-list.md
├── AGENTS.md           # Agent instructions
├── opencode.json       # Plugins, MCP servers, permissions
└── .env.example        # Credentials template
```

## Integrations

Configured in `opencode.json`, credentials in `.env`:

| Server    | What it gives you                          | Env vars needed                                                     |
| --------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Atlassian | Read Jira issues and Confluence pages      | `ATLASSIAN_USERNAME`, `ATLASSIAN_API_TOKEN`, `JIRA_URL`, `CONFLUENCE_URL` |
| Exa       | Web search                                 | `EXA_API_KEY`                                                       |
| Context7  | Library and framework docs                 | —                                                                   |
| gh_grep   | GitHub code search                         | —                                                                   |

To disable an integration: set `"enabled": false` in `opencode.json` or remove the block.

## Source code access

The `external_directory` permission in `opencode.json` controls which directories outside the journal the agent can read and modify. Set it to the path where your source code repositories live:

```json
"external_directory": {
  "~/workspace/**": "allow"
}
```

This is what allows the agent to act as a coding agent — reviewing files, making changes, addressing MR comments — in your actual projects. `{env:VAR}` interpolation is not supported in permission keys, so edit the path directly.

## License

MIT
