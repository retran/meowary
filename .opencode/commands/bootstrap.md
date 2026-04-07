---
description: First-time setup or update personal context and coding environment
---

Set up or revise `context.md` and the six coding context files. Idempotent — safe to re-run anytime.

Arguments: `/bootstrap`

---

## Step 1: Check Current State

Read `context.md`. Branch:
- **Has content** (non-empty Author section) → go to **Step 2a** (revision).
- **Empty or missing** → go to **Step 2b** (fresh setup).

---

## Step 2a: Revision Flow

Show the current context in a readable summary. Ask: "Is this still accurate? What would you like to update?"

Scan `projects/` and `areas/` (excluding `archive/`) to refresh Active Projects/Areas lists. Apply updates, then skip to **Step 5**.

---

## Step 2b: Fresh Setup

Ask all questions in one prompt:

1. **Name** — full name
2. **Role** — job title
3. **Team** — immediate team
4. **Department / Product** — broader org unit and product
5. **Jira URL** — base URL (e.g. `https://company.atlassian.net`); `n/a` if not used
6. **Confluence URL** — base URL (e.g. `https://company.atlassian.net/wiki`); `n/a` if not used
7. **MCP integrations** — which are configured (Jira, Confluence, GitHub, etc.)
8. **Language / work week / time format** — e.g. English, Mon–Fri, 24-hour
9. **Jira project key** — primary key (e.g. `MYPROJ`); `n/a` if unused
10. **Commit format** — e.g. `[PROJ-123] description` or `description only`
11. **Preferences** — verbosity (concise/standard/detailed), risk tolerance (conservative/moderate/aggressive), commit granularity (atomic/grouped/manual)

---

## Step 3: Write context.md

Write `context.md` with the collected values. Update `updated:` to today's date. Scan `projects/` and `areas/` (excluding `archive/`) for the Active lists.

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
- **MCP integrations:** <list>
- **Jira URL:** <url> or n/a
- **Confluence URL:** <url> or n/a

## Conventions

- **Language:** <language>
- **Work week:** <e.g. Monday–Friday>
- **Time format:** <e.g. 24-hour>
- **Week numbering:** ISO 8601
- **Jira project key:** <key> or n/a
- **Commit format:** <format>

## Active Projects

<scan projects/ excluding archive/>

## Active Areas

<scan areas/ excluding archive/>

## Preferences

- **Verbosity:** <concise / standard / detailed>
- **Risk tolerance:** <conservative / moderate / aggressive>
- **Commit granularity:** <atomic / grouped / manual>
```

---

## Step 4: Coding Context Files (fresh only)

Ask all six questions in one prompt. Write all six files in one pass after collecting answers. If a file already has real content, show it and ask what needs updating.

| File | Collect |
|------|---------|
| `architecture.md` | External workspace path, repo structure, tech stack, build system, CI, source control host |
| `patterns.md` | Primary languages/frameworks, project-specific naming/state/data patterns |
| `style.md` | Languages used, linter/formatter in use, any rules differing from defaults |
| `testing.md` | Test frameworks per language, file structure (co-located vs `tests/`), coverage policy |
| `safety.md` | No questions — rules are universal. Remove Jira/Confluence line if not used. |
| `conventions.md` | Use the Jira key from Step 2b. Replace `PROJ` with actual key; remove Jira content if n/a. |

Update `updated:` in the front matter of every file written.

---

## Step 5: Verify Tooling

Check required CLI tools:

| Tool | Version command | Required |
|------|----------------|----------|
| `node` | `node --version` | Yes — must be ≥ 22 |
| `jira` | `jira version` | Yes — Jira CLI |
| `gh` | `gh --version` | Yes — GitHub CLI |
| `qmd` | `qmd --version` | Yes — semantic search |
| `repomix` | `repomix --version` | Yes — repo packing |
| `glab` | `glab --version` | Optional — GitLab CLI |

Report status (OK / MISSING / WARN). Don't block on failures — note for the user to fix.

---

## Step 6: Environment (fresh only)

Check for `.env` at repo root. If missing, check for `.env.example` and tell the user to copy and fill in credentials.

---

## Step 7: Recurring Events (fresh only)

Read `recurring-events.md`. If empty, ask for recurring events (standups, 1-on-1s, ceremonies) with day and time. Write organized by weekday.

---

## Step 8: Author Resource Entry (fresh only)

Offer to create `resources/people/<slug>.md` for the author. If accepted: fill name, role, team; register `#person-<slug>` in `tags.md`.

---

## Step 9: Orientation (fresh only)

Explain the command set:

- **Daily rhythm:** `/morning` to start the day, `/evening` to close it, `/standup` for async updates, `/weekly` for planning and retrospectives
- **Lifecycle work:** `/do <phase>` — phases: `scout`, `research`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`
- **Knowledge graph:** `/r <operation>` — operations: `enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`, `query`
- **Quick capture:** `/capture <note>` — drops a timestamped note into today's daily Inbox
- **Meeting notes:** `/meeting`

$ARGUMENTS
