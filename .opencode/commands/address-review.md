---
description: Address unresolved review comments — GitHub PRs, GitLab MRs, pasted text, or local changes
---

Address unresolved review comments. Works for GitHub PRs, GitLab MRs, pasted review text, and local (pre-PR/MR) changes.

Arguments: `/address-review [pr-or-mr-number]` — PR/MR number to work on. Omit to auto-detect from current branch, or paste review comments directly for Paste/Local mode.

1. Detect input mode from context (API / Paste / Local — see skill for rules).
2. Load the `workflow/address-review` skill.
3. Follow the address-review workflow in full: gather threads → display → plan (hard gate) → apply fixes → commit → push (unless Local mode) → resolve threads (unless Paste/Local mode).

$ARGUMENTS
