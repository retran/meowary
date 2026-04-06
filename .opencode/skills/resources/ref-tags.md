---
name: resources/ref-tags
description: Tag naming conventions, prefixes, and registration procedure for resource articles
compatibility: opencode
---

## Tag Reference

`tags.md` is the canonical tag registry. Read it before assigning or creating tags.

| Prefix | Scope | Example |
|--------|-------|---------|
| `#p-` | Projects (match folder slug) | `#p-my-project` |
| `#t-` | Teams (match team resource filename) | `#t-my-team` |
| `#person-` | People (match person resource filename) | `#person-alice` |
| *(none)* | Topics, domains, technologies | `#architecture` |

- Lowercase kebab-case. No `#` prefix in front matter YAML.
- `#` prefix in inline body text (backtick-quoted when used in tables).
- Every article needs at least one tag.
- Common pitfalls: `spam` instead of `t-spam`; unregistered tags.

**Registering a new tag:** pick a lowercase kebab-case name, add a row to the correct table in `tags.md` with tag, link, and description, then use it in the article's front matter.
