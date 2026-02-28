---
description: Create a new project or learning topic
---

Create a new project under `projects/`. Works for both regular projects and learning topics.

Arguments: `/project <slug> [name]`

## Step 1: Gather Info

If not supplied via arguments or clear from context, ask the user **once** for all of the following:

- **Name** — readable project name.
- **Type** — Project / Dev / Learning / Game / Family. (Offer a one-line description of each if the user seems unsure.)
- **Overview** — what is this, what do you want from it? One or two sentences.
- **Companion files** — which optional files to create: `notes.md`, `resources.md`, `sessions.md` (Game), `docs.md` (Family). Default: none.
- **Dev only:** repo URL and tech stack.

If the type is clear from context (e.g. "new learning project about GLSL"), infer it and skip asking. Only ask about what isn't obvious.

## Step 2: Create the Folder

1. Create `projects/<slug>/`.
2. Copy `meta/templates/project-template.md` into `projects/<slug>/README.md`.
3. Replace placeholders:
   - `{{PROJECT_NAME}}` — readable name
   - `{{PROJECT_SLUG}}` — the slug
   - `{{DATE}}` — today's date
   - `{{TYPE}}` — the project type (lowercase)
4. Write the Overview from the info gathered in Step 1. Do not leave it as a placeholder.
5. For **Dev** projects: add repo URL and tech stack under the Overview.

## Step 3: Create Companion Files

Create only the files requested in Step 1. Do not create files that weren't asked for.

## Step 4: Register Tag

Add the `#p-<slug>` tag to `meta/tags.md`.

## Step 5: Commit

Commit with message: `project: add <slug>`.

$ARGUMENTS
