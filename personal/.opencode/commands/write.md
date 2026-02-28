---
description: Work on a blog post or article
---

Write, edit, or manage content in `writing/`. Covers the full lifecycle: idea → draft → ready → published.

Arguments: `/write [slug]` — if a slug is provided, open that article. Otherwise, determine intent from context.

## Step 1: Determine Intent

Infer what the user wants from arguments and conversation context:

| Intent | Signal |
| ------ | ------ |
| **Add idea** | User mentions a topic but no work to do yet |
| **New article** | User wants to start writing something |
| **Continue draft** | Slug provided, or user mentions an existing article |
| **Mark published** | User says the article is live, provides URL |
| **New series** | User wants a series or recurring column |

If the intent is unclear, ask one question: "Start a new article, continue an existing one, or just log an idea?"

## Step 2: Execute by Intent

### Add idea

Append to `writing/ideas.md` (create the file if it doesn't exist):

```
- <topic> — <angle or hook> (<optional context>)
```

Done. No folder, no draft.

### New article

1. Derive a slug from the title (kebab-case).
2. Check `writing/ideas.md` — remove the matching idea if present.
3. Create `writing/<slug>/draft.md` from `meta/templates/article-template.md`.
   - Fill in `{{TITLE}}` and `{{DATE}}`.
   - If the user provided an outline or starting points, write them into `## Outline`.
4. Ask if a `notes.md` is needed for research or sources. Create it only if yes.
5. If part of a series: place the file at `writing/series/<series-slug>/<N>-<slug>.md` instead, and update the series `README.md`.

### Continue draft

1. Read `writing/<slug>/draft.md` (and `notes.md` if it exists).
2. Work on the text as directed — expand sections, rewrite passages, restructure.
3. Append to `## Changelog`: `- **YYYY-MM-DD:** <what changed>`.
4. If the draft is complete and ready for publishing, set `status: Ready` in frontmatter.

### Mark published

1. Read `writing/<slug>/draft.md`.
2. Set `status: Published`, `published: <URL>`, `platform: <platform>` in frontmatter.
3. Update `## Changelog`: `- **YYYY-MM-DD:** published`.
4. Append to `writing/published.md`:
   ```
   - **YYYY-MM-DD** — [Title](URL) — platform — <one-line note>
   ```

### New series

1. Derive a series slug.
2. Create `writing/series/<series-slug>/README.md`:

```markdown
# <Series Title>

**Platform:** <where it's published>

## Premise

<What this series is about. One paragraph.>

## Parts

- [ ] 01 — <planned title>
- [ ] 02 — <planned title>
```

3. If the first post is ready to start, proceed as "New article" and place the file in the series folder.

## Step 3: Commit

Commit with a message reflecting the action:
- `write: idea — <topic>`
- `write: new — <slug>`
- `write: draft — <slug>`
- `write: published — <slug>`
- `write: series — <series-slug>`

$ARGUMENTS
