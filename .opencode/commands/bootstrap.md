---
description: First-time setup or update personal context and coding environment
updated: 2026-05-06
tags: [bootstrap, setup]
---

<role>
Bootstrap agent. Set up or revise `context/context.md`, `context/safety.md`, `context/habits.md`, and `codebases/<name>.md` files. Idempotent — safe to re-run.
</role>

<arguments>
`/bootstrap`
</arguments>

<context>
Templates:
- `.opencode/context-templates/context.md`
- `.opencode/context-templates/safety.md`
- `.opencode/context-templates/habits.md`
- `.opencode/skills/codebases/codebase-template.md`
- `.opencode/meta-templates/*` (tags, confluence-sync, resources-log, recurring-events)

Branching: existing `context/context.md` with non-empty Author section → revision flow (Step 2a). Empty/missing → fresh setup (Step 2b onward).
</context>

<steps>

<step n="1" name="Check current state">
Read `context/context.md`. Branch: has content → Step 2a. Empty/missing → Step 2b.
<done_when>Branch determined.</done_when>
</step>

<step n="2a" name="Revision flow" condition="existing context">
Display current context as readable summary. Ask: "Is this still accurate? What would you like to update?" Scan `projects/` and `areas/` (excluding `archive/`) to refresh Active lists. Apply updates.

Check `context/habits.md`. If exists: ask "Want to review your daily/weekly habits?" If yes: display current habits, accept edits. If missing: offer to create from template (Step 7b logic).

Skip to Step 5.
<done_when>Revisions applied.</done_when>
</step>

<step n="2b" name="Fresh setup" condition="empty/missing context">
Ask all questions in one prompt:

1. **Name** — full name
2. **Role** — job title
3. **Team** — immediate team
4. **Department / Product** — broader org unit and product
5. **Jira URL** — base URL (e.g. `https://company.atlassian.net`); `n/a` if unused
6. **Confluence URL** — base URL (e.g. `https://company.atlassian.net/wiki`); `n/a` if unused
7. **MCP integrations** — which are configured (Jira, Confluence, GitHub, etc.)
8. **Language / work week / time format** — e.g. English, Mon–Fri, 24-hour
9. **Jira project key** — primary key (e.g. `MYPROJ`); `n/a` if unused
10. **Commit format** — e.g. `[PROJ-123] description` or `description only`
11. **Preferences** — verbosity (concise/standard/detailed), risk tolerance (conservative/moderate/aggressive), commit granularity (atomic/grouped/manual)
<done_when>All answers collected.</done_when>
</step>

<step n="2c" name="Bootstrap meta files" condition="fresh only">
Ensure `meta/` files exist. For each, copy template if missing:

| File | Template |
|------|----------|
| `meta/tags.md` | `.opencode/meta-templates/tags-template.md` |
| `meta/confluence-sync.json` | `.opencode/meta-templates/confluence-sync-template.json` |
| `meta/resources-log.md` | `.opencode/meta-templates/resources-log-template.md` |

<done_when>All meta files exist.</done_when>
</step>

<step n="3" name="Write context/context.md">
If file does not exist, copy from `.opencode/context-templates/context.md` first. Write with collected values. Update `updated:` to today. Scan `projects/` and `areas/` (excluding `archive/`) for Active lists.

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

<done_when>File written with correct values.</done_when>
</step>

<step n="4" name="Safety rules" condition="fresh only">
If `context/safety.md` missing, copy from `.opencode/context-templates/safety.md`. Universal rules — no questions. Remove Jira/Confluence rule if neither tool used. Update `updated:` and `path:` frontmatter.
<done_when>Safety file present and updated.</done_when>
</step>

<step n="4b" name="Codebase file" condition="fresh only">
Ask: "Are you currently working in a codebase? If so, what is its name and local path?"

If yes:
- Copy `.opencode/skills/codebases/codebase-template.md` → `codebases/<name>.md`
- Collect: local path, primary language/framework, repo structure, build command, test command, CI system, source control host, linter/formatter
- Write file. Mark unknown sections `<!-- TBD -->`.
- Add to `context/context.md § Codebases`: `**<name>:** <local path> — [codebases/<name>.md](../codebases/<name>.md)`

If no, skip.
<done_when>Codebase file written or step skipped.</done_when>
</step>

<step n="5" name="Verify tooling">
Check CLI tools:

| Tool | Version command | Required |
|------|----------------|----------|
| `node` | `node --version` | Yes — must be ≥ 22 |
| `jira` | `jira version` | Yes — Jira CLI |
| `confluence` | `confluence --version` | Yes — Confluence CLI |
| `gh` | `gh --version` | Yes — GitHub CLI |
| `qmd` | `qmd --version` | Yes — semantic search |
| `repomix` | `repomix --version` | Yes — repo packing |
| `glab` | `glab --version` | Optional — GitLab CLI |

Report status (OK / MISSING / WARN). DO NOT block on failures.

Regenerate environment snapshot:

```
node .opencode/scripts/env-context.js
```

This writes CLI versions/paths to `context/env-snapshot.md`. If script missing: note tool gaps manually, skip.
<done_when>Tool report produced; snapshot regenerated or skip noted.</done_when>
</step>

<step n="5b" name="Register QMD collections" condition="fresh only AND qmd installed">
qmd registry: `~/.cache/qmd/index.sqlite`. Collections must be registered before indexing.

Run from repo root (idempotent):

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

Build initial index:

```bash
node .opencode/scripts/qmd-index.js
```

Skip if `qmd` not installed (Step 5 noted).
<done_when>Collections registered and initial index built, OR step skipped.</done_when>
</step>

<step n="6" name="Environment" condition="fresh only">
Check `.env` at repo root. If missing, check `.env.example` and instruct user to copy and fill credentials.
<done_when>Env state assessed.</done_when>
</step>

<step n="7" name="Recurring events" condition="fresh only">
Read `journal/recurring-events.md`. If missing, copy from `.opencode/meta-templates/recurring-events-template.md`. If empty, ask for recurring events (standups, 1-on-1s, ceremonies) with day and time. Write organized by weekday.
<done_when>Recurring events recorded.</done_when>
</step>

<step n="7b" name="Habits" condition="fresh only">
Check `context/habits.md`. If missing, copy from `.opencode/context-templates/habits.md`.

Present the default habits table to the user:
- "Here are suggested daily and weekly habits. They'll be surfaced by `/morning`, `/evening`, and `/weekly` at the relevant trigger points."
- Show: `## Daily — Morning`, `## Daily — Evening`, `## Weekly — Monday`, `## Weekly — Friday` sections.

ASK: "Would you like to customize these habits? You can add, remove, or modify any row. These are personal — adapt them to your role and goals."

If user wants changes: apply them. If user accepts defaults: leave as-is.

<done_when>Habits file exists and user has reviewed it.</done_when>
</step>
Offer to create `resources/people/<slug>.md` for author. If accepted: fill name, role, team. Register `#person-<slug>` in `meta/tags.md`.

Pre-check: `meta/tags.md` exists; if not, copy from `.opencode/meta-templates/tags-template.md`.
<done_when>Author resource created or declined.</done_when>
</step>

<step n="8b" name="Obsidian setup" condition="fresh only">
ASK: "Will you use Obsidian to browse or edit your journal?"

If yes, display recommended settings:

| Setting | Value |
|---|---|
| Files & Links → Use [[Wikilinks]] | Off |
| Files & Links → New link format | Relative path to file |
| Files & Links → Automatically update internal links | On |
| Files & Links → Excluded files | `node_modules` |
| Editor → Properties in document | Visible or Source |

Note: these keep links compatible with Typora, GitHub, and other Markdown editors. No file changes needed — Obsidian reads the vault as-is.

If no, skip.
<done_when>Obsidian guidance delivered or skipped.</done_when>
</step>

<step n="9" name="Orientation" condition="fresh only">
Explain command set:
- **Daily rhythm:** `/morning`, `/evening`, `/standup`, `/weekly`
- **Lifecycle work:** `/do <phase>` — phases: `scout`, `research`, `brainstorm`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`
- **Knowledge graph:** `/r <operation>` — operations: `enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`
- **Quick capture:** `/capture <note>` — timestamped note into today's daily Inbox
- **Meeting notes:** `/meeting`
<done_when>Orientation delivered.</done_when>
</step>

</steps>

<output_rules>
- Language: English.
- Idempotent — every step safe to re-run.
- Skip "fresh only" steps in revision flow.
- DO NOT overwrite existing files except where step explicitly says "write" with collected values.
</output_rules>

$ARGUMENTS
