---
name: projects/plan
description: Implementation plan format — phased work breakdown, dependencies, risks, and linked spec or ADR. Load when writing or updating an implementation plan in projects/<slug>/plans/ during the plan or write workflow.
compatibility: opencode
updated: 2026-04-18
---

<role>Implementation plan steward — phased work breakdown linked to a spec or ADR.</role>

<summary>
> Plan = implementation guide produced during `/plan`. Translates spec/ADR into concrete phased tasks. Task-oriented: answers "how do we build this?"
</summary>

<when_to_write>
- Work too large for flat task list in `README.md`.
- Multiple phases with dependencies tracked across sessions.
- Needs continuity separate from project README.

SKIP for small self-contained work — add tasks to project README instead.
</when_to_write>

<file_location>
```
projects/<slug>/plans/plan-<topic>.md
```

One plan per implementation area. Kebab-case topics (e.g. `plan-auth-implementation.md`, `plan-data-migration.md`).
</file_location>

<front_matter>
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
</front_matter>

<section_structure>
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

**Overview:** 1–3 sentences on approach. What we're building and how.

**Phases:** One `###` per phase. Each contains `- [ ]` task checkboxes — concrete and independently completable. Mark complete `- [x]` in place; NEVER delete.

Each task includes `[risk: high|medium|low]`:

| Risk | Criteria |
|------|----------|
| `high` | First-time patterns, cross-cutting changes (>5 files), external deps |
| `medium` | Known patterns, moderate scope, some ambiguity |
| `low` | Mechanical/repetitive, single-file edits |

Example:
```
- [ ] Refactor auth middleware to support OAuth2 [risk: high]
- [ ] Add unit tests for token validation [risk: medium]
- [ ] Update config schema with new fields [risk: low]
```

**Dependencies:** External systems, teams, decisions that MUST resolve before/during implementation.

**Risks:** Format: `- **Risk:** description. **Mitigation:** action.`

**Open Questions:** Unanswered questions affecting implementation decisions.

**Changelog:** Bullets newest-first. Format: `- **YYYY-MM-DD:** Action.`
</section_structure>

<rules>
- LINK to spec/ADR this plan implements. Plans without linked decision are harder to review.
- KEEP phases coarse — 3–7 tasks per phase. Granular detail goes in project README or daily notes.
- UPDATE `status` as plan progresses. Stale status misleads.
- NEVER delete completed tasks — mark `- [x]` in place.
</rules>

<self_review>
- [ ] Front matter complete (`type: plan`, `status`, `updated`, `tags`)?
- [ ] Linked to spec or ADR?
- [ ] Each phase has ≥1 concrete task checkbox with `[risk:]` tag?
- [ ] Dependencies and Risks populated (or "none" stated)?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, status values remain English.
</output_rules>
