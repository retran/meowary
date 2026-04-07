---
updated: 2026-04-07
tags: [project-refactoring, security, gdpr, agent-config]
---

# Spec: Mandatory Security & GDPR Guards

## Problem

Security rules are opt-in. `reference/security-rules.md` is loaded only when a skill or command explicitly references it — there is no guarantee it is active. No GDPR rules exist anywhere in the system. Additionally, `.opencode/plugin/shell-strategy/shell_strategy.md` contains two security-problematic patterns that need to be extracted before the file is deleted.

## Constraints

- Security and GDPR rules must be **always active** — not loaded on demand.
- Mandatory rules must live in AGENTS.md (the authoritative always-read rules file).
- GDPR scope: professional-context PII only — colleagues' names, roles, decisions in notes/resources. Not financial or medical data.
- `shell_strategy.md` deleted in full. Two security-relevant patterns extracted before deletion.
- `reference/security-rules.md` kept and expanded — AGENTS.md carries the mandatory summary; the reference file carries lookup detail.

## Options

### Option A: AGENTS.md section + expanded reference [RECOMMENDED]

Add `## Security & GDPR` to AGENTS.md with 6–8 non-negotiable hard rules plus a pointer to `reference/security-rules.md` for detail. Expand the reference file with a GDPR section and the two extracted shell security notes. Delete `shell_strategy.md`.

**Pros:**
- Mandatory rules always active — AGENTS.md is read every session [VERIFIED]
- Single authoritative file for mandatory rules — no new mechanism
- Reference file retains detailed lookup content (red flags table, cloud rules, secrets handling)
- Consistent with existing AGENTS.md structure (Editing Rules section already has 3 non-negotiables)

**Cons:**
- AGENTS.md grows by ~15 lines [ASSUMED: acceptable given prior skill dispatch deletion freed ~25 lines]

**Effort:** Small  
**Risk:** Low

---

### Option B: Plugin file

Create `.opencode/plugin/security/security.md`. Always injected via plugin mechanism.

**Pros:** Independent file, easy to update in isolation.

**Cons:** Plugin mechanism is for system-level behavioral patches; security rules are domain rules — wrong home. No stronger "mandatory" guarantee than AGENTS.md. Adds token weight to every session.

**Effort:** Small  
**Risk:** Low-medium (wrong abstraction)

---

### Option C: Inline in AGENTS.md only (no reference file)

Put everything — summary and detail — directly in AGENTS.md.

**Pros:** One file.

**Cons:** AGENTS.md becomes unwieldy; lookup tables (red flags, cloud rules) belong in a reference, not a top-level instruction file.

**Effort:** Small  
**Risk:** Medium (AGENTS.md bloat)

## Recommendation

**Option A.** AGENTS.md carries the mandatory hard rules; `reference/security-rules.md` carries the detail. The two files complement each other — AGENTS.md is always read, the reference is consulted when detail is needed.

## Scope of Changes

1. **AGENTS.md** — add `## Security & GDPR` section with:
   - Hard rules: no production mutations, no secrets in code/commands, no force-push to main, verify before destructive ops, no exfiltration, no bypassing security controls
   - GDPR rules: no PII commits (emails, phone numbers), professional context only in resource articles, confirm before writing personal data to Confluence/Jira
   - Pointer to `reference/security-rules.md` for detail

2. **`reference/security-rules.md`** — expand with:
   - GDPR section (detail on what counts as PII, what to do when encountered)
   - Shell security note: `echo "password" | sudo -S` is prohibited (password in process list/shell history); use a secrets manager or env var instead
   - Shell security note: `ssh -o StrictHostKeyChecking=no` — used in non-interactive environments; disables host key verification; do not use against unknown/untrusted hosts

3. **`.opencode/plugin/shell-strategy/shell_strategy.md`** — delete in full (and the `shell-strategy/` directory)

4. **References to `reference/security-rules.md`** in `workflow/implement.md`, `workflow/review.md`, `repomix/SKILL.md` — kept as-is (they point to the reference for detail; AGENTS.md now also guarantees the rules are active)

## Open Questions

- None blocking. GDPR scope confirmed as professional-context PII.
