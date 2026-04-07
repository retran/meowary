---
description: Verify required CLI tools are installed and report their versions
---

Check that all required journal tools are available and report their status.

Arguments: `/check-env`

1. For each tool below, run `command -v <tool> 2>/dev/null` to detect presence, then capture the version string where applicable.

   | Tool      | Version command   | Required                       |
   |-----------|-------------------|--------------------------------|
   | `node`    | `node --version`  | Yes — must be ≥ 22             |
   | `jira`    | `jira version`    | Yes — Jira CLI for issue queries |
   | `gh`      | `gh --version`    | Yes — GitHub CLI for PR/issue ops |
   | `qmd`     | `qmd --version`   | Yes — semantic search index    |
   | `repomix` | `repomix --version` | Yes — repo packing for analysis |
   | `glab`    | `glab --version`  | Optional — GitLab CLI          |

2. For each tool, determine status:
   - **OK** — present and version check succeeded
   - **MISSING** — `command -v` returned nothing
   - **WARN** — present but version is below minimum (applies to `node` < 22)

3. Print a markdown table:

   ```
   | Tool     | Status  | Version / Note          |
   |----------|---------|-------------------------|
   | node     | OK      | v22.x.x                 |
   | jira     | MISSING | not found in PATH       |
   | gh       | OK      | 2.x.x                   |
   | qmd      | OK      | x.x.x                   |
   | repomix  | OK      | x.x.x                   |
   | glab     | OK      | x.x.x (optional)        |
   ```

4. Print a summary line:
   - All required tools present: `All required tools OK.`
   - Any required tool missing or WARN: `Missing or outdated: <list of tool names>. Run /bootstrap or install manually.`

$ARGUMENTS
