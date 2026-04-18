---
name: areas
description: Area dashboard format and lifecycle — ongoing responsibilities, task states, Focus section, log, and archiving. Load when creating a new area, updating an area's tasks or focus, appending a log entry, or archiving a completed responsibility.
compatibility: opencode
updated: 2026-04-18
---

<role>Area dashboard format and lifecycle authority for ongoing responsibilities (no end date).</role>

<summary>
> Areas are the responsibility layer: steady-state commitments without deliverables. Focus matters more than tasks. Log captures drift over time. Archive when over — never "Done".
</summary>

<definitions>
- **Area:** ongoing responsibility, no end date. Lives at `areas/<slug>/README.md`. Examples: Architecture Governance, Mentoring, Personal Finance.
- **Focus:** 1–3 sentences describing current priority. Update when responsibility shifts.
- **Log:** append-only reverse-chronological record of significant events.
</definitions>

<file_format>

### Front matter

```yaml
---
type: area
status: Active            # Active | Paused (no Done — archive instead)
updated: YYYY-MM-DD
tags: [a-<slug>]
---
```

DO NOT include `deadline` — areas have no deadline.

### Sections (in order)

1. `# <Area Name>` — H1, human-readable
2. `**Status:** Active` and `**Tags:** #a-<slug>` lines immediately after H1
3. `## Focus` — 1–3 sentences, current
4. `## Open Tasks` — `- [ ]` checkboxes
5. `## Log` — append-only, reverse-chronological: `- **YYYY-MM-DD:** <entry>`

</file_format>

<task_states>

| State | Format |
|-------|--------|
| Open | `- [ ] text` |
| Done | `- [x] text` |
| Moved | `- [ ] ~~text~~ → [date](link)` (target date must include task) |
| Dropped | `- [ ] ~~text~~ *(dropped: reason)*` |
| Blocked | `- [ ] text *(blocked: reason)*` |

NEVER delete tasks. Mark in place.

</task_states>

<steps>

<step n="1" name="create_new_area" condition="creating new area">
1. Create `areas/<slug>/` folder.
2. Copy `.opencode/skills/areas/area-template.md` → `areas/<slug>/README.md`.
3. Replace `{{AREA_NAME}}`, `{{AREA_SLUG}}`, `{{DATE}}`.
4. Write concrete **Focus** (real content, not placeholder).
5. Add ≥1 concrete **Open Task**.
6. Register `#a-<slug>` in `meta/tags.md` under Area Tags with link to `areas/<slug>/README.md`.

<pre_check>Verify `meta/tags.md` exists. If missing, copy from `.opencode/meta-templates/tags-template.md`.</pre_check>
</step>

<step n="2" name="update_area" condition="editing existing area">
- Update **Focus** if responsibility shifted.
- Add/mark tasks in **Open Tasks**.
- Append to **Log** for any significant event.
- Update `updated:` to today.
</step>

<step n="3" name="archive_area" condition="responsibility entirely over">
DO NOT confuse with pausing. Paused = `status: Paused`, stays in `areas/`. Archived = moved out.

1. Append final Log entry: `**YYYY-MM-DD:** Area archived — <reason>.`
2. Set `status: Paused` in front matter (move to `archive/` signals completion).
3. Move `areas/<slug>/` → `archive/areas/<slug>/`.
4. Update all cross-links pointing to old path.
5. Remove `#a-<slug>` from `meta/tags.md` or mark archived.
</step>

</steps>

<health_rules>
- `updated` MUST change every edit.
- Inline `**Status:**` MUST match front matter `status`.
- NO `deadline` field.
- Focus MUST be substantive and current.
- `#a-<slug>` MUST be in front matter `tags` AND `**Tags:**` line AND `meta/tags.md`.
- Active areas MUST have ≥1 concrete Open Task.
</health_rules>

<self_review>
- [ ] Front matter complete: `type`, `status`, `updated`, `tags`?
- [ ] No `deadline` field?
- [ ] H1 human-readable?
- [ ] Status/Tags lines after H1?
- [ ] Focus current and concrete?
- [ ] Task states use correct formats?
- [ ] Log append-only, reverse-chronological?
</self_review>

<output_rules>Output in English. Preserve verbatim file paths and tag formats.</output_rules>
