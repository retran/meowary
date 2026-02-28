# AGENTS.md

This repository is Meowary — a personal journal managed as a collection of Markdown files. It is not a software project — there is no code to build, test, or run. All content is plain Markdown.

## Author & Context

Author identity and other instance-specific details live in [`meta/context.md`](meta/context.md). AGENTS.md contains only generic rules and conventions that apply to any Meowary instance.

**On first use:** If `meta/context.md` is empty or missing, direct the user to run `/bootstrap` before proceeding with any task that needs this context.

## Writing Style

Write plainly. The journal is a working tool, not a publication. Follow these principles (drawn from _Слово живое и мёртвое_ by Nora Gal and _Пиши, сокращай_ by Maxim Ilyakhov):

- **Cut filler.** Remove words that add no meaning: "basically", "essentially", "in order to", "it should be noted that", "comprehensive", "robust", "leverages". If a sentence works without a word, drop it.
- **No marketing language.** Do not write "powerful", "seamless", "cutting-edge", "world-class", "innovative", "state-of-the-art". Describe what the thing _does_, not how impressive it is.
- **Be concrete.** "Ran 5km in 24 minutes" is better than "had a good run". "Repotted the monstera" is better than "did some gardening".
- **Short sentences.** One thought per sentence. If a sentence has more than two commas, split it.
- **Active voice.** "I fixed the shelf" not "the shelf was fixed". Prefer verbs over nouns.
- **Say it once.** Do not repeat information that already exists in another file — link to it.
- **No ceremonial phrasing.** Do not write "It is important to note that" or "This section provides an overview of". Just state the fact.
- **Plain structure.** Tables and bullet lists over prose paragraphs. Headings as labels, not sentences.

## Repository Structure

```
meowary/
├── daily/                     # One file per day, named YYYY-MM-DD.md
├── weekly/                    # One file per week, named YYYY-WNN.md
├── notes/                     # Standalone notes (conversations, ideas, research)
├── projects/                  # One folder per active project
│   ├── <name>/
│   │   ├── README.md          # Project dashboard (status, tasks, dev log)
│   │   ├── notes.md           # Project-specific notes (optional)
│   │   └── resources.md       # Links, snippets, references (optional)
│   └── _archive/              # Completed projects are moved here
├── knowledge-base/            # Persistent reference notes
│   ├── people/                # One file per person (family, friends, contacts)
│   ├── topics/                # Interests, hobbies, skills, subjects
│   ├── health/                # Health, fitness, medical notes
│   ├── places/                # Restaurants, travel, locations
│   ├── finance/               # Budgets, subscriptions, financial notes
│   ├── pets/                  # Pet care, vet visits, routines
│   └── <topic>/               # New folders as needed
├── meta/                      # Repo metadata: templates, recurring events, data files
│   ├── templates/
│   │   ├── daily-template.md
│   │   ├── weekly-template.md
│   │   ├── project-template.md
│   │   ├── person-template.md
│   │   ├── kb-template.md
│   │   └── note-template.md
│   ├── context.md
│   ├── habits.md
│   ├── recurring-events.md
│   ├── reading-list.md
│   └── tags.md
├── .opencode/                 # OpenCode configuration
│   └── commands/              # Custom slash commands
└── AGENTS.md                  # Agent instructions (this file)
```

## Conventions

### Daily Notes (`daily/YYYY-MM-DD.md`)

- File name is always `YYYY-MM-DD.md` (ISO 8601 date).
- The H1 heading is `# YYYY-MM-DD: Weekday` (e.g. `# 2026-02-24: Tuesday`).
- Navigation bar below the heading links to previous day, current week, and next day. Omit the previous-day link if there is no previous daily note. Omit the next-day link if the next day's note does not exist yet.
- Sections, in order: **Tasks** (task checkboxes), **Habits** (scorecard table), **Events & Appointments** (times in bold), **Log & Notes** (bullet list of what was done during the day), **Day Summary** (brief end-of-day wrap-up).
- Tag entries inline: tasks, events, and log items should carry relevant `#p-`, `#person-`, or topic tags at the end of the line.
- Link to relevant project files using relative paths (e.g. `[Garden Redesign](../projects/garden-redesign/README.md)`).
- Link to the current week's note (e.g. `[Week 09](../weekly/2026-W09.md)`).

### Habits

Daily notes include a **Habits** scorecard table for tracking good and bad habits.

- Habits are defined in [`meta/habits.md`](meta/habits.md). Each habit has a type (Good or Bad), applicable days, and optional notes.
- **Good habits** are things to do (exercise, read, meditate). "Yes" in the Done column means you did it.
- **Bad habits** are things to avoid (junk food, doomscrolling, staying up late). "Yes" means you slipped.
- When creating a new daily note, read `meta/habits.md` and populate the Habits table with all habits that apply to today's day of the week. Set Done to `No` by default.
- During wrap-up, ask the user to fill in the Done column for each habit.
- The scorecard format:

  ```
  | Habit | Type | Done? |
  |-------|------|-------|
  | Exercise | Good | Yes |
  | Junk food | Bad | No |
  ```

### Weekly Notes (`weekly/YYYY-WNN.md`)

- File name uses ISO week numbering: `YYYY-WNN.md` (e.g. `2026-W09.md`).
- The H1 heading is `# Week NN: YYYY-MM-DD -- YYYY-MM-DD` (Monday to Sunday date range).
- Navigation bar links to previous week and next week.
- **Daily Notes** section links only to days that have notes. Do not add placeholder entries for days without notes.
- Sections, in order: **Daily Notes**, **Goals** (task checkboxes), **Highlights** (bullet list of the week's best moments or achievements), **Carry-Over** (items moving to next week), **Notes & Reflections** (free-form).
- Tag entries inline: goals, highlights, and carry-over items should carry relevant `#p-` or topic tags at the end of the line.
- Can be created any day of the week. No enforced Monday/Friday rhythm.
- **Planning:** Fill in Goals (seeded from previous week's Carry-Over) and Daily Notes links.
- **Wrap-up:** Fill in Highlights, Carry-Over, Notes & Reflections. Mark completed goals with `- [x]`. Move uncompleted goals to Carry-Over.
- **Granularity:** Weekly notes are summaries, not logs. Each highlight or goal should be one short line. Details belong in daily notes — link to them if needed.
- **Carry-over workflow:** During wrap-up, move uncompleted goals to **Carry-Over**. When planning the next week, seed **Goals** from the previous week's Carry-Over.

### Project Folders (`projects/<name>/`)

- The entry point is always `README.md` (or `index.md` for lightweight projects).
- The project dashboard includes: **Status** (Active/Paused/Done), **Deadline**, **Tags**, **Overview**, **Open Tasks** (checkboxes), and **Dev Log** (reverse-chronological entries with bold dates).
- Optional companion files: `notes.md`, `resources.md`, and other documents stored alongside the README.
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

### Notes

Notes live in two places depending on scope:

- **Project notes** are appended to `projects/<name>/notes.md`. This keeps project-related discussions and ideas close to the project dashboard.
- **General notes** (not tied to a specific project) are standalone files in the `notes/` folder, named `YYYY-MM-DD-<slug>.md`.

#### Project Notes (`projects/<name>/notes.md`)

- The file starts with an H1 heading: `# <Project Name> -- Notes`.
- Each note is an H2 entry: `## YYYY-MM-DD: <Title>`.
- Entries are in **reverse chronological order** (newest first).
- Sections per entry: metadata line (People, Duration — if applicable), **Details** (bullet list), **Takeaways** (bullet list), **Action Items** (checkboxes).
- Action items should use `- [ ]` format and tag the responsible person with `#person-` if applicable.

#### General Notes (`notes/YYYY-MM-DD-<slug>.md`)

- File name: `YYYY-MM-DD-<slug>.md` where `<slug>` is a kebab-case short name (e.g. `2026-02-25-sourdough-research.md`).
- H1 heading: `# YYYY-MM-DD: <Title>`.
- Metadata lines: **People** (if applicable), **Tags**.
- Sections: **Details**, **Takeaways**, **Action Items** (same format as project notes).
- Tag with relevant `#p-` and `#person-` tags.

#### Cross-Linking

- After recording a note, add or update the entry in today's daily note **Events & Appointments** section (if it was an event) or **Log & Notes** section with a relative link to the note.
- If action items belong to specific projects, add them to those projects' **Open Tasks** sections.
- If durable facts were learned, update the knowledge base.

### Knowledge Base (`knowledge-base/`)

- Persistent reference notes about people, interests, health, places, finances, pets, and other topics not tied to a single day or project.
- Organized into subfolders by entity type. Every article lives in a subfolder, not at the root.
- One Markdown file per entity (e.g. `topics/sourdough.md`, `places/tokyo.md`, `people/alice.md`).

#### Folder Classification

| Folder     | Contents                                        | Template             |
| ---------- | ----------------------------------------------- | -------------------- |
| `people/`  | One file per person (family, friends, contacts) | `person-template.md` |
| `topics/`  | Interests, hobbies, skills, subjects            | `kb-template.md`     |
| `health/`  | Health, fitness, medical notes                  | `kb-template.md`     |
| `places/`  | Restaurants, travel destinations, locations     | `kb-template.md`     |
| `finance/` | Budgets, subscriptions, financial notes         | `kb-template.md`     |
| `pets/`    | Pet care, vet visits, routines                  | `kb-template.md`     |

Create new folders when a new category of entity appears (e.g. `recipes/`, `gear/`). Do not put articles at the KB root.

- Consult the knowledge base for background context when writing daily notes or project entries.
- Keep entries up to date when new information is learned.

#### Using and Maintaining the Knowledge Base

The knowledge base is the agent's long-term memory. **Actively use it and keep it current:**

- **Read before writing.** Before starting any task that involves a person, project, topic, or place, check the knowledge base for existing context. This avoids asking the user to repeat information that is already recorded.
- **Update when you learn something new.** If a task reveals new information — a person moved, a recipe was tweaked, a health routine changed — update the relevant knowledge base entry before finishing the task. If no entry exists yet, create one.
- **Capture context.** When the user shares knowledge about topics, people, places, or routines (whether explicitly or as part of a task), distil the durable facts into the knowledge base. Ephemeral details belong in daily notes; lasting reference material belongs here.
- **Cross-link.** New entries should link to related knowledge base files, project files, and people entries where appropriate.
- **Keep it concise.** Knowledge base entries are reference documents, not narratives. Use tables, bullet lists, and short descriptions. Avoid duplicating information that already lives in another entry — link to it instead.
- **Maintain a changelog.** Every knowledge base article has a `## Changelog` section at the bottom. When you edit the article, append a dated entry: `- **YYYY-MM-DD:** <what changed>`. This tracks how the article evolved over time. Add the section when creating a new article or when first editing an article that lacks one.

### External Sources

When MCP integrations are configured (check `meta/context.md` for details), use them as additional context alongside the local knowledge base.

Example integrations:

- **GitHub** — check issues, pull requests, and project boards for side projects or open-source contributions. When writing about a GitHub issue, use the full reference (e.g. `owner/repo#123`) for traceability.
- **Calendar** — check upcoming events and appointments when planning a day or week.
- **Todoist / task apps** — pull in tasks and deadlines from external task managers.

The specific integrations depend on what the user configures. The key principles:

- **When to consult external sources:**
  - During planning (`/today`, `/weekly`) — check for open tasks, upcoming deadlines, and scheduled events.
  - When creating or updating project dashboards — pull current task status from external tools.
  - When a user mentions an external reference (GitHub issue, calendar event) — fetch it directly for context.
- **What stays local vs. external:** The journal is personal working memory. It captures reflections, priorities, and context that don't belong in external tools. Don't duplicate external content verbatim — summarise and link.

### Meta (`meta/`)

- Contains repo metadata that supports the journal workflow but is not journal content.
- `meta/context.md` — author identity and setup. Read this file on session start for personal context. See "Author & Context" above.
- `meta/templates/` — boilerplate files for new entries.
- `meta/habits.md` — list of good and bad habits to track in daily notes.
- `meta/recurring-events.md` — schedule of recurring events (used when creating daily notes).
- `meta/tags.md` — canonical registry of all tags used in the journal.
- `meta/reading-list.md` — books and articles to read.

### Templates (`meta/templates/`)

- `daily-template.md` — placeholders: `{{DATE}}`, `{{DAY}}`, `{{PREV_DATE}}`, `{{NEXT_DATE}}`, `{{WEEK_NUMBER}}`, `{{WEEK_FILE}}`.
- `weekly-template.md` — placeholders: `{{WEEK_NUMBER}}` (zero-padded number, e.g. `09`), `{{WEEK_START}}`, `{{WEEK_END}}`, `{{PREV_WEEK_NUMBER}}`, `{{PREV_WEEK_FILE}}`, `{{NEXT_WEEK_NUMBER}}`, `{{NEXT_WEEK_FILE}}`. The Daily Notes section is initially empty — link only to days that have notes.
- `project-template.md` — placeholders: `{{PROJECT_NAME}}`, `{{PROJECT_SLUG}}` (kebab-case), `{{DEADLINE}}`, `{{DATE}}`.
- `person-template.md` — placeholders: `{{PERSON_NAME}}`, `{{PERSON_SLUG}}`, `{{RELATIONSHIP}}`, `{{DATE}}`.
- `kb-template.md` — placeholders: `{{TITLE}}`, `{{TAGS}}`, `{{OVERVIEW}}`, `{{DATE}}`. Generic template for knowledge base articles. Add topic-specific sections between Overview and Related Docs as needed.
- `note-template.md` — placeholders: `{{DATE}}`, `{{NOTE_TITLE}}`, `{{PEOPLE}}`, `{{TAGS}}`. Designed for project notes (appended to a project's `notes.md` as an H2 entry). For general notes, use the same structure but wrap in an H1 heading and add metadata lines.
- To create a new entry, copy the template and replace the placeholders.

### Tags

- Use inline tags to mark entries for easy searching: `#project-name`, `#topic`.
- Tags go at the end of the line they relate to, or in a `**Tags:**` line in project/knowledge-base files.
- Use kebab-case for multi-word tags (e.g. `#sourdough-baking`, `#home-renovation`).
- Common tag prefixes: `#p-` for projects (e.g. `#p-garden-redesign`), `#person-` for people (e.g. `#person-alice`). The `#person-` slug must match the person's KB filename (e.g. `#person-alice` for `people/alice.md`).
- All tags are registered in [`meta/tags.md`](meta/tags.md). When introducing a new tag, add it to the appropriate table there. Consult the registry before creating a tag to avoid duplicates or inconsistent naming.

## Recurring Events

When creating a new daily note, consult [`meta/recurring-events.md`](meta/recurring-events.md) and automatically populate the **Events & Appointments** section with the events scheduled for that day of the week.

## Habit Tracking

When creating a new daily note, consult [`meta/habits.md`](meta/habits.md) and populate the **Habits** scorecard table with all habits that apply to today's day of the week. During wrap-up, ask the user to mark each habit as done or not.

## Rules for Editing

1. **Never delete or overwrite past daily notes.** They are an append-only log. You may add to them or mark tasks as complete (`- [x]`), but do not remove existing content.
2. **Preserve the section structure.** Do not rename, reorder, or remove the standard sections in daily notes or project dashboards.
3. **Use relative links** between daily notes and project files so references stay valid if the repo is moved.
4. **Maintain links.** Every link must point to an existing target. When creating, renaming, moving, or deleting a file, update all links that reference it. Before adding a navigation link (previous/next day, previous/next week), verify the target file exists — omit the link if it does not. When in doubt, search the repo for the old path and fix every occurrence.
5. **Timestamps in the Log & Notes section** are optional. If the user provides a time, use `HH:MM` (24-hour) or `H:MM AM/PM` format, italicized (e.g. `*10:15 AM:*`). Otherwise, write plain bullet items with no timestamps.
6. **Dev Log entries in project files** use bold dates (`**YYYY-MM-DD:**`) and are listed in reverse chronological order (newest first).
7. **Task states** in daily/weekly tasks and project tasks:

   | State   | Format                               | Example                                                    |
   | ------- | ------------------------------------ | ---------------------------------------------------------- |
   | Open    | `- [ ] text`                         | `- [ ] Buy potting soil`                                   |
   | Done    | `- [x] text`                         | `- [x] Schedule dentist appointment`                       |
   | Moved   | `- [ ] ~~text~~ → [date](link)`      | `- [ ] ~~Call plumber~~ → [2026-02-25](2026-02-25.md)`     |
   | Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Buy new lamp~~ *(dropped: found one in storage)*` |
   | Blocked | `- [ ] text *(blocked: reason)*`     | `- [ ] Fix fence *(blocked: waiting for lumber delivery)*` |

   Rules:
   - Moved tasks must link to the target date. The target daily note should include the task in its Tasks section.
   - Dropped and blocked require a short reason in italics.
   - Do not delete tasks to change their state — mark them in place. Daily notes are append-only.

8. **Status values** for projects are: `Active`, `Paused`, or `Done`.
9. **When creating a new daily note**, use today's date and the correct weekday. Copy from `meta/templates/daily-template.md`. Replace all placeholders including `{{WEEK_NUMBER}}` (zero-padded, e.g. `09`), `{{WEEK_FILE}}` (e.g. `2026-W09.md`), `{{PREV_DATE}}`, and `{{NEXT_DATE}}`. Consult `meta/recurring-events.md` to populate Events & Appointments. Consult `meta/habits.md` to populate the Habits scorecard with habits applicable to today's day of the week.
10. **When creating a new weekly note**, use ISO week numbering. Copy from `meta/templates/weekly-template.md`. Replace `{{WEEK_NUMBER}}` with the zero-padded week number (e.g. `09`, not `W09`). Replace all day-of-week date placeholders (`{{MON_DATE}}` through `{{SUN_DATE}}`). The week runs Monday to Sunday.
11. **When creating a new project**, create a folder under `projects/`, copy from `meta/templates/project-template.md` into `README.md`, and fill in all placeholders including `{{PROJECT_SLUG}}`.
12. **Commits** during the day are free-form. The squash merge at day's end produces the single `main` commit (see Git Workflow below).

## Git Workflow

Each day lives on its own branch. At the end of the day the branch is squash-merged into `main`, producing one commit per day.

### Start of day (`/today`)

1. Make sure `main` is up to date: `git checkout main && git pull` (if a remote is configured).
2. Check if a branch `daily/YYYY-MM-DD` already exists.
   - **Exists:** switch to it (`git checkout daily/YYYY-MM-DD`). Continue the day.
   - **Does not exist:** create and switch (`git checkout -b daily/YYYY-MM-DD`).

### During the day

- Commit freely on the daily branch. No special message format required.
- All `/today`, `/wrap-up`, `/note`, `/new-project`, and ad-hoc changes are committed here.

### End of day (`/wrap-up`)

1. Commit any remaining uncommitted changes on the daily branch.
2. Switch to `main`: `git checkout main`.
3. Squash-merge the daily branch: `git merge --squash daily/YYYY-MM-DD`.
4. Commit with the message `journal: YYYY-MM-DD`.
5. Delete the daily branch: `git branch -d daily/YYYY-MM-DD`.
6. Push `main` if a remote is configured.

### Edge cases

- If the user runs `/wrap-up` but there are no changes on the daily branch beyond what's already on `main`, skip the merge — there's nothing to squash.
- If the daily branch has merge conflicts with `main`, resolve them interactively with the user before completing the merge.
- Gaps between days are fine — the branch is named after the day it was created, and a new branch starts the next active day.

## Updating the Daily Note

When the user asks to update today's daily note, or when a session produces results worth recording:

1. **Check for an existing note.** Look for `daily/YYYY-MM-DD.md`. If it does not exist, create one from the template.
2. **Log everything in Log & Notes.** Every substantive action during a session must appear as a bullet in the Log & Notes section. Be specific: name the changes made, problems solved, decisions taken. If it changed the state of the journal or a project, it belongs in the log.
3. **Update Tasks.** Mark completed items with `- [x]`. Add new items if the session surfaced them.
4. **Update related projects.** Add dev log entries and mark tasks in any project READMEs affected by the work.
5. **Update the weekly note.** Keep the Daily Notes links current.
6. **Update the knowledge base** if durable facts were learned (see "Using and Maintaining the Knowledge Base" above).
