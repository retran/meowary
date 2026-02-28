---
description: First-time setup or update personal context
---

Set up or revise the personal context file (`meta/context.md`). Idempotent: if context already exists, present it for review; if missing or empty, walk through it from scratch.

## Step 1: Check Current State

- Read `meta/context.md`.
- If it has content (non-empty Author section) → go to **Step 2a**.
- If missing, empty, or only skeleton → go to **Step 2b**.

## Step 2a: Revision Flow

- Show the current context in a readable format.
- Ask: "Is this still accurate? What would you like to update?"
- Update `meta/context.md` with any changes.
- Skip to **Step 4**.

## Step 2b: Fresh Setup

Ask the user these questions (all at once):

1. **Name** — how should the journal refer to you?
2. **Language** — what language to write in by default?
3. **MCP integrations** — any already configured? (Calendar, GitHub, task manager, etc.) List what's active; note anything planned for later.

## Step 3: Write Context File

Write `meta/context.md` with the collected information. Under MCP integrations, list active ones and include a note for any planned but not yet configured ("Calendar — to be added").

## Step 4: Verify Active Integrations

For each active MCP integration, do a quick smoke test:

- GitHub: list repos.
- Others: run a simple query.

Report results. If something fails, note it — don't block setup.

## Step 5: Create Author KB Entry (fresh setup only)

`meta/context.md` holds agent configuration — name, language, tooling. It is not a personal profile.

If the user wants to record personal facts about themselves (health background, interests, biography, goals), offer to create a KB entry at `knowledge-base/people/<slug>.md` using `meta/templates/person-template.md`. This is optional — don't insist.

If created, add a link from `meta/context.md` to the KB entry (one line: `**Profile:** [<name>](../knowledge-base/people/<slug>.md)`). Register `#person-<slug>` in `meta/tags.md`.

## Step 6: Summary

Show what was created or updated. Remind the user of the available commands: `/note`, `/project`, `/kb`.

Commit with message: `bootstrap: set up context` (or `bootstrap: update context`).

$ARGUMENTS
