---
name: projects/plan
description: Implementation plan format — phased work breakdown, dependencies, risks, and linked spec or ADR. Load when writing or updating an implementation plan in projects/<slug>/plans/ during the plan or write workflow.
compatibility: opencode
---

A plan is an implementation guide produced during the `/plan` phase. It translates a spec or ADR into a concrete, phased work breakdown. Plans are task-oriented: they answer "how do we build this?" in actionable steps.

---

## When to Write a Plan

- The work is large enough that a flat task list in `README.md` is insufficient.
- Multiple phases with dependencies need to be tracked across sessions.
- The work needs its own continuity separate from the project README.

Skip a plan for small, self-contained work. Add tasks directly to the project README instead.

---

## File Location

```
projects/<slug>/plans/plan-<topic>.md
```

One plan per implementation area. Use kebab-case for topic names (e.g. `plan-auth-implementation.md`, `plan-data-migration.md`).

---

## Front Matter

```yaml
---
type: plan
status: draft
updated: YYYY-MM-DD
tags: [p-<slug>]
---
```

- `status`: `draft` → `approved` → `in-progress` → `done`
- `updated`: set on creation; update on every edit.

---

## Section Structure

```
# Plan: <Title>

**Project:** [Project Name](../README.md)
**Spec / ADR:** [<link>](<link>)
**Status:** draft | approved | in-progress | done
**Updated:** YYYY-MM-DD

## Overview

## Phases

### Phase 1: <name>

### Phase 2: <name>

## Dependencies

## Risks

## Open Questions

## Changelog
```

**Overview:** 1–3 sentences summarizing the approach. What are we building and how?

**Phases:** One `###` subsection per phase. Each phase contains `- [ ]` task checkboxes. Tasks must be concrete and independently completable. Mark completed tasks `- [x]` in place — do not delete them.

Each task should include a `[risk: high|medium|low]` tag to signal implementation difficulty:

| Risk | Criteria |
|------|----------|
| `high` | First-time patterns, cross-cutting changes (>5 files), or external dependencies |
| `medium` | Known patterns with moderate scope or some ambiguity |
| `low` | Mechanical/repetitive changes, single-file edits |

Example:
```
- [ ] Refactor auth middleware to support OAuth2 [risk: high]
- [ ] Add unit tests for token validation [risk: medium]
- [ ] Update config schema with new fields [risk: low]
```

**Dependencies:** External systems, teams, or decisions that must be resolved before or during implementation.

**Risks:** Known risks with a mitigation note. Format: `- **Risk:** description. **Mitigation:** action.`

**Open Questions:** Unanswered questions that affect implementation decisions.

**Changelog:** Bullets, newest first. Format: `- **YYYY-MM-DD:** Action.`

---

## Rules

- Link to the spec or ADR this plan implements. Plans without a linked decision record are harder to review.
- Keep phases coarse — 3–7 tasks per phase. Move granular detail into the project README or daily notes.
- Update `status` as the plan progresses. A stale status is misleading.
- Never delete completed tasks — mark them `- [x]` in place.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: plan`, `status`, `updated`, `tags`?
- [ ] Linked to a spec or ADR?
- [ ] Each phase has at least one concrete task checkbox?
- [ ] Dependencies and Risks populated (or explicitly marked "none")?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
