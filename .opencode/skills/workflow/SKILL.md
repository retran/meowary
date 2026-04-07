---
name: workflow
description: Structured workflows for software engineering and document authoring — brainstorm, plan, implement, review, debug phases with hard approval gates. Use when brainstorming, planning, implementing, reviewing, or debugging code or documents.
compatibility: opencode
---

# Skill: workflow

Structured workflows for software engineering and document authoring tasks. Each phase produces artifacts, and hard gates ensure user approval before moving to the next phase.

## Modes

The workflow operates in two modes, inferred from context:

| Mode | Trigger | Artifacts |
|------|---------|-----------|
| **Code** | Task targets an external repository or involves writing code | Specs, plans, code changes |
| **Document** | Task targets journal content: ADR, proposal, RFC, resource article, blog post | Specs, plans, written documents |

**Detection:** If the user specifies a target repository or the task involves code changes, use code mode. If the task involves writing a document within the journal (or for external publication via `drafts/`), use document mode. When ambiguous, ask.

## Sub-skills

Load these on top of `workflow` for specific phases:

| Trigger | Sub-skill |
|---------|-----------|
| Exploring a problem space, generating solution options | `workflow/brainstorm` ([brainstorm.md](brainstorm.md)) |
| Creating an implementation plan from an approved spec | `workflow/plan` ([plan.md](plan.md)) |
| Building from an approved plan | `workflow/implement` ([implement.md](implement.md)) |
| Reviewing code changes or documents | `workflow/review` ([review.md](review.md)) |
| Investigating a bug or error | `workflow/debug` ([debug.md](debug.md)) |

## Workflow

```
brainstorm → [GATE] → plan → [GATE] → implement → review
                                         ↑
                        debug ────────────┘
```

Each phase can be used standalone. Not every task needs all phases — simple bug fixes skip brainstorm/plan; well-understood features can skip brainstorm.

## Context Loading

Before starting any workflow phase, load relevant context files from the repo root:

| Phase | Files to load |
|-------|--------------|
| Brainstorm | `architecture.md`, `patterns.md` |
| Plan | `architecture.md`, `patterns.md`, `testing.md` |
| Implement | `style.md`, `patterns.md`, `testing.md`, `safety.md` |
| Review | `style.md`, `patterns.md`, `testing.md`, `safety.md` |
| Debug | `architecture.md`, `patterns.md` |

If working in an external repo, check for equivalent context files there first. Fall back to gathering conventions from `AGENTS.md`, linter configs, and existing code.

**Document mode:** Context files are optional. Load `writing` skill rules instead. If the document relates to a specific codebase (e.g., an ADR), load that codebase's context.

## Artifacts

| Artifact | Location | Created by |
|----------|----------|------------|
| Spec | `projects/<project>/specs/<slug>.md` | Brainstorm |
| Plan | `projects/<project>/plans/<slug>.md` | Plan |
| Code changes | Working tree (target repo) | Implement (code mode) |
| Document | Final location or `projects/<project>/drafts/` | Implement (document mode) |
| Review findings | Conversation (structured format) | Review |
| Diagnosis | Conversation | Debug |

## Hard Gates

A `<HARD-GATE>` means: **stop and present your output to the user. Do not proceed until they approve, modify, or reject.**

Gates appear at:
1. End of brainstorm — spec must be approved before planning
2. End of plan — plan must be approved before implementing
3. End of debug diagnosis — fix must be approved before applying

## Anti-Slop Rules

These rules apply to all workflow phases:

- **No ceremonial code.** No empty constructors, no unused imports, no boilerplate "just in case."
- **No unnecessary abstractions.** Do not create interfaces with a single implementation. Do not wrap a library just to wrap it.
- **No filler comments.** Comments explain *why*, never *what*. `// increment counter` above `counter++` is noise. Delete it.
- **No premature generalization.** Solve the specific problem. Extract patterns only when they repeat 3+ times.
- **No AI-slop patterns.** Do not add `try/catch` around every function. Do not add logging to every method. Do not create utility classes for one-off helpers.
- **Match existing style.** If the codebase uses callbacks, do not introduce promises everywhere. If it uses classes, do not refactor to functions. Consistency beats personal preference.
- **No filler prose** (document mode). No "In this document, we will explore..." — state the point directly.

## Research Tool Hierarchy

When investigating APIs, libraries, or unfamiliar code during any workflow phase, use tools in this priority order:

| Priority | Tool | Use when |
|----------|------|----------|
| 1 | Codebase search (Grep/Glob) | Answer is in the working repo |
| 2 | `ctx7` — library docs | Need library/framework docs: `ctx7 library <name> [query]` → get ID → `ctx7 docs <id> "<query>"` |
| 3 | `gh search code` | Need real-world usage examples: `gh search code "<pattern>" --language <lang>` |
| 4 | `websearch` tool | Need broader web search, blog posts, Stack Overflow |

**Reference, do not recall.** When a task requires knowledge of a specific API, class, or config option — look it up. Do not rely on training data for version-sensitive details.

## Comment Discipline

Only comment what the code cannot say: constraints, non-obvious side effects, deliberate design decisions, known limitations. Never restate what the code does. Before adding a comment, ask if a rename or restructure makes it unnecessary.

## Continuation Format

When ending a response mid-workflow, always close with a `▶ Next Up` block so the user knows how to continue:

```
▶ **Next Up:** `/command` — one-sentence description of what it does.
Also available: `/other-command` — alternative next step.
💡 `/clear` starts a fresh conversation (useful if context is stale).
```

Rules:
- Put the recommended command in backticks and bold the label.
- Use "Also available:" (not "Other options:") for alternatives.
- Always mention `/clear` — users forget it exists.

## Deferred Items

When a workflow phase reveals out-of-scope work — bugs, improvements, refactors unrelated to the current task — do not expand scope. Instead:

1. Append the item to `projects/<project>/deferred-items.md` (create if missing).
2. One line per item: `- **YYYY-MM-DD:** <description> (discovered during <phase>)`
3. Continue the current task without actioning the deferred item.

This prevents scope creep while preserving discoveries for future planning.

## Proactive Resource Enrichment

After completing any workflow phase, scan for resource gaps:
- New concepts, tools, or patterns encountered → create resource articles
- People or teams referenced → ensure resource entries exist
- Architectural decisions made → consider whether an ADR is needed
