---
name: projects/rfc
description: RFC format, sections, and process — proposals seeking broader input before a decision is made. Load when drafting or updating an RFC in projects/<slug>/drafts/ during the design or write workflow.
compatibility: opencode
---

An RFC (Request for Comments) is a proposal document used when broader input is needed before committing to a decision. Unlike a spec (problem-focused) or an ADR (decision record), an RFC is explicitly an invitation to discuss and critique. Use RFCs when a proposal affects multiple teams, introduces a breaking change, or has significant trade-offs that benefit from review.

---

## When to Write an RFC

- The proposal affects systems or teams outside the current project.
- The change is non-trivial and benefits from external critique before commitment.
- The author wants structured feedback rather than informal discussion.

Skip an RFC for decisions made within the team with no external impact. Use a spec or ADR instead.

---

## File Location

```
projects/<slug>/drafts/rfc-<topic>.md
```

Use kebab-case for topic names (e.g. `rfc-deprecate-v1-api.md`, `rfc-unified-auth.md`).

---

## Front Matter

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

---

## Section Structure

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

**Summary:** One paragraph. What is being proposed? Target audience: someone with no background on this.

**Motivation:** Why is this needed? What problem does it solve? What happens if we do nothing?

**Proposal:** Detailed description of the change. Use sub-sections for complex proposals. Be specific — include interfaces, data shapes, or process steps as needed.

**Alternatives Considered:** What other approaches were evaluated and why were they not chosen? Be honest — this section's quality affects credibility.

**Drawbacks:** The genuine costs and downsides of the proposal. Name them explicitly. If you can't identify any drawbacks, the analysis is incomplete.

**Open Questions:** Questions the author is specifically asking reviewers to address.

**Feedback Log:** Append-only record of key feedback received during the `open` phase. Format:
```
- **YYYY-MM-DD — <Reviewer>:** Summary of feedback.
```

**Changelog:** Bullets, newest first. Format: `- **YYYY-MM-DD:** Action.`

---

## Lifecycle

| Status | Meaning |
|--------|---------|
| `draft` | Being written; not yet circulated |
| `open` | Circulated for comment; actively accepting feedback |
| `accepted` | Proposal adopted; implementation starts |
| `rejected` | Proposal declined; reason documented in Changelog |
| `withdrawn` | Author withdrew the proposal; reason in Changelog |

Transition from `open` to `accepted` or `rejected` requires a decision from the relevant stakeholders. Document the decision and key reasoning in the Changelog.

---

## Common Mistakes

- **Vague motivation.** "Improve developer experience" is not motivation. Name the specific pain point with concrete examples.
- **Missing drawbacks.** Every meaningful change has costs. If you find none, look harder.
- **Scattered open questions.** If you have open questions, put them in the Open Questions section — not scattered through the Proposal.
- **Missing Feedback Log.** Once an RFC is open, every significant piece of feedback must be logged here for traceability.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: rfc`, `status`, `updated`, `tags`?
- [ ] Summary is self-contained — can be read without context?
- [ ] Motivation names a specific problem, not a vague aspiration?
- [ ] Drawbacks are honest and explicit — not omitted or minimised?
- [ ] Open Questions are specific questions, not placeholders?
- [ ] If `status` is `open` or later: Feedback Log section present?
- [ ] `updated` set to today?
- [ ] Changelog entry for today?
