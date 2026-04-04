---
name: writing
description: Write or edit any journal content — KB articles, ADRs, meeting notes, daily notes, weekly notes, READMEs, structured notes — following repo style and structure rules
compatibility: opencode
---

## Sub-skills

Load these on top of `writing` for specialised content types:

| Content type | Sub-skill file |
|-------------|---------------|
| Architecture Decision Records (draft in `projects/`) | `writing/adr.md` |
| Meeting notes (`journal/meetings/`) | `writing/meeting.md` |
| Daily notes (`journal/daily/`) | `writing/daily.md` |
| Weekly notes (`journal/weekly/`) | `writing/weekly.md` |
| Area dashboards (`areas/`) | `writing/area.md` |

---

## Language & Style

- **Active voice.** Specify who or what acts. Prefer verbs over nouns: "compacts the history" not "performs history compaction". Use passive only when the actor is irrelevant.
- **No nominalizations.** "Configure the server" not "make a configuration of the server." "Analyze the response" not "perform an analysis of the response."
- **Imperative mood for instructions.** "Click **Submit**" not "The user should click Submit."
- **Cut filler.** Delete words that add no meaning: "basically", "essentially", "in order to", "it should be noted that", "comprehensive", "robust", "leverages". If a sentence works without a word, drop it.
- **No marketing language.** Do not write "powerful", "seamless", "cutting-edge", "world-class", "innovative", "state-of-the-art". Describe what the thing _does_, not how impressive it is.
- **No ceremonial phrasing.** State the fact. Never write "It is important to note that" or "This section provides an overview of."
- **Be concrete.** "Retries with exponential backoff" is better than "sophisticated retry mechanism". "200+ C# projects" is better than "a large number of projects".
- **Short sentences.** One idea per sentence. Target 15–20 words. If a sentence has more than two commas, split it.
- **Front-load.** Put the most important information first.
- **Say it once.** Link instead of repeating.

## Structure

- **Tables and bullets over prose.** Use prose only when a list would fragment meaning.
- **Numbered lists for sequential steps only.** Bullets for everything else.
- **Headings as labels.** Short noun phrases, not sentences.
- **Lead with outcome.** State the result or decision first, then context, then details.

## Formatting

- **UI elements:** Bold buttons, menus, labels. Example: Click **Save**, go to **Settings > Profile**.
- **Code and paths:** `inline code` for filenames, paths, variables, endpoints, method names, config keys, short commands.
- **Code blocks:** Triple backticks with a language identifier. Add brief inline comments for non-obvious logic.
- **Bold** key terms and decision outcomes on first use in a section.

---

## Tag Conventions

Tags organize content across the journal. Full tag reference with all prefixes and registration rules: load `resources` skill → [ref-tags.md](../resources/ref-tags.md).

Key rules:
- **Lowercase kebab-case**, no `#` prefix in front matter. Inline tags in body text use `#` prefix.
- **Prefixes by type:** `p-` (project), `t-` (team), `person-` (person), no prefix for topics.
- **Register every tag** in `tags.md` before first use. Check `tags.md` to avoid duplicates.
- **Front matter tags and inline tags should match.** Every inline `#tag` in the body should appear in front matter `tags` (without `#`).
- **Tag sparingly.** Apply tags that add findability. Do not tag every noun.

---

## Editor checklist (run silently before every output)

**Style:**
- [ ] Any filler, marketing words, or useless adjectives? Delete them.
- [ ] Any nominalizations? Replace with verbs.
- [ ] Any passive voice where the actor is known? Make it active.
- [ ] All instructions in imperative mood?
- [ ] Sentences under 20 words?

**Structure:**
- [ ] Steps numbered; non-sequential items bulleted?
- [ ] Tables used for comparisons and structured data?
- [ ] Headings are short noun phrases, not sentences?

---

## When to use me

Load this skill when:
- Writing or editing any KB article
- Drafting a project README or overview section
- Editing structured notes that will be referenced repeatedly
- Reviewing any documentation draft for style and structure

For specialised content types, also load the relevant sub-skill listed in the table above.
