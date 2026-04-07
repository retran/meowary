---
name: codebases
description: Codebase context file format, lifecycle, and enrichment rules — architecture, tech stack, build commands, test setup, coding conventions, CI, and key decisions. Load when working in any external codebase, reading or writing a codebases/<name>.md file, or when codebase-specific conventions, build commands, or architecture context are needed.
compatibility: opencode
---

## Philosophy

`codebases/<name>.md` is the authoritative context file for a single external codebase. It replaces the need for separate architecture, coding-style, and testing context files — everything codebase-specific lives here. There is one file per codebase, named after the repo or project slug (e.g. `codebases/my-api.md`).

The file is a living document: start thin on first contact, enrich continuously as knowledge accumulates. Never invent values — record only what has been confirmed from the codebase or from the user.

## When to create

Create a new `codebases/<name>.md` when:
- Starting work in a codebase for the first time (during `/bootstrap` or session start).
- A codebase appears in `context/context.md § Codebases` but no file exists yet.

If the file is missing and codebase work is requested: create it with the available facts before proceeding. Stubs are acceptable — record what you know, leave unknowns blank.

## File format

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
<One paragraph: what this codebase is, its purpose, repo URL or local path.>

## Tech Stack
- **Language(s):** <e.g. TypeScript, Python>
- **Runtime:** <e.g. Node 20, Python 3.12>
- **Framework(s):** <e.g. Next.js, FastAPI>
- **Key libraries:** <list>
- **Package manager:** <e.g. pnpm, uv>

## Architecture
<Key components, directory structure, data flow. Link to ADRs in projects/ if applicable.>

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
<Pipeline overview: what runs on PR, what runs on merge, deployment targets.>

## Coding Conventions
<Language-specific idioms, naming rules, import order, error handling patterns, formatting tool and config.>

## Key Decisions
<Links to ADRs or brief notes on significant past decisions. Append; never delete.>

## Component Ownership
<Which teams or individuals own which parts of the codebase, if known.>
```

## Update rules

Update `codebases/<name>.md` immediately — during the session, not at the end — whenever you learn:
- A build or test command.
- An architecture component or directory purpose.
- A coding convention or idiom.
- A CI step or deployment target.
- A key decision or constraint.

If a section is empty and the information surfaces during work, fill it in. Leaving a section empty when the answer is known is a gap.

## Registration in context/context.md

Every codebase file must have a corresponding entry in `context/context.md § Codebases`:

```markdown
## Codebases

- **<name>:** <local path> — [`codebases/<name>.md`](../codebases/<name>.md)
```

Add the entry when creating the file. Keep the path accurate.

## Blank template

Use `.opencode/skills/codebases/codebase-template.md` as the base when creating a new `codebases/<slug>.md`.
