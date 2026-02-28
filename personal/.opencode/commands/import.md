---
description: Import files from an external export (Notion, Obsidian, etc.)
---

One-shot import of an external dump into the journal. The agent evaluates each file, routes it to the right place, and produces a report. No interactive questions during the process — decisions are made autonomously and documented in the report.

Arguments: `/import <path>` — path to the folder containing exported files (absolute or relative to the repo root).

## Step 1: Inventory

List all files in the import folder recursively. Ignore system files (`.DS_Store`, `Thumbs.db`, hidden files starting with `.`). Build a flat list of candidates.

## Step 2: Evaluate Each File

For each file, determine:

1. **Is it useful?** A file is useful if it contains actual content: notes, decisions, knowledge, references, or meaningful lists. Skip:
   - Empty files or files with only a title.
   - System/template artefacts (Notion export metadata, index files with only links, workspace configs).
   - Purely structural files with no standalone value.

2. **Where does it go?** Map the file to one of these destinations:

   | Destination | Criteria |
   | ----------- | -------- |
   | `projects/<slug>/` | Content clearly belongs to a specific project (references a named project, has a dev log, is a project README) |
   | `notes/<topic>/YYYY-MM-DD-<slug>.md` | Standalone note — a single topic, observation, or session write-up |
   | `knowledge-base/<folder>/<slug>.md` | Durable reference: concept, person, place, rule, fact |
   | `lists/<name>.md` | A list of items to consume or track (books, movies, games, tools) |
   | `_review/<original-filename>` | Uncertain — see criteria below |

3. **Uncertain → `_review/`** if any of these apply:
   - Cannot determine what the file is about from its content.
   - Multiple unrelated topics mixed together with no clear primary.
   - Looks like it might be useful but requires context only the user has.
   - Belongs to a project that doesn't exist yet and creating it would require too many assumptions.
   - Contains data that should go to the KB but the right folder/category is unclear.
   - File is a large raw dump (e.g. an entire Notion database export) that needs manual triage.

   When moving to `_review/`, add a one-line comment at the top of the file:
   ```
   <!-- _review: <reason why this wasn't auto-imported> -->
   ```

## Step 3: Process Each File

For files with a clear destination:

- **Project files:** Check if the project folder exists. If it does, merge content appropriately (don't overwrite existing dev log entries — prepend or append). If the project doesn't exist and the file provides enough context to create it, create the project using the standard template. Otherwise → `_review/`.
- **Notes:** Convert to note format (H1 title, `## Notes`, optional `## Takeaways`). Use the file's original date if available in the filename or metadata; otherwise use today. If a note with the same slug already exists, append the imported content to the existing `## Notes` section (add new bullets below the existing ones). If the imported content has a `## Takeaways` section, append those to the existing `## Takeaways` section, or add the section if it's missing.
- **KB files:** Convert to KB format. Check if an entry already exists for this topic — if so, merge rather than overwrite. Append a changelog entry.
- **Lists:** Append items to the appropriate existing list file. Create a new list file if the category doesn't exist yet.
- **`_review/` files:** Copy as-is with the comment prepended. Do not restructure.

Preserve original content — don't summarise or truncate. Restructure formatting to match the journal conventions (headings, bullets) but keep all substance.

## Step 4: Report

After processing all files, output a summary report:

```
## Import Report

**Source:** <path>
**Date:** YYYY-MM-DD
**Total files:** N

### Imported (N)

| File | Destination | Notes |
| ---- | ----------- | ----- |
| original-name.md | projects/glsl/notes.md | merged into existing project |
| another-file.md | knowledge-base/topics/shaders.md | created new KB entry |

### Skipped (N)

| File | Reason |
| ---- | ------ |
| index.md | structural file, no content |
| .DS_Store | system file |

### Needs Review (N)

| File | Reason |
| ---- | ------ |
| dump.md | multiple unrelated topics |
| unknown-project.md | references unknown project "FooBar" |

Review files are in `_review/`. Open each one and use `/note` or `/project` to route manually.
```

Print the report to the conversation. Do not create a separate report file.

## Step 5: Commit

Commit all imported files with the message: `import: <source folder name> — <N> files`.

$ARGUMENTS
