---
description: Evening wrap-up, day summary, and project updates (includes week wrap-up on Fridays)
---

Run the evening routine. This is an interactive process.

Arguments: `/evening`

1. Load `writing` skill and `writing/daily` sub-skill.
2. Fill `## Evening > ### Completed`:
   - List each MIT that was completed today (use `- [x]` format).
   - Add any additional actions accomplished that are worth recording.
3. Fill `## Evening > ### Carried / Dropped`:
   - For each unfinished MIT, make a decision: carry to a specific date, or drop.
   - Format: `- [ ] ~~MIT text~~ → [YYYY-MM-DD](YYYY-MM-DD.md)` for carried, or `- [ ] ~~MIT text~~ *(dropped: reason)*` for dropped.
4. Check meeting action items:
   - Scan any meeting files created today (`journal/meetings/YYYY-MM-DD-*.md`).
   - For each action item not yet routed: own tasks → today's `### Inbox`; waiting items → `waiting-for.md`; project tasks → project README.
5. Fill `## Evening > ### Insights → Resources`:
   - Scan today's Day > Inbox, Day > Events, and Day > Waiting for durable facts.
   - **For each item that references a specific source** (URL, book chapter, article, talk): write a source note in `inbox/` first using the source-note template (`inbox/<source-slug>.md`). Summarize what the source argues in your own words; list candidate topics. Then promote those concepts to the knowledge graph.
   - For each fact or concept: check if a resource article exists. If yes, update it. If no, create a stub (`status: stub`) or flag for creation.
   - After writing to a resource article, update the article's `updated` and `tags` front matter fields.
   - Record each promotion: `- Wrote X to [resources/domain/article.md](../resources/domain/article.md)`.
   - If nothing to promote, write: `nothing to promote today.` Do not leave blank.
   - **After processing all items:** scan the set of articles touched today — do any two connect in a way that suggests a cross-cutting insight neither article expresses alone? If yes, add one line to `inbox/scratch.md`: `Synthesis candidate: [A](link) × [B](link) → <what the connection suggests>.`
6. Append Day > Waiting items to `waiting-for.md` (journal root):
   - For each new item in Day > Waiting, append to the `## Active` section of `waiting-for.md`.
   - Check existing `waiting-for.md` items: if any have a follow-up date on or before today, flag them for review.
   - If a Waiting item is resolved, move it to `## Resolved` in `waiting-for.md`.
7. Fill `## Evening > ### Day Summary`:
   - 1–2 sentences on how the day went.
   - Bold task stats: `**Done: N | Carried: N | Dropped: N**`
   - End with: `End-of-day scan: [items actioned, or "nothing pending"].`
8. Update project and area dashboards: add dev log entries for completed MITs, update task states.
9. Update the weekly note: ensure today's daily note link is present in the Daily Notes section.
10. **On Fridays**, also run the weekly wrap-up (defined in `writing/daily` and `writing/weekly`): compile Accomplishments from the week's Evening > Completed sections, identify Failures & Setbacks, collect Carry-Over, write Notes & Reflections, run weekly resources scan.
11. Commit with a descriptive message (e.g. `Evening: YYYY-MM-DD`).

$ARGUMENTS
