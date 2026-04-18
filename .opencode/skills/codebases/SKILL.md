---
name: codebases
description: Codebase context file format, lifecycle, and enrichment rules — architecture, tech stack, build commands, test setup, coding conventions, CI, and key decisions. Load when working in any external codebase, reading or writing a codebases/<name>.md file, or when codebase-specific conventions, build commands, or architecture context are needed.
compatibility: opencode
updated: 2026-04-18
---

<role>Codebase context file authority — one file per external codebase at `codebases/<slug>.md`.</role>

<summary>
> One authoritative file per codebase. Replaces separate architecture/style/test context files. Living document: thin on first contact, enrich continuously. NEVER invent values — record only confirmed facts.
</summary>

<triggers>
Create `codebases/<name>.md` when:
- Starting work in a codebase for the first time (during `/bootstrap` or session start).
- A codebase appears in `context/context.md § Codebases` but no file exists.

If missing when codebase work requested: create with available facts before proceeding. Stubs OK — leave unknowns blank.
</triggers>

<file_format>

### Front matter

```yaml
---
type: codebase
codebase: <slug>
path: codebases/<slug>.md
updated: YYYY-MM-DD
apply-when: Working in the <slug> codebase
tags: []
---
```

### Sections

```markdown
# Codebase: <name>

## Overview
<One paragraph: purpose, repo URL or local path.>

## Tech Stack
- **Language(s):** <e.g. TypeScript, Python>
- **Runtime:** <e.g. Node 20, Python 3.12>
- **Framework(s):** <e.g. Next.js, FastAPI>
- **Key libraries:** <list>
- **Package manager:** <e.g. pnpm, uv>

## Architecture
<Components, directory structure, data flow. Link to ADRs in projects/ if applicable.>

## Build & Run
- **Install:** `<command>`
- **Dev server:** `<command>`
- **Build:** `<command>`
- **Lint:** `<command>`
- **Type check:** `<command>`

## Test
- **Framework:** <e.g. Vitest, pytest>
- **Run all:** `<command>`
- **Run single:** `<command>`
- **File convention:** <e.g. `*.test.ts` co-located, `tests/` directory>
- **Coverage:** <policy or threshold>

## CI/CD
<Pipeline: PR runs, merge runs, deployment targets.>

## Coding Conventions
<Idioms, naming, import order, error handling, formatting tool/config.>

## Key Decisions
<ADR links or brief notes. Append; never delete.>

## Component Ownership
<Team/individual ownership by area, if known.>
```

</file_format>

<update_rules>
Update IMMEDIATELY during session (NOT at end) when you learn:
- Build or test command
- Architecture component or directory purpose
- Coding convention or idiom
- CI step or deployment target
- Key decision or constraint

Empty section + known answer = gap. Fill it.
</update_rules>

<registration>
Every codebase file MUST have an entry in `context/context.md § Codebases`:

```markdown
## Codebases

- **<name>:** <local path> — [`codebases/<name>.md`](../codebases/<name>.md)
```

Add when creating file. Keep path accurate.
</registration>

<template>
Use `.opencode/skills/codebases/codebase-template.md` as base.
</template>

<self_review>
- [ ] Front matter complete: `type: codebase`, `codebase`, `path`, `updated`, `apply-when`, `tags`?
- [ ] `updated` set to today?
- [ ] All sections populated — no empty sections?
- [ ] Build/test commands verified with user?
- [ ] Architecture reflects current understanding?
- [ ] No secrets or credentials?
</self_review>

<output_rules>Output in English. Preserve verbatim paths, commands, and YAML keys.</output_rules>
