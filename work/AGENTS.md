# AGENTS.md

This repository is Meowary — a personal work journal managed as a collection of Markdown files. It is not a software project — there is no code to build, test, or run. All content is plain Markdown.

## Author & Context

Author identity, team, tooling, and other instance-specific details live in [`meta/context.md`](meta/context.md). AGENTS.md contains only generic rules and conventions that apply to any Meowary instance.

**On first use:** If `meta/context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

**Language:** Write all journal content in the language specified in `meta/context.md` → Conventions → Language. Apply this to daily notes, weekly notes, project files, meeting notes, KB entries, and commit messages. If no language is set, default to English.

## Writing Style

Write plainly. The journal is a working tool, not a publication. Follow these principles (drawn from _Слово живое и мёртвое_ by Nora Gal and _Пиши, сокращай_ by Maxim Ilyakhov):

- **Cut filler.** Remove words that add no meaning: "basically", "essentially", "in order to", "it should be noted that", "comprehensive", "robust", "leverages". If a sentence works without a word, drop it.
- **No marketing language.** Do not write "powerful", "seamless", "cutting-edge", "world-class", "innovative", "state-of-the-art". Describe what the thing _does_, not how impressive it is.
- **Be concrete.** "Retries with exponential backoff" is better than "sophisticated retry mechanism". "200+ C# projects" is better than "a large number of projects".
- **Short sentences.** One thought per sentence. If a sentence has more than two commas, split it.
- **Active voice.** "The agent sends a request" not "a request is sent by the agent". Prefer verbs over nouns: "compacts the history" not "performs history compaction".
- **Say it once.** Do not repeat information that already exists in another file -- link to it.
- **No ceremonial phrasing.** Do not write "It is important to note that" or "This section provides an overview of". Just state the fact.
- **Plain structure.** Tables and bullet lists over prose paragraphs. Headings as labels, not sentences.

## Repository Structure

```
work/
├── daily/                     # One file per day, named YYYY-MM-DD.md
├── weekly/                    # One file per week, named YYYY-WNN.md
├── meetings/                  # General meeting notes (not tied to a project)
├── projects/                  # One folder per active microproject
│   ├── <name>/
│   │   ├── README.md          # Project dashboard (status, tasks, dev log)
│   │   ├── meetings.md        # Project-specific meeting notes (optional)
│   │   └── resources.md       # Links, snippets, references (optional)
│   └── _archive/              # Completed projects are moved here
├── lists/                     # Reading, talks, tools, and other backlogs
│   ├── reading.md
│   ├── talks.md
│   ├── tools.md
│   └── <anything>.md          # Add more as needed
├── knowledge-base/            # Persistent reference notes (teams, tools, glossary, etc.)
│   ├── codebases/             # Repos, workspaces, packages, code architecture
│   ├── processes/             # Workflows, release process, CI/CD, review flows
│   ├── people/                # One file per person
│   ├── teams/                 # One file per team
│   └── <topic>/               # New folders as needed (tools, glossary, etc.)
├── meta/                      # Repo metadata: templates, recurring events, data files
│   ├── templates/
│   │   ├── daily-template.md
│   │   ├── weekly-template.md
│   │   ├── project-template.md
│   │   ├── person-template.md
│   │   ├── team-template.md
│   │   ├── kb-template.md
│   │   └── meeting-template.md
│   ├── context.md
│   ├── recurring-events.md
│   └── tags.md
├── .opencode/                 # OpenCode configuration
│   └── commands/              # Custom slash commands
└── AGENTS.md                  # Agent instructions (this file)
```

## Conventions

### Daily Notes (`daily/YYYY-MM-DD.md`)

- File name is always `YYYY-MM-DD.md` (ISO 8601 date).
- The H1 heading is `# YYYY-MM-DD: Weekday` (e.g. `# 2026-02-24: Tuesday`).
- Navigation bar below the heading links to previous day, current week, and next day. Omit the previous-day link if there is no previous daily note (e.g. Monday with no note for the weekend). Omit the next-day link if the next day's note does not exist yet.
- Sections, in order: **Tasks** (task checkboxes), **Events & Meetings** (times in bold), **Blockers & Time Off** (non-work time sinks: doctor visits, errands, personal blockers), **Log & Notes** (bullet list of what was done during the day), **Day Summary** (brief end-of-day wrap-up: what was accomplished, what's left, key numbers).
- Tag entries inline: tasks, events, and log items should carry relevant `#p-`, `#t-`, `#person-`, or topic tags at the end of the line.
- Link to relevant project files using relative paths (e.g. `[Project Alpha](../projects/project-alpha/README.md)`).
- Link to the current week's note (e.g. `[Week 09](../weekly/2026-W09.md)`).

### Weekly Notes (`weekly/YYYY-WNN.md`)

- File name uses ISO week numbering: `YYYY-WNN.md` (e.g. `2026-W09.md`).
- The H1 heading is `# Week NN: YYYY-MM-DD -- YYYY-MM-DD` (Monday to Friday date range).
- Navigation bar links to previous week and next week.
- **Daily Notes** section links to each day's daily note (Monday through Friday). Mark days without a note as `*(no note)*`.
- Sections, in order: **Daily Notes**, **Weekly Focus** (single main theme for the week), **Weekly Goals** (task checkboxes), **Accomplishments** (bullet list), **Failures & Setbacks** (bullet list), **Carry-Over** (items moving to next week), **Notes & Reflections** (free-form).
- Tag entries inline: weekly focus, goals, accomplishments, and carry-over items should carry relevant `#p-`, `#t-`, or topic tags at the end of the line.
- Created on Monday during weekly planning; finalized on Friday during weekly wrap-up.
- **Weekly planning (Monday):** Fill in Weekly Focus, Weekly Goals (seeded from previous week's Carry-Over), and Daily Notes links. Leave Accomplishments, Failures & Setbacks, Carry-Over, and Notes & Reflections empty.
- **Weekly wrap-up (Friday):** Fill in Accomplishments, Failures & Setbacks, Carry-Over, Notes & Reflections. Mark completed goals with `- [x]`. Move uncompleted goals to Carry-Over.
- **Granularity:** Weekly notes are summaries, not logs. Each accomplishment or goal should be one short line. Details belong in daily notes -- link to them if needed.
- **Carry-over workflow:** During Friday wrap-up, move uncompleted goals to **Carry-Over**. During Monday planning of the next week, seed **Weekly Goals** from the previous week's Carry-Over.

### Project Folders (`projects/<name>/`)

- The entry point is always `README.md` (or `index.md` for lightweight projects).
- The project dashboard includes: **Status** (Active/Paused/Done), **Deadline**, **Tags**, **Overview**, **Open Tasks** (checkboxes), and **Dev Log** (reverse-chronological entries with bold dates).
- Optional companion files: `meetings.md`, `resources.md`, and draft documents (ADRs, design docs, etc.) stored alongside the README.
- When a project is finished, move its entire folder into `projects/_archive/`, set status to `Done`, and add a final dev log entry.

#### Maintaining Projects in Proper State

Projects are living documents. Keep them accurate and useful:

- **Update after every work session.** When you do work related to a project, add a dev log entry summarizing what was done. Mark completed tasks with `- [x]`. Add new tasks discovered during the session.
- **Move completed tasks.** When a project accumulates many completed tasks, move them to a **Completed Tasks** section (between Open Tasks and Dev Log) so Open Tasks stays short and actionable.
- **Keep the overview current.** If the project scope, goals, or approach change, update the Overview section to reflect reality.
- **Set deadlines when known.** Replace `TBD` with an actual date once a deadline exists. Update it if the deadline shifts.
- **Pause idle projects.** If a project has no activity for 2+ weeks and no planned work, set status to `Paused`. Add a dev log entry explaining why.
- **Archive finished projects.** When all tasks are done and no further work is expected, set status to `Done`, add a final dev log entry, and move the folder to `projects/_archive/`.
- **Cross-link with daily notes.** Daily note log entries about project work should link to the project README. Project dev log entries can link to relevant daily notes or KB articles.
- **Tag consistently.** Every project README must have a `#p-<slug>` tag. Use the same tag in daily/weekly notes when referencing the project.
- **No stubs.** Every active project should have a meaningful Overview (not just a one-liner) and at least one concrete Open Task. If you create a project placeholder, fill it in before the end of the session or mark it as a task in another project.

### Meeting Notes

Meeting notes live in two places depending on scope:

- **Project meetings** are appended to `projects/<name>/meetings.md`. This keeps project-related discussions close to the project dashboard.
- **General meetings** (not tied to a specific project) are standalone files in the `meetings/` folder, named `YYYY-MM-DD-<slug>.md`.

#### Project Meeting Notes (`projects/<name>/meetings.md`)

- The file starts with an H1 heading: `# <Project Name> -- Meetings`.
- Each meeting is an H2 entry: `## YYYY-MM-DD: <Title>`.
- Entries are in **reverse chronological order** (newest first).
- Sections per entry: metadata line (Attendees, Duration), **Discussion** (bullet list), **Decisions** (bullet list), **Action Items** (checkboxes).
- Action items should use `- [ ]` format and tag the responsible person with `#person-`.

#### General Meeting Notes (`meetings/YYYY-MM-DD-<slug>.md`)

- File name: `YYYY-MM-DD-<slug>.md` where `<slug>` is a kebab-case short name (e.g. `2026-02-25-agent-evaluation-sync.md`).
- H1 heading: `# YYYY-MM-DD: <Title>`.
- Metadata lines: **Attendees**, **Duration**, **Tags**.
- Sections: **Discussion**, **Decisions**, **Action Items** (same format as project meetings).
- Tag with relevant `#p-`, `#t-`, and `#person-` tags.

#### Cross-Linking

- After recording a meeting, add or update the entry in today's daily note **Events & Meetings** section with a relative link to the meeting notes.
- If action items belong to specific projects, add them to those projects' **Open Tasks** sections.
- If durable facts were learned (team changes, process updates, architecture decisions), update the knowledge base.

### Lists (`lists/`)

Backlogs for reading, talks to watch, tools to explore, and anything else worth tracking at work.

Each list is a separate file. Existing files: `lists/reading.md`, `lists/talks.md`, `lists/tools.md`. Create new files as needed.

**Structure of each list:**

```markdown
# Reading

## Backlog

- *Title* — Author/Source (optional note: why it's relevant)

## Done

- *Title* — Author/Source — YYYY-MM — one-line takeaway
```

Rules:
- **Backlog** is unread/unwatched. Order doesn't matter.
- **Done** is reverse chronological — most recent first. Include month (YYYY-MM).
- One-line impression max. If you want to write more, create a note and link with `→`.
- When moving an item from Backlog to Done, add the date and impression. Don't leave it blank.

### Knowledge Base (`knowledge-base/`)

- Persistent reference notes about teams, tools, processes, glossary, and other context not tied to a single day or project.
- Organized into subfolders by entity type. Every article lives in a subfolder, not at the root.
- One Markdown file per entity (e.g. `codebases/my-app.md`, `teams/frontend.md`, `people/alice.md`).

#### Folder Classification

| Folder       | Contents                                        | Template             |
| ------------ | ----------------------------------------------- | -------------------- |
| `codebases/` | Repos, workspaces, packages, code architecture  | `kb-template.md`     |
| `processes/` | Workflows, release process, CI/CD, review flows | `kb-template.md`     |
| `people/`    | One file per person                             | `person-template.md` |
| `teams/`     | One file per team                               | `team-template.md`   |

Create new folders when a new category of entity appears (e.g. `tools/`, `glossary/`). Do not put articles at the KB root.

- Consult the knowledge base for background context when writing daily notes or project entries. For example, read the relevant team's KB entry when writing about team-related work.
- Keep entries up to date when new information is learned.

#### Using and Maintaining the Knowledge Base

The knowledge base is the agent's long-term memory. **Actively use it and keep it current:**

- **Read before writing.** Before starting any task that involves a team, project, tool, codebase, or person, check the knowledge base and external sources (see "External Sources" below) for existing context. This avoids asking the user to repeat information that is already recorded.
- **Update when you learn something new.** If a task reveals new information — a person's role changed, a tool works differently than documented, a new codebase was explored, a process was clarified — update the relevant knowledge base entry before finishing the task. If no entry exists yet, create one.
- **Capture external context.** When the user shares knowledge about codebases, architectures, team structures, workflows, or conventions (whether explicitly or as part of a task), distil the durable facts into the knowledge base. Ephemeral details belong in daily notes; lasting reference material belongs here.
- **Cross-link.** New entries should link to related knowledge base files, project files, and team/people entries where appropriate.
- **Keep it concise.** Knowledge base entries are reference documents, not narratives. Use tables, bullet lists, and short descriptions. Avoid duplicating information that already lives in another entry — link to it instead.
- **Maintain a changelog.** Every knowledge base article has a `## Changelog` section at the bottom. When you edit the article, append a dated entry: `- **YYYY-MM-DD:** <what changed>`. This tracks how the article evolved over time. Add the section when creating a new article or when first editing an article that lacks one.

### External Sources (Jira, Confluence)

When MCP integrations are configured (check `meta/context.md` for details), use them as additional context alongside the local knowledge base:

- **Jira** — check assigned issues, sprint boards, and project backlogs for current work items, priorities, and blockers. When planning a day or week, query Jira for the user's open issues and upcoming deadlines. When writing about a Jira issue, use the issue key (e.g. `PROJ-123`) for traceability.
- **Confluence** — search for team documentation, architecture decisions, process guides, and meeting notes. When creating or updating knowledge base articles, cross-check Confluence for authoritative sources.
- **When to consult external sources:**
  - During morning planning (`/morning`, `/week-plan`) — check Jira for assigned issues and sprint goals.
  - When creating or updating project dashboards — pull current task status from Jira.
  - When writing about a topic that may have Confluence documentation — search before writing from scratch.
  - When recording meeting notes — check Confluence for shared agendas or prior meeting pages.
  - When a user mentions a Jira issue or Confluence page — fetch it directly for context.
- **What stays local vs. external:** The journal is the user's personal working memory. It captures reflections, priorities, and context that don't belong in Jira or Confluence. Don't duplicate Jira issue descriptions verbatim — summarise and link. Knowledge base articles should reference Confluence pages rather than copy their content.

### Meta (`meta/`)

- Contains repo metadata that supports the journal workflow but is not journal content.
- `meta/context.md` — author identity, team, tooling setup. Read this file on session start for personal context. See "Author & Context" above.
- `meta/templates/` — boilerplate files for new entries.
- `meta/recurring-events.md` — schedule of recurring events (used when creating daily notes).
- `meta/tags.md` — canonical registry of all tags used in the journal.

### Templates (`meta/templates/`)

- `daily-template.md` — placeholders: `{{DATE}}`, `{{DAY}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`.
- `weekly-template.md` — placeholders: `{{WEEK_NUMBER}}` (zero-padded number, e.g. `09`), `{{WEEK_START}}`, `{{WEEK_END}}`, `{{PREV_WEEK_NUMBER}}`, `{{PREV_WEEK_FILE}}`, `{{NEXT_WEEK_NUMBER}}`, `{{NEXT_WEEK_FILE}}`, `{{MON_DATE}}` through `{{FRI_DATE}}`.
- `project-template.md` — placeholders: `{{PROJECT_NAME}}`, `{{PROJECT_SLUG}}` (kebab-case), `{{DEADLINE}}`, `{{DATE}}`.
- `person-template.md` — placeholders: `{{PERSON_NAME}}`, `{{PERSON_SLUG}}`, `{{ROLE}}`, `{{TEAM}}`, `{{DEPARTMENT}}`, `{{RELATIONSHIP}}`, `{{DATE}}`.
- `team-template.md` — placeholders: `{{TEAM_NAME}}`, `{{TEAM_SLUG}}`, `{{FULL_NAME}}`, `{{DEPARTMENT}}`, `{{DATE}}`.
- `kb-template.md` — placeholders: `{{TITLE}}`, `{{TAGS}}`, `{{OVERVIEW}}`, `{{DATE}}`. Generic template for knowledge base articles. Add topic-specific sections between Overview and Related Docs as needed.
- `meeting-template.md` — placeholders: `{{DATE}}`, `{{MEETING_TITLE}}`, `{{ATTENDEES}}`, `{{DURATION}}`, `{{TAGS}}`. Designed for project meetings (appended to a project's `meetings.md` as an H2 entry). For general meetings, use the same structure but wrap in an H1 heading and add metadata lines for Attendees, Duration, and Tags (see Meeting Notes conventions).
- To create a new entry, copy the template and replace the placeholders.

### Tags

- Use inline tags to mark entries for easy searching: `#project-name`, `#team-name`, `#topic`.
- Tags go at the end of the line they relate to, or in a `**Tags:**` line in project/knowledge-base files.
- Use kebab-case for multi-word tags (e.g. `#mcp-client`, `#spam-team`, `#studio-pro`).
- Common tag prefixes: `#p-` for projects (e.g. `#p-mcp-client`), `#t-` for teams (e.g. `#t-spam`), `#person-` for people (e.g. `#person-ylber`). The `#person-` slug must match the person's KB filename (e.g. `#person-robbert-jan` for `people/robbert-jan.md`).
- All tags are registered in [`meta/tags.md`](meta/tags.md). When introducing a new tag, add it to the appropriate table there. Consult the registry before creating a tag to avoid duplicates or inconsistent naming.

## Recurring Events

When creating a new daily note, consult [`meta/recurring-events.md`](meta/recurring-events.md) and automatically populate the **Events & Meetings** section with the events scheduled for that day of the week.

## Rules for Editing

1. **Never delete or overwrite past daily notes.** They are an append-only log. You may add to them or mark tasks as complete (`- [x]`), but do not remove existing content.
2. **Preserve the section structure.** Do not rename, reorder, or remove the standard sections in daily notes or project dashboards.
3. **Use relative links** between daily notes and project files so references stay valid if the repo is moved.
4. **Maintain links.** Every link must point to an existing target. When creating, renaming, moving, or deleting a file, update all links that reference it. Before adding a navigation link (previous/next day, previous/next week), verify the target file exists — omit the link if it does not. When in doubt, search the repo for the old path and fix every occurrence.
5. **Timestamps in the Log & Notes section** are optional. If the user provides a time, use `HH:MM` (24-hour) or `H:MM AM/PM` format, italicized (e.g. `*10:15 AM:*`). Otherwise, write plain bullet items with no timestamps.
6. **Dev Log entries in project files** use bold dates (`**YYYY-MM-DD:**`) and are listed in reverse chronological order (newest first).
7. **Task states** in daily/weekly tasks and project tasks:

   | State   | Format                               | Example                                                              |
   | ------- | ------------------------------------ | -------------------------------------------------------------------- |
   | Open    | `- [ ] text`                         | `- [ ] Review Alice's MR`                                            |
   | Done    | `- [x] text`                         | `- [x] Fix build failures`                                           |
   | Moved   | `- [ ] ~~text~~ → [date](link)`      | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)`                  |
   | Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded by framework switch)*` |
   | Blocked | `- [ ] text *(blocked: reason)*`     | `- [ ] Deploy to staging *(blocked: waiting on infra team)*`         |

   Rules:
   - Moved tasks must link to the target date. The target daily note should include the task in its Tasks section.
   - Dropped and blocked require a short reason in italics.
   - Do not delete tasks to change their state — mark them in place. Daily notes are append-only.

8. **Status values** for projects are: `Active`, `Paused`, or `Done`.
9. **When creating a new daily note**, use today's date and the correct weekday. Copy from `meta/templates/daily-template.md`. Replace all placeholders including `{{WEEK_NUMBER}}` (zero-padded, e.g. `09`), `{{WEEK_FILE}}` (e.g. `2026-W09.md`), `{{PREV_DATE}}`, and `{{NEXT_DATE}}`. Consult `meta/recurring-events.md` to populate Events & Meetings.
10. **When creating a new weekly note**, use ISO week numbering. Copy from `meta/templates/weekly-template.md`. Replace `{{WEEK_NUMBER}}` with the zero-padded week number (e.g. `09`, not `W09`). Replace all day-of-week date placeholders (`{{MON_DATE}}` through `{{FRI_DATE}}`). Created on Monday, finalized on Friday.
11. **When creating a new project**, create a folder under `projects/`, copy from `meta/templates/project-template.md` into `README.md`, and fill in all placeholders including `{{PROJECT_SLUG}}`.
12. **Commits** during the day are free-form. The squash merge at day's end produces the single `main` commit (see Git Workflow below).

## Git Workflow

Each day lives on its own branch. At the end of the day the branch is squash-merged into `main`, producing one commit per day.

### Start of day (`/morning` or `/week-plan`)

1. Make sure `main` is up to date: `git checkout main && git pull` (if a remote is configured).
2. Check if a branch `daily/YYYY-MM-DD` already exists.
   - **Exists:** switch to it (`git checkout daily/YYYY-MM-DD`). Continue the day.
   - **Does not exist:** create and switch (`git checkout -b daily/YYYY-MM-DD`).

### During the day

- Commit freely on the daily branch. No special message format required.
- All `/morning`, `/evening`, `/meeting`, `/new-project`, and ad-hoc changes are committed here.

### End of day (`/evening` or `/week-wrap`)

1. Commit any remaining uncommitted changes on the daily branch.
2. Switch to `main`: `git checkout main`.
3. Squash-merge the daily branch: `git merge --squash daily/YYYY-MM-DD`.
4. Commit with the message `journal: YYYY-MM-DD`.
5. Delete the daily branch: `git branch -d daily/YYYY-MM-DD`.
6. Push `main` if a remote is configured.

### Edge cases

- If the user runs `/evening` but there are no changes on the daily branch beyond what's already on `main`, skip the merge — there's nothing to squash.
- If the daily branch has merge conflicts with `main`, resolve them interactively with the user before completing the merge.
- Weekend or multi-day gaps are fine — the branch is named after the day it was created, and a new branch starts the next active day.

## Updating the Daily Note

When the user asks to update today's daily note, or when a work session produces results worth recording:

1. **Check for an existing note.** Look for `daily/YYYY-MM-DD.md`. If it does not exist, create one from the template.
2. **Log everything in Log & Notes.** Every substantive action during a session must appear as a bullet in the Log & Notes section. Be specific: name the files changed, problems solved, decisions made. Include task state changes (moved, dropped, blocked), meetings recorded, and knowledge base updates. If it changed the state of the journal or a project, it belongs in the log.
3. **Update Tasks.** Mark completed items with `- [x]`. Add new items if the session surfaced them.
4. **Update related projects.** Add dev log entries and mark tasks in any project READMEs affected by the work.
5. **Update the weekly note.** Keep the Daily Notes links current. Do not fill in Accomplishments, Failures & Setbacks, Carry-Over, or Notes & Reflections mid-week — those are for Friday wrap-up only.
6. **Update the knowledge base** if durable facts were learned (see "Using and Maintaining the Knowledge Base" above).
