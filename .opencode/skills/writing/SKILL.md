---
name: writing
description: Prose quality rules — active voice, concision, formatting conventions, and editor checklist. Load when writing or editing any human-readable content: resource articles, notes, ADRs, RFCs, proposals, READMEs, or any document.
compatibility: opencode
updated: 2026-04-18
---

<role>Prose quality authority for all human-readable content.</role>

<summary>
> Active voice. Cut filler. Be concrete. Short sentences. Tables/bullets over prose. Lead with outcome.
</summary>

<language_style>
- **Active voice.** Specify who/what acts. Verbs over nouns: "compacts the history" NOT "performs history compaction". Passive only when actor irrelevant.
- **No nominalizations.** "Configure the server" NOT "make a configuration of the server." "Analyze the response" NOT "perform an analysis of the response."
- **Imperative mood for instructions.** "Click **Submit**" NOT "The user should click Submit."
- **Cut filler.** Delete: "basically", "essentially", "in order to", "it should be noted that", "comprehensive", "robust", "leverages". If sentence works without word, drop it.
- **No marketing language.** NEVER write "powerful", "seamless", "cutting-edge", "world-class", "innovative", "state-of-the-art". Describe what it *does*.
- **No ceremonial phrasing.** State the fact. NEVER "It is important to note that" or "This section provides an overview of."
- **Be concrete.** "Retries with exponential backoff" beats "sophisticated retry mechanism". "200+ C# projects" beats "a large number of projects".
- **Short sentences.** One idea per sentence. Target 15–20 words. >2 commas? Split.
- **Front-load.** Most important info first.
- **Say it once.** Link instead of repeating.
</language_style>

<structure>
- **Tables and bullets over prose.** Prose only when list would fragment meaning.
- **Numbered lists for sequential steps only.** Bullets for everything else.
- **Headings as labels.** Short noun phrases, NOT sentences.
- **Lead with outcome.** State result/decision first, then context, then details.
</structure>

<formatting>
- **UI elements:** Bold buttons, menus, labels. Example: Click **Save**, go to **Settings > Profile**.
- **Code and paths:** `inline code` for filenames, paths, variables, endpoints, method names, config keys, short commands.
- **Code blocks:** Triple backticks with language identifier. Brief inline comments for non-obvious logic.
- **Bold** key terms and decision outcomes on first use in section.
</formatting>

<self_review>

**Style:**
- [ ] Filler/marketing/useless adjectives? Delete.
- [ ] Nominalizations? Replace with verbs.
- [ ] Passive voice with known actor? Make active.
- [ ] All instructions in imperative?
- [ ] Sentences <20 words?

**Structure:**
- [ ] Steps numbered; non-sequential items bulleted?
- [ ] Tables for comparisons and structured data?
- [ ] Headings short noun phrases, not sentences?

</self_review>

<output_rules>Output in English. Apply rules to own output.</output_rules>
