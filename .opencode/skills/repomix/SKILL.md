---
name: repomix
description: Pack a repository or file subset into a single AI-friendly file using repomix. Load when preparing an external codebase for analysis, review, or planning — before scout, research, or peer-review workflows on large external repos.
compatibility: opencode
updated: 2026-04-18
tags: []
---

<role>`repomix` packing authority for codebase analysis preparation.</role>

<summary>
> Pack repository or file subset into single AI-friendly file. Use when target repo is too large for file-by-file loading. Grep before reading. Use `/tmp` for remote repos.
</summary>

<workflow>
1. **Pack** — run `repomix` with appropriate flags.
2. **Check output** — note metrics: files processed, total tokens, output path.
3. **Grep before reading** — search output for patterns first.
4. **Read selectively** — offset/limit; avoid loading whole file.
5. **Clean up** — remove large output files when done; ephemeral artifacts.
</workflow>

<core_usage>

### Pack current repo
```bash
repomix                          # Default: repomix-output.xml
repomix --style markdown         # Markdown
repomix --style plain            # Plain text
```

### Pack specific dir/files
```bash
repomix path/to/dir
repomix --include "src/**/*.ts,**/*.md"
repomix --ignore "**/*.log,tmp/,dist/"
```

### Remote repos — ALWAYS output to `/tmp`
```bash
repomix --remote user/repo -o /tmp/repo-analysis.xml
repomix --remote https://github.com/user/repo -o /tmp/repo-analysis.xml
repomix --remote user/repo --remote-branch main -o /tmp/repo-analysis.xml
repomix --remote user/repo --remote-branch 935b695 -o /tmp/repo-analysis.xml
```

### Stdin file list
```bash
git ls-files "*.ts" | repomix --stdin
rg -l "TODO|FIXME" --type ts | repomix --stdin
git diff --name-only HEAD~5 | repomix --stdin   # changed files only
```

### Clipboard
```bash
repomix --copy
repomix --include "src/**/*.ts" --copy
```

</core_usage>

<flags>

| Flag | Purpose |
|------|---------|
| `--style xml\|markdown\|plain\|json` | Output format (default xml) |
| `--include "glob,glob"` | Restrict to matches |
| `--ignore "glob,glob"` | Exclude matches |
| `--compress` | ~70% token reduction (Tree-sitter) — repos >100k lines |
| `--remove-comments` | Strip comments |
| `--output-show-line-numbers` | Add line numbers |
| `--include-diffs` | Append working-tree + staged diffs |
| `--include-logs` | Append last 50 commits |
| `--include-logs-count N` | N commits instead of 50 |
| `--stdin` | File list from stdin |
| `--split-output SIZE` | Split into files (e.g. `1mb`, `500kb`) |
| `--token-count-tree` | Token distribution tree, exit |
| `--no-security-check` | Skip secret scanning (caution) |
| `--copy` | To clipboard |
| `-o FILE` | Custom output |
| `--init` | Generate `repomix.config.json` |

</flags>

<token_analysis>

Before packing large repo, check distribution:

```bash
repomix --token-count-tree
repomix --token-count-tree 1000   # Nodes ≥1000 tokens
```

USE to identify token-heavy directories, decide `--ignore`, decide `--compress`.

</token_analysis>

<grep_patterns>

Search output rather than reading full:

```bash
OUTPUT=repomix-output.xml         # local default
# OUTPUT=/tmp/repo-analysis.xml   # remote

# Exports / public API
rg "export.*function|export.*class|export default" $OUTPUT
# Imports / dependencies
rg "import.*from|require\(" $OUTPUT
# Auth
rg -i "auth|login|password|token|jwt" $OUTPUT
# Endpoints / routing
rg -i "router\.|route\.|endpoint|\.get\(|\.post\(|\.put\(|\.delete\(" $OUTPUT
# DB / models
rg -i "model|schema|migration|query|sequelize|prisma|mongoose" $OUTPUT
# Error handling
rg "try\s*{|catch\s*\(|throw new|\.catch\(" $OUTPUT
# Config
rg -i "config\.|Config|configuration|\.env" $OUTPUT
# Tests
rg "describe\(|it\(|test\(|beforeEach\(" $OUTPUT
```

</grep_patterns>

<config_file>

```bash
repomix --init          # Creates repomix.config.json
```

Sets default include/ignore, format, style. Commit if project-specific.

</config_file>

<common_workflows>

### Full snapshot for AI analysis
```bash
repomix --style markdown --compress --include-logs -o /tmp/snapshot.md
```

### Targeted review of changed files
```bash
# --include-diffs appends ALL working-tree+staged diffs (not scoped to stdin files)
git diff --name-only HEAD~5 | repomix --stdin --include-diffs --style markdown --copy
```

### Remote library inspection
```bash
repomix --remote yamadashy/repomix --compress -o /tmp/repomix-analysis.xml
```

### Pack external repo for brainstorm/plan
```bash
repomix path/to/external/repo/src --compress --style markdown -o /tmp/codebase.md
```
Then load `/tmp/codebase.md` as context. Faster than file-by-file when AI needs holistic view.

</common_workflows>

<error_handling>

| Problem | Action |
|---------|--------|
| Remote command fails | Verify slug/URL; check network; try `--remote-branch main` explicitly |
| Output too large | Use `--compress`; narrow `--include`; `rg` before reading |
| Pattern not found | Try broader regex; verify file tree |
| Permission error on local | Verify path exists and readable |

</error_handling>

<rules>
- Grep before reading — search output first; read sections only when grep gives target.
- `/tmp` for remote repos — NEVER write remote output to working directory; pollutes `git status`.
- USE `--compress` for repos >100k lines — ~70% token reduction, minimal information loss.
- USE `--stdin` when targeted file list ready (`rg`, `git ls-files`, `git diff`).
- Default XML — clearest file boundaries; switch to `--style markdown` for chat paste.
- `repomix.config.json` keeps flags DRY — `repomix --init` for repeat repos.
- Review output before sharing — built-in security check NOT exhaustive. NEVER pack files with API keys, certificates, credentials.
- Before `--no-security-check`: load `.opencode/reference/security-rules.md`.
- Output files ephemeral — add `repomix-output.*` to `.gitignore`; clean `/tmp` artifacts.
</rules>

<output_rules>Output in English. Preserve verbatim CLI commands, flags, and grep patterns.</output_rules>
