<!--
updated: 2026-04-18
-->

# AGENTS.md

<role>
Root entry point for all agents operating in this repository. Defines session-start loading protocol, repository layout, automation surface, non-negotiable editing rules, and security/GDPR constraints. Read on every session before any other instruction.
</role>

<summary>
> Personal work journal organized as Markdown files under **PARA** (Projects, Areas, Resources, Archive) with supporting shell scripts. Operates on **progressive disclosure**: AGENTS.md carries the rules, skills carry workflows, context files carry project-specific detail. Load only what the current task requires.
</summary>

<inputs>

| Input | Source | Required |
|---|---|---|
| Author identity, team, tooling | `context/context.md` | Yes (Tier 0) |
| Resource articles | `resources/` via `qmd query` | When task touches writing/people/teams/projects (Tier 1) |
| Codebase context | `codebases/<name>.md` | When editing external repo (Tier 2) |

</inputs>

<definitions>

- **PARA** — Projects, Areas, Resources, Archive. Top-level organization scheme.
- **Progressive disclosure** — Load skills, workflows, and context files on demand, not upfront.
- **Tier 0/1/2** — Session-start loading stages, scoped to task type.
- **Stub** — Minimal placeholder resource article created when an entity is referenced but has no article yet.

</definitions>

<tiers>

**Tier 0 — every session**
DO read `context/context.md` (author identity, team, active projects, tooling). Skip if already loaded this session.

**Tier 1 — task involves writing, resources, people, teams, or projects**
DO search `resources/` with `qmd query "<topic>"` or browse the directory tree to identify articles relevant by topic, team, person, or project tag. DO read specific resource articles that directly bear on the task. If an article should exist but doesn't, DO create a stub before proceeding.

**Tier 2 — coding work in external repos**
DO read `context/context.md` `## Codebases` to identify the active codebase. DO read `codebases/<name>.md` — it contains architecture, tech stack, build commands, test commands, coding conventions, CI context, and key decisions. If no `codebases/<name>.md` exists, DO create one before proceeding. NEVER invent conventions. If the file is missing or a field is empty, ASK the user before assuming.

</tiers>

<pre_check>

1. **Context loaded** — `context/context.md` read this session. If empty or missing, direct user to run `/bootstrap` before any context-dependent task.
2. **Task tier identified** — Determine whether Tier 1 and/or Tier 2 loading applies.
3. **Context currency** — If the user shares new project, role change, team update, tool adoption, or any fact belonging in `context/context.md` or `codebases/<name>.md`, update the file immediately during the session.

</pre_check>

<context>

## Repository Structure

Full directory tree and "What Goes Where" table: [`.opencode/reference/structure.md`](.opencode/reference/structure.md).

Top-level directories: `journal/`, `projects/`, `areas/`, `resources/`, `archive/`, `inbox/`, `context/`, `codebases/`, `.opencode/`.

Workflow prompts live in `.opencode/workflows/` (24 files). Commands live in `.opencode/commands/`. Sub-agent definitions live in `.opencode/agents/`. Reference files (conventions, structure, security rules) live in `.opencode/reference/`.

## Automation Surface

### Slash Commands

- **Lifecycle workflows** — `/do <phase>` dispatches to `.opencode/workflows/`: `scout`, `research`, `brainstorm`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review`
- **Knowledge graph workflows** — `/r <operation>` dispatches to `.opencode/workflows/`: `enrich`, `sync`, `plan`, `discover`, `ops`, `ingest`
- **Daily workflows** — direct dispatch: `/morning`, `/evening`, `/standup`, `/weekly`, `/capture`, `/meeting`
- **Utility commands** — `/bootstrap`

### QMD — Semantic Search

- Index: `node .opencode/scripts/qmd-index.js` (`--changed` for fast early-exit, `--full` to force re-embed)
- Query: `qmd query "<question>"`
- Re-index after any bulk create/actualize, `/r ingest`, or `/r sync` run.
- Collections are registered in `~/.cache/qmd/index.sqlite` via `qmd collection add`. The `/bootstrap` command registers all standard collections on first setup.

</context>

<trigger_table>

| Condition | Action |
|---|---|
| New session started | Execute Tier 0 load |
| Task touches writing, resources, people, teams, or projects | Execute Tier 1 load |
| Task involves coding in external repo | Execute Tier 2 load |
| User shares new project/role/team/tool fact | Update `context/context.md` or `codebases/<name>.md` immediately |
| Person, team, process, or concept referenced without resource article | Create stub article immediately |
| Learn new build command, architecture detail, convention, CI step, or decision while coding | Update `codebases/<name>.md` immediately (NEVER defer) |
| `context/context.md` empty or missing | Direct user to run `/bootstrap` before proceeding |

</trigger_table>

<steps>

<step n="1" name="session_start_load" gate="HARD-GATE">
DO execute Tier 0 (`context/context.md`). DO identify task type and execute Tier 1 / Tier 2 loads as applicable. DO NOT proceed to task work until required context is loaded.
<done_when>Required tier context is in working memory or stub/codebase file has been created.</done_when>
</step>

<step n="2" name="proactive_enrichment" gate="SOFT-GATE">
DURING every session, regardless of primary task:
- DO scan for resource gaps. When you encounter a person, team, process, or concept that should have a resource article but doesn't, DO create a stub immediately.
- DURING any coding session, DO update `codebases/<name>.md` immediately whenever you learn a build command, architecture component, coding convention, CI step, or key decision. NEVER defer these updates to the end of the session.
<done_when>Gaps surfaced are filled inline; codebase facts are recorded as learned.</done_when>
</step>

<step n="3" name="enforce_editing_rules" gate="HARD-GATE">
Non-negotiable constraints on every edit:
1. NEVER delete or overwrite past daily notes. Append-only.
2. MAINTAIN links. Every link MUST point to an existing target. UPDATE all inbound links when renaming, moving, or deleting files.
3. NEVER write to Jira or Confluence without explicit user approval.
<done_when>All edits in the session satisfy these three rules.</done_when>
</step>

<step n="4" name="enforce_security_gdpr" gate="HARD-GATE">
Full detail: [`.opencode/reference/security-rules.md`](.opencode/reference/security-rules.md). Non-negotiable in all sessions.

**Security:**
- NEVER mutate production systems without explicit user approval.
- NEVER write secrets, tokens, or API keys into source files, commit messages, or log statements.
- NEVER pass secrets as inline shell arguments — USE environment variables.
- NEVER add `sudo` to application code without flagging the user.
- NEVER force-push to `main` or `master`.
- NEVER bypass security controls (`--no-verify`, disabled hooks) without explicit approval.
- VERIFY before any destructive operation (`rm -rf`, `DROP TABLE`, bulk updates) — show scope and confirm.

**GDPR:**
- NEVER commit PII (email addresses, phone numbers, home addresses) to git.
- In resource articles and notes, USE professional context only — name + role, NOT personal contact data.
- CONFIRM before writing personal data beyond name + role to Confluence or Jira.
- When ingesting Confluence/Jira content, STRIP personal contact info before storing in resources.
<done_when>No action in the session violates any security or GDPR rule.</done_when>
</step>

</steps>

<error_handling>

- **`context/context.md` missing or empty** → Direct user to `/bootstrap`. DO NOT proceed with context-dependent tasks.
- **`codebases/<name>.md` missing for active repo** → Create it before proceeding. If fields are unknown, ASK the user — NEVER invent.
- **Broken inbound link after rename/move/delete** → Fix all inbound references in the same edit; NEVER leave dangling links.
- **Uncertainty about write to Jira/Confluence** → STOP and request explicit approval.
- **Uncertainty about destructive operation** → STOP, show scope, request confirmation.

</error_handling>

<contracts>

- Append-only for daily notes.
- Every link resolves to an existing target.
- No writes to Jira or Confluence without explicit user approval.
- No secrets in source, commits, logs, or inline shell arguments.
- No force-push to `main` / `master`.
- No PII in git; professional context only in resources.

</contracts>

<subagents>

Sub-agent definitions live in `.opencode/agents/`. Invoke via the `task` tool with a specialized `subagent_type`. Current agents: `code-reviewer`, `confluence-fetcher`, `explore`, `general`, `graph-auditor`, `url-fetcher`.

</subagents>

<next_steps>

- Load required skill(s) via the `skill` tool when a task matches an available skill's description.
- Dispatch lifecycle work through `/do <phase>`; knowledge-graph work through `/r <operation>`; daily work through direct commands.
- Consult `.opencode/reference/` for structure, conventions, and security detail on demand.

</next_steps>

<output_rules>

- Respond in English unless the user writes in another language.
- Keep root-level guidance concise; defer detail to skills, workflows, and reference files.
- NEVER output `<dcp-message-id>` or `<dcp-system-reminder>` tags — they are environment metadata.

</output_rules>
