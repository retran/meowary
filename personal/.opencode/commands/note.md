---
description: Record a note or capture knowledge
---

Record a note or capture knowledge. Use this whenever you want to write something down — an idea, a discovery, research findings, observations during a learning session, anything worth keeping.

Arguments: `/note [project-slug]` — if a project slug is provided, the note goes into that project's `notes.md`. Otherwise, the agent figures out the best place.

## Step 1: Understand What This Is

Read what the user has shared (via arguments or conversation context). Determine the destination — in order of priority:

1. **Explicit project slug in arguments** → route to that project.
2. **Content clearly references an existing project** (mentions its name, is a session log, references its codebase or subject) → route to that project. Check `projects/` for active projects.
   - For **Learning** projects: also check whether the content contains durable knowledge (concepts, rules, API facts) that should go into `knowledge-base/topics/<slug>.md`. It may need to go to *both* places — session context to `notes.md`, distilled facts to KB.
3. **Content is a durable fact** about a person, place, health, finance, etc. → route to `knowledge-base/`.
4. **Everything else** → standalone topic note at `notes/<topic>/YYYY-MM-DD-<slug>.md`. Derive the topic from the content.

Do not ask the user where to route. Pick the best fit and proceed. If the routing turns out to be wrong, the user can move the file.

## Step 2: Take the Note

Ask the user to share the content if they haven't already. Then write it using the structure from `meta/templates/note-template.md`:

- **Notes** — the substance: what was learned, observed, or decided. Bullet points.
- **Takeaways** — key insights worth highlighting. Omit if there are none.

For **Learning** project content, after writing the session note, identify durable facts in the material (concepts, rules, patterns, API behaviour). Extract these into `knowledge-base/topics/<slug>.md` — write or update the relevant sections. Don't ask the user to separate them; do it yourself.

Keep it concise. Do not pad with empty sections.

## Step 3: Write the File

**If project note** (routed to a project):

- Check if `projects/<slug>/notes.md` exists. If not, create it with H1: `# <Project Name> — Notes`.
- Prepend the new entry as H2: `## YYYY-MM-DD: <Title>` (newest first).

**If topic note** (standalone):

- Determine the topic folder from context (e.g. GLSL → `notes/glsl/`, cooking → `notes/cooking/`). Create the folder if it doesn't exist.
- File name: `notes/<topic>/YYYY-MM-DD-<slug>.md`.

**If KB content** (durable reference):

- Write or update the relevant `knowledge-base/` entry directly.

## Step 4: Cross-link

- If the note relates to a project, and the project's `README.md` dev log doesn't have an entry for this session yet, add one: `- **YYYY-MM-DD:** <one-line summary>`.
- If durable facts were learned and not already written to the KB in Step 2, update or create the relevant `knowledge-base/` entry now.

## Step 5: Commit

Commit with a short message: `note: <title>` or `note: <project> — <title>`.

$ARGUMENTS
