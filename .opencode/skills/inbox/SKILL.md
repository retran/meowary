---
name: inbox
description: Inbox capture and processing — file naming, capture format, source-note format, and processing rules. Load when creating a capture or source note, routing inbox items during evening or weekly processing, or distilling a source note into resource articles.
compatibility: opencode
---

## Philosophy

The inbox is a temporary buffer, not a home. Every item in `inbox/` is either processed and filed elsewhere or deleted. Items should not live in `inbox/` indefinitely — the inbox is a capture point, not a storage layer.

---

## What Goes in the Inbox

| Item type | When to use |
|-----------|-------------|
| Capture | A quick thought, link, task, or idea that needs to be processed later |
| Source note | A structured note on an external source (article, book, talk, Confluence page) ready to be distilled into resource articles |

---

## Capture Format

Use `.opencode/skills/inbox/capture-template.md` for raw captures.

```yaml
---
type: capture
date: YYYY-MM-DD
project: <project-slug or null>
processed: false
updated: YYYY-MM-DD
tags: []
---

# <title or one-line description>

<free-form content>
```

Captures are intentionally minimal — the goal is fast, low-friction capture. Clean up during processing.

Set `processed: true` once the capture has been routed or actioned.

---

## Source Note Format

Use `.opencode/skills/inbox/source-note-template.md` when you've consumed a source and want to extract knowledge from it.

```yaml
---
type: source-note
source-type: "article|book|talk|video|confluence|other"
source: "URL or full reference"
source-title: "SOURCE TITLE"
processed: false
updated: YYYY-MM-DD
tags: []
---
```

### Sections

**What it argues** — 3–10 bullets in your own words. Not quotes. Your interpretation of what the source claims.

**Key facts** — concrete details worth extracting: numbers, names, decisions, dates, constraints.

**Candidate topics** — list of concepts that should become or update resource articles. One per line.

Set `processed: true` in front matter once the source note has been distilled into resource articles.

---

## Processing Rules

Process inbox items regularly — at minimum during `/evening` or `/weekly`. For each item:

1. **Captures:**
   - Is this a task? → Add to the relevant project's Open Tasks or today's daily note.
   - Is this a resource fact? → Create or update the relevant resource article.
   - Is this a project idea? → Create a stub in `projects/` or log it in a relevant project.
   - Is this noise? → Delete it.

2. **Source notes:**
   - For each candidate topic, check if a resource article exists in `resources/`.
   - If it exists: enrich it with facts from the source note.
   - If it doesn't: create a stub resource article.
   - Once all candidate topics are handled: set `processed: true` and optionally move to `archive/inbox/`.

3. After processing, the item should be gone from `inbox/` or marked `processed: true`.

---

## File Naming

Two naming patterns depending on how the file was created:

- **Automated captures** (via `/capture` workflow): `YYYY-MM-DDTHHMM-<slug>.md` — timestamp prefix ensures no filename collisions when capturing multiple items per day.
- **Manually created items**: `capture-<slug>.md` or `source-<slug>.md` — descriptive, no date prefix.

Examples: `2026-04-08T0930-oauth-idea.md`, `capture-oauth-idea.md`, `source-accelerate-book.md`.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `updated`, `tags`?
- [ ] Source notes include `source`, `source-type`, `source-title`, `processed`?
- [ ] Captures are minimal — no over-engineering during capture?
- [ ] Processed items removed or marked `processed: true`?
