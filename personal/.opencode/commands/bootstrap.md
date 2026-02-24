---
description: First-time setup or update personal context
---

Set up or revise the personal context file (`meta/context.md`). This command is idempotent: if context already exists, present it for review and update; if it's missing or empty, walk the user through filling it in from scratch.

## Step 1: Check Current State

- Read `meta/context.md`.
- If the file exists and has content (non-empty Author section), go to **Step 2a** (revision flow).
- If the file is missing, empty, or has only the template skeleton with no values filled in, go to **Step 2b** (fresh setup).

## Step 2a: Revision Flow (context exists)

- Show the user the current context in a readable format.
- Ask: "Is this still accurate? What would you like to update?"
- Let the user change any fields: name, tooling, conventions.
- Update `meta/context.md` with the revised values.
- Skip to **Step 4**.

## Step 2b: Fresh Setup (no context)

Ask the user the following questions. Ask them all at once to reduce back-and-forth:

1. **Name** -- how should the journal refer to you?
2. **Tooling** -- what MCP integrations are configured? (GitHub, Calendar, Todoist, etc.) Any external paths the agent should know about?
3. **Conventions** -- preferred language, time format, week numbering, any personal preferences for how the journal should behave?

## Step 3: Write Context File

Write `meta/context.md` with the collected information, following the structure already in the file. Adapt sections as needed -- add fields the user mentions, omit fields that don't apply.

## Step 4: Verify Tooling Connections

If the user mentioned MCP integrations, do a quick smoke test:

- For GitHub: try listing repos to confirm the connection works.
- For other integrations: try a simple query to confirm connectivity.
- Report results to the user. If something fails, note it but don't block -- the user can fix configuration later.

## Step 5: Create Author KB Entry (fresh setup only)

If this is a fresh setup (Step 2b), offer to create a knowledge base entry for the author:

- Create `knowledge-base/people/<slug>.md` from `meta/templates/person-template.md`.
- Fill in the known details (name).
- Add a link from `meta/context.md` to the KB entry.
- Register the `#person-<slug>` tag in `meta/tags.md` if it doesn't exist.

## Step 6: Summary

- Show the user what was created or updated.
- Remind them of next steps: `/today` to start the day, `/weekly` to plan the week.
- Commit changes with a descriptive message (e.g. "Bootstrap Meowary context for <name>" or "Update Meowary context").

$ARGUMENTS
