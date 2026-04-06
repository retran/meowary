---
description: Quickly capture a raw note, idea, or link to inbox/
---

Capture a raw note to `inbox/`. Fast, low-friction — no structure required.

**Two capture channels — use the right one:**

| Channel | What it's for | Lifetime | How to add |
|---------|---------------|----------|------------|
| `inbox/` folder | Richer captures: URLs, ideas to develop, references to file | Until processed via `/r-plan` or `/r-ingest` | This command (`/capture`) |
| Daily note `## Day > ### Inbox` | Same-day ephemeral notes: quick thoughts, reminders, raw observations | Processed in `/evening` | Edit the daily note directly — no command |

This command writes to `inbox/` only. For same-day ephemeral captures, edit Day > Inbox directly.

Arguments: `/capture [title]`

1. Load `writing` skill.
2. Get title (`$1`) and content. Ask for missing values.
3. Write to `inbox/YYYY-MM-DD-<slug>.md` with minimal front matter (`type: capture`, `updated`, `tags: []`).
4. Confirm location. Do **not** commit — inbox captures are committed when processed.

$ARGUMENTS
