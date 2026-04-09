---
type: reference
updated: 2026-04-09
tags: [security, gdpr]
---

# Security Rules

These rules apply to all workflow phases when working with real systems, credentials, or production environments. They are non-negotiable.

## Hard Rules

1. **No production mutations without explicit approval.** Never write to, delete from, or modify a production system unless the user explicitly says "yes, do it in production." Describe the change; let the user execute it or confirm.

2. **No secrets in code.** Never write credentials, tokens, API keys, or passwords into source files, commit messages, or log statements — even temporarily. Secrets belong in `.env` files or a secrets manager.

3. **No secrets in shell commands.** Do not pass secrets as inline arguments (they appear in process lists and shell history). Use environment variables or input piping instead.

4. **No `sudo` for application code.** If something requires elevated privileges, flag it for the user — do not silently add `sudo`. Privilege escalation must be deliberate.

5. **No force-push to `main` or `master`.** This is a hard stop. If the user asks for it, warn them explicitly and ask for confirmation. Prefer revert commits over force-push.

6. **No bypassing security controls.** Do not add `--no-verify`, disable linting, or skip pre-commit hooks without explicit approval. These exist for a reason.

7. **Verify before destructive operations.** Before any `rm -rf`, `DROP TABLE`, `delete_*`, or bulk update — show what will be affected and confirm with the user.

8. **No exfiltration patterns.** Never pipe file contents or env vars to external services, URLs, or clipboard commands. Data stays in the working environment.

9. **Credential files are read-only.** `.env`, `credentials.json`, and similar files are for reading config. Never overwrite them without user instruction. Never log their contents.

## When Working with AWS / Cloud

- Default posture is **read-only**. Use `--dry-run` or equivalent before any mutating operation.
- Always confirm the target account/region before running commands — wrong account = incident.
- Prefer IAM roles over long-lived access keys. If keys are needed, they come from the environment — never hardcode.
- Tag resources with the project name when creating them.
- Every cloud command that creates, modifies, or deletes resources requires explicit user approval.

## Secrets in This Repo

All credentials are in `.env` at the repo root. This file is gitignored. Never commit it, log it, or include its values in any file.

To read a value from `.env` in a shell command:
```bash
source .env && echo "loaded"   # source first, then use $VAR_NAME
```

Do not use `cat .env` to inspect it — pipe it to `grep` if you need a specific value:
```bash
grep "^GITLAB_TOKEN" .env
```

## Red Flags — Hard Stops

If any of these appear in a request or command, **stop and verify with the user** before proceeding:

| Red flag | What to do |
|----------|------------|
| `DROP`, `TRUNCATE`, `DELETE FROM` without `WHERE` | Show affected rows estimate first |
| `rm -rf /` or similar root deletion | Refuse unless path is clearly safe and scoped |
| `git push --force` to `main`/`master` | Warn and require explicit re-confirmation |
| Any command writing to a production URL | Confirm environment and intent |
| Exporting env vars to a file that will be committed | Stop and flag |
| Credentials appearing in a planned commit | Stop and strip before committing |

## GDPR — Personal Data

The journal may contain personal data encountered through meeting notes, Confluence imports, and Jira issues.

**What counts as PII in this context:**
- Email addresses, phone numbers, home addresses (PII on their own)
- Personal health or financial information
- Full names combined with any contact or identifying data above

**What is allowed (professional context):**
- First name + professional role (e.g., "Alex, Engineering Lead")
- Decisions and professional judgments attributed to a person
- Work-related contact info that is publicly available (e.g., work email already on a Confluence page)

**Rules:**

1. **No PII commits.** Before committing any file that may contain personal contact data, verify it contains professional context only.
2. **Resource articles: professional context only.** When writing about a person, include role, team, and professional decisions — not personal contact details.
3. **Confirm before writing to Confluence or Jira.** If a planned write would include personal data beyond name + role, stop and confirm with the user.
4. **Confluence/Jira ingestion: strip contact info.** When ingesting pages, remove personal contact information (email addresses, phone numbers) before writing to resource articles.
5. **No personal data in commit messages.** Issue keys and brief descriptions only.

## Shell Security Notes

Patterns that carry security risk in shell usage:

**`echo "password" | sudo -S` — PROHIBITED**

Passing passwords via echo exposes them in the process list and shell history. Never pipe a literal password through echo in any command. Use `sudo` with a proper authenticated session (run manually by the user), or configure passwordless sudo for specific commands via `/etc/sudoers`. If the user asks to use this pattern, flag the risk.

**`ssh -o StrictHostKeyChecking=no` — EXCEPTION, USE WITH CAUTION**

This flag disables SSH host key verification, making connections vulnerable to MITM attacks. Only use it when all three conditions hold:
- The host is known and trusted
- The connection is within a controlled network or a CI/CD environment with ephemeral hosts
- Manual host key verification is not possible in the execution environment

Never use `StrictHostKeyChecking=no` against unknown or untrusted hosts.
