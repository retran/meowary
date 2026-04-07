---
name: writing
description: Write or edit any journal content — resource articles, ADRs, meeting notes, daily notes, weekly notes, READMEs, structured notes — following repo style and structure rules. Use when writing or editing any journal file.
compatibility: opencode
---

## Sub-skills

Load these on top of `writing` for specialised content types:

| Trigger | Sub-skill |
|---------|-----------|
| Creating or updating a daily note (`journal/daily/`) | `writing/daily` ([daily.md](daily.md)) |
| Creating or updating a weekly note (`journal/weekly/`) | `writing/weekly` ([weekly.md](weekly.md)) |
| Recording or editing meeting notes (`journal/meetings/`) | `writing/meeting` ([meeting.md](meeting.md)) |
| Drafting an Architecture Decision Record in `projects/` | `writing/adr` ([adr.md](adr.md)) |
| Creating or updating an area dashboard (`areas/`) | `writing/area` ([area.md](area.md)) |

---

## YAML Front Matter

Every Markdown file must begin with a YAML front matter block. Exceptions: `AGENTS.md` and skill files.

Front matter schemas are in the templates under `.opencode/templates/`. Key rules:

1. The `---` block must be the very first line of the file.
2. **`updated`** is mandatory in every file. Set on creation; update on every edit.
3. **`tags`** is mandatory in every file. May be an empty list (`tags: []`). Lowercase kebab-case strings without the `#` prefix.
4. `tags` in front matter have no `#` prefix. Inline `#tags` in the body are separate.
5. When creating from a template, fill in all placeholders before saving.

---

## Editing Rules

1. **Never delete or overwrite past daily notes.** They are append-only. Mark tasks complete or add content — do not remove existing entries.
2. **Preserve the section structure.** Do not rename, reorder, or remove standard sections in daily notes or project dashboards.
3. **Use relative links** between journal notes and project files so references stay valid if the repo is moved.
4. **Maintain links.** Every link must point to an existing target. When creating, renaming, moving, or deleting a file, update all links that reference it. Verify navigation links (prev/next day/week) before adding — omit if the target doesn't exist.
5. **Timestamps in Log & Notes** are optional. If the user provides a time, use `HH:MM` (24-hour) or `H:MM AM/PM`, italicized. Otherwise, write plain bullet items.
6. **Dev Log entries** use bold dates (`**YYYY-MM-DD:**`), reverse chronological order (newest first).
7. **Task states:**

   | State | Format | Example |
   |-------|--------|---------|
   | Open | `- [ ] text` | `- [ ] Review Alice's MR` |
   | Done | `- [x] text` | `- [x] Fix build failures` |
   | Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](2026-02-25.md)` |
   | Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
   | Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

   - Moved tasks must link to the target date. The target note should include the task.
   - Dropped and blocked require a short reason in italics.
   - Do not delete tasks — mark them in place.

8. **Status values** for projects: `Active`, `Paused`, or `Done`.
9. **Commits** should be descriptive (e.g. "Add daily note for 2026-02-25", "Update Project Alpha tasks").
10. **Never write to Jira or Confluence without explicit user approval.** Default posture is read-only. Before any write operation, ask: "Should I write this to [Jira/Confluence]?" Proceed only if the user explicitly says yes.
11. **Use relative Markdown links** — `[text](../path/file.md)` — not Wikilinks (`[[file]]`). Relative links work in both Obsidian and standard Markdown renderers and are required for cross-repo portability.

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
- Writing or editing any resource article
- Drafting a project README or overview section
- Editing structured notes that will be referenced repeatedly
- Reviewing any documentation draft for style and structure

For specialised content types, also load the relevant sub-skill listed in the table above.
