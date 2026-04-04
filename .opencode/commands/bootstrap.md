---
description: First-time setup or update personal context
---

Set up or revise the personal context file (`context.md`). Idempotent — safe to re-run anytime.

## Step 1: Check Current State

- Read `context.md`.
- If the file has content (non-empty Author section) → **Step 2a** (revision).
- If missing, empty, or only template skeleton → **Step 2b** (fresh setup).

## Step 2a: Revision Flow

- Show current context in a readable format.
- Ask: "Is this still accurate? What would you like to update?"
- Update `context.md` with revised values. Scan `projects/` and `areas/` (excluding `archive/`) to refresh Active Projects/Areas.
- Skip to **Step 4**.

## Step 2b: Fresh Setup

Ask all questions at once:

1. **Name** — full name for the journal author
2. **Role** — job title
3. **Team** — immediate team name
4. **Department / Product** — broader org unit and product area
5. **Jira URL** — base URL of your Jira instance (e.g. `https://company.atlassian.net`); enter `n/a` if not used
6. **Confluence URL** — base URL of your Confluence instance (e.g. `https://company.atlassian.net/wiki`); enter `n/a` if not used
7. **MCP integrations / external tools** — which integrations are configured (Jira, Confluence, GitHub, etc.) and external workspace paths
8. **Conventions** — preferred language, work week, time format, week numbering
9. **Jira project key** — primary project key used in issue keys (e.g. `MYPROJ`); enter `n/a` if Jira is not used
10. **Commit format** — does your code repo require a Jira key prefix on commit messages? (e.g. `[PROJ-123] description` — enter the format, or `description only` if no prefix)
11. **Preferences** — verbosity (concise/standard/detailed), risk tolerance (conservative/moderate/aggressive), commit granularity (atomic/grouped/manual), explanation depth (minimal/moderate/thorough)

## Step 3: Write Context File

Write `context.md` with collected information. Preserve the existing front matter (update `updated:` to today's date) and replace placeholder sections with real content:

```markdown
---
type: meta
updated: YYYY-MM-DD
tags: []
---

# Context

## Author

- **Name:** <full name>
- **Role:** <job title>
- **Department:** <department, company>
- **Product:** <product area>
- **Team:** <team name>

## Tooling

- **Editor/Agent:** OpenCode
- **MCP integrations:** <list, e.g. Jira, Confluence, GitHub>
- **Jira URL:** <https://company.atlassian.net> or n/a
- **Confluence URL:** <https://company.atlassian.net/wiki> or n/a
- **External workspaces:** <paths, e.g. ~/workspace>

## Conventions

- **Language:** <language>
- **Work week:** <e.g. Monday–Friday>
- **Time format:** <e.g. 24-hour>
- **Week numbering:** ISO 8601 (weeks start on Monday)
- **Jira project key:** <e.g. PROJ> or n/a
- **Commit format:** <e.g. `[PROJ-123] description` for code repos, `description` for journal>

## Active Projects

<scan projects/ excluding archive/>

## Active Areas

<scan areas/ excluding archive/>

## Preferences

- **Verbosity:** <concise / standard / detailed>
- **Risk tolerance:** <conservative / moderate / aggressive>
- **Commit granularity:** <atomic / grouped / manual>
- **Explanation depth:** <minimal / moderate / thorough>
```

## Step 3b–3f: Coding Context Files (fresh only)

Read all five context files: `architecture.md`, `patterns.md`, `style.md`, `testing.md`, `safety.md`.

For each file, check whether the user-specific sections contain real content or only comment placeholders / generic defaults copied from the template.

Ask all questions for all five files **at once** in a single prompt — do not ask file by file.

---

### 3b: Architecture (`architecture.md`)

Check the "Source Code Repos (External)" section. If it is a comment placeholder, collect:

1. **External workspace path** — where source code repos live on disk (e.g. `~/workspace`, `~/code`)
2. **Repo structure** — key directories, tech stack, purpose of each (one line per repo/sub-project)
3. **Build system** — e.g. Gradle, npm, Make, cargo
4. **CI system** — e.g. GitHub Actions, GitLab CI, Jenkins
5. **Source control host** — e.g. GitHub, GitLab self-hosted, Bitbucket

Rewrite the "Source Code Repos (External)" section: remove the comment, write a Markdown table and a one-line prose summary.

---

### 3c: Patterns (`patterns.md`)

Check the "Coding Patterns (External Repos)" section. The file ships with generic defaults (error handling, config, API design). Ask:

1. **Primary languages / frameworks** — e.g. TypeScript/React, Python/FastAPI, Go, Kotlin/Spring
2. **Any project-specific patterns** — naming conventions, state management approach, data access layer style, etc. (optional — skip if nothing notable)

Rewrite the "Coding Patterns (External Repos)" section with language-specific idioms and any project-specific patterns the user described. Keep the generic defaults only if they are accurate; remove or replace what does not apply.

---

### 3d: Style (`style.md`)

The file ships with a TypeScript section. Ask:

1. **Languages used in external repos** — list all (e.g. TypeScript, Python, Go, Rust, Java, C#)
2. **Any linter / formatter in use** — e.g. ESLint, Prettier, Ruff, gofmt, clippy (optional)
3. **Any style rules that differ from common defaults** — e.g. tabs vs spaces, line length, import order (optional)

Replace the language-specific sections to match the actual languages. Keep the "Markdown" and "General" sections unchanged — they always apply. Add a section per language with the relevant rules.

---

### 3e: Testing (`testing.md`)

The file ships with TypeScript and C# sections. Ask:

1. **Test frameworks in use** — per language (e.g. Vitest, pytest, Go testing, RSpec)
2. **Test file structure** — co-located or separate `tests/` directory?
3. **Any coverage or flakiness policies** — e.g. minimum coverage threshold, flaky test handling (optional)

Replace the language-specific sections to match the actual stack. Keep the "Journal Repo" section unchanged.

---

### 3f: Safety (`safety.md`)

No questions needed — the rules are universal. Just:
- If the user's tooling does **not** include Jira/Confluence, remove the line "Never write to Jira or Confluence without explicit user approval."
- Update `updated:` in front matter.

---

After collecting all answers, write all five files in one pass. Update `updated:` in the front matter of each file written.

If any file already has real user-specific content (not a placeholder), show it and ask if it is still accurate. Update only what the user confirms needs changing.

## Step 4: Verify Tooling Connections

If MCP integrations were mentioned, smoke-test each:
- **Jira:** list projects.
- **Confluence:** simple search.
- Report results. Don't block on failures — note them for the user to fix later.

## Step 5: Environment Setup (fresh only)

1. Check if `.env` exists at repo root.
2. If not, check for `.env.example` → tell user to copy and fill in credentials.
3. If `.env` exists, confirm and skip.

## Step 6: Recurring Events (fresh only)

1. Read `recurring-events.md`.
2. If empty/placeholder → ask user for recurring events (standups, 1-on-1s, sprint ceremonies) with day and time.
3. Write events organized by weekday.
4. If file has content → show and ask if still accurate.

## Step 7: Author KB Entry (fresh only)

Offer to create a knowledge base entry for the author:
- Create `resources/people/<slug>.md` from template.
- Fill in known details (name, role, team).
- Register `#person-<slug>` tag in `tags.md`.
- Add entry to `knowledge-graph.md`.

## Step 8: Orientation

Show the user what was created/updated, then explain the key workflows:
- `/morning` to start each day (auto-includes weekly planning on Mondays)
- `/evening` to close each day (auto-includes weekly wrap-up on Fridays)
- `/brainstorm` → `/plan` → `/implement` → `/review` for structured work (code or documents)
- `/lint` to check repo health
- Commit changes with a descriptive message.

$ARGUMENTS
