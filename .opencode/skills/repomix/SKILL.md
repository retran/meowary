---
name: repomix
description: Pack a repository or file subset into a single AI-friendly file for analysis, review, or planning. Use when packing a repo or file subset for AI analysis, review, or planning.
compatibility: opencode
updated: 2026-04-06
tags: []
---

# Skill: repomix

`repomix` packs an entire repository (or a subset of files) into a single AI-friendly file. Use it to prepare codebase context for deep analysis, code review, debugging, or planning when the target repo is too large to load file-by-file.

## Analysis Workflow

When using repomix to analyze a codebase, follow this order:

1. **Pack** — run `repomix` with appropriate flags
2. **Check output** — note the metrics repomix prints: files processed, total tokens, output path
3. **Grep before reading** — search the output file for patterns before reading large sections
4. **Read selectively** — use offset/limit to read specific sections; avoid loading the whole file at once
5. **Clean up** — remove large output files when done; they are ephemeral artifacts

---

## Core Usage

### Pack the current repository

```bash
repomix                          # Produces repomix-output.xml
repomix --style markdown         # Markdown format
repomix --style plain            # Plain text
```

### Pack a specific directory or files

```bash
repomix path/to/dir
repomix --include "src/**/*.ts,**/*.md"
repomix --ignore "**/*.log,tmp/,dist/"
```

### Remote repositories

Always output to `/tmp` for remote repos to avoid polluting the working directory:

```bash
repomix --remote user/repo -o /tmp/repo-analysis.xml
repomix --remote https://github.com/user/repo -o /tmp/repo-analysis.xml
repomix --remote user/repo --remote-branch main -o /tmp/repo-analysis.xml
repomix --remote user/repo --remote-branch 935b695 -o /tmp/repo-analysis.xml
```

### Pipe a file list from stdin

Use when you already know which files matter:

```bash
git ls-files "*.ts" | repomix --stdin
rg -l "TODO|FIXME" --type ts | repomix --stdin
git diff --name-only HEAD~5 | repomix --stdin   # pack only changed files
```

### Copy to clipboard instead of file

```bash
repomix --copy
repomix --include "src/**/*.ts" --copy
```

---

## Useful Flags

| Flag | Purpose |
|------|---------|
| `--style xml\|markdown\|plain\|json` | Output format (default: xml) |
| `--include "glob,glob"` | Restrict to matching files |
| `--ignore "glob,glob"` | Exclude matching files |
| `--compress` | ~70% token reduction via Tree-sitter — use for repos >100k lines |
| `--remove-comments` | Strip all comments from source files |
| `--output-show-line-numbers` | Add line numbers to output |
| `--include-diffs` | Append git diffs (working tree and staged changes) |
| `--include-logs` | Append recent git commit log (last 50 commits) |
| `--include-logs-count N` | Use N commits instead of 50 |
| `--stdin` | Accept file list from stdin |
| `--split-output SIZE` | Split into multiple files (e.g. `1mb`, `500kb`) |
| `--token-count-tree` | Print token distribution tree and exit |
| `--no-security-check` | Skip secret-scanning (use with caution) |
| `--copy` | Copy output to clipboard |
| `-o FILE` | Custom output file name |
| `--init` | Generate `repomix.config.json` in current directory |

---

## Token Count Analysis

Before packing a large repo, check token distribution:

```bash
repomix --token-count-tree
repomix --token-count-tree 1000   # Only show nodes with ≥ 1000 tokens
```

Use this to identify token-heavy directories, decide what to `--ignore`, and decide whether to apply `--compress`.

---

## Grep Patterns for Common Analysis Tasks

Search the output file rather than reading it in full:

```bash
# Set OUTPUT to match where you wrote the file
OUTPUT=repomix-output.xml        # local (default)
# OUTPUT=/tmp/repo-analysis.xml  # remote

# Exports and public API
rg "export.*function|export.*class|export default" $OUTPUT

# Imports and dependencies
rg "import.*from|require\(" $OUTPUT

# Authentication / authorization
rg -i "auth|login|password|token|jwt" $OUTPUT

# API endpoints / routing
rg -i "router\.|route\.|endpoint|\.get\(|\.post\(|\.put\(|\.delete\(" $OUTPUT

# Database / models
rg -i "model|schema|migration|query|sequelize|prisma|mongoose" $OUTPUT

# Error handling
rg "try\s*{|catch\s*\(|throw new|\.catch\(" $OUTPUT

# Configuration
rg -i "config\.|Config|configuration|\.env" $OUTPUT

# Test files
rg "describe\(|it\(|test\(|beforeEach\(" $OUTPUT
```

---

## Configuration File

```bash
repomix --init          # Creates repomix.config.json
```

`repomix.config.json` sets default include/ignore patterns, output format, and style so you don't repeat flags. Commit it if the config is project-specific.

---

## Common Workflows

### Full codebase snapshot for AI analysis

```bash
repomix --style markdown --compress --include-logs -o /tmp/snapshot.md
```

### Targeted review of changed files

```bash
# Pack only the changed files; --include-diffs appends ALL working-tree+staged diffs (not scoped to stdin files)
git diff --name-only HEAD~5 | repomix --stdin --include-diffs --style markdown --copy
```

### Remote library inspection

```bash
repomix --remote yamadashy/repomix --compress -o /tmp/repomix-analysis.xml
```

### Journal-specific: pack an external repo for workflow brainstorm/plan

When starting a `brainstorm` or `plan` phase for a feature in an external repo:

```bash
repomix path/to/external/repo/src --compress --style markdown -o /tmp/codebase.md
```

Then load `/tmp/codebase.md` as context. Faster than file-by-file exploration when the AI needs a holistic view.

---

## Error Handling

| Problem | Action |
|---------|--------|
| Command fails on remote | Verify repo slug/URL; check network; try `--remote-branch main` explicitly |
| Output too large to read | Use `--compress`; narrow with `--include`; use `rg` before reading |
| Pattern not found | Try broader regex; check file tree section to verify files exist |
| Permission error on local path | Verify path exists and is readable |

---

## Rules

- **Grep before reading** — search the output file first; read sections only when grep gives you a target.
- **`/tmp` for remote repos** — never write remote output to the working directory; it pollutes `git status`.
- **Use `--compress` for repos >100k lines** — ~70% token reduction with minimal information loss.
- **Use `--stdin`** when you already have a targeted file list from `rg`, `git ls-files`, or `git diff`.
- **Default format is XML** — clearest file boundaries for structured analysis; switch to `--style markdown` when pasting into a chat interface.
- **`repomix.config.json` keeps flags DRY** — create with `repomix --init` for repos you run repeatedly.
- **Review the output before sharing** — the built-in security check is not exhaustive. Do not pack files with API keys, certificates, or credentials.
- **Before using `--no-security-check`**, load `.opencode/reference/security-rules.md`.
- **Output files are ephemeral** — add `repomix-output.*` to `.gitignore`; clean up `/tmp` artifacts when done.
