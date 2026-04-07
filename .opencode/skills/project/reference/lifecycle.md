# Project Lifecycle Reference

## Status Transitions

| From | To | When | Action |
|------|----|------|--------|
| Active | Paused | No activity for 2+ weeks and no planned work | Set `status: Paused` in front matter and `**Status:**` line. Add Dev Log entry explaining why. |
| Paused | Active | Work resumes | Set `status: Active`. Add Dev Log entry. |
| Active / Paused | Done | All tasks complete, no further work expected | Set `status: Done`. Add final Dev Log entry. Move folder to `archive/projects/`. |

## Archiving

1. Set `status: Done` in front matter and `**Status:** Done` inline.
2. Set `deadline` in front matter to the actual completion date if not already set.
3. Add final Dev Log entry: `**YYYY-MM-DD:** Project completed and archived.`
4. Move entire folder: `git mv projects/<slug> archive/projects/<slug>`.
5. Update any links pointing to the old path (daily notes, weekly notes, resource articles).

## Cross-Linking

| Direction | Where | What |
|-----------|-------|------|
| Daily note → project | Daily note Log & Notes | `[Project Name](../projects/<slug>/README.md)` |
| Project → daily note | Dev Log entry | `[2026-03-25](../../journal/daily/2026-03-25.md)` |
| Project → resource article | Overview or Dev Log | Link when referencing a durable concept |
| Weekly note → project | Weekly Goals / Accomplishments | `#p-<slug>` tag on the line |
| Meeting → project | Meeting Action Items | Add action item to project Open Tasks |
