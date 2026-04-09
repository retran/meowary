---
name: projects/dev-log
description: Dev-log entry format — canonical entry structure, append procedure, and phase-specific field sets. Load when writing a dev-log entry at the close of any lifecycle workflow phase.
compatibility: opencode
---

## Purpose

`dev-log.md` is the **sole persistent cross-session record** for a project. It is an append-only episodic log. Each lifecycle workflow writes one entry at its Close step. The entry records what phase was run, what was accomplished, and what the suggested next step is. The next session reads the last entry to re-establish context without requiring the user to explain the project state.

---

## File Location

```
projects/<name>/dev-log.md
```

One `dev-log.md` per project. Created when the project is created. Never deleted.

---

## File Structure

```markdown
---
updated: YYYY-MM-DD
tags: [dev-log, <project-slug>]
---

# Dev Log: <project-name>

## YYYY-MM-DD — /<workflow> — <topic>
**Phase:** <phase-name>
**Duration:** <estimate>
**Summary:** <1–2 sentences>
**Next:** <suggested next workflow or action>

## YYYY-MM-DD — /<workflow> — <topic>
...
```

Entries are in **reverse-chronological order** — newest entry at the top. This allows Step 0 of any lifecycle workflow to read "last entry" by reading the first `##`-level heading after the front matter.

---

## Entry Format

Every lifecycle workflow writes exactly one entry at the Close step. The entry format varies slightly per workflow but follows this skeleton:

```markdown
## <date> — /<workflow> — <topic>
**Phase:** <phase-name>
**Duration:** <estimate>
**Summary:** <1–2 sentences: what was done or decided>
**Next:** <suggested workflow or action>
```

### Common field values

| Field | Rules |
|-------|-------|
| `<date>` | ISO 8601 (`YYYY-MM-DD`) |
| `/<workflow>` | Workflow name, e.g. `/scout`, `/implement`, `/debug` |
| `<topic>` | 2–6 words describing the subject; kebab-case |
| `**Phase:**` | Matches the workflow name: `scout`, `research`, `brainstorm`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review` |
| `**Duration:**` | Rough estimate: `~15 min`, `~1 hr`, `~3 hrs` |
| `**Summary:**` | Present tense, 1–2 sentences: what was produced, decided, or found |
| `**Next:**` | The workflow or action that logically follows — a suggestion, not a command |

### Workflow-specific optional fields

Some workflows add extra fields between `**Summary:**` and `**Next:**`:

| Workflow | Extra fields |
|----------|-------------|
| `/scout` | `**Gaps:**` — what is missing or unknown |
| `/debug` | `**Root cause:**` — one sentence; `**Fix applied:**` — what was changed; `**Systemic issue:**` yes/no |
| `/implement` | `**Commit:**` — commit hash or message |
| `/design` | `**Decision:**` — one sentence on what was chosen |
| `/plan` | `**Scope:**` — what is in scope; `**Next action:**` — first implementation step |
| `/test` | `**Outcome:**` — pass/fail summary; `**Regressions:**` — count or "none" |

Do not add fields not listed here without a good reason. Keep entries lean.

---

## Append Procedure

1. Prepare the new entry as a Markdown block (see format above).
2. Read the current `dev-log.md`.
3. Insert the new entry **immediately after the front matter block** (after the closing `---` and the `# Dev Log: <name>` heading), before all existing entries.
4. Update the `updated` field in the front matter to today's date.
5. Do not remove or edit existing entries.

---

## Reading the Last Entry

Step 0 of every lifecycle workflow reads the last `dev-log.md` entry. Since entries are newest-first, "last entry" = the first `##`-level heading encountered after the front matter and H1.

Extract:
- Current phase (`**Phase:**`)
- What was last accomplished (`**Summary:**`)
- Suggested next action (`**Next:**`)
- Any workflow-specific fields (e.g. `**Gaps:**` from `/scout`)

If `dev-log.md` does not exist or is empty, the project has no prior work recorded. Treat as a fresh start and ask the user for context.

---

## `meta/resources-log.md` — Knowledge Graph Variant

Knowledge graph workflows (`/r`) write to `meta/resources-log.md` instead of a project `dev-log.md`.

Format:
```
- **YYYY-MM-DD:** <operation> | <subject> — <one-line summary>
```

Example:
```
- **2026-04-07:** r-enrich | resources/tools/github.md — enriched with API rate limit facts from Confluence
```

This is a flat bullet log, not a structured entry format. The `/r` router reads it on startup if it exists.

---

## Editor Checklist (run silently before writing any dev-log entry)

- [ ] Entry uses `## YYYY-MM-DD — /<workflow> — <topic>` heading format?
- [ ] `**Phase:**`, `**Duration:**`, `**Summary:**`, `**Next:**` fields all present?
- [ ] Entry is inserted at the top (newest-first order)?
- [ ] `updated` in front matter updated to today?
- [ ] No existing entries modified or deleted?
