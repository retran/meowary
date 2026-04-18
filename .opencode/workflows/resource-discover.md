---
updated: 2026-04-18
tags: []
---

# Resource-Discover

<summary>
> Knowledge gap discovery. Scans journal, projects, codebase for recurring concepts/entities with no resource article. Produces prioritized list and optionally seeds stub articles. Forward-looking complement to `resource-plan` (existing articles) and `resource-enrich` (deepens articles).
</summary>

<role>
Proactive knowledge graph scout. Scans what's been written to find recurring concepts deserving articles. NEVER enriches stubs (that's `resource-enrich`). Confirms stub creation before writing.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Date range | User / last discover date | Yes |
| `journal/daily/`, `journal/weekly/` | Repo | Yes |
| `projects/` | Repo | Optional |
| `codebases/<name>.md` | If active codebase | Optional |
| `meta/resources-log.md` | `meta/` | For last-run date |
</inputs>

<tiers>Not applicable. Fixed-procedure workflow — all steps mandatory.</tiers>

<steps>

<step n="0" name="Load context">
1. READ today's daily note for matching tasks.
2. CHECK `meta/resources-log.md` for last `r-discover` entry.

<done_when>Daily note checked; last discover date noted.</done_when>
</step>

<step n="0.5" name="Clarify">
ASK:
1. Time range? (default: since last run, or last 30 days first time)
2. Specific topic areas/subfolders to focus?
3. Create stubs for high-priority gaps, or report only?

DEFAULT if no preferences stated.

<done_when>Date range, focus, stub-creation preference confirmed.</done_when>
</step>

<step n="1" name="Extract from journal">
1. SCAN `journal/daily/` in target range.
2. SCAN `journal/weekly/` same range.
3. EXTRACT recurring proper nouns, technical terms, team/tool/project/process names.
4. FLAG entities ≥ 3 mentions as high-priority (heuristic; promote significant low-frequency by judgment).
5. QMD-query extracted terms to check existing articles.

<subagent_trigger>Date range > 14 days OR journal > ~200 files: spawn `explore` for Steps 1–3. Pass: scan range, paths (`journal/daily/`, `journal/weekly/`, `projects/*/notes/`, `projects/*/dev-log.md`, optionally `codebases/<name>.md`), `resources/` for cross-reference. Returns: candidate names, mention counts, source files+lines, article-exists flag. Inline if range ≤ 14 days or journal ≤ ~200 files.</subagent_trigger>

<done_when>Recurring entities extracted; confirmed against `resources/`.</done_when>
</step>

<step n="2" name="Extract from project notes">
1. SCAN `projects/*/notes/`, `dev-log.md`, `plans/`, `design/`.
2. EXTRACT recurring entities not in `resources/`.
3. FLAG entities in ≥ 2 project artifacts (breadth signal).

<done_when>Project candidates extracted.</done_when>
</step>

<step n="3" name="Extract from codebase" condition="Active codebase">
1. SCAN `codebases/<name>.md` for components, services, patterns.
2. CROSS-REFERENCE against `resources/` — named components without articles are candidates.

<done_when>Codebase candidates extracted or skipped.</done_when>
</step>

<step n="4" name="Validate">
1. For top-priority: QMD + web search to confirm concept is real and distinct.
2. REMOVE near-duplicates before listing.

<done_when>Top-priority validated; near-duplicates removed.</done_when>
</step>

<step n="5" name="Produce gap report">
WRITE `projects/<name>/notes/discover-<date>.md` (or inline if no project):

```markdown
# Knowledge Gap Report — <date>

## High Priority (3+ mentions, no article)
| Concept | Mentions | Example context |

## Medium Priority (2 mentions, no article)
| Concept | Mentions | Example context |

## Low Priority (1 mention, worth noting)
| Concept | Mentions | Example context |

## Already exists (confirmed)
- <concept> → resources/<path>

## Duplicates found
- <name A> / <name B> → suggest merge or alias
```

<done_when>Gap report written.</done_when>
</step>

<step n="6" name="Create stubs" condition="User requested" gate="SOFT-GATE">
**SOFT-GATE:** Confirm stub creation list with user before writing.

1. For each confirmed high-priority: CREATE minimal stub in `resources/<subfolder>/` using `.opencode/skills/resources/resources-template.md`.
2. Stub: complete front matter + one-sentence summary + empty `## Related`.
3. DO NOT enrich here — that's `resource-enrich`.

<done_when>Stubs created or skipped.</done_when>
</step>

<step n="7" name="Close" gate="END-GATE">
1. STAGE: gap report, new stubs, `meta/tags.md`.
2. COMMIT: `Discover knowledge gaps: N candidates, M stubs created`
3. APPEND to `meta/resources-log.md`: `- **YYYY-MM-DD:** r-discover | N candidates, M stubs`
4. APPEND work log to `## Day` of today's daily note.
5. MARK matching tasks done.

<self_review>
- [ ] All `Done when` met
- [ ] Findings documented
- [ ] Stubs created for gaps
- [ ] Cross-references added
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Committed; log appended; daily note updated.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| Gap report | `projects/<name>/notes/discover-<date>.md` | Markdown |
| Stubs | `resources/<subfolder>/<slug>.md` | Markdown |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **No prior discover entry:** Default last 30 days; note in report header.
- **No active project:** Inline gap report; commit stubs if created.
- **Near-duplicates found:** Surface in "Duplicates found" section. NEVER stub near-duplicates — suggest `resource-ops merge`.
- **User wants stub for existing concept:** Surface existing article; ask if updating instead.
</error_handling>

<contracts>
1. Read-only scan during Steps 1–4. No edits.
2. Stub creation in Step 6 requires explicit confirmation.
3. Stubs intentionally thin — front matter + summary + empty `## Related`.
4. NEVER enrich inline. Queue for `resource-enrich`.
</contracts>

<subagents>
| Step | Agent | Type | Parallel? | Trigger | Output |
|------|-------|------|-----------|---------|--------|
| 1–3 Extract entities | `explore` | built-in | No | Range > 14 days OR journal > ~200 files | Candidates with mention counts, contexts per source |
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| High-priority stubs created | `resource-enrich` per stub |
| Structural issues | `resource-plan` |
| Duplicate candidates | `resource-ops merge` |
</next_steps>

<output_rules>Output language: English.</output_rules>
