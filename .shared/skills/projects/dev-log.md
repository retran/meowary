---
name: projects/dev-log
description: Dev-log entry format — canonical entry structure, append procedure, and phase-specific field sets. Load when writing a dev-log entry at the close of any lifecycle workflow phase.
compatibility: opencode
updated: 2026-04-18
---

<role>Dev-log steward — sole persistent cross-session record of project work.</role>

<summary>
> `dev-log.md` is append-only episodic log. Each lifecycle workflow writes one entry at Close. Entry records phase run, accomplishment, suggested next step. Next session reads last entry to re-establish context without user explanation.
</summary>

<file_location>
```
projects/<name>/dev-log.md
```

One per project. Created when project is created. NEVER deleted.
</file_location>

<file_structure>
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

Entries in **reverse-chronological order** — newest at top. Step 0 reads "last entry" via first `##`-level heading after front matter.
</file_structure>

<entry_format>
Every lifecycle workflow writes exactly one entry at Close. Skeleton:

```markdown
## <date> — /<workflow> — <topic>
**Phase:** <phase-name>
**Duration:** <estimate>
**Summary:** <1–2 sentences: what was done or decided>
**Next:** <suggested workflow or action>
```

### Field rules

| Field | Rules |
|-------|-------|
| `<date>` | ISO 8601 (`YYYY-MM-DD`) |
| `/<workflow>` | Workflow name, e.g. `/scout`, `/implement`, `/debug` |
| `<topic>` | 2–6 words; kebab-case |
| `**Phase:**` | Matches workflow: `scout`, `research`, `brainstorm`, `plan`, `design`, `write`, `implement`, `test`, `self-review`, `resolve`, `debug`, `peer-review` |
| `**Duration:**` | Rough estimate: `~15 min`, `~1 hr`, `~3 hrs` |
| `**Summary:**` | Present tense, 1–2 sentences |
| `**Next:**` | Workflow/action that logically follows — suggestion, not command |

### Workflow-specific optional fields

Some workflows add fields between `**Summary:**` and `**Next:**`:

| Workflow | Extra fields |
|----------|-------------|
| `/scout` | `**Gaps:**` — what's missing/unknown |
| `/debug` | `**Root cause:**` — one sentence; `**Fix applied:**`; `**Systemic issue:**` yes/no |
| `/implement` | `**Commit:**` — hash or message |
| `/design` | `**Decision:**` — one sentence |
| `/plan` | `**Scope:**`; `**Next action:**` |
| `/test` | `**Outcome:**` pass/fail; `**Regressions:**` count or "none" |

DO NOT add fields not listed without good reason. KEEP entries lean.
</entry_format>

<append_procedure>
1. Prepare new entry as Markdown block.
2. Read current `dev-log.md`.
3. Insert immediately after front matter `---` and `# Dev Log:` H1, before all existing entries.
4. Update `updated` in front matter to today.
5. NEVER remove or edit existing entries.
</append_procedure>

<reading_last_entry>
Step 0 of every lifecycle workflow reads last `dev-log.md` entry. Newest-first → "last entry" = first `##` heading after front matter and H1.

Extract:
- Current phase (`**Phase:**`)
- Last accomplished (`**Summary:**`)
- Suggested next (`**Next:**`)
- Workflow-specific fields (e.g. `**Gaps:**` from `/scout`)

If `dev-log.md` missing/empty: no prior work. Treat as fresh start; ASK user for context.
</reading_last_entry>

<resources_log_variant>
Knowledge graph workflows (`/r`) write to `meta/resources-log.md` instead of project `dev-log.md`.

Format:
```
- **YYYY-MM-DD:** <operation> | <subject> — <one-line summary>
```

Example:
```
- **2026-04-07:** r-enrich | resources/tools/github.md — enriched with API rate limit facts from Confluence
```

Flat bullet log, NOT structured entry. The `/r` router reads on startup if exists.
</resources_log_variant>

<self_review>
- [ ] Heading uses `## YYYY-MM-DD — /<workflow> — <topic>` format?
- [ ] `**Phase:**`, `**Duration:**`, `**Summary:**`, `**Next:**` all present?
- [ ] Inserted at top (newest-first)?
- [ ] `updated` in front matter set to today?
- [ ] No existing entries modified or deleted?
</self_review>

<output_rules>
Output language: English. Frontmatter, headings, fields remain English.
</output_rules>
