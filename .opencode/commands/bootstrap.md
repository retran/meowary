---
description: First-time setup or update personal context and coding environment
---

Set up or revise `context/context.md`, `context/safety.md`, and any `codebases/<name>.md` files. Idempotent — safe to re-run anytime. Templates live in `.opencode/context-templates/` and `.opencode/skills/codebases/codebase-template.md`.

Arguments: `/bootstrap`

---

## Step 1: Check Current State

Read `context/context.md`. Branch:
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

## Step 2c: Bootstrap Meta Files (fresh only)

Ensure the `meta/` directory files exist. For each file listed below, check if it exists. If not, copy from the template:

| File | Template |
|------|----------|
| `meta/tags.md` | `.opencode/meta-templates/tags-template.md` |
| `meta/confluence-sync.json` | `.opencode/meta-templates/confluence-sync-template.json` |
| `meta/resources-log.md` | `.opencode/meta-templates/resources-log-template.md` |

---

## Step 3: Write context/context.md

If `context/context.md` does not exist, copy from `.opencode/context-templates/context.md` first.

Write `context/context.md` with the collected values. Update `updated:` to today's date. Scan `projects/` and `areas/` (excluding `archive/`) for the Active lists.

```markdown
---
type: meta
path: context/context.md
updated: YYYY-MM-DD
apply-when: [every session — identity, tooling, active projects, commit conventions]
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
- **Commit format (code repos):** <e.g. `[PROJ-123] description`>
- **Commit format (journal):** description only (no key, no type prefix)

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

## Step 4: Safety Rules File (fresh only)

If `context/safety.md` does not exist, copy from `.opencode/context-templates/safety.md`. No questions needed — rules are universal. Remove the Jira/Confluence rule if neither tool is used.

Update `updated:` and `path:` in the front matter.

---

## Step 4b: Codebase File (fresh only)

Ask: "Are you currently working in a codebase? If so, what is its name and local path?"

If yes:
- Create `codebases/<name>.md` by copying `.opencode/skills/codebases/codebase-template.md`.
- Collect: local path, primary language/framework, repo structure overview, build command, test command, CI system, source control host, any known linter/formatter.
- Write the file with collected values. Leave unknown sections with `<!-- TBD -->`.
- Add an entry to `context/context.md § Codebases`:
  `**<name>:** <local path> — [codebases/<name>.md](../codebases/<name>.md)`

If no, skip this step.

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

After checking tools, regenerate the environment snapshot:

```
node .opencode/scripts/env-context.js
```

This writes the CLI tool versions and paths to `context/env-snapshot.md`. If the script does not exist: manually note any tool gaps; skip the script step.

---

## Step 5b: Register QMD Collections (fresh only, if qmd is installed)

qmd stores its collection registry in `~/.cache/qmd/index.sqlite`. Collections must be registered once before `qmd update` / `qmd-index.js` can index them.

Run the following from the repo root to register all standard collections (idempotent — safe to re-run):

```bash
qmd collection add meta ./meta
qmd collection add context ./context
qmd collection add codebases ./codebases
qmd collection add resources ./resources
qmd collection add skills ./.opencode/skills
qmd collection add journal ./journal
qmd collection add inbox ./inbox
qmd collection add projects ./projects
qmd collection add areas ./areas
qmd collection add archive ./archive
```

Then build the initial index:

```bash
node .opencode/scripts/qmd-index.js
```

Skip this step if `qmd` is not installed (will be noted in Step 5).

---

## Step 6: Environment (fresh only)

Check for `.env` at repo root. If missing, check for `.env.example` and tell the user to copy and fill in credentials.

---

## Step 7: Recurring Events (fresh only)

Read `journal/recurring-events.md`. If the file does not exist, copy it from `.opencode/meta-templates/recurring-events-template.md` first. If empty, ask for recurring events (standups, 1-on-1s, ceremonies) with day and time. Write organized by weekday.

---

## Step 8: Author Resource Entry (fresh only)

Offer to create `resources/people/<slug>.md` for the author. If accepted: fill name, role, team; register `#person-<slug>` in `meta/tags.md`.

> **Before using `meta/tags.md`:** Check that it exists. If not, copy from `.opencode/meta-templates/tags-template.md`.

---

## Step 9: Orientation (fresh only)

Explain the command set:

- **Daily rhythm:** `/morning` to start the day, `/evening` to close it, `/standup` for async updates, `/weekly` for planning and retrospectives
- **Lifecycle work:** `/do <phase>` — phases: `scout`, `research`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`
- **Knowledge graph:** `/r <operation>` — operations: `enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`, `query`
- **Quick capture:** `/capture <note>` — drops a timestamped note into today's daily Inbox
- **Meeting notes:** `/meeting`

$ARGUMENTS
