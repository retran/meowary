---
name: projects/adr
description: Architecture Decision Record format — local file structure, section rules, sub-ADR splitting, and Confluence publishing process. Load when drafting, updating, or archiving an ADR.
compatibility: opencode
updated: 2026-04-18
---

<role>ADR steward — author and maintainer of architecture decision records, local drafts and Confluence publication.</role>

<summary>
> ADRs are drafted locally in `projects/<name>/` before publishing to Confluence. ADRs are NOT stored in `resources/` — Confluence is source of truth for accepted ADRs. Local files are working drafts only. For org-specific conventions (storage locations, naming series, Confluence spaces, decision process), see `context/context.md`.
</summary>

<principles>
- **Time proportional to impact.** Match writing effort to decision impact. Low-impact reversible → short ADR. Cross-cutting shift → thorough analysis.
- **Enforcement is mandatory.** Accepted ADRs are binding, not advisory. SUPERSEDE with new ADR if decision no longer fits — NEVER silently ignore.
- **Single-option ADRs are valid.** When top-down or obvious, document reasoning without alternatives. Still write Background and Consequences.
- **Group into decision logs.** ADRs belong to logs organized by area or team.
- **Store where most useful.** Place close to teams and codebases affected.
</principles>

<lifecycle>
Three phases. Each has different document style.

| Phase | ADR State | Purpose |
|-------|-----------|---------|
| Before development | `PROPOSED` | Design/discussion doc. Explorative — investigate options, take readers on journey. Drives stakeholder alignment. |
| During development | `ACCEPTED` | Record of decision. Concise, precise. Explains why chosen option selected over alternatives. |
| After development | — | Update architecture docs (e.g. C4 diagrams). |

ADRs can be created/edited by everyone. Accepted ADRs reflect historical decisions — NEVER edit retroactively. SUPERSEDE with new ADR instead.
</lifecycle>

<writing_process>
Write in stages. Each stage ends with review before proceeding.

1. **Outline** — skeleton with section headings + one-line summaries. NO prose. Review before writing.
2. **Section by section** — write one at a time, review before next.
3. **Publish** — create or update Confluence page once all sections approved.
</writing_process>

<local_file_format>
### File Location

Drafts in `projects/<name>/` — NEVER in `resources/`. Naming: `<area>-NNN`, zero-padded to 3 digits (e.g. `auth-001`, `api-003`). Specific series in `context/context.md`.

### Front Matter

```yaml
---
type: adr
aliases: ["<series-id>", "<Human Readable Title>"]
tags: [architecture, adr, <domain-tag>]
status: DRAFT
updated: YYYY-MM-DD
---
```

- `type`: ALWAYS `adr` for local drafts (not `resource`).
- `tags`: MUST include `architecture` and `adr`. Add ≥1 domain tag.
- `aliases`: include ADR ID so Obsidian resolves wikilinks.
- `updated`: set on creation; update only for administrative changes (status, back-links, typos).
- `status`: `DRAFT` → `PROPOSED` → `ACCEPTED` (or `REJECTED` / `SUPERSEDED`).

### Reference Formats

ADRs blend two established formats:
- **Nygard (2011):** Minimal. Sections: Title, Context, Decision, Status, Consequences. Decision in active voice ("We will use X."). 1–2 pages. Context = value-neutral facts only.
- **MADR (Markdown ADR):** Adds Options Considered with pros/cons, Decision Drivers, Decision Outcome with confirmation.

Authoritative template reference in `context/context.md`.

### Immutability

**A finalized ADR MUST NOT be edited.** Once status moves beyond `DRAFT`, content is frozen.

- To change a decision: CREATE new ADR; set old to `SUPERSEDED`.
- ADD `**Superseded by**` and `**Supersedes**` rows to metadata tables of both.
- Permitted edits after acceptance: status, back-links, typos. NEVER rewrite Background, Options, Decision, or Consequences — supersede instead.

### H1 and Metadata Table

```markdown
# [<series-id>] <Title>

| Field | Value |
|-------|-------|
| **Status** | DRAFT |
| **Decision** | One-line summary of the decision made. |
| **Status changed on** | YYYY-MM-DD |
| **Author** | Name |
| **Decision makers** | Name, Name |
| **Confluence** | [page-id](url) |
```

ADD `**Superseded by**` or `**Supersedes**` rows when relevant.

**Status values:**

| Value | Meaning |
|-------|---------|
| `DRAFT` | Content incomplete; not ready for reference |
| `PROPOSED` | Written and ready for review; decision not yet made |
| `ACCEPTED` | Decision made and active |
| `REJECTED` | Option evaluated and rejected |
| `SUPERSEDED` | Replaced by newer ADR |

### Section Structure

```
## Background
## Options Considered   ← omit for top-down or Y-Statement decisions
## Decision
## Consequences
## Related
## Changelog
```

**Background** (= Nygard's "Context"): What situation forced this decision? State constraints and challenges. 2–5 sentences. **Value-neutral facts only** — NO opinions, NO advocacy.

**Options Considered** *(optional)*: Include when ≥2 real alternatives evaluated. OMIT when top-down, no alternatives, or Y-Statement format. When present, USE table:

```markdown
| Option | Description | Notes |
|--------|-------------|-------|
| **Option 1** | Short title. | Pros: … Cons: … |
| **Option 2** | Short title. | Pros: … Cons: … |
```

BOLD chosen option's row after decision is made.

**Decision**: One paragraph or bold phrase. Active voice. "We will use X." Single-option ADRs acceptable — document reasoning anyway.

**Consequences**: Bullet list. List **all** consequences — positive, negative, neutral. NAME costs explicitly. DO NOT omit negatives.

**Related**: `- [Title](relative-path.md) — one-line description`. ADD back-links in every linked article.

**Changelog**: Bullets newest-first. Format: `- **YYYY-MM-DD:** Action.`

### Compact Format (Y-Statement)

For low-impact or top-down decisions where full ADR is disproportionate, REPLACE **Options Considered** with Y-Statement in **Decision**:

> In the context of `<use case>`, facing `<concern>`, we decided for `<option>` to achieve `<quality>`, accepting `<downside>`.

Still include front matter, H1, metadata table, Background, Consequences, Related, Changelog.
</local_file_format>

<sub_adr_splitting>
USE main ADR + sub-ADR structure when single decision is large enough that one document becomes hard to navigate, review, or implement in isolation.

### When to Split

Split when **any** of:
- Multiple independently-implementable sub-decisions that could be accepted/rejected separately.
- Consequences exceeds 10 bullets because different aspects drive different trade-offs.
- Reviewers with different expertise need to review different parts (e.g. security for auth, platform for infra).
- One part ready for decision now; another still under investigation.
- Total length >~6 pages in Confluence (reliable readability threshold).

DO NOT split for length alone if content is genuinely one decision. A thorough single-ADR is better than artificial split.

### Main ADR (Summary)

Entry point. Answers: "What was the overall decision and where do details live?"

**Contains:**
- Full Background and problem statement (same as single ADR).
- Decision Drivers — cross-cutting constraints applying to all sub-decisions.
- **Sub-ADR Index** section listing each sub-ADR with one-line description.
- High-level **Decision** paragraph summarizing overall direction.
- **Consequences** covering only cross-cutting effects; sub-specific live in sub-ADRs.
- DOES NOT repeat content living in sub-ADRs — links to it.

**Front matter:** USE same series ID as sub-ADRs (e.g. `maia-012`). Sub-ADRs get `maia-012a`, `maia-012b`, etc.

**Metadata table:** ADD `**Sub-ADRs**` row listing all sub-ADR IDs.

**Sub-ADR Index format:**

```markdown
## Sub-ADR Index

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [maia-012a](./maia-012a.md) | Auth Strategy | ACCEPTED | Chose OAuth 2.0 over API keys for federation support. |
| [maia-012b](./maia-012b.md) | Token Storage | PROPOSED | Evaluating secure enclave vs. OS keychain. |
| [maia-012c](./maia-012c.md) | Session Lifetime | ACCEPTED | 8h access token, 30d refresh, no silent renewal. |
```

### Sub-ADRs

Each is full self-contained ADR — readable and decidable in isolation.

**Contains:**
- Own Background scoped to sub-problem only. 1–2 sentences may reference parent for context.
- `**Part of:**` row in metadata table linking to main ADR.
- Own Options Considered, Decision, Consequences — scoped to sub-decision only.
- **Related** entry pointing to main ADR and any sibling sub-ADRs depended on.

**DOES NOT contain:**
- Re-stating full system background (link to main instead).
- Decision Drivers applying to all sub-decisions (those live in main).
- Options belonging to different sub-ADR.

### Numbering and Naming

| Level | ID format | Example |
|-------|-----------|---------|
| Main ADR | `<area>-NNN` | `maia-012` |
| Sub-ADR | `<area>-NNNa`, `<area>-NNNb`, … | `maia-012a`, `maia-012b` |

Sub-ADR file names follow same scheme: `maia-012a.md`, `maia-012b.md`.

USE letters, not numbers, for sub-ADRs to visually distinguish from sequential main ADRs. AVOID >26 sub-ADRs (if you reach `z`, decision needs different decomposition).

### Status and Lifecycle Rules

- Main ADR's status reflects **overall** decision state:
  - `PROPOSED` — at least one sub-ADR still PROPOSED.
  - `ACCEPTED` — all sub-ADRs accepted (or marked N/A).
  - `SUPERSEDED` — whole decision set replaced.
- Sub-ADRs can have independent statuses. A sub-ADR can be `SUPERSEDED` while siblings remain `ACCEPTED`.
- When sub-ADR superseded, UPDATE Sub-ADR Index in main to show new status and link to successor.
- NEVER change main ADR's decision text when only one sub-ADR changes — supersede sub-ADR and update Index row.

### Cross-Linking Rules

- Main ADR → every sub-ADR: link in Sub-ADR Index.
- Each sub-ADR → main: `**Part of:**` row in metadata + entry in **Related**.
- Each sub-ADR → sibling sub-ADRs **directly depended on**: entry in **Related**. DO NOT link all siblings blindly — only when real dependency.
- In Confluence: main ADR page is parent; sub-ADR pages are children.

### Splitting an Existing ADR

If existing accepted ADR needs split (e.g. one part needs supersede):

1. Create main summary ADR as new entry (`area-NNN`). Background and decision reflect original.
2. Create sub-ADRs for each distinct part. COPY relevant sections from original — DO NOT rewrite accepted content.
3. Mark original `SUPERSEDED` with `**Superseded by:**` row pointing to main summary.
4. Update inbound links to original to point to appropriate sub-ADR (or main if no sub-ADR more specific).

### Self-review for Split ADRs

**Main ADR:**
- [ ] Sub-ADR Index table present (ID, Title, Status, Summary)?
- [ ] `**Sub-ADRs**` row in metadata?
- [ ] Decision covers overall direction only — no sub-specific detail?
- [ ] Consequences covers only cross-cutting effects?

**Each Sub-ADR:**
- [ ] `**Part of:**` row in metadata linking to main?
- [ ] Background scoped to sub-problem — not repeating full system context?
- [ ] Related links to main and dependent siblings?
- [ ] Readable and decidable independently of siblings?
</sub_adr_splitting>

<confluence_document_structure>
USE when drafting or transcribing ADR to/from Confluence. Different from local file format.

```
Status badge
Deciders block
Context and Problem
  [named subsections, one per sub-problem]
  Core Problem
Decision Drivers
Considered Options
  [one subsection per option]
Decision Outcome
  [one subsection per rejected option, explaining why it fails]
  [Chosen option summary]
Action Items
References
```

### Status Badge

First line.

| Status | When |
|--------|------|
| `DRAFT` | Being written, not yet reviewed |
| `PROPOSED` | Ready for review / under discussion |
| `ACCEPTED` | Decision made, implementation approved |
| `SUPERSEDED` | Replaced by later ADR (link to successor) |

Confluence: colored info panel (yellow DRAFT, blue PROPOSED, green ACCEPTED). Markdown: `> **Status:** PROPOSED`.

### Deciders Block

Right after status badge. Small table with Deciders and Date.

### Context and Problem

Leads with actual problem. Broken into named subsections — one per sub-problem.

Each subsection:
1. **How it works** — concrete description, often with flow (`Client -> POST -> Server`).
2. **Limitations** — specific failure modes. NOT "it has drawbacks" but "it fails when X because Y".

END with **Core Problem** subsection: three sharp paragraphs distilling essential tension. Written last, placed last.

Concreteness means:
- Flow: `Client -> POST /register {metadata} -> Server <- {client_id}`
- Failure: "fails for GitHub because GitHub does not support DCR"
- Numbers: "10+ manual steps", "30s timeout", "90% context window threshold"

### Decision Drivers

Bullet list. One constraint or success criterion per bullet. One sentence each.

Bad: `- We need good performance`
Good: `- Client Secrets must never be distributed inside the desktop binary`

### Considered Options

One subsection per option. Title is option name (short, noun-phrase). Each: one paragraph + Pros bullet list + Cons bullet list. Each con NAMES concrete failure mode.

Options listed simplest-first; chosen option last.

### Decision Outcome

Opens with: "We will adopt Option N: Name."

One short paragraph on why. Then one subsection per rejected option titled "Why not Option N" (2–3 sentences: which driver violated, what breaks). Optionally: numbered implementation phases.

### Action Items

`- [ ]` checkboxes. Concrete, assignable. NAMES what needs to happen, not who does it.

### References

Bullet list of `- [Title](URL)`.
</confluence_document_structure>

<common_mistakes>
- **Vague cons.** "Has limited compatibility" is not a con. "Fails for X, Y, and Z because they do not support DCR" is.
- **Passive voice.** "The signal is not propagated" → "Tools receive no AbortSignal".
- **Marketing language.** NO "robust", "seamless", "powerful".
- **Repeating context in outcome.** Outcome states decision and why losers fail. Does NOT re-explain problem.
- **Missing Core Problem.** Three-paragraph distillation makes ADR readable.
- **Options without failure modes.** Every con MUST name what breaks and why.
</common_mistakes>

<self_review>
- [ ] Front matter complete (`type: adr`, `aliases`, `tags` (`architecture` + `adr` + domain), `status`, `updated`)?
- [ ] H1 uses `[series-id]` format?
- [ ] Metadata table present (Status, Decision one-line, Status changed on, Author, Decision makers, Confluence)?
- [ ] Background value-neutral facts only — no opinions?
- [ ] If options evaluated: table present with chosen option BOLD?
- [ ] Decision in active voice?
- [ ] Consequences list ALL outcomes including negatives?
- [ ] Every con names concrete failure mode, not vague drawback?
- [ ] Related section present with ≥1 link?
- [ ] Changelog entry for today?
- [ ] If split ADR: Sub-ADR Index in main? Each sub has `**Part of:**` and links back?
</self_review>

<output_rules>
Output language: English. Frontmatter, status values, section headers, metadata field labels remain English.
</output_rules>
