---
updated: 2026-04-07
tags: []
---

# Repository Structure

```
<root>/
├── journal/                   # Time-based notes
│   ├── daily/                 # One file per day, named YYYY-MM-DD.md
│   ├── weekly/                # One file per week, named YYYY-WNN.md
│   └── meetings/              # One file per meeting, named YYYY-MM-DD-<slug>.md
├── projects/                  # Active microprojects with a defined end
│   └── <name>/
│       ├── README.md          # Project dashboard (status, tasks, dev log)
│       ├── resources.md       # Links, snippets, references (optional)
│       ├── specs/             # Brainstorm output — problem specs with options
│       ├── plans/             # Implementation plans linked to specs
│       └── drafts/            # Document brainstorm output (proposals, RFCs, ADRs)
├── areas/                     # Ongoing responsibilities with no end date
│   └── <name>/
│       └── README.md          # Area dashboard (focus, tasks, log)
├── resources/                 # Resources — atomic, topic-based reference articles
│   ├── <domain>/              # Domain subfolders (scope defined in context.md)
│   ├── tools/                 # Developer tools and internal tooling
│   ├── teams/                 # One file per team
│   └── people/                # One file per person
├── drafts/                    # Outputs for external audiences (blog posts, proposals, Confluence drafts)
├── archive/                   # Completed or inactive items (PARA)
│   ├── projects/
│   ├── areas/
│   └── resources/
├── inbox/                     # Unprocessed captures — process or promote regularly
│   ├── scratch.md             # Running scratch pad for quick links, ideas, snippets
│   └── <slug>.md              # Source notes and other captures
├── context.md                 # Author identity, team, active projects, tooling
├── tags.md                    # All tags registered here
├── confluence-sync.json       # Confluence page monitoring registry (page IDs + sync dates)
├── resources-log.md           # Append-only log of resource operations (ingest, sync, enrich)
├── qmd.yml                    # QMD index config for semantic search over resources
├── recurring-events.md        # Standing meetings and recurring events
├── reading-list.md            # Articles, papers, books to read
├── architecture.md            # External repo structure, tech stack, build system, CI
├── patterns.md                # Language-specific idioms and project conventions
├── style.md                   # Code style rules per language, linter/formatter config
├── testing.md                 # Test frameworks, file structure, coverage policy
├── safety.md                  # Non-negotiable rules: secrets, destructive ops
├── scripts/                   # Automation scripts (Confluence sync, link auditing)
├── .opencode/                 # OpenCode configuration
│   ├── commands/              # Custom slash commands
│   ├── skills/                # Custom skills
│   ├── reference/             # Reference files (structure, conventions)
│   └── templates/             # File templates
└── AGENTS.md                  # Agent instructions
```

## What Goes Where

| Content type | Where it lives |
|---|---|
| What I did today, task outcomes, reflections | `journal/daily/` |
| Standing meeting notes | `journal/meetings/` |
| Meeting action items (own tasks) | Today's `### Inbox` in daily note |
| Meeting action items (waiting on someone) | `waiting-for.md` |
| Meeting action items (project tasks) | `projects/<name>/README.md` Open Tasks |
| Persistent facts: person roles, team structure, process, architecture | `resources/` |
| Notes about a specific source before promoting concepts to resources | `inbox/` (source note, `type: source-note`) |
| Project tasks, status, dev log | `projects/<name>/README.md` |
| Area tasks, focus, ongoing log | `areas/<name>/README.md` |
| Unprocessed captures and raw notes | `inbox/` |
| Quick links, ideas, snippets (not yet promoted) | `inbox/scratch.md` |
| Content for external audiences (blog posts, Confluence drafts, proposals) | `drafts/` |
| Jira issue details | Jira (link from daily note; don't duplicate) |
