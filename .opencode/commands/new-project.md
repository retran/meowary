---
description: Create a new project folder from template
---

Create a new project under `projects/`. This is an interactive process.

Arguments: `/new-project [slug] [name] [deadline]`

1. Load `project` skill.
2. Gather details: slug (`$1`), name (`$2`), deadline (`$3`). Ask for missing values.
3. Follow the project creation workflow from the skill: create folder from template, fill overview and initial tasks, register `#p-<slug>` tag, cross-link to daily/weekly notes, commit.
4. Ask: "Is this a **code project** (has an external repo) or a **document project** (journal-only)?"
   - If **code project**: ask for the repo path, then scan the repo to generate codebase context notes in `projects/<slug>/`:
     - `architecture-notes.md` — repo structure, tech stack, build system, key directories
     - `conventions-notes.md` — coding patterns, naming conventions, framework idioms
     - `testing-notes.md` — test framework, file structure, coverage approach
     Scan by reading key config files (`package.json`, `tsconfig.json`, `Makefile`, `Cargo.toml`, `pyproject.toml`, etc.), directory structure, and existing README. These are project-local notes, not the root-level coding context files.
   - If **document project**: skip this step.

$ARGUMENTS
