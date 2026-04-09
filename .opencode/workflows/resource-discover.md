---
updated: 2026-04-07
tags: []
---

# Resource-Discover

> Knowledge gap discovery workflow. Scans the journal, project notes, and codebase for concepts, entities, and topics that appear repeatedly but have no resource article. Produces a prioritized list of missing nodes and optionally seeds stub articles for the highest-priority gaps. Forward-looking complement to `resource-plan` (which reviews existing articles) and `resource-enrich` (which deepens individual articles). Invoke when you want to see what the knowledge graph doesn't know it's missing.

## Role

Acts as a proactive knowledge graph scout. Scans what has been written — not what is already captured — to find recurring concepts that deserve dedicated articles. Does not enrich stubs here; that is `resource-enrich`'s job. Confirms stub creation with the user before writing any files.

## Inputs

| Input                                  | Source                                | Required          |
| -------------------------------------- | ------------------------------------- | ----------------- |
| Date range                             | User declaration / last discover date | Required          |
| `journal/daily/` and `journal/weekly/` | Repo                                  | Required          |
| `projects/`                            | Repo                                  | Optional          |
| `codebases/<name>.md`                  | Loaded if codebase active             | Optional          |
| `meta/resources-log.md`                     | `meta/`                               | For last-run date |

## Complexity Tiers

Not applicable. Fixed-procedure workflow — all steps are mandatory.

## Steps

### Step 0 — Load context

1. Read today's daily note — find any tasks matching this workflow.
2. Check `meta/resources-log.md` for the last `r-discover` entry — note the date range to scan.

Done when: daily note checked; last discover date noted.

### Step 0.5 — Clarify

Ask the user:

1. What time range to scan? (default: since last discover run, or last 30 days — 30 days is the default window before the first ever run; afterward the last-run date takes over)
2. Any specific topic areas or subfolders to focus on?
3. Should stub articles be created for high-priority gaps, or produce a report only?

If no preferences stated, proceed with defaults.

Done when: date range, focus areas, and stub-creation preference confirmed.

### Step 1 — Extract entity candidates from journal

1. Scan `journal/daily/` entries in the target date range.
2. Scan `journal/weekly/` for the same range.
3. Extract recurring proper nouns, technical terms, team names, tool names, project names, process names.
4. Flag entities appearing 3+ times as high-priority candidates. (3+ mentions is the high-priority threshold — a heuristic. Some concepts appear once but are clearly important; use judgment to promote high-significance low-frequency items.)
5. Use QMD query on the extracted terms to check if articles already exist.

**Sub-agent trigger:** When date range > 14 days OR journal > ~200 files, spawn the `explore` agent for Steps 1–3. Pass: scan date range, paths to scan (`journal/daily/`, `journal/weekly/`, `projects/*/notes/`, `projects/*/dev-log.md`, and optionally `codebases/<name>.md`), and the existing `resources/` directory for cross-reference. The agent returns: candidate entity names, mention counts, source files with line references, and whether a `resources/` article already exists. Run inline when date range ≤ 14 days or journal ≤ ~200 files.

Done when: recurring entities extracted; confirmed against existing `resources/`.

### Step 2 — Extract candidates from project notes

1. Scan `projects/*/notes/`, `projects/*/dev-log.md`, `projects/*/plans/`, `projects/*/design/`.
2. Extract recurring entities and concepts not yet in `resources/`.
3. Flag entities appearing in 2+ project artifacts as candidates. (2+ project artifacts as a threshold because a concept appearing in multiple project contexts has breadth beyond a single initiative.)

Done when: project entity candidates extracted.

### Step 3 — Extract candidates from codebase (if active)

1. Scan `codebases/<name>.md` for component names, service names, architectural patterns.
2. Cross-reference against `resources/` — any named component without a resource article is a candidate.

Skip if no active codebase.

Done when: codebase candidates extracted (or skipped).

### Step 4 — Proactive web/source validation

1. For top-priority candidates, run a quick QMD + web search to confirm the concept is real and distinct.
2. Remove near-duplicates (e.g., two names for the same thing) before listing.

Done when: top-priority candidates validated; near-duplicates removed.

### Step 5 — Produce gap report

Write `projects/<name>/notes/discover-<date>.md` (or output inline if no active project):

```markdown
# Knowledge Gap Report — <date>

## High Priority (3+ mentions, no article)

| Concept   | Mentions | Example context      |
| --------- | -------- | -------------------- |
| <concept> | <count>  | <file:line or quote> |

## Medium Priority (2 mentions, no article)

| Concept | Mentions | Example context |
| ------- | -------- | --------------- |

## Low Priority (1 mention, worth noting)

| Concept | Mentions | Example context |
| ------- | -------- | --------------- |

## Already exists (confirmed)

- <concept> → resources/<path>

## Duplicates found (same concept, two names)

- <name A> / <name B> → suggest merge or alias
```

Done when: gap report written.

### Step 6 — Create stubs (if user requested)

**SOFT-GATE (all tiers):** Confirm stub creation list with the user before writing any files.

1. For each high-priority candidate confirmed by the user: create a minimal stub article in the appropriate `resources/` subfolder using `.opencode/skills/resources/resources-template.md` as the base.
2. Stub content: complete front matter + one-sentence summary + empty `## Related` section.
3. Do not enrich stubs here — enrichment is `resource-enrich`'s job.

Skip if user requested report only.

Done when: stubs created for all confirmed high-priority candidates (or skipped).

### Step 7 — Close

1. Stage: gap report, any new stub articles, `meta/tags.md`.
2. Commit: `Discover knowledge gaps: N candidates, M stubs created`
3. Append to `meta/resources-log.md`: `- **YYYY-MM-DD:** r-discover | N candidates, M stubs`
4. Append work log entry to `## Day` zone of today's daily note.
5. Mark any matching task items as done.

**Self-review checklist:**

- [ ] All `Done when` criteria met for every step
- [ ] Discovery findings documented
- [ ] Stub articles created for identified gaps
- [ ] Cross-references added to related articles
- [ ] No placeholders (TBD, TODO, FIXME) in output artifacts
- [ ] All file paths in outputs are correct and targets exist

Done when: committed; log entry appended; daily note updated.

**END-GATE:** Present final deliverables to the user.

## Outputs

| Output                       | Location                                   | Format       |
| ---------------------------- | ------------------------------------------ | ------------ |
| Gap report                   | `projects/<name>/notes/discover-<date>.md` | Markdown     |
| Stub articles (if requested) | `resources/<subfolder>/<slug>.md`          | Markdown     |
| `meta/resources-log.md` entry     | `meta/`                                  | Append entry |
| Daily note work log          | `journal/daily/<date>.md` Day zone         | Append entry |
| Commit                       | Git history                                | Git commit   |

## Error Handling

- **`meta/resources-log.md` has no prior discover entry:** Default to last 30 days. Note this in the gap report header.
- **No active project:** Write the gap report inline (in-session) rather than to a project path. Still commit stubs if created.
- **Near-duplicate candidates found:** Surface them explicitly in the report's "Duplicates found" section. Do not create separate stubs for near-duplicates — suggest `resource-ops merge` instead.
- **User confirms stub creation for a concept that already has an article:** Surface the existing article; ask whether to update it instead.

## Contracts

1. Read-only scan during Steps 1–4; no article edits.
2. Stub creation in Step 6 is only performed after explicit user confirmation.
3. Stubs from this workflow are intentionally thin — front matter + one-sentence summary + empty `## Related`. Enrichment is a separate step.
4. Do not enrich stubs inline. Queue them for `resource-enrich`.

## Sub-Agents

| Step                                  | Agent     | Type     | Parallel?   | Trigger                                      | Output                                                                    |
| ------------------------------------- | --------- | -------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| Steps 1–3 — Extract entity candidates | `explore` | built-in | No — single | Date range > 14 days OR journal > ~200 files | Candidate entity list with mention counts and example contexts per source |

---

*Suggested next steps (present, do not run):*

| Condition                            | Suggested next workflow                          |
| ------------------------------------ | ------------------------------------------------ |
| High-priority stubs created          | `resource-enrich` on each stub                   |
| Gap report reveals structural issues | `resource-plan` to generate full operation queue |
| Duplicate candidates found           | `resource-ops merge`                             |
