# AGENTS.md

This repository is Meowary — a personal knowledge base and project journal managed as plain Markdown files. It is not a software project — there is no code to build, test, or run.

## Purpose

A place to capture and accumulate knowledge from personal projects, hobbies, and learning. Used session-by-session: open the laptop, work on something, record what was done and learned, close. Not a daily planner. Not a habit tracker.

## Author & Context

Author identity and instance-specific details live in [`meta/context.md`](meta/context.md). Read it at the start of every session.

**On first use:** If `meta/context.md` is empty or missing, direct the user to run `/bootstrap` first.

**Language:** Write all journal content in the language specified in `meta/context.md` → Conventions → Language. Apply this to notes, project files, KB entries, and commit messages. If no language is set, default to English.

## Writing Style

Write plainly. The journal is a working tool, not a publication. Principles from _Слово живое и мёртвое_ (Nora Gal) and _Пиши, сокращай_ (Maxim Ilyakhov):

- **Cut filler.** Remove words that add no meaning: "basically", "essentially", "it should be noted that", "comprehensive". If a sentence works without a word, drop it.
- **No marketing language.** "Powerful", "seamless", "innovative" — banned. Describe what the thing _does_.
- **Be concrete.** "Implemented Phong shading in GLSL" not "made progress on shaders".
- **Short sentences.** One thought per sentence. More than two commas — split it.
- **Active voice.** "I fixed the bug" not "the bug was fixed".
- **Say it once.** Do not repeat information from another file — link to it.
- **Plain structure.** Tables and bullets over prose. Headings as labels, not sentences.

## Repository Structure

```
personal/
├── notes/                     # Standalone notes, organised by topic
│   └── <topic>/               # e.g. notes/glsl/, notes/cooking/
│       └── YYYY-MM-DD-<slug>.md
├── projects/                  # One folder per project or learning topic
│   ├── <name>/
│   │   ├── README.md          # Project overview and dev log
│   │   ├── notes.md           # Accumulated knowledge, concepts, snippets (optional)
│   │   └── resources.md       # Links, books, references (optional)
│   └── _archive/              # Inactive projects moved here
├── writing/                   # Blog posts and articles
│   ├── ideas.md               # Backlog of ideas
│   ├── published.md           # Log of published pieces
│   ├── series/                # One folder per series or recurring column
│   │   └── <series-slug>/
│   │       ├── README.md      # Series overview
│   │       └── <N>-<slug>.md  # Individual drafts in order
│   └── <slug>/                # One folder per standalone article
│       ├── draft.md           # Working draft
│       └── notes.md           # Research, sources, scratch (optional)
├── lists/                     # Media and backlog lists
│   ├── books.md
│   ├── movies.md
│   ├── games.md
│   └── <anything>.md          # Add more as needed
├── knowledge-base/            # Persistent reference notes
│   ├── people/
│   ├── topics/
│   ├── health/
│   ├── places/
│   ├── finance/
│   ├── pets/
│   └── <topic>/               # New folders as needed
├── _review/                   # Files awaiting manual triage after /import
├── meta/
│   ├── templates/
│   │   ├── project-template.md
│   │   ├── note-template.md
│   │   ├── kb-template.md
│   │   ├── person-template.md
│   │   └── article-template.md
│   ├── context.md
│   └── tags.md
├── .opencode/
│   └── commands/
└── AGENTS.md
```

## Commands

- `/note` — capture a note; agent routes it to the right place
- `/project` — create a new project or learning topic
- `/kb` — add or update a knowledge base entry
- `/write` — work on a blog post or article (new draft, continue editing, publish)
- `/bootstrap` — first-time setup or update personal context
- `/import <path>` — import files from an external export; uncertain files go to `_review/`

## Conventions

### Projects (`projects/<name>/`)

Three types:

| Type     | When to use                                               | Status values            |
| -------- | --------------------------------------------------------- | ------------------------ |
| Project  | Concrete non-technical goal (paint miniature set, build furniture, finish a book) | Active, Paused, Done |
| Dev      | Programming pet project (has a repo, code, technical decisions) | Active, Paused, Done |
| Learning | Exploring a topic with no fixed endpoint (learning GLSL)  | Active, Paused, Archived |
| Game     | Playing a game — tracking sessions, strategies, knowledge | Active, Paused, Archived |
| Family   | Family or household projects with steps, deadlines, documents (trips, apartment purchase, paperwork) | Active, Paused, Done |

The `README.md` is the entry point. Structure:

```
---
type: project          # or: learning
status: Active
tags: [p-<slug>]
---

# Name

**Status:** Active
**Tags:** #p-<slug>

## Overview

What this is and what you want from it.

## Dev Log

- **YYYY-MM-DD:** What happened this session.
```

Rules:
- **Dev log is the core.** After every session, add an entry: what was done, what was learned, what to look at next. Reverse chronological order. Bold dates.
- **Overview stays current.** If the direction changes, update it.
- **No tasks.** Use the dev log to record what happened, not to manage what's next. If you need to capture a next step, write it as the last bullet of a dev log entry: "Next: look into X."
- **Companion files depend on type:**
  - Project: `notes.md` for decisions and ideas, `resources.md` for references.
  - Dev: `notes.md` for architecture decisions, technical notes, problem breakdowns; `resources.md` for docs, articles, references. `README.md` should include repo link and tech stack.
  - Learning: `notes.md` for raw session notes (what was tried, what broke, what clicked today); `resources.md` for books, tutorials, links. Durable knowledge — concepts, patterns, rules — goes into `knowledge-base/topics/<slug>.md`, not `notes.md`. See "Learning projects and the KB" below.
  - Game: `notes.md` for rules, strategies, mechanics; `sessions.md` for session/game log (date, who played, what happened, outcome).
  - Family: `notes.md` for research and decisions, `resources.md` for links and contacts, `docs.md` for documents checklist (what's obtained, what's pending, deadlines).
- **Pause idle projects.** No activity for a few weeks and no plans? Set status to `Paused`. Add a dev log entry saying why.
- **Archive when done.** Set status to `Done` (project) or `Archived` (learning, game), add a final dev log entry, move folder to `projects/_archive/`.

### Learning Projects and the KB

Learning projects have two layers of storage:

| Layer | File | What goes here |
| ----- | ---- | -------------- |
| Session log | `projects/<slug>/notes.md` | Raw notes from a session: what was tried, what broke, what you were confused about, scratch thoughts |
| Durable knowledge | `knowledge-base/topics/<slug>.md` | Concepts, patterns, rules, API facts — things that stay true and useful regardless of when you learned them |

The `README.md` dev log records what happened each session ("explored lighting models, got normal maps working"). The KB article is the distilled reference you'd open when you need to remember how something works.

**When capturing content for a Learning project, always ask: is this ephemeral or durable?**

- "Spent an hour debugging why normals were inverted" → `notes.md` (session context, not reference material)
- "Normal vectors must be transformed with the transpose of the inverse model matrix" → KB (a fact you'll want to look up later)
- "Tried three approaches to implement shadow mapping, ended up with PCF" → `notes.md`
- "PCF: sample the depth map multiple times with small offsets, average the results" → KB

**When the user shares learning material** (pastes a tutorial, explains a concept, shows code):

1. Record the session context in `projects/<slug>/notes.md` if it belongs there.
2. Extract the durable facts and write or update `knowledge-base/topics/<slug>.md`. If no KB entry exists yet, create one from `meta/templates/kb-template.md`.
3. Add a dev log entry to the project `README.md`.

The KB entry for a topic grows over time. Each session should leave it more complete than before.

Standalone notes not tied to a specific project, organised by topic folder.

- Topic folder is derived from content (e.g. `notes/glsl/`, `notes/cooking/`, `notes/japanese/`). Create the folder if it doesn't exist.
- File name: `YYYY-MM-DD-<slug>.md` where slug is kebab-case.
- Structure: H1 title, Tags line, `## Notes` section, optional `## Takeaways` section.
- Keep concise. Not every thought needs a note — if it belongs in a project's `notes.md` or the KB, route it there instead.

### Lists (`lists/`)

Backlog and consumption tracking for books, movies, shows, games, and anything else worth tracking.

Each list is a separate file: `lists/books.md`, `lists/movies.md`, `lists/games.md`. Create new files as needed (`lists/podcasts.md`, `lists/albums.md`, etc.).

**Structure of each list:**

```markdown
# Books

## Backlog

- *Title* — Author (optional note: why you want to read it)

## Done

- *Title* — Author — YYYY-MM — one-line impression
  → [detailed notes](../notes/books/title.md)   ← only if a deeper note exists
```

Rules:
- **Backlog** is things you want to read/watch/play. Order doesn't matter.
- **Done** is reverse chronological — most recent first. Include the month finished (YYYY-MM).
- **Inline impressions** are one line max. If you want to write more — create a note in `notes/books/`, `notes/movies/`, etc. and link with `→`.
- When moving an item from Backlog to Done, add the date and impression inline. Don't leave it blank.
- Add new list files freely — there's no fixed set.

### Writing (`writing/`)

Blog posts and articles at all stages — from raw idea to published.

**`writing/ideas.md`** — flat backlog of ideas. One line each: topic + angle + optional context.

```markdown
# Ideas

- Why I stopped using Notion — personal tools, lessons learned
- GLSL normal mapping demystified — practical explainer
```

**`writing/published.md`** — log of published pieces, reverse chronological.

```markdown
# Published

- **YYYY-MM-DD** — [Title](URL) — platform — one-line note
```

**Standalone article** (`writing/<slug>/`):

```
writing/<slug>/
├── draft.md       # The working text
└── notes.md       # Research, sources, discarded sections (optional)
```

**Series** (`writing/series/<series-slug>/`):

```
writing/series/<series-slug>/
├── README.md          # Series title, premise, planned parts
└── 01-<slug>.md       # Individual posts in order
```

**`draft.md` structure** (from `meta/templates/article-template.md`):

```markdown
---
status: Draft          # Draft | Ready | Published
published: ~           # URL when published
platform: ~            # Medium, Substack, personal site, etc.
tags: []
---

# Title

**Status:** Draft

## Outline

- Point 1
- Point 2

## Draft

<body text>

## Changelog

- **YYYY-MM-DD:** started
```

**Status values:** `Draft` → `Ready` → `Published`. Set `published:` URL when status becomes `Published`.

Rules:
- **Ideas stay in `ideas.md`** until work actually begins. Don't create a folder for a bare idea.
- **One folder per article or series, not per revision.** Revisions happen inside `draft.md`.
- **`notes.md` is optional.** Create it only if there's research or material separate from the draft.
- **When published:** update `draft.md` status and `published:` URL, move the idea from `ideas.md` backlog (or just note it there as done), add an entry to `published.md`.
- **Series README** lists planned and completed parts with checkboxes. Update it as parts are written and published.

### Knowledge Base (`knowledge-base/`)

Long-term reference material: things you'll want to look up later, not tied to a single session or project.

| Folder     | Contents                                        |
| ---------- | ----------------------------------------------- |
| `people/`  | One file per person (family, friends, contacts) |
| `topics/`  | Interests, skills, subjects (not project-specific) |
| `health/`  | Health, fitness, medical                        |
| `places/`  | Restaurants, travel, locations                  |
| `finance/` | Budgets, subscriptions, financial notes         |
| `pets/`    | Pet care, vet, routines                         |

Create new folders as needed. Don't put files at the KB root.

Rules:
- **Read before writing.** Before working on anything involving a person, place, or topic, check the KB first. Don't ask the user to repeat what's already recorded.
- **Update when you learn something durable.** New fact about a person, a place recommendation, a concept clarified — update the KB entry (or create one).
- **Changelog.** Every KB article has a `## Changelog` section. When editing, append: `- **YYYY-MM-DD:** <what changed>`.
- **Concise.** Tables and bullets. Link to related entries instead of duplicating.

### Tags

- Inline, kebab-case: `#p-glsl`, `#person-alice`, `#sourdough`.
- `#p-<slug>` — projects (must match the project folder name).
- `#person-<slug>` — people (must match the KB filename).
- All tags registered in `meta/tags.md`. Check before creating new ones.

### Meta (`meta/`)

- `context.md` — who you are, tooling, conventions. Read at session start.
- `templates/` — boilerplate for new entries.
- `tags.md` — tag registry.

### `_review/`

Files placed here by `/import` that couldn't be automatically routed. Each file has a `<!-- _review: <reason> -->` comment at the top explaining why.

To process a file:

1. Read it and the comment.
2. Use `/note`, `/project`, or `/kb` to route the content to the right place.
3. Delete the file from `_review/` once done.

## Rules for Editing

1. **Use relative links.** Links between files use relative paths so they stay valid if the repo moves.
2. **Maintain links.** When creating, renaming, or moving a file, update all links that reference it.
3. **Dev log entries** use bold dates (`**YYYY-MM-DD:**`) in reverse chronological order.
4. **No stubs.** Don't create a project or KB entry with placeholder content. Fill in the Overview before finishing the session, or don't create the file yet.
5. **Project status:** `Active`, `Paused`, `Done` (project, family) or `Active`, `Paused`, `Archived` (learning, game).

## Git Workflow

Commit directly to `main`. No daily branches.

- Commit after each meaningful action: creating a note, updating a project's dev log, adding a KB entry.
- Commit messages are short and descriptive: `note: GLSL — uniforms`, `project: add glsl`, `kb: update alice`, `session: glsl — explored lighting models`.
- If a remote is configured, push at the end of the session.

## On Session Start

When the user opens the journal or starts a session:

1. Read `meta/context.md` for personal context.
2. If the user mentions a project they're working on, read that project's `README.md` and `notes.md` for context before doing anything.
3. Do not ask "what are you planning today?" or offer to create a daily note. Wait for the user to direct.

## External Sources

MCP integrations are configured in `meta/context.md`. None are set up by default — they will be added over time.

When an integration is active, use it only when the user asks or it's directly relevant to the current task. Don't pull in external content unprompted.
