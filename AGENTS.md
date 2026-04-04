# AGENTS.md

This repository is a personal work journal managed as a collection of Markdown files with supporting shell and Python scripts for automation. All content is plain Markdown; scripts in `scripts/` handle batch operations like Confluence sync and resource link auditing. The agent also operates as a **workflow agent** — structured workflows (brainstorm, plan, implement, review, debug) produce specs and plans in the journal while writing code or documents.

This journal functions as a **second brain for a software developer**. It externalizes working memory — decisions, context, relationships, technical knowledge — so nothing is lost between sessions, meetings, or projects. The structure follows **PARA** (Projects, Areas, Resources, Archive): time-sensitive work in projects, ongoing responsibilities in areas, durable reference knowledge in resources, and completed items in archive. Daily and weekly notes capture the ephemeral; resources capture the permanent. A **knowledge graph** (`knowledge-graph.md`) indexes all resource articles by topic, person, team, and project — use it to discover connections and find relevant context before writing. The system uses **progressive disclosure**: AGENTS.md provides the rules, skills provide workflows, and context files provide project-specific details — load only what the current task requires. The agent's job is to help maintain this system — capture information accurately, connect it to existing knowledge, and surface it when relevant.

## Author & Context

Author identity, team, tooling, and other instance-specific details live in [`context.md`](context.md). AGENTS.md contains only generic rules and conventions that apply to any journal instance.

**On first use:** If `context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

**Keep context current:** If the user shares new information — a new project, role change, team update, tool adoption, or any fact that belongs in `context.md` or the coding context files — update the appropriate file immediately during the session. Do not wait for an explicit instruction to save it.

## Session Start

### Tier 0 — every session

Read `context.md` (author identity, team, active projects, tooling). Skip if already loaded this session.

### Tier 1 — when the task involves writing, resources, people, teams, or projects

Scan `knowledge-graph.md`. Identify articles relevant to the task by topic, team, person, or project tag.

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

**Rules:**

1. **Read before acting.** Before any coding workflow phase, read the files listed in the "Load when" column above. Do not skip this step even if the task seems simple.
2. **Never invent conventions.** If a file is empty or has only a placeholder, note it and ask the user before assuming any convention.
3. **Update context files with new information.** If the user tells you something about the codebase, team, or conventions, or you discover a pattern, constraint, or convention not yet recorded — write it to the appropriate file immediately. Do not wait until the end of the session. Keep entries concise — max ~200 lines per file.
4. **These files describe external repos, not the journal.** When working on journal content (daily notes, resources, projects), these files are not relevant — do not load them.
5. **Bootstrap fills them.** If any file is empty or has placeholder content, direct the user to run `/bootstrap`.

## Repository Structure

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
├── resources/                 # Knowledge base — atomic, topic-based reference articles
│   ├── <domain>/              # Domain subfolders (scope defined in context.md)
│   ├── tools/                 # Developer tools and internal tooling
│   ├── teams/                 # One file per team
│   ├── people/                # One file per person
│   └── adr/                   # Architecture Decision Records
├── drafts/                    # Outputs for external audiences (blog posts, proposals, Confluence drafts)
├── archive/                   # Completed or inactive items (PARA)
│   ├── projects/
│   ├── areas/
│   └── resources/
├── inbox/                     # Unprocessed captures — process or promote regularly
│   └── scratch.md             # Running scratch pad for quick links, ideas, snippets
├── context.md                 # Author identity, team, active projects, tooling
├── tags.md                    # All tags registered here
├── knowledge-graph.md         # Resource index — topics, people, teams, projects
├── confluence-map.md          # Confluence page index + summaries
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
│   └── templates/             # File templates
└── AGENTS.md                  # Agent instructions (this file)
```

## YAML Front Matter

Every Markdown file must begin with a YAML front matter block. Exceptions: `AGENTS.md`.

Front matter schemas are in the templates under `.opencode/templates/`. Key rules:

1. The `---` block must be the very first line of the file.
2. **`updated`** is mandatory in every file. Set on creation; update on every edit.
3. **`tags`** is mandatory in every file. May be an empty list (`tags: []`). Lowercase kebab-case strings without the `#` prefix.
4. `tags` in front matter have no `#` prefix. Inline `#tags` in the body are separate.
5. When creating from a template, fill in all placeholders before saving.

## Conventions

For format details on each content type, load the referenced skill. Do not start the task without it.

| Content type | Skill to load | Quick reference |
|---|---|---|
| Daily notes | `writing` + `.opencode/skills/writing/daily.md` | `journal/daily/YYYY-MM-DD.md` — append-only |
| Weekly notes | `writing` + `.opencode/skills/writing/weekly.md` | `journal/weekly/YYYY-WNN.md` — Monday plan, Friday wrap |
| Meeting notes | `writing` + `.opencode/skills/writing/meeting.md` | `journal/meetings/YYYY-MM-DD-<slug>.md` |
| Project dashboards | `project` | `projects/<slug>/README.md` |
| Area dashboards | `project` + `.opencode/skills/writing/area.md` | `areas/<slug>/README.md` |
| Knowledge base | `resources` | `resources/<domain>/` — one topic per article |
| ADRs | `writing` + `.opencode/skills/writing/adr.md` | Draft in `projects/<name>/`, not `resources/` |
| Writing style & tags | `writing` | Plain language, active voice, tables over prose |

### What Goes Where

| Content type | Where it lives |
|---|---|
| What I did today, task outcomes, reflections | `journal/daily/` |
| Standing meeting notes | `journal/meetings/` |
| Persistent facts: person roles, team structure, process, architecture | `resources/` |
| Project tasks, status, dev log | `projects/<name>/README.md` |
| Area tasks, focus, ongoing log | `areas/<name>/README.md` |
| Unprocessed captures and raw notes | `inbox/` |
| Quick links, ideas, snippets (not yet promoted) | `inbox/scratch.md` |
| Content for external audiences (blog posts, Confluence drafts, proposals) | `drafts/` |
| Confluence page index + summaries | `confluence-map.md` |
| Jira issue details | Jira (link from daily note; don't duplicate) |

### Proactive Resources Enrichment

During every session — regardless of primary task — scan for resource gaps. Full trigger-action table: load `resources` skill. Do not wait for an explicit resources task. Surface gaps as you work and fill them immediately.

## Rules for Editing

1. **Never delete or overwrite past daily notes.** They are append-only. Mark tasks complete or add content — do not remove existing entries.
2. **Preserve the section structure.** Do not rename, reorder, or remove standard sections in daily notes or project dashboards.
3. **Use relative links** between journal notes and project files so references stay valid if the repo is moved.
4. **Maintain links.** Every link must point to an existing target. When creating, renaming, moving, or deleting a file, update all links that reference it. Verify navigation links (prev/next day/week) before adding — omit if the target doesn't exist.
5. **Timestamps in Log & Notes** are optional. If the user provides a time, use `HH:MM` (24-hour) or `H:MM AM/PM`, italicized. Otherwise, write plain bullet items.
6. **Dev Log entries** use bold dates (`**YYYY-MM-DD:**`), reverse chronological order (newest first).
7. **Task states:**

   | State | Format | Example |
   |-------|--------|---------|
   | Open | `- [ ] text` | `- [ ] Review Alice's MR` |
   | Done | `- [x] text` | `- [x] Fix build failures` |
   | Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)` |
   | Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
   | Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

   - Moved tasks must link to the target date. The target note should include the task.
   - Dropped and blocked require a short reason in italics.
   - Do not delete tasks — mark them in place.

8. **Status values** for projects: `Active`, `Paused`, or `Done`.
9. **Commits** should be descriptive (e.g. "Add daily note for 2026-02-25", "Update Project Alpha tasks").
10. **Never write to Jira or Confluence without explicit user approval.** Default posture is read-only. Before any write operation, ask: "Should I write this to [Jira/Confluence]?" Proceed only if the user explicitly says yes.

## Skill Dispatch

Load the listed skill as soon as the trigger condition is met. Do not start the task without the skill.

### Available Skills

| Skill | Path | Description |
|-------|------|-------------|
| `writing` | `.opencode/skills/writing/SKILL.md` | Write or edit any journal content — KB articles, ADRs, meeting notes, daily notes, weekly notes, READMEs, structured notes — following repo style and structure rules |
| `project` | `.opencode/skills/project/SKILL.md` | Create, update, and maintain project dashboards — tasks, dev log, status, cross-links, lifecycle |
| `resources` | `.opencode/skills/resources/SKILL.md` | Maintain and actualize resources — single-article enrichment, batch Confluence map sync, graph review and operation planning, and structural operations (create, delete, merge, split, reclassify) |
| `confluence` | `.opencode/skills/confluence/SKILL.md` | Read Confluence pages and maintain the local confluence map — search, fetch, record, and transform pages into KB source material |
| `jira` | `.opencode/skills/jira/SKILL.md` | Search and read Jira issues — query assigned issues, sprint boards, epics, and extract facts for KB and daily notes |
| `glab` | `.opencode/skills/glab/SKILL.md` | Work with GitLab via glab CLI — merge request lifecycle, CI monitoring, issue management |
| `github` | `.opencode/skills/github/SKILL.md` | Work with GitHub via gh CLI — pull request lifecycle, Actions CI, issue management, repo operations |
| `workflow` | `.opencode/skills/workflow/SKILL.md` | Structured workflows for software engineering and document authoring — brainstorm, plan, implement, review, debug |
| `worktrunk` | `.opencode/skills/worktrunk/SKILL.md` | Manage git worktrees with wt — create, switch, list, merge, and remove worktrees; check out MR branches |
| `thinking` | `.opencode/skills/thinking/SKILL.md` | Structured reasoning for complex decisions — frame the problem, research options, compare tradeoffs, plan execution, verify the plan before acting |
| `security` | `.opencode/skills/security/SKILL.md` | Baseline safety rules for production systems, credentials, destructive operations, and cloud environments |
| `conventions` | `.opencode/skills/conventions/SKILL.md` | Commit message and MR/PR title conventions — Conventional Commits format with Jira issue key prefix |

### Sub-skills

Sub-skills provide detailed instructions for specific tasks within a parent skill. Load the parent skill first, then the sub-skill.

| Sub-skill | Path | Parent | Description |
|-----------|------|--------|-------------|
| `writing/daily` | `.opencode/skills/writing/daily.md` | `writing` | Daily note format, sections, append-only rules |
| `writing/weekly` | `.opencode/skills/writing/weekly.md` | `writing` | Weekly note format, Monday plan, Friday wrap |
| `writing/meeting` | `.opencode/skills/writing/meeting.md` | `writing` | Meeting note format, attendees, action items |
| `writing/adr` | `.opencode/skills/writing/adr.md` | `writing` | Architecture Decision Record drafting |
| `writing/area` | `.opencode/skills/writing/area.md` | `writing` | Area dashboard format and conventions |
| `resources/enrich` | `.opencode/skills/resources/enrich.md` | `resources` | Single-article enrichment from Confluence or other sources |
| `resources/sync` | `.opencode/skills/resources/sync.md` | `resources` | Confluence map sync and batch enrichment |
| `resources/plan` | `.opencode/skills/resources/plan.md` | `resources` | Resource graph review and operation planning |
| `resources/discover` | `.opencode/skills/resources/discover.md` | `resources` | Resource discovery — find gaps and create stubs |
| `workflow/brainstorm` | `.opencode/skills/workflow/brainstorm.md` | `workflow` | Brainstorm solutions, produce problem specs with options |
| `workflow/plan` | `.opencode/skills/workflow/plan.md` | `workflow` | Plan implementation from an approved spec |
| `workflow/implement` | `.opencode/skills/workflow/implement.md` | `workflow` | Implement from an approved plan |
| `workflow/review` | `.opencode/skills/workflow/review.md` | `workflow` | Review code changes or documents |
| `workflow/debug` | `.opencode/skills/workflow/debug.md` | `workflow` | Debug a problem systematically |
| `glab/address-review` | `.opencode/skills/glab/address-review.md` | `glab` | Address unresolved MR discussion threads — fetch, plan, fix, commit, push, resolve |

### Trigger → Skill mapping

| Trigger | Skill(s) to load |
|---------|-----------------|
| Writing or editing any journal content | `writing` |
| Daily note creation or updates | `writing` + `.opencode/skills/writing/daily.md` |
| Weekly note creation or updates | `writing` + `.opencode/skills/writing/weekly.md` |
| Meeting notes | `writing` + `.opencode/skills/writing/meeting.md` |
| ADR drafting | `writing` + `.opencode/skills/writing/adr.md` |
| Creating or updating a project dashboard | `project` |
| Creating or updating an area dashboard | `project` + `.opencode/skills/writing/area.md` |
| Resource article enrichment | `resources` + `.opencode/skills/resources/enrich.md` |
| Confluence map sync and batch enrichment | `resources` + `.opencode/skills/resources/sync.md` |
| Resource graph review and planning | `resources` + `.opencode/skills/resources/plan.md` |
| Resource discovery | `resources` + `.opencode/skills/resources/discover.md` |
| Resource structural operation (create, delete, merge, split, reclassify) | `resources` |
| Fetching Confluence pages | `confluence` |
| Querying Jira issues | `jira` |
| Creating or managing GitLab MRs, CI pipelines | `glab` |
| Creating or managing GitHub PRs, Actions, issues | `github` |
| Managing git worktrees | `worktrunk` |
| Complex decision with high risk or irreversible steps | `thinking` |
| Brainstorming solutions (code or document) | `workflow` + `.opencode/skills/workflow/brainstorm.md` |
| Planning implementation from an approved spec | `workflow` + `.opencode/skills/workflow/plan.md` |
| Implementing from an approved plan | `workflow` + `.opencode/skills/workflow/implement.md` |
| Reviewing code changes or documents | `workflow` + `.opencode/skills/workflow/review.md` |
| Debugging a problem | `workflow` + `.opencode/skills/workflow/debug.md` |
| Addressing unresolved MR review comments | `glab` + `.opencode/skills/glab/address-review.md` |
| Working with production systems, credentials, or destructive operations | `security` |
| Writing a commit message or MR/PR title | `conventions` |
| `/pre-plan` — surface gray areas before planning | `workflow` |
| `/do` — smart command dispatcher | _(self-contained)_ |
| `/draft` — write a draft document | `writing` |
