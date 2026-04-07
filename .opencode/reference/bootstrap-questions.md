# Bootstrap: Coding Context File Questions

Questions for Steps 3b–3f of `/bootstrap`. Ask all questions for all five files **at once** in a single prompt — do not ask file by file.

---

## 3b: Architecture (`architecture.md`)

Check the "Source Code Repos (External)" section. If it is a comment placeholder, collect:

1. **External workspace path** — where source code repos live on disk (e.g. `~/workspace`, `~/code`)
2. **Repo structure** — key directories, tech stack, purpose of each (one line per repo/sub-project)
3. **Build system** — e.g. Gradle, npm, Make, cargo
4. **CI system** — e.g. GitHub Actions, GitLab CI, Jenkins
5. **Source control host** — e.g. GitHub, GitLab self-hosted, Bitbucket

Rewrite the "Source Code Repos (External)" section: remove the comment, write a Markdown table and a one-line prose summary.

---

## 3c: Patterns (`patterns.md`)

Check the "Coding Patterns (External Repos)" section. The file ships with generic defaults (error handling, config, API design). Ask:

1. **Primary languages / frameworks** — e.g. TypeScript/React, Python/FastAPI, Go, Kotlin/Spring
2. **Any project-specific patterns** — naming conventions, state management approach, data access layer style, etc. (optional — skip if nothing notable)

Rewrite the "Coding Patterns (External Repos)" section with language-specific idioms and any project-specific patterns the user described. Keep the generic defaults only if they are accurate; remove or replace what does not apply.

---

## 3d: Style (`style.md`)

The file ships with a TypeScript section. Ask:

1. **Languages used in external repos** — list all (e.g. TypeScript, Python, Go, Rust, Java, C#)
2. **Any linter / formatter in use** — e.g. ESLint, Prettier, Ruff, gofmt, clippy (optional)
3. **Any style rules that differ from common defaults** — e.g. tabs vs spaces, line length, import order (optional)

Replace the language-specific sections to match the actual languages. Keep the "Markdown" and "General" sections unchanged — they always apply. Add a section per language with the relevant rules.

---

## 3e: Testing (`testing.md`)

The file ships with TypeScript and C# sections. Ask:

1. **Test frameworks in use** — per language (e.g. Vitest, pytest, Go testing, RSpec)
2. **Test file structure** — co-located or separate `tests/` directory?
3. **Any coverage or flakiness policies** — e.g. minimum coverage threshold, flaky test handling (optional)

Replace the language-specific sections to match the actual stack. Keep the "Journal Repo" section unchanged.

---

## 3f: Safety (`safety.md`)

No questions needed — the rules are universal. Just:
- If the user's tooling does **not** include Jira/Confluence, remove the line "Never write to Jira or Confluence without explicit user approval."
- Update `updated:` in front matter.

---

After collecting all answers, write all five files in one pass. Update `updated:` in the front matter of each file written.

If any file already has real user-specific content (not a placeholder), show it and ask if it is still accurate. Update only what the user confirms needs changing.
