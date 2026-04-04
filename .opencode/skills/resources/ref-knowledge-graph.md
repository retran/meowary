---
name: resources/ref-knowledge-graph
description: Format and update rules for knowledge-graph.md
compatibility: opencode
---

## Resources Map Reference

`knowledge-graph.md` tracks every resource article. Three columns: `File`, `Summary`, `Tags`.

**Row format:**
```
| [filename.md](resources/<subfolder>/filename.md) | Summary stating specific facts | `tag1`, `tag2` |
```

- **Summary:** State what the article contains — not "Describes the release process" but "Release process types, schedule, branching, porting."
- **Tags:** Backtick-quoted, comma-separated, no `#` prefix. Must match front matter `tags`.
- **Section:** Place under the section matching the subfolder. Create a new section if needed.

Update when: new article added, article summary or tags change, article moved/renamed/archived.

## Synthesis Articles

Articles in `resources/synthesis/` have `status: synthesis` in front matter and answer a specific question by synthesizing multiple sources. They are first-class resource nodes — include them in `knowledge-graph.md` under a `## Synthesis` section.

Synthesis articles are cross-linked from their source articles. A source article with 2+ synthesis articles referencing it should have a `## Synthesis` sub-section in its `## Related` block.
