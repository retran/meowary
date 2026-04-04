---
description: Address unresolved MR review comments — fetch threads, plan fixes, apply, commit, push, resolve
---

Address unresolved discussion threads on a GitLab MR.

Arguments: `/address-review [mr-id]` — MR number to work on. Defaults to the MR for the current branch if omitted.

1. Identify the MR (`$1`). If not provided, detect from current branch via `glab mr view`.
2. Load `glab` skill and `glab/address-review` sub-skill.
3. Follow the address-review workflow in full: fetch threads → display → plan (hard gate) → apply fixes → commit → push → resolve threads.

$ARGUMENTS
