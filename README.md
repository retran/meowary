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

Daily and weekly notes capture the ephemeral — what happened, what you decided, what's next. The `resources/` folder captures the permanent — facts that stay true across projects and quarters. A `knowledge-graph.md` indexes all resource articles so the agent can surface relevant context before writing anything.

## Daily workflow

Each day follows a three-zone structure grounded in GTD:

```
## Morning         ← intent
## Day             ← capture
## Evening         ← reflection
```

### Morning — set intent

Run `/morning` at the start of the day. The agent:

1. Reviews yesterday's unfinished items and surfaces carry-overs as candidates.
2. Creates today's daily note from the template.
3. Populates the Calendar from your recurring events.
4. Asks: "What would make today a success?" — sets the **Focus** line.
5. Fills your **MITs** (Most Important Tasks): one primary `★` MIT (the non-negotiable), up to two optional. Soft limit of three — a fourth triggers a warning.

On **Mondays**, `/morning` also runs weekly planning: creates this week's note, reviews last week's carry-overs, sets the Weekly Focus and Goals.

### Day — capture as things happen

Three sub-sections accumulate throughout the day without needing a command:

| Sub-section | What goes there |
|-------------|-----------------|
| `### Inbox` | Raw same-day thoughts, reminders, quick ideas — ephemeral, processed in the evening |
| `### Events` | Meetings as they happen — linked to meeting note files via `/meeting` |
| `### Waiting` | Items delegated to others: `- [ ] @Person — item — date delegated — follow-up by date` |

For richer structured captures (URLs, ideas to develop, references to file later), use `/capture` — these go to `inbox/` and are processed separately via `/r-plan` or `/r-ingest`.

### Evening — reflect and promote

Run `/evening` at the end of the day. The agent:

1. Fills **Completed** — ticks off each finished MIT.
2. Fills **Carried / Dropped** — makes an explicit decision on each unfinished MIT: carry to a specific date, or drop with a reason.
3. Fills **Insights → Resources** — scans Inbox, Events, and Waiting for durable facts worth keeping. For each one: updates or creates the relevant `resources/` article, then updates `knowledge-graph.md` (refreshes `actualized` date and tags). If nothing to promote, writes `nothing to promote today.`
4. Appends new **Day > Waiting** items to `waiting-for.md` — the authoritative list of open delegations. Flags any with an overdue follow-up date.
5. Writes the **Day Summary**: 1–2 sentences + `**Done: N | Carried: N | Dropped: N**` + end-of-day scan.
6. Updates project and area dashboards with dev log entries.
7. Updates the weekly note's daily link list.

On **Fridays**, `/evening` also triggers the weekly wrap-up.

## Weekly workflow

Weekly notes live in `journal/weekly/YYYY-WNN.md`.

**Monday:** `/morning` creates the weekly note, sets the Weekly Focus and Weekly Goals (seeded from last week's carry-overs).

**Friday:** `/evening` triggers the Friday Wrap-Up:

- Compiles **Accomplishments** from the week's Evening > Completed and Day > Inbox sections.
- Identifies **Failures & Setbacks** — unmet goals, missed MITs.
- Collects **Carry-Over** — confirms with you what carries vs. drops.
- Writes **Notes & Reflections** (minimum 2 sentences).
- Runs a **Resources Scan** — scans all daily and meeting notes from the week for durable facts not yet in `resources/`. Updates `knowledge-graph.md` for any stale articles referenced this week.
- Reviews **`waiting-for.md`** — flags Active items whose follow-up date has passed, surfaces them as MIT candidates for next week.

## The second brain loop

```
Daily note (Day > Inbox/Events/Waiting)
        ↓ /evening
resources/<domain>/<article>.md  ←→  knowledge-graph.md
        ↓ weekly resources scan
resources/ stays current
        ↓ any session
Agent reads knowledge-graph.md → loads relevant articles → answers with your own context
```

The key principle: **ephemeral content in daily notes, durable facts in resources**. The evening and weekly routines are the transfer mechanism. The knowledge graph is the index that makes resources findable without reading everything.

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

## Prerequisites

### Required

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [Node.js](https://nodejs.org) ≥ 22 | Runs all `scripts/` automation | [nodejs.org](https://nodejs.org) or `mise install node@22` |
| [qmd](https://github.com/tobi/qmd) | Semantic search index — powers `/ask`, `/r-ingest`, `/r-sync` | `npm install -g @tobilu/qmd` |

### Integrations — install what you use

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [uv](https://docs.astral.sh/uv/) | Runs MCP servers (Atlassian Jira + Confluence) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

### Env management — pick one

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [direnv](https://direnv.net) | Auto-loads `.env` when you enter the directory | `brew install direnv` |
| [mise](https://mise.jdx.dev) | Auto-loads `.env`; also manages Node.js and Python versions | `curl https://mise.run \| sh` |

### Source control — pick what matches your host

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [gh](https://cli.github.com) | GitHub CLI — PR lifecycle, Actions, issues | `brew install gh` |
| [glab](https://gitlab.com/gitlab-org/cli) | GitLab CLI — MR lifecycle, CI pipelines, issues | `brew install glab` |

Python 3.10+ is required if you use `/address-review` with GitLab (the `mr_discussions.py` script uses Python 3.10+ type syntax).

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

### Daily workflow

| Command      | What it does |
| ------------ | ------------ |
| `/bootstrap` | Create or refresh `context.md` — run once on first use, re-run when context changes |
| `/morning`   | Set daily intent: Focus line, MITs, Calendar from recurring events; includes weekly planning on Mondays |
| `/evening`   | Close the day: Completed, Carried/Dropped, promote insights to `resources/` + `knowledge-graph.md`, update `waiting-for.md`; includes weekly wrap-up on Fridays |
| `/standup`   | Generate a standup from yesterday's Evening > Completed and today's Morning > MITs |
| `/meeting`   | Record a meeting interactively and cross-link to today's Day > Events |
| `/capture`   | Quick-capture a URL, idea, or reference to `inbox/` for later processing |

### Structured work (code or documents)

| Command          | What it does |
| ---------------- | ------------ |
| `/brainstorm`    | Explore a problem and produce a spec with options — requires user approval before planning |
| `/pre-plan`      | Scout for ambiguities, reusable assets, and open questions before writing a plan |
| `/plan`          | Turn an approved spec into a step-by-step implementation plan |
| `/implement`     | Execute an approved plan |
| `/review`        | Review code changes, a document, or a PR/MR diff |
| `/debug`         | Investigate a bug or error systematically |
| `/address-review`| Address unresolved MR/PR discussion threads — fetch, fix, push, resolve |
| `/draft`         | Draft any external document: proposal, RFC, postmortem, blog post |

### Resources

| Command       | What it does |
| ------------- | ------------ |
| `/ask`        | Query all journal data with a question and synthesize a cited answer |
| `/r-enrich`   | Enrich a resource article from Confluence or another source |
| `/r-plan`     | Review the resource graph and plan structural operations (merge, split, reclassify) |
| `/r-sync`     | Sync the Confluence map and batch-update resource articles |
| `/r-discover` | Discover gaps and cross-connection opportunities in `resources/` |
| `/r-ingest`   | Ingest a URL or file directly into `resources/` |
| `/r-lint`     | Audit the journal repo for convention violations (read-only) |

### Organisation

| Command        | What it does |
| -------------- | ------------ |
| `/new-project` | Create a project dashboard with spec, plan, and dev log structure |
| `/new-area`    | Create an area dashboard for an ongoing responsibility |
| `/new-adr`     | Draft an Architecture Decision Record |
| `/archive`     | Move a completed project or area to `archive/` with link updates |
| `/do`          | Smart dispatcher — translate freeform text into the best matching command |

## Structure

```
<root>/
├── journal/
│   ├── daily/          # YYYY-MM-DD.md — three-zone daily notes (Morning/Day/Evening)
│   ├── weekly/         # YYYY-WNN.md — weekly plan and wrap
│   └── meetings/       # YYYY-MM-DD-<slug>.md
├── projects/           # Active projects (README, specs, plans, drafts)
├── areas/              # Ongoing responsibilities
├── resources/          # Reference articles — one per topic
│   ├── <domain>/
│   ├── tools/
│   ├── teams/
│   └── people/
├── drafts/             # External-facing docs (proposals, blog posts)
├── archive/            # Completed projects and areas
├── inbox/
│   └── scratch.md      # Quick capture pad
├── waiting-for.md      # Open delegations — appended by /evening, reviewed weekly
├── scripts/            # Confluence sync, link auditing, migration tools
├── context.md          # Your identity, team, active projects — filled by /bootstrap
├── knowledge-graph.md  # Index of all resource articles — updated when resources change
├── tags.md             # Tag registry
├── recurring-events.md # Standing meetings and recurring events
├── reading-list.md     # Articles, papers, books to read
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
