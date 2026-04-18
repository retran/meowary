---
updated: 2026-04-18
tags: []
---

# Resource-Ops

<summary>
> Structural operations on `resources/`: create, rename/move, merge, split, delete, archive. Mechanical work — file ops, link updates, backlink fixes, tag registry, QMD re-index. One operation per invocation. Always confirms before destructive actions.
</summary>

<role>
Disciplined knowledge graph restructuring operator. NEVER leaves broken inbound links. ALWAYS runs `find-backlinks.js` before any move/rename/merge/delete. Shows scope and stops for explicit confirmation before destructive ops. One operation, one commit.
</role>

<inputs>
| Input | Source | Required |
|-------|--------|----------|
| Operation type | User invocation | Yes |
| Source/target paths | User invocation | Yes |
| `find-backlinks.js` output | Script | Yes for rename/merge/delete/split |
| `meta/confluence-sync.json` | `meta/` | Yes for rename/merge/delete |
</inputs>

<tiers>Not applicable. Operation type determines sub-steps.</tiers>

## Steps — Create

<steps>

<step n="c0" name="Create: Clarify">
1. ASK: what concept? subfolder? near-duplicate exists?
2. RUN `qmd query "<concept>"` to check.
3. CONFIRM slug.

<done_when>Concept, subfolder, slug confirmed; no near-duplicate.</done_when>
</step>

<step n="c1" name="Create: Article">
WRITE `resources/<subfolder>/<slug>.md`:
- Front matter: `updated`, `tags`, `status: stub`
- `# Title`
- One-sentence summary
- Empty `## Related`
- `## Changelog` with `- **YYYY-MM-DD:** Created.`

<done_when>File written.</done_when>
</step>

<step n="c2" name="Create: Register tags">
ADD new tags to `meta/tags.md`.

<done_when>Tags registered.</done_when>
</step>

<step n="c3" name="Create: Link">
Find closest related; add link to new article in its `## Related`.

<done_when>Linked from nearest relative.</done_when>
</step>

<step n="c4" name="Create: Commit">
`git add resources/<path> meta/tags.md && git commit -m "Create resources: <subfolder>/<slug>"`

<done_when>Committed.</done_when>
</step>

</steps>

## Steps — Rename / Move

<steps>

<step n="r0" name="Rename: Clarify" gate="HARD-GATE">
1. CONFIRM old and new paths.
2. CHECK new path is free.
3. RUN `node .opencode/scripts/find-backlinks.js resources/<old-path>.md` — show all inbound links.
4. **HARD-GATE:** Output pending rename + inbound count. DO NOT proceed without confirmation.

<done_when>Paths confirmed; new free; user confirmed.</done_when>
</step>

<step n="r1" name="Rename: Move">
`git mv resources/<old-path>.md resources/<new-path>.md`

<done_when>Moved.</done_when>
</step>

<step n="r2" name="Rename: Fix inbound links">
1. RE-RUN `find-backlinks.js` (fresh run for fix pass — DO NOT reuse Step 0 output).
2. UPDATE every inbound link.

<done_when>All inbound updated.</done_when>
</step>

<step n="r3" name="Rename: Update sync registry">
If in `meta/confluence-sync.json` `resources` fields: update path.

<done_when>Registry updated.</done_when>
</step>

<step n="r4" name="Rename: Commit">
`git add -A && git commit -m "Rename resources: <old-slug> → <new-slug>"`

<done_when>Committed.</done_when>
</step>

<step n="r5" name="Rename: Re-index">
`node .opencode/scripts/qmd-index.js`

<done_when>QMD rebuilt.</done_when>
</step>

</steps>

## Steps — Merge

<steps>

<step n="m0" name="Merge: Clarify" gate="HARD-GATE">
1. CONFIRM target (kept) vs source (absorbed).
2. CONFIRM unique source content to preserve.
3. **HARD-GATE:** Show what will be deleted before proceeding.

<done_when>Target/source confirmed; user saw deletion scope and confirmed.</done_when>
</step>

<step n="m1" name="Merge: Content">
1. READ both fully.
2. ADD unique source content into target; remove redundant.
3. UPDATE target `## Related`, `## Sources`, `## Changelog`.
4. ADD `- **YYYY-MM-DD:** Merged from <source-slug>.`

<done_when>Unique content absorbed; changelog updated.</done_when>
</step>

<step n="m2" name="Merge: Fix inbound links">
1. RUN `node .opencode/scripts/find-backlinks.js resources/<source-path>.md`
2. UPDATE every inbound to target.

<done_when>All inbound point to target.</done_when>
</step>

<step n="m3" name="Merge: Delete source">
`git rm resources/<source-path>.md`

<done_when>Source deleted.</done_when>
</step>

<step n="m4" name="Merge: Update sync registry">
1. MERGE `confluence:` page IDs from source into target.
2. REMOVE source entry from `meta/confluence-sync.json` if present.

<done_when>Registry updated.</done_when>
</step>

<step n="m5" name="Merge: Commit">
`git add -A && git commit -m "Merge resources: <source-slug> → <target-slug>"`

<done_when>Committed.</done_when>
</step>

<step n="m6" name="Merge: Re-index">
`node .opencode/scripts/qmd-index.js`

<done_when>QMD rebuilt.</done_when>
</step>

</steps>

## Steps — Split

<steps>

<step n="s0" name="Split: Clarify" gate="HARD-GATE">
1. CONFIRM new articles, concepts each covers.
2. CONFIRM slugs and subfolders.
3. **HARD-GATE:** Show proposed split before creating.

<done_when>Concepts/slugs/subfolders confirmed; user approved.</done_when>
</step>

<step n="s1" name="Split: Create new articles">
WRITE each new article with appropriate section. Add `## Changelog`: `- **YYYY-MM-DD:** Created by splitting from <original-slug>.`

<done_when>All new articles written.</done_when>
</step>

<step n="s2" name="Split: Update original">
- Replaced entirely: delete after creating replacements.
- Partially extracted: remove extracted content; add links to new articles.

<done_when>Original updated or deleted.</done_when>
</step>

<step n="s3" name="Split: Fix inbound links">
1. RUN `node .opencode/scripts/find-backlinks.js resources/<original-path>.md`
2. UPDATE inbound to correct new article.

<done_when>All inbound updated.</done_when>
</step>

<step n="s4" name="Split: Register tags">
ADD new tags to `meta/tags.md`.

<done_when>Tags registered.</done_when>
</step>

<step n="s5" name="Split: Commit">
`git add -A && git commit -m "Split resources: <original-slug> → <new1-slug> + <new2-slug>"`

<done_when>Committed.</done_when>
</step>

<step n="s6" name="Split: Re-index">
`node .opencode/scripts/qmd-index.js`

<done_when>QMD rebuilt.</done_when>
</step>

</steps>

## Steps — Delete

<steps>

<step n="d0" name="Delete: Clarify" gate="HARD-GATE">
1. CONFIRM article.
2. RUN `node .opencode/scripts/find-backlinks.js <path>` — show all inbound.
3. **HARD-GATE:** Confirm deletion explicitly. NEVER delete without inbound count shown.

<done_when>User saw inbound and confirmed.</done_when>
</step>

<step n="d1" name="Delete: Fix inbound">
For every inbound: remove or replace with inline text. If superseded: replace with superseding article.

<done_when>All inbound removed/redirected.</done_when>
</step>

<step n="d2" name="Delete: File">
`git rm resources/<path>.md`

<done_when>Deleted.</done_when>
</step>

<step n="d3" name="Delete: Update sync registry">
Remove from `resources` fields in `meta/confluence-sync.json`.

<done_when>Registry updated.</done_when>
</step>

<step n="d4" name="Delete: Commit">
`git add -A && git commit -m "Delete resources: <subfolder>/<slug>"`

<done_when>Committed.</done_when>
</step>

<step n="d5" name="Delete: Re-index">
`node .opencode/scripts/qmd-index.js`

<done_when>QMD rebuilt.</done_when>
</step>

</steps>

## Steps — Archive

<steps>

<step n="a0" name="Archive: Clarify" gate="HARD-GATE">
1. CONFIRM article.
2. RUN `node .opencode/scripts/find-backlinks.js <path>` — show all inbound.
3. **HARD-GATE:** Confirm archival explicitly. Show inbound count.

<done_when>User saw inbound and confirmed.</done_when>
</step>

<step n="a1" name="Archive: Move">
`git mv resources/<path>.md archive/resources/<path>.md`

Create intermediate dirs if needed.

<done_when>Moved to `archive/resources/`.</done_when>
</step>

<step n="a2" name="Archive: Update front matter">
1. SET `status: archived`.
2. UPDATE `updated`.

<done_when>Front matter updated.</done_when>
</step>

<step n="a3" name="Archive: Fix inbound">
Update every inbound from Step 0 to new archive path, or remove with inline text.

<done_when>All inbound updated/removed.</done_when>
</step>

<step n="a4" name="Archive: Update sync registry">
Update path in `resources` fields, or mark archived.

<done_when>Registry updated.</done_when>
</step>

<step n="a5" name="Archive: Commit">
`git add -A && git commit -m "Archive resources: <subfolder>/<slug>"`

<done_when>Committed.</done_when>
</step>

<step n="a6" name="Archive: Re-index">
`node .opencode/scripts/qmd-index.js`

<done_when>QMD rebuilt.</done_when>
</step>

</steps>

## Close (all operations)

<steps>

<step n="z0" name="Close" gate="END-GATE">
After commit:
1. APPEND to `meta/resources-log.md`: `- **YYYY-MM-DD:** <operation> | <subject-slug> — <one-line summary>`
   - Example: `- **2026-04-07:** archive | resources/teams/old-team.md — archived; team disbanded`
2. APPEND work log to today's daily note `## Day`.
3. MARK matching tasks done.
4. STOP.

<self_review>
- [ ] All `Done when` met
- [ ] All inbound links updated for renamed/moved
- [ ] Sync registry updated if applicable
- [ ] QMD re-indexed
- [ ] No placeholders
- [ ] All file paths correct
</self_review>

<done_when>Log appended; daily note updated; stopped.</done_when>
</step>

</steps>

<outputs>
| Output | Location | Format |
|--------|----------|--------|
| New/modified/deleted article(s) | `resources/` | Markdown |
| Tag updates | `meta/tags.md` | Markdown |
| Sync registry | `meta/confluence-sync.json` | JSON |
| Log entry | `meta/resources-log.md` | Append |
| Work log | `journal/daily/<date>.md` Day zone | Append |
| Commit | Git | Commit |
</outputs>

<error_handling>
- **Near-duplicate during Create:** Surface; ask if user wants new vs updating existing.
- **Many inbound for Delete/Archive:** Show all. DO NOT proceed without user reviewing impact.
- **New path exists during Rename:** STOP. Ask user — merge, rename, or abort.
- **Merge content conflicts (contradicting claims):** Surface both; ask which to keep. NEVER silently discard.
</error_handling>

<contracts>
1. One operation per invocation — one commit per operation.
2. NEVER leave inbound link to deleted/moved file.
3. ALWAYS run `find-backlinks.js` before destructive ops.
4. HARD-GATE before destructive ops — show scope, confirm.
5. ALWAYS re-index after path-changing ops.
</contracts>

<subagents>
None. All operations run inline — file-manipulation procedures benefit from main context where user reviews HARD-GATE confirmations in real time.
</subagents>

<next_steps>
| Condition | Suggested next workflow |
|-----------|------------------------|
| Structural ops complete; need enrichment | `resource-enrich` on affected |
| More ops in queue | Next `resource-ops` operation |
| New stubs | `resource-enrich` |
| After batch ops | `resource-plan` |
</next_steps>

<output_rules>Output language: English.</output_rules>
