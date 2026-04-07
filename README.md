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

For richer structured captures (URLs, ideas to develop, references to file later), use `/capture` — these go to `inbox/` and are processed separately via `/r-plan` or `/r-ingest`.

### Evening — reflect and promote

Run `/evening` at the end of the day. The agent:

1. Fills **Completed** — ticks off each finished MIT.
2. Fills **Carried / Dropped** — makes an explicit decision on each unfinished MIT: carry to a specific date, or drop with a reason. No task silently disappears.
3. Fills **Insights → Resources** — scans Inbox, Events, and Waiting for durable facts worth keeping. For sources (URLs, articles, books, talks), writes a source note first — a summary in your own words with candidate topics — then promotes those concepts to the knowledge graph. For plain facts, updates or creates the relevant `resources/` article directly. After processing all items, checks whether any two touched articles suggest a cross-cutting insight and flags it as a synthesis candidate in `inbox/scratch.md`.
4. Appends new **Day > Waiting** items to `waiting-for.md` — the authoritative list of open delegations. Flags any with an overdue follow-up date.
5. Writes the **Day Summary**: 1–2 sentences + `**Done: N | Carried: N | Dropped: N**` + end-of-day scan.
6. Updates project and area dashboards with dev log entries.
7. Updates the weekly note's daily link list.

The Insights → Resources step is the heart of the second brain. It's the mechanism that converts ephemeral capture into durable knowledge. Over time, `resources/` becomes a dense, cross-linked reference layer that the agent reads before acting — so it answers from your context rather than from scratch.

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

## The knowledge graph

`resources/` is an evolving knowledge graph. Articles are nodes; cross-references are edges. The graph grows through three mechanisms:

**1. Daily capture → promotion.** The `/evening` routine scans the day's Inbox, Events, and Waiting for durable facts and writes them directly into the graph. Quick facts go straight to resource articles. Richer sources (articles, books, talks) go through a source note first — you summarize what it argues in your own words and list candidate topics, then promote those to the graph. This intermediate step is where understanding forms before it becomes a permanent article.

**2. Deliberate ingestion.** `/r-ingest <url-or-file>` fetches and processes a source into resource articles. Narrative sources produce a source note in `inbox/` before the graph update — the same principle as the evening routine, just for larger inputs.

**3. Enrichment and synthesis.** `/r-enrich <article>` deepens an existing article from Confluence, Jira, codebase, and journal. Every enrichment pass checks for synthesis candidates: pairs of newly-linked articles that together express an insight neither contains alone. Flagged candidates are reviewed during `/r-plan` and become synthesis articles in `resources/synthesis/` when the pattern is strong enough.

```
Source (article, book, talk, Confluence page, codebase)
        ↓ /r-ingest or /evening
inbox/<source-note>.md     ← what it argues, in your own words; candidate topics
        ↓ /evening or /r-plan
resources/<domain>/<topic>.md   ← atomic, cross-linked, deepens on every revisit
        ↓ /r-enrich (synthesis check)
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

**[Digital Gardening](https://maggieappleton.com/garden-history)** — the philosophy underlying `resources/` as a whole. No article is a failure for being thin. New articles start with `status: stub`; they develop into `status: current` as facts accumulate. The garden grows through regular tending, not through batch completions. The `/r-plan` command is the gardening pass: review the graph, identify what to merge, split, deepen, or synthesize.

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
- Review code, debug problems, address MR/PR comments
- Look up architecture, team ownership, and prior decisions from your own notes before acting — so it doesn't ask you things you've already documented

You own the Markdown. The agent does the grunt work.

## Prerequisites

### Required

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [Node.js](https://nodejs.org) ≥ 22 | Runs all `.opencode/scripts/` automation | [nodejs.org](https://nodejs.org) or `mise install node@22` |
| [qmd](https://github.com/tobi/qmd) | Semantic search — powers `/ask`, `/r-ingest`, `/r-sync` | `npm install -g @tobilu/qmd` |

### CLI integrations — install what you use

These are all optional. Install the tools that match your workflow.

| Tool | Purpose | Install |
| ---- | ------- | ------- |
| [confluence-cli](https://www.npmjs.com/package/confluence-cli) | Read Confluence pages into resources | `npm install -g confluence-cli` |
| [jira-cli](https://github.com/ankitpokhrel/jira-cli) | Query Jira issues and sprints | `brew install ankitpokhrel/tap/jira-cli` |
| [gh](https://cli.github.com) | GitHub CLI — PR lifecycle, Actions, issues | `brew install gh` |
| [glab](https://gitlab.com/gitlab-org/cli) | GitLab CLI — MR lifecycle, CI pipelines, issues | `brew install glab` |

### Env management — pick one

| Tool | Purpose | Install |
| ---- | ------- | ------- |
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

### Daily workflow

| Command      | What it does |
| ------------ | ------------ |
| `/bootstrap` | Create or refresh `context.md` — run once on first use, re-run when context changes |
| `/morning`   | Set daily intent: Focus line, MITs, Calendar from recurring events; includes weekly planning on Mondays |
| `/evening`   | Close the day: Completed, Carried/Dropped, promote insights to `resources/`, update `waiting-for.md`; includes weekly wrap-up on Fridays |
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
| `/address-review`| Address unresolved PR/MR discussion threads — fetch, fix, push, resolve (GitHub and GitLab) |
| `/draft`         | Draft any external document: proposal, RFC, postmortem, blog post |

### Resources

| Command       | What it does |
| ------------- | ------------ |
| `/ask`        | Query all journal data with a question and synthesize a cited answer |
| `/r-enrich`   | Enrich a resource article from Confluence or another source |
| `/r-plan`     | Review the resource graph and plan structural operations (merge, split, reclassify) |
| `/r-sync`     | Sync Confluence tracked pages and batch-update resource articles |
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
| `/check-env`   | Verify Node.js version and required CLI tools are installed |
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
│   ├── scratch.md      # Quick capture pad
│   └── <slug>.md       # Source notes and captures
├── waiting-for.md      # Open delegations — appended by /evening, reviewed weekly
├── .opencode/scripts/            # Confluence sync, link auditing, migration tools
├── context.md          # Your identity, team, active projects — filled by /bootstrap
├── confluence-sync.json# Confluence page monitoring registry
├── resources-log.md    # Append-only log of resource operations
├── qmd.yml             # QMD index config for semantic search
├── tags.md             # Tag registry
├── recurring-events.md # Standing meetings and recurring events
├── reading-list.md     # Articles, papers, books to read
├── AGENTS.md           # Agent instructions
├── opencode.json       # Agent configuration — plugins and permissions
└── .env.example        # Credentials template
```

## Integrations

All integrations use CLI tools installed separately. Credentials go in `.env` (see `.env.example`).

| Integration | Tool | What it gives you | One-time setup |
| ----------- | ---- | ----------------- | -------------- |
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

## License

MIT
