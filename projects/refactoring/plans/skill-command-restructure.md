---
title: "Skill & Command Restructure — Implementation Plan"
status: draft
spec: "specs/skill-command-restructure.md"
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Skill & Command Restructure — Implementation Plan

## Block 1 — Create `scm` skill (merges glab + github)

- [ ] T1. Create `scm/SKILL.md`
  - **Files:** `.opencode/skills/scm/SKILL.md` (new)
  - **Changes:** Write merged skill from glab/SKILL.md + github/SKILL.md. Structure: Related Skills table (conventions→reference, security→reference, jira, worktrunk); platform-tagged sections `[GitLab]`/`[GitHub]` for MR/PR, CI/Actions, Issues, API access; Common Workflows (merged, platform-tagged); Troubleshooting table; Rules. Remove all "When to load" and setup sections. Update `address-review` reference → `workflow/address-review`. Update `conventions` reference → `.opencode/reference/conventions.md`. Update `security` reference → `.opencode/reference/security-rules.md`.

- [ ] T2. Create `scm/reference/workflows.md`
  - **Files:** `.opencode/skills/scm/reference/workflows.md` (new)
  - **Changes:** Extract Common Workflows from glab + github into one reference file, platform-tagged.

## Block 2 — Promote thinking + address-review as workflow sub-skills

- [ ] T3. Create `workflow/thinking.md`
  - **Files:** `.opencode/skills/workflow/thinking.md` (new)
  - **Changes:** Copy content of `thinking/SKILL.md`. Delete lines 12-19 ("When to Load" table). Keep five phases (Frame, Research, Compare, Plan, Verify) and Rules.

- [ ] T4. Create `workflow/address-review.md`
  - **Files:** `.opencode/skills/workflow/address-review.md` (new)
  - **Changes:** Copy content of `address-review/SKILL.md` verbatim (no "when to use" section existed). Update internal `glab`/`github` skill references → `scm`.

## Block 3 — Demote conventions + security to reference files

- [ ] T5. Create `.opencode/reference/conventions.md`
  - **Files:** `.opencode/reference/conventions.md` (new)
  - **Changes:** Copy full content of `conventions/SKILL.md` (strip YAML frontmatter skill metadata if present; retain all reference tables, format, examples, rules, finding Jira key).

- [ ] T6. Create `.opencode/reference/security-rules.md`
  - **Files:** `.opencode/reference/security-rules.md` (new)
  - **Changes:** Copy full content of `security/SKILL.md` (9 hard rules, AWS/cloud section, secrets section with bash examples, red flags table).

## Block 4 — Extract reference files from existing skills

- [ ] T7. Create `jira/reference/jql-patterns.md`
  - **Files:** `.opencode/skills/jira/reference/jql-patterns.md` (new)
  - **Changes:** Extract from `jira/SKILL.md`: Common JQL patterns table (lines 62-69), Sprint and Board Queries section (lines 97-114), Morning Planning Queries section (lines 151-163).

- [ ] T8. Create `worktrunk/reference/commands.md`
  - **Files:** `.opencode/skills/worktrunk/reference/commands.md` (new)
  - **Changes:** Extract full Commands section from `worktrunk/SKILL.md` (lines 9-183): wt switch, wt list, wt merge, wt remove, wt step, wt hook, wt config — all with flags tables.

- [ ] T9. Create `repomix/reference/reference.md`
  - **Files:** `.opencode/skills/repomix/reference/reference.md` (new)
  - **Changes:** Extract from `repomix/SKILL.md`: Useful Flags table (lines 75-93), Grep Patterns section (lines 109-142), Error Handling table (lines 190-196).

- [ ] T10. Create `confluence/reference/search-strategies.md`
  - **Files:** `.opencode/skills/confluence/reference/search-strategies.md` (new)
  - **Changes:** Extract from `confluence/SKILL.md`: search commands (lines 62-76) and search strategies table (lines 79-83).

- [ ] T11. Create `project/reference/lifecycle.md`
  - **Files:** `.opencode/skills/project/reference/lifecycle.md` (new)
  - **Changes:** Extract from `project/SKILL.md`: Status Transitions table (lines 128-132), Archiving steps (lines 134-143), Cross-Linking table (lines 148-154).

- [ ] T12. Create `qmd/reference/query-guide.md`
  - **Files:** `.opencode/skills/qmd/reference/query-guide.md` (new)
  - **Changes:** Extract from `qmd/SKILL.md`: Writing Good Queries (lines 42-57), Combining Types table (lines 64-73), Lex Query Syntax table (lines 75-83), Intent section (lines 84-91).

- [ ] T13. Create `writing/reference/style-guide.md`
  - **Files:** `.opencode/skills/writing/reference/style-guide.md` (new)
  - **Changes:** Extract from `writing/SKILL.md`: Language & Style (lines 65-76), Structure (lines 78-83), Formatting (lines 85-90).

- [ ] T14. Create `.opencode/reference/bootstrap-questions.md`
  - **Files:** `.opencode/reference/bootstrap-questions.md` (new)
  - **Changes:** Extract from `bootstrap.md` command: Steps 3b-3f content (lines 90-155) — the detailed question prompts for coding context files.

- [ ] T15. Create `.opencode/reference/env-tools.md`
  - **Files:** `.opencode/reference/env-tools.md` (new)
  - **Changes:** Extract from `check-env.md` command: tool version-check table (lines 11-19).

## Block 5 — Delete old skill directories

- [ ] T16. Delete `glab/` skill directory
  - **Files:** `.opencode/skills/glab/` (delete)
  - **Changes:** `rm -rf .opencode/skills/glab`

- [ ] T17. Delete `github/` skill directory
  - **Files:** `.opencode/skills/github/` (delete)
  - **Changes:** `rm -rf .opencode/skills/github`

- [ ] T18. Delete `thinking/` skill directory
  - **Files:** `.opencode/skills/thinking/` (delete)
  - **Changes:** `rm -rf .opencode/skills/thinking`

- [ ] T19. Delete `address-review/` skill directory
  - **Files:** `.opencode/skills/address-review/` (delete)
  - **Changes:** `rm -rf .opencode/skills/address-review`

- [ ] T20. Delete `conventions/` skill directory
  - **Files:** `.opencode/skills/conventions/` (delete)
  - **Changes:** `rm -rf .opencode/skills/conventions`

- [ ] T21. Delete `security/` skill directory
  - **Files:** `.opencode/skills/security/` (delete)
  - **Changes:** `rm -rf .opencode/skills/security`

## Block 6 — Edit existing skill files (strip + add reference links)

- [ ] T22. Edit `jira/SKILL.md`
  - **Files:** `.opencode/skills/jira/SKILL.md`
  - **Changes:** Delete Setup section (lines 7-17). Delete Common JQL patterns table (lines 62-69) — replace with link to `jira/reference/jql-patterns.md`. Delete Sprint and Board Queries section (lines 97-114) — replace with link. Delete Morning Planning Queries section (lines 151-163) — replace with link.

- [ ] T23. Edit `worktrunk/SKILL.md`
  - **Files:** `.opencode/skills/worktrunk/SKILL.md`
  - **Changes:** Delete Commands section (lines 9-183) — replace with one-line link to `worktrunk/reference/commands.md`.

- [ ] T24. Edit `repomix/SKILL.md`
  - **Files:** `.opencode/skills/repomix/SKILL.md`
  - **Changes:** Delete Useful Flags table (lines 75-93) — replace with link to `repomix/reference/reference.md`. Delete Grep Patterns section (lines 109-142) — replace with link. Delete Error Handling table (lines 190-196) — replace with link. Update `security` skill reference on line 208 → `.opencode/reference/security-rules.md`.

- [ ] T25. Edit `confluence/SKILL.md`
  - **Files:** `.opencode/skills/confluence/SKILL.md`
  - **Changes:** Delete Setup section (lines 7-25). Delete search commands (lines 62-76) and strategies table (lines 79-83) — replace with link to `confluence/reference/search-strategies.md`.

- [ ] T26. Edit `project/SKILL.md`
  - **Files:** `.opencode/skills/project/SKILL.md`
  - **Changes:** Delete Status Transitions table (lines 128-132) — replace with link to `project/reference/lifecycle.md`. Delete Archiving steps (lines 134-143) — replace with link. Delete Cross-Linking table (lines 148-154) — replace with link. Delete Changelog section (ephemeral noise).

- [ ] T27. Edit `qmd/SKILL.md`
  - **Files:** `.opencode/skills/qmd/SKILL.md`
  - **Changes:** Delete Writing Good Queries (lines 42-57) — replace with link to `qmd/reference/query-guide.md`. Delete Combining Types table (lines 64-73) — replace with link. Delete Lex Query Syntax table (lines 75-83) — replace with link. Delete Intent section (lines 84-91) — replace with link. Delete Setup section (lines 103-110).

- [ ] T28. Edit `writing/SKILL.md`
  - **Files:** `.opencode/skills/writing/SKILL.md`
  - **Changes:** Delete Language & Style (lines 65-76) — replace with link to `writing/reference/style-guide.md`. Delete Structure (lines 78-83) — replace with link. Delete Formatting (lines 85-90) — replace with link. Delete "When to use me" section (lines 122-130).

## Block 7 — Edit command files

- [ ] T29. Edit `morning.md`
  - **Files:** `.opencode/commands/morning.md`
  - **Changes:** Delete Step 5b inline Jira bash block (lines 16-21) — replace with: `Load the \`jira\` skill for query commands.`

- [ ] T30. Edit `standup.md`
  - **Files:** `.opencode/commands/standup.md`
  - **Changes:** Delete Step 3b inline Jira bash block (lines 12-16) — replace with: `Load the \`jira\` skill for query commands.`

- [ ] T31. Edit `bootstrap.md`
  - **Files:** `.opencode/commands/bootstrap.md`
  - **Changes:** Replace Steps 3b-3f content (lines 90-155) with a reference to `.opencode/reference/bootstrap-questions.md`.

- [ ] T32. Edit `check-env.md`
  - **Files:** `.opencode/commands/check-env.md`
  - **Changes:** Replace tool table (lines 11-19) with a reference to `.opencode/reference/env-tools.md`.

- [ ] T33. Edit `address-review.md` command
  - **Files:** `.opencode/commands/address-review.md`
  - **Changes:** Update line 10: skill reference `address-review` → `workflow/address-review`.

## Block 8 — Update infrastructure files

- [ ] T34. Edit `workflow/SKILL.md`
  - **Files:** `.opencode/skills/workflow/SKILL.md`
  - **Changes:** Add two rows to Sub-skills table: `thinking` (sub-skill file `workflow/thinking`, trigger: structured reasoning for complex decisions, depends on `workflow`) and `address-review` (sub-skill file `workflow/address-review`, trigger: addressing review comments on MR/PR, depends on `workflow` + `scm`).

- [ ] T35. Edit `AGENTS.md`
  - **Files:** `AGENTS.md`
  - **Changes:** Delete entire `## Skill Dispatch` section (lines 118-138). Redundant — OpenCode already injects `available_skills` from skill frontmatter into every session.

## Block 9 — Update README

- [ ] T36. Edit `README.md`
  - **Files:** `README.md`
  - **Changes:** Update skills section: reflect merged `scm` skill, demoted `conventions`/`security` to reference files, `thinking`/`address-review` as workflow sub-skills.

## Block 10 — Verification

- [ ] T37. Verification pass
  - **Files:** All modified files
  - **Changes:** Grep for remaining references to deleted skills (`glab`, `github`, `address-review`, `conventions`, `security`, `thinking` as standalone skills). Confirm all links to reference files are correct.

## Test Strategy

No automated tests. Verification is manual:
1. After T37, grep for stale skill references across commands and skills.
2. Spot-check 3 reference files to confirm extracted content is complete.
3. Confirm AGENTS.md available_skills list matches actual skill directories.

## Risks

- **Content loss during extraction:** Mitigated by extracting before deleting, and doing blocks in order (create → delete → edit → wire).
- **Stale cross-references:** Mitigated by T37 verification grep pass.
- **scm skill usability:** Merging glab + github into one file with platform tags may add cognitive overhead. Mitigated by clear `[GitLab]` / `[GitHub]` section headers throughout.
