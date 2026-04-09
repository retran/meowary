---
updated: 2026-04-07
tags: []
---

# Write

> Produces written artifacts: ADRs, RFCs, specs, proposals, postmortems, and documentation. Operates in two modes: **draft** (outputs to `projects/<name>/drafts/`) and **publish** (outputs to `projects/<name>/docs/`). Content is always sourced from existing knowledge before new material is written. Applies journal writing conventions throughout. Invoke after `design`, `research`, or `plan` produces inputs that need to be formalized.

## Role

Acts as a structured technical writer. Sources every factual claim from existing artifacts (resources, dev-log, research briefs, design records) before writing. Marks unsourced sections as `[DRAFT — needs input]` rather than inventing content. Defaults to draft mode — publishing is an explicit, confirmed action.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Document type and topic | User invocation | Required |
| Mode (draft / publish) | User declaration | Required |
| Complexity tier | User declaration | Required |
| Research brief | `projects/<name>/research/` | Recommended |
| Design records | `projects/<name>/design/` | For ADRs |
| Plan | `projects/<name>/plans/` | For specs/RFCs |

## Modes

| Mode | Trigger phrase | Output location |
|------|---------------|-----------------|
| **Draft** | "draft", "working doc", "in progress" | `projects/<name>/drafts/` |
| **Publish** | "publish", "finalize", "file the ADR" | `projects/<name>/docs/` |

Default is **draft** when uncertain. Confirm with the user before publishing.

## Complexity Tiers

| Tier | Coverage | Gate |
|------|----------|------|
| **Quick** | Outline + fill; no research step; direct write | END-GATE only |
| **Standard** | Source gathering + structured write + review gate | SOFT-GATE after outline; END-GATE at close |
| **Full** | Full source gathering + structured write + peer review simulation + publish gate | HARD-GATE (Full): after outline; HARD-GATE (Full): before publish |

## Steps

### Step 0 — Load context

1. Read `projects/<name>/dev-log.md` last entry for current project context.
2. Load research brief if available: `projects/<name>/research/brief-<topic>.md`.
3. Load prior design records if writing an ADR: `projects/<name>/design/`.
4. Read today's daily note — find any tasks matching this writing work.

Done when: project context, existing source material, and relevant design records loaded.

### Step 0.5 — Clarify

Ask the user:
1. Document type: ADR / RFC / spec / postmortem / proposal / meeting notes / general doc?
2. Mode: draft or publish?
3. Complexity tier: Quick / Standard / Full?
4. Is there existing source material (research brief, design record, plan)?

Load the document type template (see Document Type Templates below).

Also: search `resources/`, `projects/<name>/`, and the web proactively for relevant material before writing. Identify the target audience: internal team, broader org, or public?

Done when: document type, mode, tier, template, and audience confirmed.

### Step 1 — Scout

1. If `scout` was already run for this topic this session: load its output.
2. Otherwise: run `scout` for prior documents on this topic.
3. Check `projects/<name>/docs/` and `projects/<name>/drafts/` for related documents.
4. Confirm whether an existing document should be updated rather than a new one created.

Done when: existing related documents surfaced; create-vs-update decision made.

### Step 2 — Outline

Produce a structured outline for the document type using the template.

**HARD-GATE (Standard + Full):** Present outline to user; confirm structure before writing body.

Done when: outline confirmed by user.

### Step 3 — Source material (Standard + Full)

1. Read every source document in full before writing.
2. For each section: identify which source(s) it draws from.
3. Flag any sections that lack source material — ask the user to provide input or approve a gap.

Skip for Quick tier.

Done when: sources mapped to sections; gaps identified and flagged.

### Step 4 — Write

Write each section in full:
- All factual claims must cite a source (resource article, research brief, design record, dev-log entry).
- If a section has no source: mark it `[DRAFT — needs input]`. Never invent facts.

Done when: all sections written; all unsourced sections marked `[DRAFT — needs input]`.

### Step 5 — Review gate (Standard + Full)

1. Present the full draft; ask: "Is this ready to publish or still draft?"
2. **Full:** Simulate a peer review — identify weak arguments, missing context, and open questions. Present findings to the user.
3. Address all HARD-GATE issues before proceeding.

Skip for Quick tier.

Done when: review findings addressed; mode (draft vs. publish) confirmed.

### Step 6 — Close

1. Draft mode: write to `projects/<name>/drafts/<slug>.md`.
2. Publish mode: write to `projects/<name>/docs/<slug>.md`.
3. For ADRs being published: also write to `projects/<name>/design/adr-<slug>.md` if not already there.
4. Update `status:` front matter field (draft → accepted/published as appropriate).
5. Append dev-log entry:

```markdown
## <YYYY-MM-DD> — write — <doc-type>: <title>
**Phase:** write [draft | publish]
**Duration:** <estimate>
**Summary:** <what was written>
**Key decisions:** <structural choices made>
**Deferred:** <sections left as [DRAFT — needs input]>
**Next:** <review, publish, or share>
```

6. Append work log entry to `## Day` zone of today's daily note.
7. Mark matching task items as done.
8. Commit: `Write <doc-type>: <slug>` or `Publish <doc-type>: <slug>`.
9. Enrich `resources/` with any new knowledge extracted during writing.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Document structure matches target format (ADR/RFC/proposal)
- [ ] All claims are substantiated
- [ ] Cross-references and links are valid
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: document filed; dev-log entry appended; daily note updated; committed.

**END-GATE:** Present final deliverables to the user.

---

## Document Type Templates

### RFC

For RFC format: use `.opencode/skills/projects/rfc-template.md`.

### Spec

For Spec format: use `.opencode/skills/projects/spec-template.md`.

### Postmortem

```markdown
---
updated: <date>
tags: [postmortem, <incident>]
---
# Postmortem: <incident title>
## Summary
## Timeline
## Root Cause
## Contributing Factors
## Impact
## Response
## Lessons Learned
## Action Items
- [ ] <action> — owner: <name>, due: <date>
```

For ADR format: see `design.md` (Step 6 ADR format block).
For meeting notes: use `.opencode/skills/journal/meeting-template.md`.
For proposals: use Spec template; adjust sections to: Summary, Problem, Proposed Solution, Alternatives, Risks, Success Criteria.

---

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Document (draft) | `projects/<name>/drafts/<slug>.md` | Markdown |
| Document (published) | `projects/<name>/docs/<slug>.md` | Markdown |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | `Write <doc-type>: <slug>` or `Publish <doc-type>: <slug>` |

## Error Handling

- **Source material missing for a section:** Mark `[DRAFT — needs input]`; do not invent. Surface the gap to the user.
- **Existing document found at Step 1:** Ask whether to update it or create a new one. Default to update if it covers the same topic.
- **User requests immediate publish without review:** Warn that publishing skips the review gate; confirm explicitly before proceeding.
- **ADR draft already exists in `projects/<name>/design/`:** Load it as the primary source; do not create a new file unless told to.

## Contracts

1. Every factual claim must cite a source or be marked `[ASSUMED]`.
2. Sections without source material are marked `[DRAFT — needs input]`, never invented.
3. Default to draft. Publishing requires explicit user confirmation.
4. ADRs are never deleted. Status transitions update `status:` and `superseded-by:` fields.
5. Commit format: `Write <doc-type>: <slug>` or `Publish <doc-type>: <slug>`.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Draft written; ready for review | `self-review` |
| Draft written; implementation can begin | `implement` |
| Postmortem written; action items ready | `plan` to operationalize them |
| ADR draft written; ready to finalize | Re-invoke `write` in publish mode |
| Writing reveals problem framing issues | `brainstorm` |
| New knowledge surfaced during writing | `resource-enrich` or `resource-ingest` |
