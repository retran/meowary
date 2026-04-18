---
updated: 2026-04-18
tags: []
---

# Standup

<summary>
> Read-only standup prep. Synthesizes Yesterday/Today/Blockers from dev-logs and current daily note. Formats output ready to read or paste. Writes nothing.
</summary>

<role>
Standup synthesizer. Reads dev-logs, daily note MITs, waiting-for; produces clean Yesterday/Today/Blockers. NEVER writes. NEVER editorializes — surfaces facts only.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Active projects | `context/context.md § Active Projects` | Yes |
| Project dev-logs | `projects/<name>/dev-log.md` | Yes |
| Today's daily note | `journal/daily/<date>.md` | Optional |
| Waiting-for list | `journal/waiting-for.md` | Optional |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow.</tiers>

<steps>

<step n="0" name="Load context">
1. READ `context/context.md` for active projects. If absent or empty: glob `projects/*/dev-log.md` and use those. DO NOT stop — standup is read-only.
2. READ today's daily note if exists — Morning MITs and Day zone.
3. READ last entry of `dev-log.md` per active project.

<done_when>Active projects + recent dev-log entries loaded; today's MITs loaded if available.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK at most one question, only if ambiguous:
- "Which projects to include?" — only if `context.md` lists > 2–3 active projects.

If `/morning` not run: note gap, "No morning note — working from dev-log only." DO NOT block.

If standup is for specific audience: incorporate into summary level.

<done_when>Scope confirmed or defaulted to all active.</done_when>
</step>

<step n="1" name="Extract Yesterday">
1. From each project's dev-log last entry: extract `**Summary:**` and `**Key decisions:**`.
2. From yesterday's daily note `## Evening > ### Completed` if accessible.
3. CONDENSE to 1–3 bullets. Remove project-internal detail.

<done_when>Yesterday drafted (1–3 bullets).</done_when>
</step>

<step n="2" name="Extract Today">
1. From today's daily note `## Morning` MITs if `/morning` ran.
2. From each dev-log most recent `**Next:**`.
3. CONDENSE to 1–3 bullets. Prioritize ★ primary MIT.

<done_when>Today drafted (1–3 bullets).</done_when>
</step>

<step n="3" name="Extract Blockers">
1. From dev-log: `**Deferred:**` items with external dependency.
2. From today's daily note `## Day > ### Waiting`: items waiting on others.
3. From `journal/waiting-for.md`: overdue follow-ups.
4. If none: "No blockers."

<done_when>Blockers drafted.</done_when>
</step>

<step n="4" name="Close" gate="END-GATE">
OUTPUT standup format:

```
**Yesterday:**
- <item>

**Today:**
- <item>

**Blockers:**
- <item or "None">
```

Each section 1–3 bullets. No internal detail. Summarize at right level.

Final output. No writes. No commits.

<self_review>
- [ ] All `Done when` met
- [ ] Yesterday/Today/Blockers format
- [ ] Concise (< 2 min reading)
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Formatted standup displayed.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Standup text | In-session | Yesterday/Today/Blockers |
</outputs>

**`/standup` is read-only. NO writes, NO commits, NO dev-log entries.**

<error_handling>
- **No dev-log entries:** Note "No recent entries for `<project>`." Include project in Today if MITs exist.
- **No daily note:** Proceed from dev-log; note gap.
- **> 3 active projects:** Ask which, or default to top 3 by priority in `context.md`.
</error_handling>

<contracts>
1. Write nothing.
2. NEVER create/update daily note.
3. NEVER commit.
4. NEVER write dev-log entries.
5. One clarifying question max — time-sensitive.
6. In-session output only. User decides what to paste.
</contracts>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Clear top priority surfaced | Appropriate lifecycle workflow |
| Blocker needs escalation | `capture`; note in `journal/waiting-for.md` |
| `morning` not run | `morning` |
</next_steps>

<output_rules>Output language: English.</output_rules>
