---
title: "Skill & Command Restructure for Token Reduction"
status: draft
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Skill & Command Restructure for Token Reduction

## Problem

Skills and commands load more tokens than necessary per session. Two distinct causes:

1. **Oversized skills** — many skill files mix workflow instructions (session-relevant) with static reference material (CLI flags, JQL patterns, error tables, command signatures). The reference material is loaded even when only the workflow steps are needed.
2. **Redundant skills** — several top-level skills overlap in scope or are pure reference data with no workflow logic, making them candidates for merging, demotion to reference files, or absorption into existing skills.

Current worst offenders by line count: `worktrunk` (237), `address-review` (245), `jira` (218), `repomix` (209), `github` (205), `glab` (235). `bootstrap` command (198 lines) is also a major outlier.

## Constraints

- **[VERIFIED]** Progressive disclosure is the governing principle: AGENTS.md → skill → reference file. A skill must remain the entry point; reference files are opt-in.
- **[VERIFIED]** Sub-skill trigger tables in parent SKILL.md files must use `Trigger | Sub-skill` column headers (already normalized).
- **[VERIFIED]** Every Markdown file must have YAML front matter with `updated` and `tags`.
- **[VERIFIED]** No existing skill should become unreachable — if content moves to a reference file, the skill must link to it explicitly.
- **[VERIFIED]** Setup and installation instructions do not belong in skills at all — they are one-time operations and are never needed during a session.
- **[VERIFIED]** "When to load" / "When to use" sections inside skill bodies are duplication — trigger information belongs in frontmatter `description` and parent sub-skill trigger tables only. Delete these sections wherever found.
- **[VERIFIED]** `glab` and `github` share identical section headings (MR/PR lifecycle, CI pipelines, issues, common workflows, rules); platform differences are CLI flag-level only.

## Concern 1: Oversized Skills — Reference Extraction

**What stays in a skill:** workflow steps, rules.
**What moves to a reference file:** lookup tables, code blocks, exhaustive command lists.
**What gets deleted entirely:**
- Setup and installation instructions — one-time operations, never needed during a session.
- "When to load" / "When to use" / "When to use me" sections — trigger information belongs in frontmatter `description` and parent sub-skill trigger tables only.

Tool skills with setup sections to delete: `confluence`, `jira`, `glab`, `github`, `repomix`.
Skills with "When to load/use" sections to delete: audit all skills during implementation.

| Skill / Command | What to extract to reference | What to delete |
|---|---|---|
| `jira/SKILL.md` | JQL patterns table, sprint/board query examples → `jira/reference/jql-patterns.md` | Setup / install section |
| `glab/SKILL.md` | Common workflows table, error/troubleshooting table → `scm/reference/workflows.md` | Setup / auth section |
| `github/SKILL.md` | Common workflows table, API access patterns → `scm/reference/workflows.md` | Setup / auth section |
| `worktrunk/SKILL.md` | Full command reference → `worktrunk/reference/commands.md` | — |
| `repomix/SKILL.md` | Flags table, grep patterns, error handling table → `repomix/reference/reference.md` | Setup / install section |
| `confluence/SKILL.md` | Search strategy table → `confluence/reference/search-strategies.md` | Setup / install section |
| `project/SKILL.md` | Status transitions, archiving steps, cross-linking rules → `project/reference/lifecycle.md` | — |
| `qmd/SKILL.md` | Query writing guide (lex/vec/hyde examples, combining types) → `qmd/reference/query-guide.md` | — |
| `writing/SKILL.md` | Language & Style + Formatting sections → `writing/reference/style-guide.md` | — |
| `bootstrap` command | Per-file question sets for Steps 3b–3f → `.opencode/reference/bootstrap-questions.md` | — |
| `check-env` command | Tool version-check table → `.opencode/reference/env-tools.md` | — |
| `morning` + `standup` commands | — | Inline Jira bash commands (point to jira skill instead) |

## Concern 2: Redundant Skills — Merges and Demotions

### Option A: Aggressive merge + demotion

Merge `glab` and `github` into a single `scm` skill with platform-specific sections. Demote `conventions` and `security` to reference files. Absorb `thinking` as `workflow/thinking` sub-skill. Absorb `address-review` as `workflow/address-review` sub-skill.

**Pros:**
- Eliminates 4 top-level skill entries → shorter AGENTS.md skill dispatch table
- `conventions` and `security` as reference files match their content type (pure rules/lookup — zero workflow logic) **[VERIFIED]**
- `thinking` and `address-review` as `workflow` sub-skills makes the skill hierarchy coherent; `address-review` already carries `depends_on: workflow` frontmatter **[VERIFIED]**
- `scm` eliminates genuine duplication: identical section headings across `glab`/`github` currently maintained in two places **[VERIFIED]**

**Cons:**
- `scm` skill would be ~300 lines after reference extraction — still large but navigable with clear platform sections
- `/glab` and `/github` commands need renaming/updating to `/scm`
- `thinking` has standalone value outside software workflows; placing it under `workflow` limits its trigger surface

**Effort:** large
**Risk:** `scm` merge is the main risk — if platform sections diverge significantly, the merged file becomes harder to maintain. `/glab`/`/github` command renaming requires AGENTS.md + command file updates.

### Option B: Selective demotion only

Demote `conventions` and `security` to reference files. Keep `glab`, `github`, `thinking` as top-level skills. Absorb `address-review` into `workflow`. Apply all Concern 1 extractions.

**Pros:** Lower risk, no command renames.

**Cons:** `glab`/`github` duplication persists. `thinking`/`workflow/brainstorm` overlap persists.

**Effort:** medium
**Risk:** Low.

### Option C: Reference extraction only

Apply Concern 1 extractions, no structural changes to skill hierarchy.

**Pros:** Zero structural risk.
**Cons:** Leaves all redundancy untouched; `conventions` and `security` remain as skills despite having no workflow content.

**Effort:** medium
**Risk:** Very low.

## Recommendation

**Option A + all Concern 1 extractions.**

Rationale:
- Reference extraction is the primary token win across the largest skills; do this regardless of which redundancy option is chosen.
- `glab`/`github` merger is justified: their content is genuinely duplicated at the section level, and after reference extraction they will be thin enough that a merged `scm` skill with platform-tagged sections is navigable.
- `conventions` and `security` demotions are correct on principle — they are reference data, not workflows.
- `address-review` and `thinking` as `workflow` sub-skills is the structurally coherent choice. `thinking` loses some standalone breadth, but in practice it is always invoked in a task context anyway.
- The `/glab` → `/scm` and `/github` → `/scm` command updates are mechanical and low-risk.

## Resolved Questions

1. **`morning`/`standup` inline Jira commands** — Remove entirely; add pointer to jira skill. Dual-maintenance is a liability; the jira skill is the canonical source.
2. **`worktrunk` after extraction** — Keep as a skill. ~30-40 lines of workflow steps (create, switch, merge, remove) are session-relevant and justify a standalone skill entry.
3. **`bootstrap` question sets** — One combined reference file: `.opencode/reference/bootstrap-questions.md`. Bootstrap runs once; a single file is easier to find and maintain than five per-file companions.
4. **`writing` extractable content** — Yes: Language & Style + Formatting → `writing/reference/style-guide.md`. Structure section stays in the skill (decision-relevant during writing, not lookup).
