---
name: workflow/brainstorm
description: "Explore a problem space, generate approach options, produce a spec artifact."
compatibility: opencode
depends_on:
  - workflow
---

# Brainstorm Phase

Explore a problem before committing to a solution. Produce a spec artifact with options and a recommendation.

## When to Use

- Feature request or change request with unclear scope
- Problem with multiple possible solutions
- Architectural decision with tradeoffs
- Document (ADR, proposal, RFC) where structure and arguments need exploration
- Any task where jumping to implementation would be premature

## Workflow

### Step 0: Load Context

**Code mode:**
1. Read `architecture.md` and `patterns.md`
2. If working in an external repo, read its `AGENTS.md` and architecture docs instead

**Document mode:**
1. Load the `writing` skill for style and formatting rules
2. If the document relates to a codebase, load that codebase's architecture context
3. Search `resources/` (use `qmd query "<topic>"`) for related resource articles

### Step 1: Understand the Problem

1. Clarify the user's request. Ask questions if ambiguous.
2. Identify the project. If unclear, ask: "Which project is this for?"
3. **Search for existing work:** Load the `jira` skill to search for related issues, epics, or prior decisions. Search `resources/` (use `qmd query`) in document mode, or codebase in code mode, for relevant material.
4. Check for existing specs or plans that might overlap.

### Claim Provenance

Tag every factual claim in the spec with its evidence level:

| Tag | Meaning |
|-----|---------|
| **[VERIFIED]** | Confirmed by reading code, running a command, or checking an authoritative source |
| **[CITED]** | Referenced from documentation, Confluence, or Jira but not independently verified |
| **[ASSUMED]** | Based on reasoning, pattern matching, or training data |

Present **[ASSUMED]** claims as open questions when possible. This makes the spec's confidence level transparent to reviewers.

### Step 2: Generate Options

Generate 2-3 distinct approaches. For each option:

- **Name** — short descriptive label
- **Description** — how it works (2-3 sentences)
- **Pros** — concrete benefits
- **Cons** — concrete drawbacks
- **Effort** — rough estimate (small / medium / large)
- **Risk** — what could go wrong

**Document mode additions:**
- **Audience** — who reads this and what they need from it
- **Structure** — proposed section outline

Do not generate options that are obviously bad just to fill a quota. If there is one clear approach, say so — but explain why alternatives were rejected.

Apply claim provenance to pros and cons: a pro tagged **[ASSUMED]** is weaker than one tagged **[VERIFIED]**. Tag claims that depend on unverified information.

### Step 3: Write the Spec

Create `projects/<project>/specs/<slug>.md` using the template at `references/spec-template.md`.

Fill in all sections:
- **Problem** — what needs to change and why
- **Constraints** — technical limits, compatibility requirements, deadlines
- **Options** — from Step 2
- **Recommendation** — your preferred option with rationale
- **Open Questions** — unknowns that need answers before planning

### Step 4: Hard Gate

**`<HARD-GATE>`**

Present a summary of the spec to the user:
1. One-sentence problem statement
2. Options table (name, effort, risk)
3. Your recommendation and why
4. Open questions (if any)

Ask: "Does this spec look right? Should I adjust anything before we move to planning?"

**Do not proceed to planning until the user approves.**

## Spec Quality Checklist

Before presenting the spec, verify:

- [ ] Problem statement is concrete — names specific behavior, files, or systems
- [ ] Constraints are real — not invented ("must be backward compatible" only if true)
- [ ] Options are genuinely distinct — not minor variations of the same approach
- [ ] Pros/cons are specific — not generic ("more maintainable")
- [ ] Recommendation has a clear reason — not "Option A is the best"
- [ ] Open questions are actionable — someone can answer them

## Output Format

The spec file is the primary artifact. The conversation summary is secondary — it helps the user decide quickly, but the file is the source of truth.
