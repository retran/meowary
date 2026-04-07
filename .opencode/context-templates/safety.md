---
path: context/safety.md
updated: YYYY-MM-DD
apply-when: [always — violations are Blockers regardless of task]
---

# Safety Rules

Non-negotiable rules for all coding tasks. Violations require explicit user override.

## Never Do

- **Never commit secrets.** No API keys, passwords, tokens, or connection strings in code. Use environment variables.
- **Never force-push to main/master.** Warn if requested. Require explicit confirmation.
- **Never delete production data.** No DROP TABLE, DELETE without WHERE, or destructive migrations without backup verification.
- **Never disable security controls.** No `--no-verify`, no skipping auth checks, no disabling CORS for convenience.
- **Never write to Jira or Confluence without explicit user approval.** Default posture is read-only.
- **Never modify files outside the current project scope** unless the user explicitly names them.

## Always Do

- **Validate inputs.** Sanitize user-provided data at system boundaries.
- **Handle errors explicitly.** No empty catch blocks. No swallowed exceptions.
- **Use parameterized queries.** Never interpolate user input into SQL or command strings.
- **Check file existence** before overwriting. Confirm with user if the target exists.
- **Run tests** after code changes when a test suite exists.
- **Review diffs** before committing. Ensure no unintended changes.

## Approval Gates

These actions require user confirmation before proceeding:

| Action | Gate |
|--------|------|
| Deleting files | Confirm file list |
| Running destructive commands (rm -rf, git reset --hard) | Confirm exact command |
| Modifying CI/CD configs | Confirm changes |
| Changing authentication or authorization logic | Confirm approach |
| Publishing packages or deploying | Confirm target and version |
