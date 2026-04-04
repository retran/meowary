---
description: Archive a completed project or area
---

Move a completed project or area to `archive/` with proper link and reference updates.

## Arguments

`$ARGUMENTS` should be one of:
- A project slug (e.g. `my-project`)
- An area slug (e.g. `my-area`)

If no argument given, list active projects and areas and ask which to archive.

## Workflow

1. **Identify target.** Determine if the slug matches a `projects/<slug>/` or `areas/<slug>/` directory. Confirm with the user: "Archive `projects/<slug>/`? This will move it to `archive/projects/<slug>/`."

2. **Update status.** Set the project/area dashboard `status` to `Done` (projects) or add an archived note (areas). Set `updated` in front matter.

3. **Move the folder.** Move the entire directory:
   - `projects/<slug>/` → `archive/projects/<slug>/`
   - `areas/<slug>/` → `archive/areas/<slug>/`

4. **Fix links.** Search all `.md` files for links pointing to the old path. Update them to the new `archive/` path.

5. **Update knowledge-graph.md.** If the graph references this project/area, update the path.

6. **Update context.md.** Remove the slug from the Active Projects or Active Areas list.

7. **Update tags.md.** If the project/area had a dedicated tag (e.g. `#p-<slug>`), keep it registered but note it as archived.

8. **Commit.** Commit all changes with message: "Archive <type> <slug>".

$ARGUMENTS
