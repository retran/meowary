---
description: Add or update a knowledge base entry
---

Add or update an entry in `knowledge-base/`. Use this when you want to explicitly record something as durable reference material — not tied to a session or project, but something you'll want to look up later.

Arguments: `/kb [folder/slug]` — if provided, opens or creates that specific entry. Otherwise, the agent figures out where it belongs.

## Step 1: Determine Where It Goes

Classify the content:

| Folder     | What goes here                                      |
| ---------- | --------------------------------------------------- |
| `people/`  | People — family, friends, contacts                  |
| `topics/`  | Subjects, interests, skills not tied to one project |
| `health/`  | Health, fitness, medical                            |
| `places/`  | Locations, restaurants, travel                      |
| `finance/` | Budgets, subscriptions, financial notes             |
| `pets/`    | Pet care, vet, routines                             |

Create a new folder if none of the above fit.

## Step 2: Write or Update the Entry

**New entry:**

- Copy from the appropriate template (`meta/templates/kb-template.md` or `meta/templates/person-template.md`).
- Replace placeholders. Fill in Overview with real content — no stubs.

**Existing entry:**

- Read the current content first.
- Add new information. Update outdated sections.
- Append a changelog entry: `- **YYYY-MM-DD:** <what changed>`.

Keep entries concise: tables and bullets over prose. Link to related KB entries and project files where relevant.

## Step 3: Commit

Commit with message: `kb: <entry name>`.

$ARGUMENTS
