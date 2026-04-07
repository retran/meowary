---
title: "README.md update — reflect last two architectural commits"
status: approved
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# README.md update — reflect last two architectural commits

## Problem

`README.md` was last substantively updated in commit `0bbf455` (two commits before the current HEAD). Two subsequent commits made breaking changes to the documented architecture:

- **`c7f14e9`** — replaced all MCP server integrations with CLI-first tools. Removed `uv` dependency. Updated `opencode.json` (no MCP servers). Updated `.env.example` (now documents confluence-cli, jira-cli, ctx7, and OpenCode built-in Exa).
- **`73326c6`** — deleted `knowledge-graph.md` and `confluence-map.md`. Replaced with `confluence-sync.json` (monitoring registry) and per-article `confluence: []` frontmatter. Added `confluence-ingest.js`, `unlinked-mentions.js`, `lib/sync.js`, `lib/confluence.js`. Added `/check-env` command.

The README now has at least **10 stale locations** — deleted files referenced, wrong command descriptions, a wrong prerequisites table, and an Integrations section that documents MCP servers that no longer exist.

## Constraints

- README is a user-facing document. It must be correct and concise. **[VERIFIED]**
- Do not change the purpose, tone, or section order unless required by the content changes. **[ASSUMED]**
- The second brain loop diagram is core to explaining the product — update rather than delete. **[ASSUMED]**
- No new sections unless required (a `check-env` command needs a row). **[ASSUMED]**

## Stale locations (all VERIFIED by code review)

| Location | Problem | Correct state |
|---|---|---|
| Line 22 | "A `knowledge-graph.md` indexes all resource articles" | File deleted; QMD (`qmd query`) now provides semantic search |
| Line 64 | Evening step: "updates `knowledge-graph.md`" | knowledge-graph.md deleted; evening promotes insights to `resources/` only |
| Line 84 | Weekly: "Updates `knowledge-graph.md` for any stale articles" | Same — remove mention |
| Lines 92–97 | Second brain loop diagram: `knowledge-graph.md` appears twice | Rewrite diagram to show QMD as the search layer |
| Line 99 | "The knowledge graph is the index that makes resources findable" | Rewrite: QMD is now the search layer |
| Line 134 | Prerequisites: `uv` "Runs MCP servers (Atlassian Jira + Confluence)" | MCP removed; `uv` no longer needed — remove row |
| Line 181 | `/evening` description: "promote insights to `resources/` + `knowledge-graph.md`" | Remove `knowledge-graph.md` from description |
| Line 207 | `/r-sync` description: "Sync the Confluence map" | Now: "Sync Confluence tracked pages and batch-update resource articles" |
| Line 243 | Structure tree: lists `knowledge-graph.md` | Remove; add `confluence-sync.json` |
| Lines 254–263 | Integrations section: documents MCP servers (Atlassian, Exa, Context7, gh_grep) | Rewrite to document CLI tools: confluence-cli, jira-cli, gh/glab, ctx7, Exa built-in |

## Missing content (VERIFIED — exists in codebase, not in README)

| What | Where it belongs |
|---|---|
| `/check-env` command (added in 73326c6) | Commands table, Organisation section |
| `confluence-sync.json` file | Structure tree |
| `resources-log.md` file | Structure tree (added in 905eb67) |
| `qmd.yml` file | Structure tree (added in 905eb67) |

## Options

### Option A: Surgical fixes only

Update exactly the 10 stale locations listed above. Fix broken references in-place, with minimal surrounding text changes. For the Integrations section, remove the MCP table and replace with a brief note listing the CLI tools. Add the missing `/check-env` row. Update the structure tree.

**Pros:**
- Minimal diff — low risk of unintended changes **[VERIFIED: small scope]**
- Fast to implement and review

**Cons:**
- The Integrations section has a structural problem: the MCP model and the CLI model are different enough that a pure text substitution leaves an awkward section. The old section introduced integrations as "Configured in `opencode.json`" — that's no longer true for most tools. **[VERIFIED: opencode.json has no MCP servers]**
- `check-env`, `confluence-sync.json`, `resources-log.md`, `qmd.yml` still won't appear — this is deliberately out of scope for surgical, which may feel incomplete

**Effort:** small  
**Risk:** Low. Narrow scope, easy to verify correctness.

---

### Option B: Targeted update — fix all stale content, restructure Integrations section

Fix all 10 stale locations and add all missing items. Additionally, restructure the Integrations section to honestly document the CLI-first model: the old section assumed MCP as the integration layer; the new section should explain that integrations are CLI tools installed separately, with each tool providing different capabilities.

Also rewrite the second brain loop diagram paragraph to reference QMD as the search layer, which is architecturally correct and more accurate than vague "the agent loads relevant articles."

**Pros:**
- README accurately reflects current architecture **[VERIFIED]**
- Integrations section becomes genuinely useful (explains what to install and why) **[ASSUMED]**
- Second brain loop explanation is correct **[VERIFIED: QMD is the search mechanism per AGENTS.md]**
- Adds missing commands and files **[VERIFIED]**

**Cons:**
- Larger diff — more lines changed, higher chance of subtle errors
- The Integrations section rewrite is the only structural change; all other fixes are in-place — this asymmetry might feel inconsistent **[ASSUMED]**

**Effort:** medium  
**Risk:** Low-medium. The Integrations section rewrite is the main risk — if the new model description is unclear, it creates new confusion rather than fixing old confusion.

---

### Option C: Full README rewrite

Rewrite the entire README from scratch. Use the current system as the canonical source of truth.

**Pros:**
- Maximum coherence — no vestigial structure from old architecture **[ASSUMED]**
- Can fix other minor issues noticed in the existing README (e.g., the "What Meowary is" section could be tighter) **[ASSUMED]**

**Cons:**
- High risk of losing correct, useful content accidentally **[ASSUMED]**
- Takes significantly longer to write and review
- Premature: the system is still being actively developed — another large commit could invalidate a from-scratch rewrite quickly **[ASSUMED]**
- No strong evidence the current README structure is a problem — the stale content is the issue, not the structure **[VERIFIED: structure sections are sound]**

**Effort:** large  
**Risk:** High.

## Recommendation

**Option C: Full README rewrite.** *(selected by user)*

Rewrite the entire README from the current system as the canonical source of truth. The accumulated stale content and architectural shifts across two major commits make a full rewrite the cleaner path — rather than patching around a structure designed for a different architecture (MCP-based integrations, knowledge-graph index), start fresh and document what the system actually is today.

## Open Questions

- Should `resources-log.md` and `qmd.yml` be added to the structure tree, or only `confluence-sync.json` (which is more user-facing)? The former are implementation details; the latter is something users interact with.
- The `/check-env` command: should it appear in the Organisation section or under a new "Diagnostics" section? Organisation seems appropriate as it's a one-time tool.
- Python 3.10+ footnote (line 150): is `mr_discussions.py` (glab address-review) still in use? If so, the footnote is still correct. If the glab skill handles this via CLI now, the footnote is stale. **[ASSUMED: needs verification]**
