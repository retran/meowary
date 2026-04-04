---
name: writing/area
description: Area dashboard format rules — front matter, sections, lifecycle, task states
compatibility: opencode
---

This sub-skill extends `writing`. Load `writing` first, then load `writing/area` when creating or updating area dashboards.

---

## What Is an Area?

An area is an ongoing responsibility with no defined end date. Unlike projects, areas are never "done" — they stay active as long as the responsibility exists.

Examples: Architecture Governance, Developer Experience, Mentoring, Personal Finance.

Areas live in `areas/<slug>/README.md`.

---

## File Format

### Front Matter

```yaml
---
type: area
status: Active
updated: YYYY-MM-DD
tags: [a-<slug>]
---
```

- `type`: always `area`.
- `status`: `Active` or `Paused`. No `Done` — archive instead.
- `updated`: today's date — update on every edit.
- `tags`: always includes `a-<slug>`. Add project/topic tags as needed.

No `deadline` field — areas don't have deadlines.

### H1

```markdown
# <Area Name>
```

Human-readable name (e.g. `# Architecture Governance`).

### Sections (in order)

**Status line and Tags** — immediately after H1:
```markdown
**Status:** Active
**Tags:** #a-<slug>
```

**Focus** — 1–3 sentences describing the current focus or ongoing responsibility. Update when the focus shifts.

**Open Tasks** — `- [ ]` checkboxes. Use task state formats (see AGENTS.md). Prefix tasks with context when helpful.

**Log** — append-only reverse-chronological log of significant events, decisions, or changes. Format:
```
- **YYYY-MM-DD:** <entry>
```

---

## Creating a New Area

1. Copy `.opencode/templates/area-template.md`.
2. Replace placeholders: `{{AREA_NAME}}`, `{{AREA_SLUG}}`, `{{DATE}}`.
3. Write to `areas/<slug>/README.md`.
4. Add `#a-<slug>` to `tags.md` under Area Tags. Link to `areas/<slug>/README.md`.
5. Register the tag in `tags.md` (lowercase kebab-case, `#a-` prefix).

---

## Updating an Area

- Update the **Focus** section if the responsibility has shifted.
- Add new tasks to **Open Tasks**; mark completed tasks with `- [x]`.
- Append to **Log** for any significant event.
- Update `updated:` in front matter on every edit.

---

## Archiving an Area

When an area is no longer active:
1. Set `status: Paused` or remove the dashboard.
2. Move `areas/<slug>/` to `archive/areas/<slug>/`.
3. Update any cross-links.
4. Remove the `#a-<slug>` tag from `tags.md` or mark it as archived.

---

## Editor Checklist

- [ ] Front matter complete: `type`, `status`, `updated`, `tags`?
- [ ] No `deadline` field present?
- [ ] H1 is human-readable name?
- [ ] Status and Tags lines immediately after H1?
- [ ] Focus section is current and concrete?
- [ ] Open Tasks use correct state formats?
- [ ] Log is append-only, reverse-chronological?
