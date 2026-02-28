# Meowary

A personal journal managed as Markdown files, designed for use with AI coding agents. No code to build or run — just plain Markdown and conventions that let the agent plan your days, track projects, record notes, and maintain a knowledge base.

Supports [OpenCode](https://opencode.ai) and [Gemini CLI](https://github.com/google-gemini/gemini-cli) out of the box.

## Variants

Meowary ships two variants (templates). Pick the one that fits your use case, copy it into a new directory, and start journaling.

| Variant                  | Use case                  | Week structure      | Key features                                                                                |
| ------------------------ | ------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| [`work/`](work/)         | Professional work journal | Mon–Fri             | Meeting notes, team/codebase KB, Jira/Confluence integration, Monday/Friday planning rhythm |
| [`personal/`](personal/) | Personal knowledge base and project journal | Session-based (no daily rhythm) | Projects (hobby, learning, game, family), notes by topic, knowledge base |

## Quick Start

1. Copy the contents of `work/` or `personal/` into a new directory (this becomes your journal)
2. Open that directory with your agent of choice:
   - **OpenCode:** install [OpenCode](https://opencode.ai) and open the directory as workspace
   - **Gemini CLI:** install [Gemini CLI](https://github.com/google-gemini/gemini-cli) and run `gemini` from the directory
3. Run `/bootstrap` to set up your personal context
4. For the personal variant: use `/note`, `/project`, or `/kb` to start capturing. No daily ritual required.
4. For the work variant: run `/morning` (or `/week-plan` on Mondays) to start your first day.

The `/bootstrap` command is idempotent — run it again any time to update your context.

Both agents read the same `AGENTS.md` for conventions. Commands are available as OpenCode slash commands (`.opencode/commands/`) and Gemini CLI commands (`.gemini/commands/`).

## Slash Commands

### Work variant

| Command        | When to use                                                    |
| -------------- | -------------------------------------------------------------- |
| `/bootstrap`   | First-time setup or update personal context                    |
| `/morning`     | Start of day: create today's note, review yesterday, set tasks |
| `/evening`     | End of day: update log, mark tasks, summarize                  |
| `/week-plan`   | Monday: weekly planning (includes morning flow)                |
| `/week-wrap`   | Friday: retrospective, carry-over, reflections                 |
| `/meeting`     | Record a meeting (project-specific or general)                 |
| `/new-project` | Create a new project folder from template                      |

### Personal variant

| Command      | When to use                                              |
| ------------ | -------------------------------------------------------- |
| `/bootstrap` | First-time setup or update personal context              |
| `/note`      | Capture a note — agent routes it to the right place      |
| `/project`   | Create a new project (hobby, dev, learning, game, family)|
| `/kb`        | Add or update a knowledge base entry                     |

## How It Works

The agent reads `AGENTS.md` for conventions and `meta/context.md` for your personal details. Together, these tell it how to structure notes, which tags to use, when to consult external sources, and how to maintain the knowledge base.

Key principles:

- **Session-based (personal).** No daily ritual — open when you're working on something, record what you learned or did, close.
- **Tags** use prefixes: `#p-` for projects, `#person-` for people. The work variant also uses `#t-` for teams.
- **Knowledge base** is the agent's long-term memory. It reads KB articles for context and updates them when new facts surface.
- **External sources** (calendar, task managers, GitHub) are consulted via MCP integrations configured in `meta/context.md`.

## What's Inside

### Work variant

```
work/
├── daily/                     # One file per workday (YYYY-MM-DD.md)
├── weekly/                    # One file per week (YYYY-WNN.md)
├── projects/                  # One folder per active project
│   └── _archive/
├── meetings/                  # General meeting notes
├── knowledge-base/
│   ├── codebases/
│   ├── processes/
│   ├── people/
│   └── teams/
├── meta/
│   ├── templates/             # 7 templates (daily, weekly, project, person, team, KB, meeting)
│   ├── context.md             # Personal context (name, role, team, tooling)
│   ├── recurring-events.md
│   ├── tags.md
│   └── reading-list.md
├── .opencode/commands/        # 7 slash commands (OpenCode)
├── .gemini/commands/          # 7 slash commands (Gemini CLI)
├── AGENTS.md                  # Agent instructions (shared by both agents)
├── GEMINI.md                  # Gemini CLI context file (imports AGENTS.md)
├── opencode.json              # MCP integrations (Atlassian placeholder)
└── .gitignore
```

### Personal variant

```
personal/
├── projects/                  # One folder per project (hobby, learning, game, family)
│   ├── <name>/
│   │   ├── README.md          # Overview and dev log
│   │   ├── notes.md           # Accumulated knowledge, concepts (optional)
│   │   ├── resources.md       # Links, references (optional)
│   │   ├── sessions.md        # Session log — game projects (optional)
│   │   └── docs.md            # Documents checklist — family projects (optional)
│   └── _archive/
├── notes/                     # Standalone notes, organised by topic
│   └── <topic>/               # e.g. notes/glsl/, notes/cooking/
├── knowledge-base/
│   ├── people/
│   ├── topics/
│   ├── health/
│   ├── places/
│   ├── finance/
│   └── pets/
├── meta/
│   ├── templates/             # 4 templates (project, note, KB, person)
│   ├── context.md             # Personal context (name, tooling, MCP integrations)
│   ├── tags.md
│   └── reading-list.md
├── .opencode/commands/        # 4 slash commands (OpenCode)
├── AGENTS.md
├── opencode.json
└── .gitignore
```

## Git Workflow

Both variants use a daily branch workflow. Each day gets its own `daily/YYYY-MM-DD` branch. During the day the agent commits freely on that branch. At wrap-up, the branch is squash-merged into `main` with a single `journal: YYYY-MM-DD` commit, then deleted. This keeps `main` clean — one commit per day.

## Configuration

Both variants include `opencode.json` for OpenCode MCP integrations and `GEMINI.md` for Gemini CLI context.

- **Work variant** has a placeholder Atlassian (Jira/Confluence) integration in `opencode.json`. Replace `YOUR_INSTANCE` with your Atlassian domain and set `ATLASSIAN_USERNAME` / `ATLASSIAN_API_TOKEN` environment variables. Remove the section if unused.
- **Personal variant** ships with a minimal config. Add MCP integrations (GitHub, Todoist, calendar, etc.) as needed.
- **Gemini CLI** reads `GEMINI.md`, which imports `AGENTS.md`. No additional configuration needed — commands work out of the box.

## Personalisation

All commands and conventions are generic. Your identity and preferences live in `meta/context.md` — filled in by `/bootstrap`. To start over: clear `meta/context.md`, delete content from the daily/weekly/project/notes folders, and run `/bootstrap` again.

## License

MIT
