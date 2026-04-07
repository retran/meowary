---
updated: 2026-04-07
tags: []
---

# Resource-Ops

> Executes structural operations on the `resources/` knowledge graph: create, rename/move, merge, split, delete, and archive. Handles the mechanical work — file creation/deletion/moves, link updates, backlink fixes, tag registry updates, and QMD re-indexing. One operation per invocation. Always confirms before any destructive action. Invoke after `resource-plan` produces structural operation entries, or directly when a specific structural change is needed.

## Role

Acts as a disciplined knowledge graph restructuring operator. Never leaves a broken inbound link behind. Always runs `find-backlinks.js` before any move, rename, merge, or delete. Shows the user what will change before any destructive operation and stops for explicit confirmation. One operation, one commit.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Operation type | User invocation | Required |
| Source/target paths | User invocation | Required |
| `find-backlinks.js` output | Script | Required for rename/merge/delete/split |
| `confluence-sync.json` | Repo root | Required for rename/merge/delete |

## Complexity Tiers

Not applicable. Fixed-procedure workflow. Operation type determines which sub-steps apply.

## Steps — Create

### Create Step 0 — Clarify

1. Ask: what concept? Which subfolder? Does a similar article already exist?
2. Run `qmd query "<concept>"` to check for near-duplicates before creating.
3. Confirm the slug (filename) with the user.

Done when: concept, subfolder, and slug confirmed; no near-duplicate exists.

### Create Step 1 — Create article

Write `resources/<subfolder>/<slug>.md` with:
- Front matter: `updated`, `tags`, `status: stub`
- `# Title`
- One-sentence summary
- Empty `## Related` section
- `## Changelog` with creation entry: `- **YYYY-MM-DD:** Created.`

Done when: article file written with front matter, summary, and changelog.

### Create Step 2 — Register tags

Add any new tags to `tags.md`.

Done when: all tags registered.

### Create Step 3 — Link from nearest relative

Find the most closely related existing article; add a link to the new article in its `## Related` section.

Done when: new article linked from nearest relative.

### Create Step 4 — Commit

```
git add resources/<path> tags.md && git commit -m "Create resources: <subfolder>/<slug>"
```

Done when: committed; log entry appended (see Close below); daily note updated.

---

## Steps — Rename / Move

### Rename Step 0 — Clarify

1. Confirm old path and new path.
2. Check that the new path doesn't already exist.

Done when: old and new paths confirmed; new path is free.

### Rename Step 1 — Move file

```
git mv resources/<old-path>.md resources/<new-path>.md
```

Done when: file moved.

### Rename Step 2 — Fix all inbound links

1. Run `node .opencode/scripts/find-backlinks.js resources/<old-path>.md`
2. Update every inbound link to the new path.

Done when: all inbound links updated to new path.

### Rename Step 3 — Update `confluence-sync.json`

If the article appears in `confluence-sync.json` `resources` fields, update the path.

Done when: sync registry updated.

### Rename Step 4 — Commit

```
git add -A && git commit -m "Rename resources: <old-slug> → <new-slug>"
```

Done when: committed.

### Rename Step 5 — Re-index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

---

## Steps — Merge

### Merge Step 0 — Clarify

1. Confirm: which article is kept (target), which is absorbed (source)?
2. Confirm: is there unique content in source that must be preserved?
3. **HARD-GATE:** Show the user what will be deleted before proceeding.

Done when: target and source confirmed; user has seen what will be deleted and confirmed.

### Merge Step 1 — Merge content

1. Read both articles in full.
2. Add unique content from source into target; remove redundant content.
3. Update `## Related`, `## Sources`, `## Changelog` in target.
4. Add merge note to `## Changelog`: `- **YYYY-MM-DD:** Merged from <source-slug>.`

Done when: unique source content absorbed into target; target changelog updated.

### Merge Step 2 — Fix all inbound links

1. Run `node .opencode/scripts/find-backlinks.js resources/<source-path>.md`
2. Update every inbound link to point to target.

Done when: all inbound links updated to target.

### Merge Step 3 — Delete source

```
git rm resources/<source-path>.md
```

Done when: source file deleted.

### Merge Step 4 — Update `confluence-sync.json`

1. Merge `confluence:` front matter page IDs from source into target.
2. Remove source entry from `confluence-sync.json` if present.

Done when: sync registry updated.

### Merge Step 5 — Commit

```
git add -A && git commit -m "Merge resources: <source-slug> → <target-slug>"
```

Done when: committed.

### Merge Step 6 — Re-index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

---

## Steps — Split

### Split Step 0 — Clarify

1. Confirm: what are the two (or more) new articles? What concept does each cover?
2. Confirm slugs and subfolders for each new article.
3. **HARD-GATE:** Show the proposed split to the user before creating files.

Done when: new article concepts, slugs, and subfolders confirmed; user has approved the split.

### Split Step 1 — Create new articles

Write each new article with the appropriate section of the original content. Add `## Changelog` entry noting the split origin: `- **YYYY-MM-DD:** Created by splitting from <original-slug>.`

Done when: all new articles written.

### Split Step 2 — Update the original article

- If original article is being replaced entirely: delete it after creating replacements.
- If original article is being partially extracted: remove extracted content; add links to new articles.

Done when: original article updated or deleted.

### Split Step 3 — Fix all inbound links

1. Run `node .opencode/scripts/find-backlinks.js resources/<original-path>.md`
2. Update inbound links to point to the correct new article.

Done when: all inbound links updated.

### Split Step 4 — Register tags

Add any new tags to `tags.md`.

Done when: all tags registered.

### Split Step 5 — Commit

```
git add -A && git commit -m "Split resources: <original-slug> → <new1-slug> + <new2-slug>"
```

Done when: committed.

### Split Step 6 — Re-index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

---

## Steps — Delete

### Delete Step 0 — Clarify

1. Confirm the article to delete.
2. Run `node .opencode/scripts/find-backlinks.js <path>` — show the user all inbound links.
3. **HARD-GATE:** Confirm deletion explicitly. Never delete without showing inbound link count.

Done when: user has seen all inbound links and confirmed deletion.

### Delete Step 1 — Fix inbound links

For every inbound link: remove the link or replace with inline text. If the article is superseded by another: replace inbound links with the superseding article.

Done when: all inbound links removed or redirected.

### Delete Step 2 — Delete

```
git rm resources/<path>.md
```

Done when: file deleted.

### Delete Step 3 — Update `confluence-sync.json`

Remove the article from any `resources` fields in `confluence-sync.json`.

Done when: sync registry updated.

### Delete Step 4 — Commit

```
git add -A && git commit -m "Delete resources: <subfolder>/<slug>"
```

Done when: committed.

### Delete Step 5 — Re-index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

---

## Steps — Archive

### Archive Step 0 — Clarify

1. Confirm the article to archive.
2. Run `node .opencode/scripts/find-backlinks.js <path>` — show the user all inbound links.
3. **HARD-GATE:** Confirm archival explicitly. Show inbound link count.

Done when: user has seen all inbound links and confirmed archival.

### Archive Step 1 — Move to archive

```
git mv resources/<path>.md archive/resources/<path>.md
```

Create intermediate directories if needed.

Done when: file moved to `archive/resources/`.

### Archive Step 2 — Update front matter

1. Set `status: archived` in the moved file's front matter.
2. Update `updated` date.

Done when: front matter updated.

### Archive Step 3 — Fix inbound links

Update every inbound link found in Step 0 to the new archive path, or remove the link with inline text replacement.

Done when: all inbound links updated or removed.

### Archive Step 4 — Update `confluence-sync.json`

Update the article's path in any `resources` fields; or mark as archived.

Done when: sync registry updated.

### Archive Step 5 — Commit

```
git add -A && git commit -m "Archive resources: <subfolder>/<slug>"
```

Done when: committed.

### Archive Step 6 — Re-index

```
node .opencode/scripts/qmd-index.js
```

Done when: QMD index rebuilt.

---

## Close (all operations)

After committing:
1. Append to `resources-log.md`: `- **YYYY-MM-DD:** <operation> | <subject-slug> — <one-line summary>`
   - Example: `- **2026-04-07:** archive | resources/teams/old-team.md — archived; team disbanded`
2. Append work log entry to `## Day` zone of today's daily note.
3. Mark any matching task items as done.
4. Stop.

## Outputs

| Output | Location |
|--------|----------|
| New/modified/deleted article(s) | `resources/` |
| Updated `tags.md` | Repo root |
| Updated `confluence-sync.json` | Repo root |
| `resources-log.md` entry | Repo root |
| Daily note work log | `journal/daily/<date>.md` Day zone |
| Commit | Git history |

## Error Handling

- **Near-duplicate found during Create:** Surface it; ask the user to confirm they want a new article rather than updating the existing one.
- **`find-backlinks.js` returns many inbound links for Delete/Archive:** Show them all. Do not proceed without the user confirming they have reviewed the link impact.
- **New path already exists during Rename/Move:** Stop. Ask the user how to resolve — merge, choose a different name, or abort.
- **Merge produces content conflicts (overlapping claims that contradict each other):** Surface both versions to the user; ask which to keep. Do not silently discard either.

## Contracts

1. One operation per invocation — one commit per operation.
2. Never leave an inbound link pointing to a deleted or moved file.
3. Run `find-backlinks.js` before every destructive operation (rename, merge, delete, split, archive).
4. HARD-GATE before any destructive operation (merge, delete, archive) — always show scope and confirm.
5. Always re-index after operations that change file paths.

## Sub-Agents

None. All operations run inline — the operations are file-manipulation procedures that benefit from staying in the main context where the user can review HARD-GATE confirmations in real time.

---

*Suggested next steps (present, do not run):*

| Condition | Suggested next workflow |
|-----------|------------------------|
| Structural ops complete; articles need enrichment | `resource-enrich` on affected articles |
| More operations remain in the plan queue | Next `resource-ops` operation (user decides) |
| New stubs created | `resource-enrich` to populate them |
| After a batch of ops, graph health should be checked | `resource-plan` |
