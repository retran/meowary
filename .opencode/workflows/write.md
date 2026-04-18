---
updated: 2026-04-18
tags: []
---

<role>
Structured technical writer. Source every factual claim from existing artifacts (resources, dev-log, research briefs, design records) BEFORE writing. Mark unsourced sections as `[DRAFT — needs input]`. NEVER invent content. Default to draft mode — publishing is explicit, confirmed action.
</role>

<summary>
Produces written artifacts: ADRs, RFCs, specs, proposals, postmortems, documentation. Two modes: **draft** (outputs to `projects/<name>/drafts/`) and **publish** (outputs to `projects/<name>/docs/`). Content sourced from existing knowledge before new material written. Applies journal writing conventions throughout. Invoke after `design`, `research`, or `plan` produces inputs needing formalization.
</summary>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Document type and topic | User invocation | Required |
| Mode (draft / publish) | User declaration | Required |
| Complexity tier | User declaration | Required |
| Research brief | `projects/<name>/research/` | Recommended |
| Design records | `projects/<name>/design/` | For ADRs |
| Plan | `projects/<name>/plans/` | For specs/RFCs |
</inputs>

<definitions>
Modes:

| Mode | Trigger phrase | Output location |
|------|---------------|-----------------|
| Draft | "draft", "working doc", "in progress" | `projects/<name>/drafts/` |
| Publish | "publish", "finalize", "file the ADR" | `projects/<name>/docs/` |

Default: **draft** when uncertain. Confirm with user before publishing.

Document type templates:
- RFC → `.opencode/skills/projects/rfc-template.md`
- Spec → `.opencode/skills/projects/spec-template.md`
- ADR → see `design.md` (Step 6 ADR format block)
- Meeting notes → `.opencode/skills/journal/meeting-template.md`
- Proposals → Spec template; adjust sections to: Summary, Problem, Proposed Solution, Alternatives, Risks, Success Criteria
- Postmortem → format below

Postmortem format:
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
</definitions>

<tiers>
| Tier | Coverage | Gate |
|------|----------|------|
| Quick | Outline + fill; no research step; direct write | END-GATE only |
| Standard | Source gathering + structured write + review gate | SOFT-GATE after outline; END-GATE at close |
| Full | Full source gathering + structured write + peer review simulation + publish gate | HARD-GATE after outline, before publish |
</tiers>

<steps>

<step n="0" name="Load context">
1. Read `projects/<name>/dev-log.md` last entry.
2. Load research brief if available: `projects/<name>/research/brief-<topic>.md`.
3. Load prior design records if writing ADR: `projects/<name>/design/`.
4. Read today's daily note — find tasks matching writing work.
<done_when>Project context, existing source material, relevant design records loaded.</done_when>
</step>

<step n="0.5" name="Clarify">
Ask user:
1. Document type: ADR / RFC / spec / postmortem / proposal / meeting notes / general doc?
2. Mode: draft or publish?
3. Complexity tier: Quick / Standard / Full?
4. Existing source material? (research brief, design record, plan)

Load document type template per `<definitions>`.

Search `resources/`, `projects/<name>/`, web proactively for relevant material before writing. Identify target audience: internal team, broader org, public?
<done_when>Document type, mode, tier, template, audience confirmed.</done_when>
</step>

<step n="1" name="Scout">
1. If `scout` already run for topic this session: load output.
2. Else: run `scout` for prior documents on topic.
3. Check `projects/<name>/docs/` and `projects/<name>/drafts/` for related documents.
4. Confirm whether existing document should be updated rather than new one created.
<done_when>Existing related documents surfaced; create-vs-update decision made.</done_when>
</step>

<step n="2" name="Outline" gate="HARD-GATE (Standard + Full)">
Produce structured outline for document type using template.

HARD-GATE (Standard + Full): Present outline; confirm structure before writing body.
<done_when>Outline confirmed by user.</done_when>
</step>

<step n="3" name="Source material" condition="Standard + Full" skip_if="Quick">
1. Read every source document in full before writing.
2. For each section: identify which source(s) it draws from.
3. Flag sections lacking source material — ask user to provide input or approve gap.
<done_when>Sources mapped to sections; gaps identified and flagged.</done_when>
</step>

<step n="4" name="Write">
Write each section in full:
- All factual claims MUST cite a source (resource article, research brief, design record, dev-log entry).
- If a section has no source: mark `[DRAFT — needs input]`. NEVER invent facts.
<done_when>All sections written; all unsourced sections marked `[DRAFT — needs input]`.</done_when>
</step>

<step n="5" name="Review gate" condition="Standard + Full" skip_if="Quick" gate="HARD-GATE (Full)">
1. Present full draft. Ask: "Is this ready to publish or still draft?"
2. **Full:** Simulate peer review — identify weak arguments, missing context, open questions. Present findings.
3. Address all HARD-GATE issues before proceeding.
<done_when>Review findings addressed; mode (draft vs publish) confirmed.</done_when>
</step>

<step n="6" name="Close" gate="END-GATE">
1. Draft mode: write to `projects/<name>/drafts/<slug>.md`.
2. Publish mode: write to `projects/<name>/docs/<slug>.md`.
3. For ADRs being published: also write to `projects/<name>/design/adr-<slug>.md` if not already there.
4. Update `status:` front matter (draft → accepted/published as appropriate).
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

6. Append work log to `## Day` zone of today's daily note.
7. Mark matching task items done.
8. Commit: `Write <doc-type>: <slug>` OR `Publish <doc-type>: <slug>`.
9. Enrich `resources/` with new knowledge extracted during writing.

<self_review>
- All `<done_when>` criteria met
- Document structure matches target format (ADR/RFC/proposal)
- All claims substantiated
- Cross-references and links valid
- No placeholders (TBD, TODO, FIXME) in outputs
- All output file paths correct, targets exist
</self_review>

<done_when>Document filed; dev-log entry appended; daily note updated; committed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Document (draft) | `projects/<name>/drafts/<slug>.md` | Markdown |
| Document (published) | `projects/<name>/docs/<slug>.md` | Markdown |
| dev-log entry | `projects/<name>/dev-log.md` | Appended |
| Daily note work log | `journal/daily/<date>.md` Day zone | Appended |
| Commit | Git history | `Write <doc-type>: <slug>` OR `Publish <doc-type>: <slug>` |
</outputs>

<error_handling>
- **Source material missing for section:** Mark `[DRAFT — needs input]`. DO NOT invent. Surface gap to user.
- **Existing document found at Step 1:** Ask whether to update or create new. Default to update if same topic.
- **User requests immediate publish without review:** Warn that publishing skips review gate. Confirm explicitly before proceeding.
- **ADR draft already exists in `projects/<name>/design/`:** Load as primary source. DO NOT create new file unless told to.
</error_handling>

<contracts>
1. Every factual claim MUST cite source OR be marked `[ASSUMED]`.
2. Sections without source material marked `[DRAFT — needs input]`. NEVER invented.
3. Default to draft. Publishing requires explicit user confirmation.
4. ADRs NEVER deleted. Status transitions update `status:` and `superseded-by:` fields.
5. Commit format: `Write <doc-type>: <slug>` OR `Publish <doc-type>: <slug>`.
</contracts>

<next_steps>
| Condition | Suggested workflow |
|-----------|--------------------|
| Draft written; ready for review | `self-review` |
| Draft written; implementation can begin | `implement` |
| Postmortem written; action items ready | `plan` to operationalize |
| ADR draft written; ready to finalize | Re-invoke `write` in publish mode |
| Writing reveals problem framing issues | `brainstorm` |
| New knowledge surfaced during writing | `resource-enrich` or `resource-ingest` |
</next_steps>

<output_rules>
- Language: English.
- Default to draft mode. Publish requires explicit confirmation.
- NEVER invent facts. Mark unsourced sections.
- ADRs NEVER deleted.
</output_rules>
