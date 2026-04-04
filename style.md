---
updated: 2026-04-01
---

# Code Style

## Markdown (journal repo)

- YAML front matter on every file. `updated` and `tags` mandatory.
- Headings: short noun phrases, not sentences.
- Tables and bullets over prose.
- One blank line between sections. No trailing whitespace.
- Relative links between files. Verify targets exist before linking.

## TypeScript (when working in TS repos)

- Strict mode. No `any` unless explicitly justified.
- Named exports. Avoid default exports.
- Prefer `const` over `let`. Never `var`.
- Destructure function parameters when >2 args.
- Error handling: explicit `try/catch` at boundaries. Never swallow errors silently.
- Imports: group by external → internal → types. Alphabetize within groups.

## General

- No commented-out code in commits. Delete it or keep it behind a feature flag.
- No TODO comments without a linked issue. Use `// TODO(PROJ-123): description`.
- Function and variable names describe what they do, not how. `getUserPermissions` not `queryDbForPerms`.
- Prefer composition over inheritance.
- One concept per file. If a file has multiple unrelated exports, split it.

## Comment Discipline

Only comment what the code cannot say:
- **Constraints** — "Must be called before `init()` completes"
- **Non-obvious side effects** — "Clears the cache as a side effect"
- **Deliberate decisions** — "Using linear scan because n < 10 always"
- **Known limitations** — "Does not handle reconnection; see PROJ-456"

Never restate what the code does. `// increment counter` above `counter++` is noise — delete it. Before adding a comment, ask: would a rename or restructure make it unnecessary?
