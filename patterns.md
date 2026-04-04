---
updated: 2026-04-01
---

# Common Patterns

## Journal Repo Patterns

### Skill Files
- YAML frontmatter: `name`, `description`, `compatibility: opencode`
- Sub-skills loaded on demand via `skill` tool
- Progressive disclosure: SKILL.md dispatches to sub-files, never dumps everything

### Command Files
- YAML frontmatter: `description` only
- Numbered steps: `## Step N: Title`
- Interactive: ask user questions at decision points
- End with `$ARGUMENTS` placeholder for CLI args

### Templates
- Live in `.opencode/templates/`
- Placeholders use `{{double-braces}}`
- Front matter schema defined per content type

### Cross-linking
- Bidirectional links between related files
- Tags in front matter (no `#` prefix) + inline `#tags` in body
- Knowledge graph (`knowledge-graph.md`) indexes all resource articles

## Coding Patterns (External Repos)

### Error Handling
- Define domain-specific error types. Never throw raw strings.
- Catch at boundaries (API handlers, CLI entry points). Let errors propagate through business logic.
- Log structured errors with context: `{ error, operation, input }`.

### Configuration
- Environment variables for secrets and deployment-specific values.
- Config files for everything else. Never hardcode.
- Validate config at startup, fail fast on invalid values.

### API Design
- RESTful with consistent naming. Plural nouns for collections.
- Version in URL path (`/v1/`). Never break existing versions.
- Return consistent error shapes: `{ code, message, details }`.
