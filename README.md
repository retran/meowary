# Meowary

A personal work journal managed as Markdown files, designed for use with an AI coding agent ([OpenCode](https://opencode.ai)). No code to build or run — just plain Markdown and conventions that let the agent plan your days, track projects, record meetings, and maintain a knowledge base.

## Quick Start

1. Copy the contents of `work/` into a new directory (this becomes your journal)
2. Install [OpenCode](https://opencode.ai) and open that directory as the workspace
3. Run `/bootstrap` to set up your personal context (name, role, team, tooling)
4. Run `/morning` to start your first day

The `/bootstrap` command is idempotent — run it again any time to update your context.

## What's Inside `work/`

```
work/
├── daily/                     # One file per workday (YYYY-MM-DD.md)
├── weekly/                    # One file per week (YYYY-WNN.md)
├── projects/                  # One folder per active project
│   └── _archive/              # Completed projects
├── meetings/                  # General meeting notes
├── knowledge-base/            # Persistent reference (codebases, people, teams, processes)
│   ├── codebases/
│   ├── processes/
│   ├── people/
│   └── teams/
├── meta/
│   ├── templates/             # 7 templates (daily, weekly, project, person, team, KB, meeting)
│   ├── context.md             # Your personal context (filled in by /bootstrap)
│   ├── recurring-events.md    # Weekly/biweekly event schedule
│   ├── tags.md                # Tag registry
│   └── reading-list.md        # Books and articles to read
├── .opencode/
│   └── commands/              # 7 slash commands
├── AGENTS.md                  # All conventions and rules (read by the agent)
├── opencode.json              # OpenCode configuration (MCP integrations, permissions)
└── .gitignore
```

## Slash Commands

| Command | When to use |
|---------|-------------|
| `/bootstrap` | First-time setup or update personal context |
| `/morning` | Start of day: create today's note, review yesterday, set tasks |
| `/evening` | End of day: update log, mark tasks, summarize |
| `/week-plan` | Monday: weekly planning (includes morning flow) |
| `/week-wrap` | Friday: retrospective, carry-over, reflections |
| `/meeting` | Record a meeting (project-specific or general) |
| `/new-project` | Create a new project folder from template |

## How It Works

The agent reads `AGENTS.md` for conventions and `meta/context.md` for your personal details. Together, these tell it how to structure notes, which tags to use, when to consult external sources (Jira, Confluence), and how to maintain the knowledge base.

Key principles:
- **Daily notes are append-only.** Never delete past content — mark tasks as done, moved, dropped, or blocked.
- **Tags** use prefixes: `#p-` for projects, `#t-` for teams, `#person-` for people.
- **Knowledge base** is the agent's long-term memory. It reads KB articles for context and updates them when new facts surface.
- **External sources** (Jira, Confluence) are consulted alongside local files when MCP integrations are configured.

## Configuration

`opencode.json` includes a placeholder Atlassian MCP integration. To connect:

1. Replace `YOUR_INSTANCE` with your Atlassian domain
2. Set `ATLASSIAN_USERNAME` and `ATLASSIAN_API_TOKEN` environment variables
3. Install [`mcp-atlassian`](https://github.com/sooperset/mcp-atlassian) (runs via `uvx`)

Remove the `atlassian` MCP section entirely if you don't use Jira/Confluence.

## Personalisation

All commands and conventions are generic. Your identity, team, tooling, and preferences live in `meta/context.md` — filled in by `/bootstrap`. To start over: clear `meta/context.md`, delete content from `daily/`, `weekly/`, `projects/`, `meetings/`, and `knowledge-base/`, then run `/bootstrap`.

## License

MIT
