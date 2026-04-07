---
updated: 2026-04-07
tags: [project-refactoring, security, gdpr, agent-config]
spec: specs/security-gdpr-guards.md
---

# Plan: Mandatory Security & GDPR Guards

## End State

- `TRUE:` Security and GDPR rules are always active — no skill load required
- `TRUE:` `.opencode/plugin/shell-strategy/shell_strategy.md` does not exist
- `EXIST:` `## Security & GDPR` section in `AGENTS.md`
- `EXIST:` GDPR section in `reference/security-rules.md`
- `EXIST:` Shell security notes in `reference/security-rules.md`
- `WIRED:` AGENTS.md section points to `reference/security-rules.md` for detail

## Tasks

### T1 — Expand `reference/security-rules.md`

**File:** `.opencode/reference/security-rules.md`  
**Change:** Add two new sections at the end of the file:

1. `## GDPR — Personal Data` — what counts as PII in this journal context, what is allowed (professional context), and 5 rules: no PII commits, resource articles professional-context only, confirm before writing PII to Confluence/Jira, strip contact info during ingestion, no personal data in commit messages.

2. `## Shell Security Notes` — two extracted patterns from `shell_strategy.md`:
   - `echo "password" | sudo -S` — **PROHIBITED** (password in process list/shell history); use env vars instead
   - `ssh -o StrictHostKeyChecking=no` — **EXCEPTION, USE WITH CAUTION** — only against known/trusted hosts in controlled environments; never against unknown hosts

**Verify:** Read the file; confirm both sections are present, accurate, and consistent with existing Hard Rules.

---

### T2 — Add `## Security & GDPR` section to `AGENTS.md`

**File:** `AGENTS.md`  
**Change:** Add `## Security & GDPR` section after `## Editing Rules`. Content:
- One-line framing: these rules are non-negotiable in all sessions
- **Security hard rules** (7 rules — compact bullet list):
  - No production mutations without explicit approval
  - No secrets in source files or commit messages
  - No secrets as inline shell arguments — use env vars
  - No `sudo` for application code without flagging the user
  - No force-push to `main` or `master`
  - No bypassing security controls without explicit approval
  - Verify before destructive operations — show scope, confirm
- **GDPR rules** (4 rules — compact bullet list):
  - No PII commits (email, phone, home address)
  - Resource articles: professional context only (name + role, not contact data)
  - Confirm before writing personal data to Confluence or Jira
  - Confluence/Jira ingestion: strip personal contact info before storing in resources
- Pointer: `Full detail: .opencode/reference/security-rules.md`

**Verify:** Read AGENTS.md; confirm section is after `## Editing Rules`, rules are concise, pointer is correct.

---

### T3 — Delete `shell_strategy.md` and its directory

**File:** `.opencode/plugin/shell-strategy/shell_strategy.md` + `.opencode/plugin/shell-strategy/` directory  
**Change:** Delete file and directory.

**Verify:** Confirm `.opencode/plugin/shell-strategy/` no longer exists. Confirm `.opencode/plugin/` is empty (or has no `shell-strategy` entry).

---

### T4 — Verify no dangling references

**Search:** Grep the repo for `shell_strategy` and `shell-strategy` to confirm no remaining references.  
**Verify:** Zero matches (excluding git history).

## Verification Strategy

| Task | Check |
|------|-------|
| T1 | Read expanded file; both new sections present; shell prohibited pattern is clearly marked PROHIBITED |
| T2 | Read AGENTS.md; section appears after Editing Rules; 7 security + 4 GDPR rules; pointer present |
| T3 | Directory does not exist |
| T4 | `grep -r "shell_strategy\|shell-strategy" .opencode/ AGENTS.md` → zero matches |

## Risks

- **Low:** T2 (AGENTS.md edit) — additive only; no existing content removed or restructured
- **Low:** T3 (deletion) — non-interactive behavioral guidance lost; acceptable per user direction; model training covers most patterns
- **None:** T1 — additive to reference file; no downstream breakage

## Order

T1 → T2 → T3 → T4 (sequential; T2 references the content added in T1)
