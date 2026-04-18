---
name: projects/spec
description: Problem spec format — problem statement, constraints, options analysis, and recommendation. Load when writing or updating a spec document in projects/<slug>/specs/ during the design or write workflow.
compatibility: opencode
updated: 2026-04-18
---

<role>Spec steward — problem specification document, the thinking artifact that precedes a plan or ADR.</role>

<summary>
> Spec = problem specification produced during `/scout` or `/research`. Defines problem, documents constraints, explores options, makes recommendation — without committing to decision (that's the ADR).
</summary>

<when_to_write>
- Problem non-trivial AND solution space has >1 real option.
- Stakeholder alignment needed before implementation.
- Problem boundaries unclear and need explicit drawing.

SKIP for small obvious work — well-formed task in README suffices.
</when_to_write>

<file_location>
```
projects/<slug>/specs/spec-<topic>.md
```

One per topic. Kebab-case (e.g. `spec-auth-strategy.md`, `spec-data-model.md`).
</file_location>

<front_matter>
```yaml
---
type: spec
status: draft
updated: YYYY-MM-DD
superseded-by: <path to newer spec, if applicable>
tags: [spec, p-<slug>]
---
```

- `status`: `draft` → `under-review` → `accepted` | `rejected`
- `superseded-by`: optional. Set when newer spec replaces. Relative path to replacement.
- `updated`: set on creation; update on every edit.
</front_matter>

<section_structure>
```
# Spec: <Title>

**Project:** [Project Name](../README.md)
**Status:** draft | under-review | accepted | rejected
**Updated:** YYYY-MM-DD

## Problem

## Constraints

## Non-Goals

## Approach

## Requirements

## Alternatives Considered

## Open Questions

## Sources

## Changelog
```

**Problem:** What situation are we solving and why does it matter? 2–5 sentences. Value-neutral — NO solution advocacy yet.

**Constraints:** Hard requirements and given limitations. DISTINGUISH hard constraints from soft preferences.

**Non-Goals:** Explicitly out of scope. As important as problem definition.

**Approach:** Recommended approach. Solution direction, key design choices, why selected. REFERENCE specific constraints satisfied. NAME accepted trade-offs explicitly.

**Requirements:** Concrete requirements implementation MUST satisfy. Bullet list. Flow directly into plan tasks.

**Alternatives Considered:** One `###` per alternative. Brief description + why not chosen. Simplest first.

**Open Questions:** Unanswered questions blocking/affecting approach.

**Sources:** Links to external references, docs, prior art, research informing this spec.

**Changelog:** Bullets newest-first. Format: `- **YYYY-MM-DD:** Action.`
</section_structure>

<lifecycle>
| Status | Meaning |
|--------|---------|
| `draft` | Being written; not ready for review |
| `under-review` | Circulated for feedback; open questions being resolved |
| `accepted` | Recommendation accepted; work tracked in plan or ADR |
| `rejected` | Problem descoped or alternative chosen |

Accepted/rejected/superseded specs are NOT edited — they're historical records. CREATE new spec if problem changes significantly. Set `superseded-by` in old spec front matter.
</lifecycle>

<self_review>
- [ ] Front matter complete (`type: spec`, `status`, `updated`, `tags`)?
- [ ] Problem value-neutral — no solution advocacy?
- [ ] Constraints separated from Non-Goals?
- [ ] Approach describes chosen direction, references constraints?
- [ ] Requirements as concrete bullets?
- [ ] Alternatives Considered use `###` subsections with rationale for rejection?
- [ ] Sources section present (even if empty)?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, status values remain English.
</output_rules>
