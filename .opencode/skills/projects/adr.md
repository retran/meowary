---
name: projects/adr
description: Architecture Decision Record format — local file structure, section rules, sub-ADR splitting, and Confluence publishing process. Load when drafting, updating, or archiving an ADR.
compatibility: opencode
---

ADRs are drafted locally in `projects/<name>/` before publishing to Confluence. ADRs are not stored in `resources/` — Confluence is the source of truth for accepted ADRs. Local files are working drafts only.

For org-specific ADR conventions (storage locations, naming series, Confluence spaces, decision process), see `context/context.md`.

---

## ADR Principles

- **Time proportional to impact.** Invest writing effort matching the decision's impact. Low-impact, easily reverted choice → short ADR. Cross-cutting architectural shift → thorough analysis.
- **Enforcement is mandatory.** Accepted ADRs are binding, not advisory. Supersede with a new ADR if a decision no longer fits — never silently ignore it.
- **Single-option ADRs are valid.** When a decision is top-down or the choice is obvious, document the reasoning without listing alternatives. Still write Background and Consequences.
- **Group into decision logs.** ADRs belong to decision logs organized by area or team. Each log groups related decisions for discoverability.
- **Store where most useful.** Place ADRs close to the teams and codebases they affect.

---

## ADR Lifecycle

Three phases. Each phase has a different document style.

| Phase | ADR State | Purpose |
|-------|-----------|---------|
| Before development | `PROPOSED` | Design/discussion doc. Explorative style — investigate options, take readers on your journey. Drives stakeholder alignment. |
| During development | `ACCEPTED` | Record of decision. Concise, precise. Explains why the chosen option was selected over alternatives. |
| After development | — | Update architecture docs (e.g. C4 diagrams). |

ADRs can be created and edited by everyone. Accepted ADRs reflect historical decisions — never edit them retroactively. Supersede with a new ADR instead.

---

## Writing Process

Write in stages. Each stage ends with a review before proceeding.

1. **Outline** — skeleton with section headings and one-line summaries. No prose. Review before writing.
2. **Section by section** — write one section at a time, review before the next.
3. **Publish** — create or update the Confluence page once all sections are approved.

---

## Local File Format

### File Location

Draft ADRs live in `projects/<name>/` — never in `resources/`. File naming follows the `<area>-NNN` scheme. Zero-pad to three digits (e.g. `auth-001`, `api-003`). The specific naming series for this repo are defined in `context/context.md`.

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

- `type`: always `adr` for local draft files (not `resource`).
- `tags`: must include `architecture` and `adr`. Add at least one domain tag.
- `aliases`: include the ADR ID so Obsidian resolves wikilinks.
- `updated`: set on creation; update only for administrative changes (status, back-links, typos).
- `status`: `DRAFT` → `PROPOSED` → `ACCEPTED` (or `REJECTED` / `SUPERSEDED`).

### Reference Formats

ADRs in this repo blend two established formats:

- **Nygard (2011):** Minimal. Sections: Title, Context, Decision, Status, Consequences. Decision in active voice ("We will use X."). 1–2 pages. Context = value-neutral facts only.
- **MADR (Markdown ADR):** Adds Options Considered with pros/cons per option, Decision Drivers, Decision Outcome with confirmation.

The authoritative template reference is in `context/context.md`.

### Immutability

**A finalised ADR must not be edited.** Once status moves beyond `DRAFT`, the content is frozen.

- To change a decision: create a new ADR and set the old one to `SUPERSEDED`.
- Add `**Superseded by**` and `**Supersedes**` rows to the metadata tables of both ADRs.
- Permitted edits after acceptance: updating status, adding back-links, fixing typos. Never rewrite Background, Options, Decision, or Consequences — supersede instead.

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

Add `**Superseded by**` or `**Supersedes**` rows when relevant.

**Status values:**

| Value | Meaning |
|-------|---------|
| `DRAFT` | Content incomplete; not ready for reference |
| `PROPOSED` | Written and ready for review; decision not yet made |
| `ACCEPTED` | Decision made and active |
| `REJECTED` | Option evaluated and rejected |
| `SUPERSEDED` | Replaced by a newer ADR |

### Section Structure

```
## Background
## Options Considered   ← omit for top-down or Y-Statement decisions
## Decision
## Consequences
## Related
## Changelog
```

**Background** (= Nygard's "Context"): What situation forced this decision? State constraints and challenges. 2–5 sentences. **Value-neutral facts only** — no opinions, no advocacy for any option.

**Options Considered** *(optional)*: Include when two or more real alternatives were evaluated. Omit when top-down, no alternatives, or Y-Statement format. When present, use a table:

```markdown
| Option | Description | Notes |
|--------|-------------|-------|
| **Option 1** | Short title. | Pros: … Cons: … |
| **Option 2** | Short title. | Pros: … Cons: … |
```

Bold the chosen option's row after the decision is made.

**Decision**: One paragraph or bold phrase summarising what was decided. Active voice. "We will use X." Single-option ADRs are acceptable — document the reasoning anyway.

**Consequences**: Bullet list. List **all** consequences — positive, negative, and neutral. Name costs explicitly. Do not omit negatives.

**Related**: `- [Title](relative-path.md) — one-line description`. Add back-links in every linked article.

**Changelog**: Bullets, newest first. Format: `- **YYYY-MM-DD:** Action.`

### Compact Format (Y-Statement)

For low-impact or top-down decisions where a full ADR is disproportionate, replace **Options Considered** with a Y-Statement in **Decision**:

> In the context of `<use case>`, facing `<concern>`, we decided for `<option>` to achieve `<quality>`, accepting `<downside>`.

Still include front matter, H1, metadata table, Background, Consequences, Related, and Changelog.

---

## Splitting Large ADRs into Sub-ADRs

Use a main ADR + sub-ADR structure when a single decision is large enough that one document becomes hard to navigate, review, or implement in isolation.

### When to Split

Split when **any** of the following is true:

- The ADR covers multiple independently-implementable sub-decisions that could be accepted or rejected separately.
- The Consequences section exceeds 10 bullets because different aspects drive different trade-offs.
- Reviewers with different expertise need to review different parts (e.g. security reviewers for auth, platform reviewers for infra).
- One part is ready for decision now; another part is still under investigation.
- The total length exceeds ~6 pages in Confluence (a reliable readability threshold).

Do **not** split for length alone if the content is genuinely one decision. A thorough single-ADR is better than an artificial split.

### Main ADR (Summary)

The main ADR is the entry point. It answers: "What was the overall decision and where do the details live?"

**What it contains:**

- Full Background and problem statement (same as if it were a single ADR).
- Decision Drivers — the cross-cutting constraints that apply to all sub-decisions.
- A **Sub-ADR Index** section listing each sub-ADR with a one-line description.
- A high-level **Decision** paragraph summarising the overall direction.
- A **Consequences** section covering only cross-cutting effects; sub-specific effects live in the sub-ADRs.
- The main ADR **does not repeat** content that lives in the sub-ADRs — it links to it.

**Front matter:** use the same series ID as the sub-ADRs (e.g. `maia-012`). Sub-ADRs get `maia-012a`, `maia-012b`, etc.

**Metadata table:** add a `**Sub-ADRs**` row listing all sub-ADR IDs.

**Sub-ADR Index section format:**

```markdown
## Sub-ADR Index

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [maia-012a](./maia-012a.md) | Auth Strategy | ACCEPTED | Chose OAuth 2.0 over API keys for federation support. |
| [maia-012b](./maia-012b.md) | Token Storage | PROPOSED | Evaluating secure enclave vs. OS keychain. |
| [maia-012c](./maia-012c.md) | Session Lifetime | ACCEPTED | 8h access token, 30d refresh, no silent renewal. |
```

### Sub-ADRs

Each sub-ADR is a full, self-contained ADR — it can be read and decided in isolation.

**What it contains:**

- Its own Background section, scoped to the sub-problem only. One or two sentences may reference the parent for context.
- A `**Part of:**` row in its metadata table linking to the main ADR.
- Its own Options Considered, Decision, and Consequences — scoped to the sub-decision only.
- A **Related** entry pointing to the main ADR and any sibling sub-ADRs it depends on.

**What it does not contain:**

- Re-stating the full system background (link to main ADR instead).
- Decision Drivers that apply to all sub-decisions (those live in the main ADR).
- Options that belong to a different sub-ADR.

### Numbering and Naming

| Level | ID format | Example |
|-------|-----------|---------|
| Main ADR | `<area>-NNN` | `maia-012` |
| Sub-ADR | `<area>-NNNa`, `<area>-NNNb`, … | `maia-012a`, `maia-012b` |

Sub-ADR file names follow the same scheme: `maia-012a.md`, `maia-012b.md`.

Use letters, not numbers, for sub-ADRs to visually distinguish them from sequential main ADRs. Avoid more than 26 sub-ADRs (if you reach `z`, the decision needs a different decomposition strategy).

### Status and Lifecycle Rules

- The main ADR's status reflects the **overall** decision state:
  - `PROPOSED` — at least one sub-ADR is still PROPOSED.
  - `ACCEPTED` — all sub-ADRs are accepted (or explicitly marked N/A).
  - `SUPERSEDED` — the whole decision set is replaced.
- Sub-ADRs can have independent statuses. A sub-ADR can be `SUPERSEDED` while siblings remain `ACCEPTED`.
- When a sub-ADR is superseded, update the Sub-ADR Index in the main ADR to show the new status and link to the successor.
- Never change the main ADR's decision text when only one sub-ADR changes — supersede the sub-ADR and update the Index row.

### Cross-Linking Rules

- Main ADR → every sub-ADR: link in Sub-ADR Index.
- Each sub-ADR → main ADR: `**Part of:**` row in metadata table + entry in **Related** section.
- Each sub-ADR → sibling sub-ADRs it **directly depends on**: entry in **Related** section. Do not link all siblings blindly — only link when there is a real dependency.
- In Confluence: the main ADR page is the parent page; sub-ADR pages are children.

### Splitting an Existing ADR

If an existing accepted ADR needs to be split (e.g. one part needs to be superseded):

1. Create the main summary ADR as a new entry (`area-NNN`). Its background and decision reflect the original.
2. Create sub-ADRs for each distinct part. Copy the relevant sections from the original — do not rewrite accepted content.
3. Mark the original ADR `SUPERSEDED` with a `**Superseded by:**` row pointing to the main summary ADR.
4. Update all inbound links to the original ADR to point to the appropriate sub-ADR (or the main if no sub-ADR is more specific).

### Editor Checklist for Split ADRs

**Main ADR:**
- [ ] Sub-ADR Index table present with ID, Title, Status, Summary columns?
- [ ] `**Sub-ADRs**` row in metadata table?
- [ ] Decision section covers overall direction only — no sub-specific detail?
- [ ] Consequences covers only cross-cutting effects?

**Each Sub-ADR:**
- [ ] `**Part of:**` row in metadata table linking to main ADR?
- [ ] Background scoped to sub-problem — not repeating full system context?
- [ ] Related section links to main ADR and dependent siblings?
- [ ] Can be read and decided independently of sibling sub-ADRs?

---

## Confluence Document Structure

Used when drafting or transcribing an ADR to/from Confluence. Different from the local file format above.

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

First line of the document.

| Status | When |
|--------|------|
| `DRAFT` | Being written, not yet reviewed |
| `PROPOSED` | Ready for review / under discussion |
| `ACCEPTED` | Decision made, implementation approved |
| `SUPERSEDED` | Replaced by a later ADR (link to successor) |

In Confluence: use a colored info panel (e.g. yellow for DRAFT, blue for PROPOSED, green for ACCEPTED). In Markdown: `> **Status:** PROPOSED`.

### Deciders Block

Right after the status badge. Small table with Deciders and Date.

### Context and Problem

Leads with the actual problem. Broken into named subsections — one per sub-problem.

Each subsection:
1. **How it works** — concrete description, often with a flow (`Client -> POST -> Server`).
2. **Limitations** — specific failure modes. Not "it has drawbacks" but "it fails when X because Y".

End with a **Core Problem** subsection: three sharp paragraphs distilling the essential tension. Written last, placed last.

Concreteness means:
- Flow: `Client -> POST /register {metadata} -> Server <- {client_id}`
- Failure: "fails for GitHub because GitHub does not support DCR"
- Numbers: "10+ manual steps", "30s timeout", "90% context window threshold"

### Decision Drivers

Bullet list. One constraint or success criterion per bullet. One sentence each.

Bad: `- We need good performance`
Good: `- Client Secrets must never be distributed inside the desktop binary`

### Considered Options

One subsection per option. Title is the option name (short, noun-phrase). Each option: one paragraph + Pros bullet list + Cons bullet list. Each con names the concrete failure mode.

Options listed simplest-first; chosen option last.

### Decision Outcome

Opens with: "We will adopt Option N: Name."

One short paragraph on why. Then one subsection per rejected option titled "Why not Option N" (2-3 sentences: which driver it violates, what breaks). Optionally: numbered implementation phases.

### Action Items

`- [ ]` checkboxes. Concrete, assignable. Names what needs to happen, not who does it.

### References

Bullet list of `- [Title](URL)`.

---

## Common Mistakes

- **Vague cons.** "Has limited compatibility" is not a con. "Fails for X, Y, and Z because they do not support DCR" is.
- **Passive voice.** "The signal is not propagated" → "Tools receive no AbortSignal".
- **Marketing language.** No "robust", "seamless", "powerful".
- **Repeating context in outcome.** Outcome states the decision and why losers fail. Does not re-explain the problem.
- **Missing Core Problem.** The three-paragraph distillation is what makes the ADR readable.
- **Options without failure modes.** Every con must name what breaks and why.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type: adr`, `aliases`, `tags` (`architecture` + `adr` + domain), `status`, `updated`?
- [ ] H1 uses `[series-id]` format?
- [ ] Metadata table present with Status, Decision (one-line), Status changed on, Author, Decision makers, Confluence?
- [ ] Background is value-neutral facts only — no opinions?
- [ ] If options were evaluated: table present with chosen option bold?
- [ ] Decision in active voice?
- [ ] Consequences list ALL outcomes, including negatives?
- [ ] Every con names a concrete failure mode, not a vague drawback?
- [ ] Related section present with at least one link?
- [ ] Changelog entry for today?
- [ ] If this is a split ADR: Sub-ADR Index table present in main ADR? Each sub-ADR has `**Part of:**` row and links back to main?
