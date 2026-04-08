---
name: areas
description: Area dashboard format and lifecycle — ongoing responsibilities, task states, Focus section, log, and archiving. Load when creating a new area, updating an area's tasks or focus, appending a log entry, or archiving a completed responsibility.
compatibility: opencode
---

## Philosophy

Areas are the **responsibility layer** of the second brain — ongoing commitments with no defined end. Unlike projects (time-bound deliverables) and the journal (episodic record), areas are steady-state. They accumulate focus, tasks, and log entries across months and years.

- **No done state.** An area that is truly over gets archived, not completed.
- **Focus over tasks.** The Focus section matters more than any individual task — keep it current.
- **Log captures drift.** The Log shows how the responsibility evolved over time. It is as valuable as the current state.

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

**Open Tasks** — `- [ ]` checkboxes. Prefix tasks with context when helpful.

**Log** — append-only reverse-chronological log of significant events, decisions, or changes. Format:
```
- **YYYY-MM-DD:** <entry>
```

---

## Task States

| State | Format | Example |
|-------|--------|---------|
| Open | `- [ ] text` | `- [ ] Review Alice's MR` |
| Done | `- [x] text` | `- [x] Fix build failures` |
| Moved | `- [ ] ~~text~~ → [date](link)` | `- [ ] ~~Write ADR~~ → [2026-02-25](../../journal/daily/2026-02-25.md)` |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` | `- [ ] ~~Upgrade libs~~ *(dropped: superseded)*` |
| Blocked | `- [ ] text *(blocked: reason)*` | `- [ ] Deploy *(blocked: waiting on infra)*` |

- Moved tasks must link to the target date. The target note should include the task.
- Dropped and blocked require a short reason in italics.
- Do not delete tasks — mark them in place.

---

## Creating a New Area

1. Create `areas/<slug>/` folder.
2. Copy `.opencode/skills/areas/area-template.md` → `areas/<slug>/README.md`.
3. Replace placeholders: `{{AREA_NAME}}`, `{{AREA_SLUG}}`, `{{DATE}}`.
4. Write a concrete **Focus** section — what the responsibility is and what the current focus is.
5. Add at least one concrete **Open Task**.
6. Register `#a-<slug>` in `meta/tags.md` under Area Tags. Link to `areas/<slug>/README.md`.

> **Before using this file:** Check that `meta/tags.md` exists. If not, copy from `.opencode/meta-templates/tags-template.md`.

---

## Updating an Area

- Update the **Focus** section if the responsibility has shifted.
- Add new tasks to **Open Tasks**; mark completed tasks with `- [x]`.
- Append to **Log** for any significant event.
- Update `updated:` in front matter on every edit.

---

## Archiving an Area

Archiving means the responsibility is entirely over and will not be revisited. Do not confuse with pausing: a paused area (`status: Paused`) is a responsibility with reduced focus that stays in `areas/`. An archived area is done.

To archive:

1. Add a final Log entry: `**YYYY-MM-DD:** Area archived — <reason>.`
2. Set `status: Paused` in front matter (areas have no "Done" state — the move to `archive/` signals completion).
3. Move `areas/<slug>/` to `archive/areas/<slug>/`.
4. Update any cross-links pointing to the old path.
5. Remove the `#a-<slug>` tag from `meta/tags.md` or mark it as archived.

---

## After Every Edit

1. Update `updated` in front matter.
2. Update **Focus** if the responsibility or current priorities have shifted.
3. Update **Open Tasks**: mark completed items `- [x]`, add new tasks, mark blocked.
4. Append to **Log** for any significant event, decision, or change.
5. Update relevant resource articles if durable facts emerged (org changes, process decisions).

---

## Health Rules

Apply on every edit:

- `updated` front matter must change on every edit.
- `**Status:**` inline line must match front matter `status`.
- No `deadline` field — areas do not have deadlines.
- Focus must be substantive and current, not a placeholder.
- `#a-<slug>` tag must be present in both front matter `tags` and `**Tags:**` line.
- Tag must be registered in `meta/tags.md`.
- Active areas must have at least one concrete Open Task.

---

## Editor Checklist (run silently before every output)

- [ ] Front matter complete: `type`, `status`, `updated`, `tags`?
- [ ] No `deadline` field present?
- [ ] H1 is human-readable name?
- [ ] Status and Tags lines immediately after H1?
- [ ] Focus section is current and concrete?
- [ ] Open Tasks use correct state formats?
- [ ] Log is append-only, reverse-chronological?
