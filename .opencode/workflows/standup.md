---
updated: 2026-04-07
tags: []
---

# Standup

> Read-only daily standup preparation. Synthesises Yesterday / Today / Blockers from dev-log entries and the current daily note, then formats a standup update ready to read aloud or paste. Writes nothing to the journal. Invoke before or during daily standup.

## Role

Acts as a standup synthesiser. Reads available sources — dev-logs, daily note MITs, waiting-for list — and produces a clean Yesterday / Today / Blockers summary. Does not write to any file. Does not interpret or editorialize; surfaces facts only.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Active projects list | `context/context.md § Active Projects` | Required |
| Project dev-logs | `projects/<name>/dev-log.md` | Required |
| Today's daily note | `journal/daily/<date>.md` | Optional |
| Waiting-for list | `journal/waiting-for.md` | Optional |

## Steps

### Step 0 — Load context

1. Read `context/context.md` for active projects list. If absent or has no active projects: glob `projects/*/dev-log.md` and use those projects instead. Do not stop — standup is read-only and can proceed from dev-log alone.
2. Read today's daily note (`journal/daily/<YYYY-MM-DD>.md`) if it exists — Morning MITs and Day zone.
3. Read the last entry of `dev-log.md` for each active project.

Done when: active projects and most recent dev-log entries loaded; today's MIT list loaded if available.

### Step 0.5 — Clarify

Ask at most one question, only if genuinely ambiguous:

- "Which project(s) should I include in the standup?" — ask only if `context.md` lists more than 2–3 active projects.

If `/morning` was not run today: note the gap — "No morning note found — working from dev-log only." Do not block on this; proceed.

If the standup is for a specific audience (e.g. one team among several), incorporate that into the summary level.

Done when: scope confirmed (or defaulted to all active projects).

### Step 1 — Extract Yesterday

1. From each project's `dev-log.md` last entry: extract `**Summary:**` and `**Key decisions:**` fields.
2. From yesterday's daily note `## Evening > ### Completed` (if accessible).
3. Condense to 1–3 bullets. Remove project-internal detail not relevant to the standup audience.

Done when: Yesterday section drafted (1–3 bullets).

### Step 2 — Extract Today

1. From today's daily note `## Morning` MITs (if `/morning` was run).
2. From each active project dev-log `**Next:**` field in the most recent entry.
3. Condense to 1–3 bullets. Prioritise the ★ primary MIT if set.

Done when: Today section drafted (1–3 bullets).

### Step 3 — Extract Blockers

1. From `dev-log.md` entries: any `**Deferred:**` items caused by an external dependency.
2. From today's daily note `## Day > ### Waiting`: items waiting on others.
3. From `waiting-for.md`: items with overdue follow-up date.
4. If none: "No blockers."

Done when: Blockers section drafted.

### Step 4 — Format and output

Output the standup in standard format:

```
**Yesterday:**
- <item>

**Today:**
- <item>

**Blockers:**
- <item or "None">
```

Keep each section to 1–3 bullets. Do not include internal project detail not relevant to the standup audience. Summarise at the right level for the team.

This is the final output. No writes. No commits.

Done when: formatted standup displayed to user.

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Standup text | In-session only | Yesterday / Today / Blockers |

**`/standup` is read-only. No journal writes, no commits, no dev-log entries.**

## Error Handling

- **No dev-log entries:** Note "No recent dev-log entries found for `<project>`." Include the project name in Today if MITs exist.
- **No daily note:** Proceed from dev-log only; note the gap.
- **More than 3 active projects:** Ask which to include, or default to the top 3 by priority in `context.md`.
## Contracts

1. Write nothing to any file.
2. Do not create or update the daily note.
3. Do not commit.
4. Do not write dev-log entries.
5. One clarifying question maximum — standup is time-sensitive.
6. Output is in-session only. The user decides what to paste or read aloud.

## dev-log Update

None. `/standup` is read-only.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Standup reveals a clear top priority | Start the appropriate lifecycle workflow |
| Blocker identified that needs escalation | `capture` the blocker; note in `waiting-for.md` |
| `morning` was not run yet | `morning` to set up the day |
