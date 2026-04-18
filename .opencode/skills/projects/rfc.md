---
name: projects/rfc
description: RFC format, sections, and process — proposals seeking broader input before a decision is made. Load when drafting or updating an RFC in projects/<slug>/drafts/ during the design or write workflow.
compatibility: opencode
updated: 2026-04-18
---

<role>RFC steward — proposal document explicitly inviting discussion and critique before a decision.</role>

<summary>
> RFC = proposal needing broader input before commitment. Unlike spec (problem-focused) or ADR (decision record), RFC is explicitly an invitation to discuss. USE when proposal affects multiple teams, introduces breaking change, or has significant trade-offs benefiting from review.
</summary>

<when_to_write>
- Proposal affects systems/teams outside current project.
- Change non-trivial; benefits from external critique before commitment.
- Author wants structured feedback rather than informal discussion.

SKIP for decisions made within team with no external impact — use spec or ADR.
</when_to_write>

<file_location>
```
projects/<slug>/drafts/rfc-<topic>.md
```

Kebab-case topics (e.g. `rfc-deprecate-v1-api.md`, `rfc-unified-auth.md`).
</file_location>

<front_matter>
```yaml
---
type: rfc
status: draft
updated: YYYY-MM-DD
tags: [p-<slug>]
---
```

- `status`: `draft` → `open` → `accepted` | `rejected` | `withdrawn`
- `updated`: set on creation; update on every edit.
</front_matter>

<section_structure>
```
# RFC: <Title>

**Author:** <name>
**Status:** draft | open | accepted | rejected | withdrawn
**Updated:** YYYY-MM-DD

## Summary

## Motivation

## Proposal

## Alternatives Considered

## Drawbacks

## Open Questions

## Feedback Log

## Changelog
```

**Summary:** One paragraph. What's being proposed? Audience: someone with no background.

**Motivation:** Why needed? What problem solved? What happens if we do nothing?

**Proposal:** Detailed change description. Sub-sections for complex proposals. Be specific — interfaces, data shapes, process steps.

**Alternatives Considered:** What other approaches evaluated and why not chosen. BE HONEST — section quality affects credibility.

**Drawbacks:** Genuine costs and downsides. NAME them explicitly. If you can't identify drawbacks, analysis is incomplete.

**Open Questions:** Questions specifically asking reviewers to address.

**Feedback Log:** Append-only record of key feedback during `open` phase. Format:
```
- **YYYY-MM-DD — <Reviewer>:** Summary of feedback.
```

**Changelog:** Bullets newest-first. Format: `- **YYYY-MM-DD:** Action.`
</section_structure>

<lifecycle>
| Status | Meaning |
|--------|---------|
| `draft` | Being written; not yet circulated |
| `open` | Circulated for comment; actively accepting feedback |
| `accepted` | Proposal adopted; implementation starts |
| `rejected` | Proposal declined; reason in Changelog |
| `withdrawn` | Author withdrew; reason in Changelog |

Transition `open` → `accepted`/`rejected` requires decision from stakeholders. DOCUMENT decision and key reasoning in Changelog.
</lifecycle>

<common_mistakes>
- **Vague motivation.** "Improve developer experience" is not motivation. Name the specific pain point with concrete examples.
- **Missing drawbacks.** Every meaningful change has costs. If you find none, look harder.
- **Scattered open questions.** PUT in Open Questions section — not scattered through Proposal.
- **Missing Feedback Log.** Once open, every significant feedback MUST be logged for traceability.
</common_mistakes>

<self_review>
- [ ] Front matter complete (`type: rfc`, `status`, `updated`, `tags`)?
- [ ] Summary self-contained — readable without context?
- [ ] Motivation names specific problem, not vague aspiration?
- [ ] Drawbacks honest and explicit — not omitted/minimized?
- [ ] Open Questions are specific questions, not placeholders?
- [ ] If `status` is `open`+: Feedback Log section present?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
</self_review>

<output_rules>
Output language: English. Frontmatter, section headers, status values remain English.
</output_rules>
