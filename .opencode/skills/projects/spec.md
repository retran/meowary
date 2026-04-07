---
name: projects/spec
description: Problem spec format — problem statement, constraints, options analysis, and recommendation. Load when writing or updating a spec document in projects/<slug>/specs/ during the design or write workflow.
compatibility: opencode
---

A spec is a problem specification document produced during the `/scout` or `/research` phase. It defines the problem, documents constraints, explores options, and makes a recommendation — without committing to a decision (that is the ADR's job). A spec is the thinking document that precedes a plan or ADR.

---

## When to Write a Spec

- The problem is non-trivial and the solution space has more than one real option.
- Stakeholder alignment is needed before implementation starts.
- The problem has unclear boundaries that need to be drawn explicitly.

Skip a spec for small, obvious work. A well-formed task description in the README is sufficient.

---

## File Location

```
projects/<slug>/specs/spec-<topic>.md
```

One spec per topic. Use kebab-case for topic names (e.g. `spec-auth-strategy.md`, `spec-data-model.md`).

---

## Front Matter

```yaml
---
type: spec
status: draft
updated: YYYY-MM-DD
tags: [p-<slug>]
---
```

- `status`: `draft` → `under-review` → `accepted` | `rejected`
- `updated`: set on creation; update on every edit.

---

## Section Structure

```
# Spec: <Title>

**Project:** [Project Name](../README.md)
**Status:** draft | under-review | accepted | rejected
**Updated:** YYYY-MM-DD

## Problem

## Constraints

## Non-Goals

## Options

## Recommendation

## Open Questions

## Changelog
```

**Problem:** What situation are we trying to solve, and why does it matter? 2–5 sentences. Value-neutral — no advocacy for any solution yet.

**Constraints:** Bullet list of hard requirements and given limitations. Distinguish hard constraints from soft preferences.

**Non-Goals:** What is explicitly out of scope. This is as important as the problem definition.

**Options:** One `###` subsection per option. Include a brief description and pros/cons for each. List simplest option first.

**Recommendation:** State the recommended option and why. Reference specific constraints it satisfies. Name accepted trade-offs explicitly.

**Open Questions:** Unanswered questions that block or affect the recommendation.

**Changelog:** Bullets, newest first. Format: `- **YYYY-MM-DD:** Action.`

---

## Lifecycle

| Status | Meaning |
|--------|---------|
| `draft` | Being written; not ready for review |
| `under-review` | Circulated for feedback; open questions being resolved |
| `accepted` | Recommendation accepted; work tracked in a plan or ADR |
| `rejected` | Problem descoped or alternative approach chosen |

Accepted and rejected specs are not edited — they are historical records. Create a new spec if the problem changes significantly.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: spec`, `status`, `updated`, `tags`?
- [ ] Problem is value-neutral — no solution advocacy?
- [ ] Constraints separated from Non-Goals?
- [ ] Options use `###` subsections with pros/cons?
- [ ] Recommendation references specific constraints?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
