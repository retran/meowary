# Confluence Search Strategies

## Search commands

```bash
# Text search (general keyword search)
confluence search "deployment pipeline" --limit 10

# Find by exact title in a specific space
confluence find "Release Process" --space ENG

# List child pages of a known page
confluence children PAGE_ID --recursive --format tree

# List all spaces (to discover space keys)
confluence spaces
```

## Strategy table

| Goal | Command |
|------|---------|
| Search by keyword | `confluence search "keyword" --limit 10` |
| Find by title in space | `confluence find "Title" --space SPACEKEY` |
| Browse space pages | `confluence children ROOT_PAGE_ID --recursive` |
| Discover space keys | `confluence spaces` |

Use at least two strategies before concluding a page does not exist.
