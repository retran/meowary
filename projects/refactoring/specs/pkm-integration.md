---
title: "PKM integration — Zettelkasten, Evergreen Notes, Digital Gardening"
status: draft
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# PKM integration — Zettelkasten, Evergreen Notes, Digital Gardening

## Problem

The current system is structurally Zettelkasten — `resources/` holds atomic permanent notes, daily Inbox is the fleeting notes layer, `resources/synthesis/` holds structure notes, QMD provides the slip-box search. Three well-established PKM methods — Zettelkasten, Evergreen Notes, and Digital Gardening — each describe principles the system already partially implements, but none are named or made explicit. Two concrete gaps exist:

1. **No vocabulary.** Users familiar with these methods cannot orient. README, AGENTS.md, and skills do not name the layers (fleeting / literature / permanent / structure), do not describe growth stages (seed / sprout / tree), and do not mention the practice of evolving notes over time. **[VERIFIED: grep across all .md files found zero Zettelkasten/Evergreen/Digital Garden mentions except incidental README references]**

2. **No literature notes layer.** `/r-ingest` and `/evening` go directly from source → permanent note, skipping the intermediate step where you summarize a specific source in your own words. This step is where understanding develops before it is distilled into concept-level permanent notes. **[VERIFIED: read evening.md step 5, ingest.md — both create/update resource articles directly. No inbox/literature/ folder exists. No literature template exists.]**

The result: notes from a book chapter, a conference talk, and a Confluence page all land directly in `resources/` with no record of the reasoning path. The source reasoning is lost.

## Three PKM methods and their contribution

### Zettelkasten (Niklas Luhmann)

Four note types in sequence: fleeting → literature → permanent → structure. The key insight is **emergence**: when permanent notes are linked, connections generate ideas that neither note contained alone. The system already has three of the four layers; literature notes are the gap.

### Evergreen Notes (Andy Matuschak)

Notes should evolve over time — they are never finished, only more developed. The practice is regular revisiting and rewriting as understanding deepens. The key discipline is **treating notes as living documents**, not filed-and-forgotten records.

Note: Matuschak's convention of assertion-style note titles (e.g. "Abstraction is dangerous") is **not adopted here**. Titles remain topic/term noun phrases (e.g. `abstraction.md`) because they function as concept graph nodes — assertion-style titles break graph navigation by making nodes non-composable.

### Digital Gardening

Low-pressure progressive development of notes through growth stages. A note starts as a **seed** (rough capture), develops into a **sprout** (developing thought, some structure), and matures into a **tree** (stable, well-linked, actualized). The philosophy is "always in process" — a seed is not a failure to finish; it is a committed intention.

## Constraints

- No unique IDs / file renaming — current path-based naming (`resources/domain/concept.md`) stays. **[CONFIRMED]**
- Do not break existing workflows — evening, r-ingest, and r-enrich must continue working unchanged for users who skip literature notes.
- All additions are opt-in — vocabulary explains the existing system; stages and evolution practices are additive, not prescriptive.
- No new external dependencies. **[CONFIRMED]**
- Note titles stay as topic/term noun phrases. Assertion-style titles are explicitly excluded. **[CONFIRMED: knowledge graph requires composable node names]**

## Layer and stage mapping (current system)

### Zettelkasten layers

| Layer | Current equivalent | Gap |
|---|---|---|
| **Fleeting notes** | Daily note `### Inbox`, meeting notes | No gap |
| **Literature notes** | Nothing | Missing: no intermediate source-summary layer |
| **Permanent notes** | `resources/<domain>/<article>.md` | Named differently; no structural gap |
| **Structure notes** | `resources/synthesis/<article>.md` | Named differently; no structural gap |

### Digital Garden growth stages

| Stage | Description | Current equivalent |
|---|---|---|
| **Seed** | Rough capture, unprocessed | `inbox/` items, new resource stubs |
| **Sprout** | Developing thought, some structure, not yet well-linked | Resource article with thin content, few links |
| **Tree** | Mature, well-linked, actualized recently | Resource article with full content, cross-links, recent `updated` date |

Growth stage maps to the existing `status` frontmatter field. No new field required; convention is what's missing.

### Evergreen Notes evolution

No structural mapping needed — evolution is a practice, not a data structure. The principle is: every time a resource article is revisited (via `/r-enrich`, `/r-ingest`, or manual edit), it should be meaningfully updated, not just timestamp-bumped. The `updated` field already tracks this; what's missing is the explicit norm.

---

## Options

### Option A: Vocabulary overlay

Update README, AGENTS.md, and the resources skill to name all three methods, map them to the existing system, and add the growth stage convention to the `status` field. No workflow changes.

**Files changed:**
- `README.md` — second brain loop section: name Zettelkasten layers, Digital Garden stages, Evergreen evolution norm
- `AGENTS.md` — Resources section: add PKM vocabulary; "What Goes Where" table: note that `inbox/` items are seeds
- `resources/SKILL.md` — Resources Philosophy: add three-method framing, stage convention, evolution norm
- `resources/<domain>/methodology/` (optional) — one resource article per method as reference knowledge

**Pros:**
- Zero workflow impact — no existing habit changes required
- Immediately orients PKM-familiar users
- Fast to implement and verify
- Growth stage convention costs nothing — just document that `status: current` + well-linked + recent `updated` = tree

**Cons:**
- Does not fix the literature notes gap — source-to-concept reasoning is still implicit
- Adding vocabulary without the matching workflow may feel hollow to experienced practitioners

**Effort:** small
**Risk:** Low. Pure documentation.

---

### Option B: Vocabulary + literature notes layer

Option A plus `inbox/literature/` as an explicit intermediate layer for source summaries. Update `/r-ingest` and `/evening` to optionally route through it. Add a literature note template.

**New files:** `.opencode/templates/literature-template.md`

**Updated files (beyond Option A):**
- `AGENTS.md` — document `inbox/literature/` in "What Goes Where" and structure tree
- `.opencode/skills/resources/ingest.md` — add optional pre-step: write a literature note before enriching a permanent note
- `.opencode/commands/evening.md` — step 5: when an Inbox item references a specific source, offer the literature note path first
- `README.md` — update second brain loop diagram to show the intermediate step

**Literature note format:**
- Front matter: `source:`, `source-type:`, `stage: seed`, `processed: false`
- Body: 3–10 bullets — what the source argues, in your own words
- Section `## Candidate permanent notes:` — list of concepts worth their own resource article

**Workflow after change:**
```
Source (article, book, Confluence page, talk)
        ↓ /r-ingest or /evening
inbox/literature/<slug>.md   ← source summary, own words, candidates
        ↓ /r-plan or /evening next pass
resources/<domain>/<article>.md   ← permanent notes (trees when mature)
```

**Pros:**
- Fixes the real gap — source reasoning is preserved and reviewable
- Literature notes are processable by `/r-plan` — they surface as unprocessed seeds
- Keeps permanent notes clean — concepts, not source summaries
- `stage: seed` on new literature notes makes the Digital Garden model concrete

**Cons:**
- Adds a decision per ingestion: "is this a literature note or a direct resource update?"
- Literature notes in `inbox/literature/` can accumulate; needs processing discipline
- Higher implementation effort than A

**Effort:** medium
**Risk:** Low-medium. Main risk: users skip literature notes under time pressure, defeating the purpose.

---

### Option C: Full integration — vocabulary + literature notes + emergence + evolution prompts

Option B plus explicit emergence prompts in the enrich workflow and evening routine, and an evolution norm in the enrich workflow.

**Emergence** is the Zettelkasten payoff: when two permanent notes are linked, a new idea emerges that neither contained alone. The system has `resources/synthesis/` for this but no prompt asking "does this connection suggest a synthesis note?"

**Evolution** is the Evergreen Notes payoff: revisiting a note should deepen it, not just update its timestamp.

**Additional changes over Option B:**
- `.opencode/skills/resources/enrich.md` — after Step 3b (Progressive Summarization):
  - Step 3c (Emergence check): "After cross-referencing, ask: does this connection suggest a synthesis insight not yet captured? If yes, note it in `## Changelog` as a synthesis candidate."
  - Step 3d (Evolution check): "Has this note grown since last visit, or only been updated? If only timestamp-bumped, identify one claim that could be sharpened or one link that could be added."
- `.opencode/commands/evening.md` — after step 5: "Do any two promoted notes today suggest a new connection? If yes, add one line to `inbox/scratch.md`: `Synthesis candidate: [A](link) × [B](link) → [what the connection suggests]`."
- `README.md` — expand second brain loop diagram to show emergence explicitly

**Pros:**
- Completes the model — emergence and evolution are where long-term value is generated
- Synthesis candidates in `inbox/scratch.md` are low-friction — one line, no immediate action
- The emergence and evolution checks are questions, not hard gates — add thinking without blocking

**Cons:**
- Largest diff — multiple skills/commands updated plus new template and vocabulary
- Emergence prompts require agent judgment; if quality is low, they produce hollow entries that clutter `inbox/scratch.md`
- System is actively being refactored — adding complexity now may conflict with the next cycle

**Effort:** medium-large
**Risk:** Medium. Emergence step quality depends on agent judgment. Poorly written, it produces noise.

---

## Recommendation

**Option C: Full integration.** *(pending user approval)*

Rationale: the user explicitly asked for "both" — make the model explicit AND fix the workflow gap. Option C delivers both plus emergence and evolution, which are where Zettelkasten and Evergreen Notes generate long-term value beyond organization. The emergence and evolution steps are written as questions, not hard gates, so they add no mandatory friction. The literature notes layer is optional per invocation — users skip it for quick facts, use it for substantial sources.

The risk (emergence prompt quality) is manageable: the prompt is constrained ("note a synthesis candidate in scratch.md, don't create it now") which limits bad outputs.

If scope feels large, Option B is the next-best choice: fixes the real gap without emergence/evolution, which can be added in a follow-up.

## Open Questions

1. **Literature note location:** `inbox/literature/` vs. `resources/literature/` — literature notes are inputs (processed then archived), so `inbox/` fits. But `resources/literature/` makes them findable via QMD alongside permanent notes. **[Needs user decision]**

2. **Literature note lifecycle:** Should processed literature notes be deleted, archived to `archive/literature/`, or kept in `inbox/literature/` with `processed: true`? Zettelkasten keeps them (source of permanent notes); archiving after processing seems cleanest. **[Needs user decision]**

3. **Evening gate:** Should the evening workflow always offer the literature note path for Inbox items, or only when the item looks like a source (URL, book title, author name)? Always offering adds noise; auto-detecting requires heuristics. **[Needs user decision]**

4. **Emergence prompt frequency:** Per-session (once per evening) or also at the end of `/r-ingest`? Both seems right for full coverage. **[Needs user decision — or pick one for now and expand later]**

5. **Growth stage field:** Use existing `status` field with a documented convention, or add a new `stage` frontmatter field? A new field is unambiguous but adds frontmatter complexity. **[Needs user decision]**
