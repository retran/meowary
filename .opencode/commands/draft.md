---
description: Draft a document — postmortem, proposal, RFC, or any other type
---

Draft a document. This is an interactive process. Read author name from `context.md`.

Arguments: `/draft <type> [project-slug] [title]`

Types: `postmortem`, `proposal`, `rfc` (or any freeform type).

1. Load `writing` skill.
2. Parse type from `$1`. If missing, ask with options: postmortem, proposal, RFC, other.
3. Identify the project/area (`$2`) and title (`$3`). Ask if not provided.
4. Gather details based on type:
   - **postmortem** — date, summary, timeline, root cause, contributing factors, resolution, action items.
   - **proposal** — goal, background, proposed approach, success criteria, risks.
   - **rfc** — problem statement, proposed solution, alternatives considered, open questions.
   - **other** — ask the user for the document structure and key sections.
   Ask for missing values interactively.
5. Write to `projects/<slug>/drafts/<type>-<kebab-title>.md` (or `areas/<slug>/drafts/`, or `inbox/` if unassociated). Read author from `context.md`.
6. Cross-link to daily note and project README. Commit.

$ARGUMENTS
