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

Daily and weekly notes capture the ephemeral — what happened, what you decided, what's next. The `resources/` folder is the **knowledge graph**: a permanent, cross-linked, always-developing body of knowledge where articles are nodes and cross-references are edges. Articles grow over time — they are never "finished", only more developed. QMD provides semantic search across the full graph, so the agent can surface relevant articles before writing anything.

## How the system is organised

The system has three layers:

**AGENTS.md** — the top-level contract. Defines session start behaviour (three tiers: every session, writing/resources tasks, coding work), editing rules, security policy, and how to load context. The agent reads this on every session start.

**Skills** (`.opencode/skills/`) — domain-specific instruction sets. Each skill covers one topic: journal format, resource graph rules, project lifecycle, QMD syntax, SCM commands. Skills are loaded on demand when a workflow step needs them. They carry the format rules, philosophy, templates, and editor checklists for their domain.

**Workflows** (`.opencode/workflows/`) — step-by-step procedures. Each workflow is a numbered sequence of actions for one task (morning routine, implement a feature, enrich a resource). Workflows are pure procedures — they reference skills for domain rules but don't duplicate them.

The agent dispatches workflows via slash commands. `/do <phase>` and `/r <operation>` are the two lifecycle routers; the others are direct dispatch.

**Progressive disclosure** is the operating principle: AGENTS.md is always loaded; skills are loaded only when the task requires them; coding context files in `context/` (`architecture.md`, `coding.md`, etc.) are auto-loaded every session via `opencode.json`.

## Daily workflow

Each day follows a three-zone structure grounded in [Bullet Journal](https://bulletjournal.com/):

```
## Morning         ← intent
## Day             ← capture
## Evening         ← reflection
```

The three zones keep different types of thinking separate. Morning is for deciding what matters. Day is for **rapid logging** — fast, unstructured capture of everything as it happens, without pausing to organise. Evening is for making sense of it: promoting insights to the knowledge graph and **migrating** unfinished tasks — each one gets an explicit decision (carry to a specific date, or drop with a reason). Nothing silently rolls forward.

### Morning — set intent

Run `/morning` at the start of the day. The agent:

1. Reviews yesterday's unfinished items and surfaces carry-overs as candidates.
2. Creates today's daily note from the template.
3. Populates the Calendar from your recurring events.
4. Asks: "What would make today a success?" — sets the **Focus** line.
5. Fills your **MITs** (Most Important Tasks): one primary `★` MIT (the non-negotiable), up to two optional. Soft limit of three — a fourth triggers a warning.

The MIT discipline is the core of the system. One non-negotiable task per day forces prioritisation. Everything else is secondary.

On **Mondays**, `/morning` also runs weekly planning: creates this week's note, reviews last week's carry-overs, sets the Weekly Focus and Goals.

### Day — capture as things happen

Three sub-sections accumulate throughout the day without needing a command:

| Sub-section | What goes there |
|-------------|-----------------|
| `### Inbox` | Raw same-day thoughts, reminders, quick ideas — ephemeral, processed in the evening |
| `### Events` | Meetings as they happen — linked to meeting note files via `/meeting` |
| `### Waiting` | Items delegated to others: `- [ ] @Person — item — date delegated — follow-up by date` |

The Inbox is intentionally unstructured. Write everything there during the day — decisions made, things learned, things to follow up. The evening pass turns that raw capture into structured knowledge.

For richer structured captures (URLs, ideas to develop, references to file later), use `/capture` — these go to `inbox/` and are processed separately via `/r ingest` or `/r plan`.

### Evening — reflect and promote

Run `/evening` at the end of the day. The agent:

1. Fills **Completed** — ticks off each finished MIT.
2. Fills **Carried / Dropped** — makes an explicit decision on each unfinished MIT: carry to a specific date, or drop with a reason. No task silently disappears.
3. Fills **Insights → Resources** — scans Inbox, Events, and Waiting for durable facts worth keeping. For sources (URLs, articles, books, talks), writes a source note first — a summary in your own words with candidate topics — then promotes those concepts to the knowledge graph. For plain facts, updates or creates the relevant `resources/` article directly. After processing all items, checks whether any two touched articles suggest a cross-cutting insight and flags it as a synthesis candidate in `inbox/scratch.md`.
4. Appends new **Day > Waiting** items to `waiting-for.md` — the authoritative list of open delegations. Flags any with an overdue follow-up date.
5. Writes the **Day Summary**: 1–2 sentences + `**Done: N | Carried: N | Dropped: N**` + end-of-day scan.
6. Updates project and area dashboards with dev log entries.
7. Updates the weekly note's daily link list.

The Insights → Resources step is the heart of the second brain. It converts ephemeral capture into durable knowledge. Over time, `resources/` becomes a dense, cross-linked reference layer that the agent reads before acting — so it answers from your context rather than from scratch.

On **Fridays**, `/evening` also triggers the weekly wrap-up.

## Weekly workflow

Weekly notes live in `journal/weekly/YYYY-WNN.md`. The weekly cycle adds two review moments the daily cycle can't provide: planning at the start of the week and retrospective at the end.

**Monday:** `/morning` creates the weekly note, sets the Weekly Focus and Weekly Goals (seeded from last week's carry-overs).

**Friday:** `/evening` triggers the Friday Wrap-Up:

- Compiles **Accomplishments** from the week's Evening > Completed and Day > Inbox sections.
- Identifies **Failures & Setbacks** — unmet goals, missed MITs.
- Collects **Carry-Over** — confirms with you what carries vs. drops.
- Writes **Notes & Reflections** (minimum 2 sentences).
- Runs a **Resources Scan** — scans all daily and meeting notes from the week for durable facts not yet in `resources/`.
- Reviews **`waiting-for.md`** — flags Active items whose follow-up date has passed, surfaces them as MIT candidates for next week.

Run `/weekly` at any time to trigger a manual weekly review outside the Friday flow.

## The knowledge graph

`resources/` is an evolving knowledge graph. Articles are nodes; cross-references are edges. The graph grows through three mechanisms:

**1. Daily capture → promotion.** The `/evening` routine scans the day's Inbox, Events, and Waiting for durable facts and writes them directly into the graph. Quick facts go straight to resource articles. Richer sources (articles, books, talks) go through a source note first — you summarize what it argues in your own words and list candidate topics, then promote those to the graph. This intermediate step is where understanding forms before it becomes a permanent article.

**2. Deliberate ingestion.** `/r ingest <url-or-file>` fetches and processes a source into resource articles. Narrative sources produce a source note in `inbox/` before the graph update — the same principle as the evening routine, just for larger inputs.

**3. Enrichment and synthesis.** `/r enrich <article>` deepens an existing article from Confluence, Jira, codebase, and journal. Every enrichment pass checks for synthesis candidates: pairs of newly-linked articles that together express an insight neither contains alone. Flagged candidates are reviewed during `/r plan` and become synthesis articles in `resources/synthesis/` when the pattern is strong enough.

```
Source (article, book, talk, Confluence page, codebase)
        ↓ /r ingest or /evening
inbox/<source-note>.md     ← what it argues, in your own words; candidate topics
        ↓ /evening or /r plan
resources/<domain>/<topic>.md   ← atomic, cross-linked, deepens on every revisit
        ↓ /r enrich (synthesis check)
resources/synthesis/<insight>.md   ← cross-cutting insight from multiple nodes
        ↓ any session
qmd query → agent reads relevant articles → answers from your accumulated context
```

The graph matures through use. A new article starts as a stub. Each enrichment pass adds facts, sharpens claims, and adds links. The `actualized` date and link density show maturity — there is no "done" state.

## The second brain loop

```
Daily note (Day > Inbox/Events/Waiting)
        ↓ /evening
resources/<domain>/<topic>.md
        ↓ weekly resources scan
resources/ stays current
        ↓ any session
qmd query → agent loads relevant articles → answers with your own context
```

The key principle: **ephemeral content in daily notes, durable facts in resources**. The evening and weekly routines are the transfer mechanism. QMD is the search layer — `qmd query` over the embedded resource index returns cited snippets so the agent can answer from your own accumulated context.

In practice: after a few weeks of daily use, the agent knows your team structure, your architecture, your on-call rotation, your open decisions, your project history. It stops asking you things you've already documented. That's the payoff.

## Design foundations

Meowary's structure draws on four established methods:

**[Bullet Journal](https://bulletjournal.com/)** (Ryder Carroll) — shapes the daily and weekly flow. The Day > Inbox is BuJo's daily log: rapid logging throughout the day without pausing to organise. Evening > Carried/Dropped is BuJo's migration: every unfinished task gets an explicit decision — carry to a specific date or drop with a reason. Nothing rolls forward silently. The `★` MIT prefix is a BuJo signifier. Weekly notes serve as the monthly log. `/morning` sets intent; `/evening` closes the loop.

**[Zettelkasten](https://zettelkasten.de/)** (Niklas Luhmann) — shapes how knowledge flows into the graph. The note-flow hierarchy: raw capture (Day > Inbox) → source notes (`inbox/`) → resource articles (`resources/`) → synthesis articles (`resources/synthesis/`). The key insight: understanding develops in stages. You summarize a source in your own words before promoting concepts to the graph. Cross-links are where new ideas emerge — two connected articles together express an insight neither contains alone.

**[Evergreen Notes](https://notes.andymatuschak.org/Evergreen_notes)** (Andy Matuschak) — shapes how resource articles develop. Notes are never finished, only more developed. Every revisit to a resource article should deepen it — sharpen a claim, add a link, expand a thin section. The `actualized` frontmatter field tracks when each article was last substantively enriched. Note titles stay as topic/term noun phrases (e.g. `ci-pipeline`, `alice-smith`) — they function as concept graph nodes, which requires composable names.

**[Digital Gardening](https://maggieappleton.com/garden-history)** — the philosophy underlying `resources/` as a whole. No article is a failure for being thin. New articles start with `status: stub`; they develop into `status: current` as facts accumulate. The garden grows through regular tending, not through batch completions. The `/r plan` command is the gardening pass: review the graph, identify what to merge, split, deepen, or synthesize.

**[PARA](https://fortelabs.com/blog/para/)** (Tiago Forte) — the top-level organisational structure. Projects (time-bound deliverables), Areas (ongoing responsibilities), Resources (durable reference), Archive (completed or inactive). Every file in the repo has exactly one home based on its nature, not its topic.

## What the agent does

The agent reads `AGENTS.md` for conventions and `context/context.md` for your personal details (filled in by `/bootstrap`). It operates in two modes at once.

**As a journal agent** it maintains the second brain:

- Write and update daily, weekly, and meeting notes
- Track project status, tasks, and dev log entries
- Maintain reference articles on people, teams, tools, processes, and architecture
- Pull context from Jira and Confluence into local notes without duplicating content

**As a coding agent** it uses the accumulated context to do real work:

- Run structured workflows: scout → research → brainstorm → plan → design → implement → test → self-review → peer-review
- Draft external documents: proposals, RFCs, ADRs, postmortems
- Review code, debug problems, address MR/PR comments
- Look up architecture, team ownership, and prior decisions from your own notes before acting — so it doesn't ask you things you've already documented

You own the Markdown. The agent does the grunt work.

## Skills

Skills are domain-specific instruction sets in `.opencode/skills/`. They are loaded on demand — the agent selects the relevant skill when a task requires it.

| Skill | What it covers |
|-------|----------------|
| `journal` | Journal philosophy; routes to `daily`, `weekly`, `meeting` sub-skills |
| `journal/daily` | Daily note format — three-zone structure, MIT system, rapid logging |
| `journal/weekly` | Weekly note format — Monday planning, Friday wrap-up, carry-over migration |
| `journal/meeting` | Meeting note format — sections by type, action item routing |
| `projects` | Project dashboard format, dev-log protocol, Step 0 state reading |
| `projects/spec` | Problem spec format — options analysis and recommendation |
| `projects/plan` | Implementation plan format — phased breakdown, dependencies, risks |
| `projects/rfc` | RFC format — proposals seeking broader input |
| `projects/adr` | Architecture Decision Record format and Confluence process |
| `projects/dev-log` | Dev-log entry format and phase-specific fields |
| `areas` | Area dashboard format, task states, archiving |
| `inbox` | Capture and source-note formats, processing rules |
| `resources` | Knowledge graph philosophy, tag conventions, health scripts |
| `query` | Multi-source retrieval strategy — citation format, confidence tags, staleness rules |
| `qmd` | QMD CLI mechanics — query types, syntax, index maintenance |
| `writing` | Prose quality rules — active voice, concision, formatting |
| `confluence` | Read Confluence pages, maintain sync registry |
| `jira` | Read Jira issues, extract facts for notes and resources |
| `scm` | PR/MR lifecycle via gh/glab; routes to `github` or `gitlab` sub-skills |
| `repomix` | Pack external repos for analysis, review, or planning |
| `worktrunk` | Git worktree management via wt |

## Prerequisites

### Required

| Tool | Purpose | Install |
|------|---------|---------|
| [Node.js](https://nodejs.org) ≥ 22 | Runs all `.opencode/scripts/` automation | [nodejs.org](https://nodejs.org) or `mise install node@22` |
| [qmd](https://github.com/tobi/qmd) | Semantic search — powers knowledge graph queries | `npm install -g @tobilu/qmd` |
| [repomix](https://github.com/yamadashy/repomix) | Packs external repos for analysis | `npm install -g repomix` |

### CLI integrations — install what you use

These are all optional. Install the tools that match your workflow.

| Tool | Purpose | Install |
|------|---------|---------|
| [confluence-cli](https://www.npmjs.com/package/confluence-cli) | Read Confluence pages into resources | `npm install -g confluence-cli` |
| [jira-cli](https://github.com/ankitpokhrel/jira-cli) | Query Jira issues and sprints | `brew install ankitpokhrel/tap/jira-cli` |
| [gh](https://cli.github.com) | GitHub CLI — PR lifecycle, Actions, issues | `brew install gh` |
| [glab](https://gitlab.com/gitlab-org/cli) | GitLab CLI — MR lifecycle, CI pipelines, issues | `brew install glab` |

### Env management — pick one

| Tool | Purpose | Install |
|------|---------|---------|
| [direnv](https://direnv.net) | Auto-loads `.env` when you enter the directory | `brew install direnv` |
| [mise](https://mise.jdx.dev) | Auto-loads `.env`; also manages Node.js versions | `curl https://mise.run \| sh` |

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

### Daily rhythm

| Command | What it does |
|---------|-------------|
| `/bootstrap` | Create or refresh `context/context.md` and coding context files — run once on first use, re-run when context changes |
| `/morning` | Set daily intent: Focus line, MITs, Calendar; includes weekly planning on Mondays |
| `/evening` | Close the day: Completed, Carried/Dropped, promote insights to `resources/`, update `waiting-for.md`; includes weekly wrap-up on Fridays |
| `/standup` | Generate a standup from yesterday's Evening > Completed and today's Morning > MITs |
| `/meeting` | Record a meeting interactively and cross-link to today's Day > Events |
| `/capture` | Quick-capture a URL, idea, or reference to `inbox/` for later processing |
| `/weekly` | Run a manual weekly review and planning pass outside the Friday flow |

### Lifecycle work — `/do <phase>`

`/do` parses your intent and dispatches to the matching workflow. Pass a project slug and optional complexity tier (`quick`, `standard`, `full`).

| Phase | What it does |
|-------|-------------|
| `scout` | Explore what already exists — codebase, resources, prior decisions |
| `research` | Deep dive into a topic — read sources, extract facts, update resources |
| `brainstorm` | Socratic exploration of a problem space — diverge and converge into a spec |
| `plan` | Turn an approved spec into a step-by-step implementation plan |
| `design` | Decide how to build something — ADR or design doc output |
| `write` | Draft any external document: proposal, RFC, ADR, postmortem |
| `implement` | Execute an approved plan |
| `test` | Manual QA or verification pass |
| `self-review` | Review your own changes before requesting peer review |
| `resolve` | Address PR/MR feedback threads — fetch, fix, push, resolve |
| `debug` | Investigate a bug or error systematically |
| `peer-review` | Review someone else's PR/MR or code |

Examples: `/do scout payment-service`, `/do implement mcp-client full`, `/do write proposal`.

### Knowledge graph — `/r <operation>`

`/r` parses your intent and dispatches to the matching resource workflow.

| Operation | What it does |
|-----------|-------------|
| `enrich` | Deepen a resource article from Confluence, Jira, codebase, and journal |
| `sync` | Sync tracked Confluence pages and batch-update resource articles |
| `plan` | Review the resource graph and plan structural operations (merge, split, reclassify) |
| `discover` | Find gaps and cross-connection opportunities in `resources/` |
| `ops` | Execute structural operations: delete, merge, split, create, reclassify |
| `ingest` | Ingest a URL or file directly into `resources/` |

Examples: `/r enrich alice-smith`, `/r sync`, `/r ingest https://...`.

## Structure

```
<root>/
├── journal/
│   ├── daily/              # YYYY-MM-DD.md — three-zone daily notes (Morning/Day/Evening)
│   ├── weekly/             # YYYY-WNN.md — weekly plan and wrap
│   ├── meetings/           # YYYY-MM-DD-<slug>.md
│   ├── recurring-events.md # Standing meetings and recurring events
│   ├── waiting-for.md      # Open delegations — appended by /evening, reviewed weekly
│   └── reading-list.md     # Articles, papers, books to read
├── projects/               # Active projects
│   └── <name>/
│       ├── README.md       # Project dashboard (status, tasks)
│       ├── dev-log.md      # Persistent cross-session work log (append-only)
│       ├── specs/          # Problem specs with options
│       ├── plans/          # Implementation plans
│       └── drafts/         # Proposals, RFCs, ADRs
├── areas/                  # Ongoing responsibilities
│   └── <name>/
│       └── README.md       # Area dashboard (focus, tasks, log)
├── resources/              # Reference articles — one per topic
│   ├── <domain>/
│   ├── tools/
│   ├── teams/
│   ├── people/
│   └── synthesis/          # Cross-cutting insights
├── archive/                # Completed projects and areas
├── inbox/
│   ├── scratch.md          # Quick capture pad
│   └── <slug>.md           # Source notes and captures
├── context/
│   ├── context.md          # Your identity, team, active projects — filled by /bootstrap
│   ├── safety.md           # Non-negotiable rules: secrets, destructive ops, approval gates
│   └── env-snapshot.md     # CLI environment snapshot (generated by env-context.js)
├── meta/
│   ├── tags.md             # Tag registry
│   ├── confluence-sync.json # Confluence page monitoring registry
│   └── resources-log.md    # Append-only log of resource operations
├── codebases/
│   └── <name>.md           # Per-repo context: stack, build, test, conventions, CI, decisions
├── .opencode/
│   ├── commands/           # Slash command definitions
│   ├── workflows/          # Step-by-step workflow procedures (24 files)
│   ├── skills/             # Domain-specific instruction sets
│   ├── scripts/            # Confluence sync, link auditing, health checks
│   ├── context-templates/  # Blank templates for context/ files
│   ├── meta-templates/     # Blank templates for meta/ and journal/ operational files
│   └── reference/          # Structure and security reference docs
├── qmd.yml                 # QMD index config for semantic search
├── AGENTS.md               # Agent instructions
└── .env.example            # Credentials template
```

## Integrations

All integrations use CLI tools installed separately. Credentials go in `.env` (see `.env.example`).

| Integration | Tool | What it gives you | One-time setup |
|-------------|------|-------------------|----------------|
| Confluence | `confluence-cli` | Read Confluence pages into resource articles | `npm install -g confluence-cli` + set `CONFLUENCE_DOMAIN`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN` in `.env` |
| Jira | `jira-cli` | Query issues, sprints, and epics | `brew install ankitpokhrel/tap/jira-cli` + `jira init` |
| GitHub | `gh` | PR lifecycle, Actions CI, code search | `brew install gh` + `gh auth login` |
| GitLab | `glab` | MR lifecycle, CI pipelines | `brew install glab` + `glab auth login` |
| Web search | Exa (built-in) | Web search from OpenCode | Set `OPENCODE_ENABLE_EXA=1` in `.env` — no API key required |
| Library docs | Context7 (built-in) | Framework and library documentation | Set `CONTEXT7_API_KEY` in `.env` (optional — public rate limits apply without it) |

The Atlassian REST credentials (`ATLASSIAN_USERNAME`, `ATLASSIAN_API_TOKEN`, `JIRA_URL`, `CONFLUENCE_URL`) are also used by `.opencode/scripts/config.js` for direct API calls in the automation scripts — set them even if you use `jira-cli` and `confluence-cli`.

## Source code access

The `external_directory` permission in `opencode.json` controls which directories outside the journal the agent can read and modify. Set it to the path where your source code repositories live:

```json
"external_directory": {
  "~/workspace/**": "allow"
}
```

This is what allows the agent to act as a coding agent — reviewing files, making changes, addressing MR comments — in your actual projects. `{env:VAR}` interpolation is not supported in permission keys, so edit the path directly.

## Inspirations

Meowary's workflow system draws from several AI agent frameworks:

| Framework | Inspiration | Link |
|-----------|------------|------|
| **Superpowers** (obra) | Mandatory brainstorming phase, spec self-review checklist, strict brainstorm-to-plan pipeline | [github.com/obra/superpowers](https://github.com/obra/superpowers) |
| **Compound Engineering** (Every) | Scope-tiered questioning, problem pressure test, learning/compound loop, multi-agent review | [github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) |
| **GSD** (gsd-build) | Quality gates (schema drift, scope reduction detection), structured artifacts, cross-session state | [github.com/gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) |
| **Spec Kit** (GitHub) | Separation of specify/plan/implement, cross-artifact consistency checks | [github.com/github/spec-kit](https://github.com/github/spec-kit) |

The system also builds on five PKM methods (PARA, Bullet Journal, Zettelkasten, Evergreen Notes, Digital Gardening) — see the design philosophy section above.

## License

MIT
