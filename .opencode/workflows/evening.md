---
updated: 2026-04-07
tags: []
---

# Evening

> Daily end-of-day close-out. Completes the Evening zone of today's daily note, distils the day into a summary, routes waiting items, scans for resource enrichment opportunities, and optionally runs the Friday weekly wrap-up. Invoke at the end of each workday.

## Role

Acts as the user's structured end-of-day closer. Reviews what was done, routes delegated items, and surfaces durable knowledge for the second brain. Does not make autonomous routing decisions — presents options and confirms with the user before writing to resource articles.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Today's daily note | `journal/daily/<date>.md` | Required |
| Project dev-logs | `projects/<name>/dev-log.md` | Optional |
| Waiting-for list | `journal/waiting-for.md` | Required |
| Resource articles | `resources/` | Optional |

## Steps

### Step 0 — Load context

1. Read today's daily note (`journal/daily/<YYYY-MM-DD>.md`) in full.
   - If no daily note exists: create from `.opencode/skills/journal/daily-template.md` and note that the Morning zone was skipped.
2. Read the last entry of `dev-log.md` for each active project where work was done today.
3. Read `journal/waiting-for.md` — note any items with follow-up date on or before today.

Done when: daily note loaded; dev-log entries surfaced; waiting-for items with overdue dates identified.

### Step 0.5 — Clarify

Ask at most two questions:

1. "Were there any notable events or decisions today not captured in the day's work log?"
2. If today is Friday: "Shall I run the weekly wrap-up after the evening close-out?"

Skip a question if context is already clear from the invocation. If today is not Friday, skip question 2 entirely.

Done when: user has responded (or questions are not applicable).

### Step 1 — Review Day zone

1. Read all content in `## Day > ### Inbox`, `## Day > ### Events`, and `## Day > ### Waiting`.
2. Categorise each Inbox item as: **done**, **carry** (to a future date), or **drop**.
3. Confirm all Events are linked to meeting notes — flag any unlinked meeting.
4. Identify new Waiting items to route to `waiting-for.md`.
5. Flag any existing `waiting-for.md` items with an overdue follow-up date.

Done when: every Inbox item has a category; Events cross-checked; new Waiting items identified.

### Step 2 — Route Waiting items

For each new waiting item in `## Day > ### Waiting`:
- Append to `waiting-for.md` under `## Active` using the format defined in the journal skill.
- Do not duplicate items already in `waiting-for.md`.

If overdue follow-up items were flagged in Step 1: surface them to the user with a prompt to chase or close.

Done when: all new waiting items appended; overdue items surfaced.

### Step 3 — Complete MITs and compile Evening zone

Write `## Evening` zone in today's daily note with these four sub-sections:

1. `### Completed` — tick off accomplished MITs and any other done tasks.
2. `### Carried / Dropped` — for each unfinished MIT: decision (carried to `<date>` or dropped) + reason.
3. `### Insights → Resources` — durable facts from today; each linked to the resource article updated or created (see Step 4).
4. `### Day Summary` — 1–2 sentences on how the day went; include task stats and an end-of-day scan per the journal skill.

The Evening zone appends. Never remove or edit existing Morning or Day content. Mark completed MITs in `### Completed` — do not edit them in-place in the Morning zone.

Done when: all four Evening sub-sections written.

### Step 4 — Resource scan (mandatory)

Scan today's Inbox, Events, and work log for durable knowledge. For each fact identified:

- **Role changes, team updates, process decisions** → update the relevant person or team resource article.
- **Architectural knowledge, component ownership, tool decisions** → update the relevant resource article.
- **New concepts or patterns with no existing article** → create a stub (YAML front matter + H1 + one sentence), or add to `inbox/` for later processing via `resource-enrich`.

If nothing durable was learned: write `nothing to promote today.` in `### Insights → Resources` and move on.

This step is mandatory. Do not skip even when the answer is "nothing."

Done when: durable facts routed or explicitly confirmed as none.

### Step 5 — Friday weekly wrap-up [Fridays only]

Skip if today is not Friday, or if the user declined in Step 0.5.

1. Open or create `journal/weekly/<year>-W<nn>.md`.
2. Perform the Friday wrap-up flow per the journal skill.

Done when: weekly note completed and all sections filled.

### Step 6 — Close

1. Update `## Active Projects` in `context/context.md`:
   - Add any new projects started today (format per the projects skill).
   - Remove any projects completed or archived today.
   - Update `phase:` and `priority:` for any projects whose state changed during the day.
2. Commit:
   - Evening only: `Evening: <YYYY-MM-DD>`
   - Evening + weekly wrap-up: `Evening: <YYYY-MM-DD>` followed immediately by `Weekly wrap-up: <year>-W<nn>` (two commits).

No dev-log entry required for `/evening` itself.

Done when: `context.md` updated; committed.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Daily note Evening zone | `journal/daily/<date>.md` | Appended |
| `waiting-for.md` updates | `journal/waiting-for.md` | Appended |
| Resource article updates | `resources/` | Varies |
| Weekly note (Fridays only) | `journal/weekly/<year>-W<nn>.md` | Wrap-up sections filled |
| Commit | Git history | `Evening: <YYYY-MM-DD>` |

## Error Handling

- **No daily note:** Create from template; note Morning zone was skipped; proceed.
- **`waiting-for.md` missing:** Create the file with `## Active` and `## Resolved` sections before appending.
- **Evening zone already filled:** Confirm with user before overwriting any section. Never silently overwrite.
- **Resource article missing for a durable fact:** Create a stub before writing the fact. Do not write to a non-existent file.
- **Friday wrap-up: weekly note missing:** Create from `.opencode/skills/journal/weekly-template.md` with a note that Monday planning was skipped.

## Contracts

1. Own `## Evening` zone in `journal/daily/<date>.md`. May write completed-task markers (`- [x]`) to existing items in `## Morning` and `## Day` but never adds new content there.
2. Resource scan is mandatory — never skip. "Nothing to promote" is a valid outcome; silence is not.
3. Waiting items must be routed before closing. No unrouted items.
4. Do not rewrite or delete any Morning or Day content.
5. Commit format: `Evening: <YYYY-MM-DD>`.
6. Friday weekly wrap-up is opt-in. Always ask before running; never auto-trigger.

## dev-log Update

`/evening` does not write a dev-log entry for itself. Dev-log entries for lifecycle workflows run today may be appended here if they were missed during those sessions — append to the relevant `projects/<slug>/dev-log.md` with the correct timestamp.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Resource stubs created today | `resource-enrich` to flesh them out |
| Inbox items flagged as source material | `resource-ingest` |
| Friday wrap-up completed | Done for the week |
| Deferred items need processing | `capture` or add to project task list |
