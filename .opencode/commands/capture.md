---
description: Quickly capture a raw note, idea, or link to inbox/
---

Capture a raw note to `inbox/`. Fast, low-friction — no structure required.

Arguments: `/capture [title]`

1. Load `writing` skill.
2. Get title (`$1`) and content. Ask for missing values.
3. Write to `inbox/YYYY-MM-DD-<slug>.md` with minimal front matter (`type: capture`, `updated`, `tags: []`).
4. Confirm location. Do **not** commit — inbox captures are committed when processed.

$ARGUMENTS
