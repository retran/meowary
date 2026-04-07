---
name: workflow/thinking
description: Structured reasoning for complex decisions — frame the problem, research options, compare tradeoffs, plan execution, verify the plan before acting.
compatibility: opencode
depends_on:
  - workflow
---

## The Five Phases

Work through all five phases in order. Do not skip phases. Output each phase as a visible section before proceeding to the next.

---

### Phase 1: Frame

State the problem in one or two sentences. Then answer:

- What is the desired end state?
- What are the hard constraints (things that must not break)?
- What is the success criterion — how will we know it worked?
- What is the reversibility? (Can this be undone easily, with effort, or not at all?)

Keep this concise. If you cannot state the desired end state clearly, stop and ask the user before proceeding.

---

### Phase 2: Research

Gather the facts needed to make a good decision. Do not reason from assumptions when you can verify.

- Read the relevant files.
- Search for all dependencies (inbound links, references, usages).
- Check for existing patterns in the repo that constrain or inform the decision.
- Identify what you do not know and cannot verify — call these out explicitly.

Output: a bullet list of findings. Flag unknowns with `?`.

---

### Phase 3: Compare

List the candidate approaches (minimum two, unless only one is viable). For each:

- **Name:** Short label.
- **What it does:** One sentence.
- **Pros:** Concrete benefits.
- **Cons / risks:** Concrete downsides.
- **Reversibility:** Easy / With effort / Hard.

Then state your recommendation and why. Be direct — "Option A because X" not "Option A might be considered because X could potentially...".

---

### Phase 4: Plan

Write a step-by-step execution plan for the chosen approach. Each step must be:

- Concrete (names a specific file, command, or action).
- Ordered (dependencies respected).
- Atomic (one action per step, not "update all the files").

Flag any step that is irreversible with `[IRREVERSIBLE]`.

---

### Phase 5: Verify

Before executing, run this checklist:

- [ ] Every hard constraint from Phase 1 is satisfied by the plan.
- [ ] No step breaks an existing link, reference, or dependency.
- [ ] Irreversible steps are clearly identified and the user is aware.
- [ ] The plan is complete — no step assumes work that is not listed.
- [ ] The success criterion from Phase 1 can be evaluated after the plan executes.

If any item fails, revise the plan in Phase 4 and re-verify. Do not proceed until all items pass.

Once verified, present the plan to the user and ask for confirmation before executing any irreversible steps.

---

## Rules

- **Never skip Phase 2.** Reasoning from assumptions causes errors. Read the files.
- **Never skip Phase 5.** Verification catches plan gaps before they become broken repo state.
- **One recommendation.** Do not present "it depends" as a conclusion. Make a call.
- **Flag unknowns.** If a fact cannot be verified, say so explicitly. Do not paper over it.
- **Ask before irreversible steps.** Even if the user said "just do it" — confirm before [IRREVERSIBLE] steps.
