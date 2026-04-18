---
type: reference
updated: 2026-04-18
tags: [security, gdpr]
---

<role>Security and GDPR rules — non-negotiable across all workflow phases.</role>

<summary>
> These rules apply to all workflow phases when working with real systems, credentials, or production environments. They are non-negotiable.
</summary>

# Security Rules

<hard_rules>
1. **NO production mutations without explicit approval.** NEVER write to, delete from, or modify a production system unless user explicitly says "yes, do it in production." DESCRIBE the change; let user execute or confirm.

2. **NO secrets in code.** NEVER write credentials, tokens, API keys, or passwords into source files, commit messages, or log statements — even temporarily. Secrets belong in `.env` files or a secrets manager.

3. **NO secrets in shell commands.** DO NOT pass secrets as inline arguments (they appear in process lists and shell history). USE environment variables or input piping.

4. **NO `sudo` for application code.** If something requires elevated privileges, FLAG for user — DO NOT silently add `sudo`. Privilege escalation MUST be deliberate.

5. **NO force-push to `main` or `master`.** Hard stop. If user asks, WARN explicitly and ask for confirmation. PREFER revert commits over force-push.

6. **NO bypassing security controls.** DO NOT add `--no-verify`, disable linting, or skip pre-commit hooks without explicit approval.

7. **VERIFY before destructive operations.** Before any `rm -rf`, `DROP TABLE`, `delete_*`, or bulk update — SHOW what will be affected and CONFIRM with user.

8. **NO exfiltration patterns.** NEVER pipe file contents or env vars to external services, URLs, or clipboard commands. Data stays in working environment.

9. **Credential files are read-only.** `.env`, `credentials.json`, similar are for reading config. NEVER overwrite without user instruction. NEVER log contents.
</hard_rules>

<aws_cloud>
- Default posture is **read-only**. USE `--dry-run` or equivalent before any mutating operation.
- ALWAYS confirm target account/region before running — wrong account = incident.
- PREFER IAM roles over long-lived access keys. If keys needed, FROM environment — NEVER hardcode.
- TAG resources with project name when creating.
- Every cloud command that creates/modifies/deletes resources REQUIRES explicit user approval.
</aws_cloud>

<secrets_in_repo>
All credentials in `.env` at repo root. File is gitignored. NEVER commit, log, or include values in any file.

To read value from `.env` in shell:
```bash
source .env && echo "loaded"   # source first, then use $VAR_NAME
```

DO NOT use `cat .env` to inspect — pipe to `grep` for specific value:
```bash
grep "^GITLAB_TOKEN" .env
```
</secrets_in_repo>

<red_flags>
If any appear in request or command, **STOP and verify with user** before proceeding:

| Red flag | What to do |
|----------|------------|
| `DROP`, `TRUNCATE`, `DELETE FROM` without `WHERE` | Show affected rows estimate first |
| `rm -rf /` or similar root deletion | Refuse unless path clearly safe and scoped |
| `git push --force` to `main`/`master` | Warn and require explicit re-confirmation |
| Any command writing to production URL | Confirm environment and intent |
| Exporting env vars to file that will be committed | Stop and flag |
| Credentials appearing in planned commit | Stop and strip before committing |
</red_flags>

<gdpr>
The journal may contain personal data through meeting notes, Confluence imports, Jira issues.

**What counts as PII:**
- Email addresses, phone numbers, home addresses (PII on their own)
- Personal health or financial information
- Full names combined with any contact or identifying data above

**What is allowed (professional context):**
- First name + professional role (e.g., "Alex, Engineering Lead")
- Decisions and professional judgments attributed to a person
- Work-related contact info publicly available (e.g., work email already on Confluence page)

**Rules:**

1. **NO PII commits.** Before committing any file that may contain personal contact data, VERIFY professional context only.
2. **Resource articles: professional context only.** When writing about a person, INCLUDE role, team, professional decisions — NOT personal contact details.
3. **CONFIRM before writing to Confluence/Jira.** If planned write would include personal data beyond name + role, STOP and confirm.
4. **Confluence/Jira ingestion: STRIP contact info.** When ingesting pages, REMOVE personal contact information (emails, phones) before writing to resource articles.
5. **NO personal data in commit messages.** Issue keys and brief descriptions only.
</gdpr>

<shell_security>
**`echo "password" | sudo -S` — PROHIBITED**

Passing passwords via echo exposes them in process list and shell history. NEVER pipe literal password through echo. USE `sudo` with proper authenticated session (run manually by user), or configure passwordless sudo for specific commands via `/etc/sudoers`. If user asks to use this pattern, FLAG the risk.

**`ssh -o StrictHostKeyChecking=no` — EXCEPTION, USE WITH CAUTION**

This flag disables SSH host key verification, making connections vulnerable to MITM attacks. ONLY use when ALL three hold:
- Host is known and trusted
- Connection is within controlled network or CI/CD with ephemeral hosts
- Manual host key verification is not possible in execution environment

NEVER use `StrictHostKeyChecking=no` against unknown or untrusted hosts.
</shell_security>

<output_rules>
Output language: English. Bash commands, file paths, error patterns remain literal.
</output_rules>
