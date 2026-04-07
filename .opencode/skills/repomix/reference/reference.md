# repomix Reference

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

## Error Handling

| Problem | Action |
|---------|--------|
| Command fails on remote | Verify repo slug/URL; check network; try `--remote-branch main` explicitly |
| Output too large to read | Use `--compress`; narrow with `--include`; use `rg` before reading |
| Pattern not found | Try broader regex; check file tree section to verify files exist |
| Permission error on local path | Verify path exists and is readable |
