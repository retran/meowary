#!/usr/bin/env tsx
/**
 * generate-resources-plan.ts
 *
 * Runs a whole-resources graph review session via OpenCode (Workflow C from the
 * resources skill) to produce an ordered operation plan.
 *
 * Output: resources-actualize-plan.md — typed operation queue consumed by
 *         resources-operation.ts.
 *
 * Usage:
 *   npx tsx scripts/generate-resources-plan.ts                  # review entire resources
 *   npx tsx scripts/generate-resources-plan.ts --subfolder maia  # scope to one subfolder
 *
 * The plan must be reviewed before running resources-operation.ts.
 */

import { execSync, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { JOURNAL_DIR } from "./config.js";

const PLAN_FILE = resolve(JOURNAL_DIR, "resources-actualize-plan.md");

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------

let subfolder = "";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--subfolder") {
    subfolder = args[i + 1] ?? "";
    if (!subfolder) {
      console.error("ERROR: --subfolder requires a value");
      process.exit(1);
    }
    i++;
  } else {
    console.error(`ERROR: Unknown argument: ${args[i]}`);
    process.exit(1);
  }
}

const scopeDesc = subfolder ? `resources/${subfolder}/` : "all resource articles";
const scopeInstruction = subfolder
  ? `Focus on resources/${subfolder}/ but consider cross-folder relationships.`
  : "";

console.log("Generating resources graph restructuring plan...");
console.log(`  Scope: ${scopeDesc}`);
console.log(`  Output: ${PLAN_FILE}`);
console.log();

// ---------------------------------------------------------------------------
// Snapshot sessions (to clean up after)
// ---------------------------------------------------------------------------

let beforeSessions: string[] = [];
try {
  const output = execSync("opencode session list 2>/dev/null", {
    encoding: "utf-8",
    cwd: JOURNAL_DIR,
  });
  beforeSessions = output
    .split("\n")
    .filter((l) => /^ses_/.test(l.trim().split(/\s+/)[0]))
    .map((l) => l.trim().split(/\s+/)[0])
    .sort();
} catch {
  // ignore
}

// ---------------------------------------------------------------------------
// Build the prompt
// ---------------------------------------------------------------------------

const PROMPT = `You are performing **Workflow C: Graph Review** from the resources skill. Your goal
is to analyze the entire knowledge base as a knowledge graph and produce an
ordered operation plan. You are NOT editing any resource articles — planning only.

Load the \`resources\` and \`writing\` skills first. Follow Workflow C steps exactly.

## Instructions

1. Read the full resource map (\`knowledge-graph.md\`), \`tags.md\`, and
   \`confluence-map.md\`.

2. For each subfolder in \`resources/\`, read every article. At minimum read full
   front matter, all headings, first paragraph of each section, and the
   \`## Related\` / \`## Sources\` sections. Understand what each article
   actually covers.

3. Identify graph problems — be aggressive:

   a. **Merges** — articles covering the same concept with overlap.
   b. **Splits** — articles covering 2+ distinct concepts.
   c. **New nodes** — concepts mentioned in 2+ articles or recurring in
      \`daily/\`, \`weekly/\`, \`projects/\` with no dedicated resource article.
      Journal content often contains durable facts that never reached resources.
   d. **Deletions** — stubs, duplicates, obsolete topics.
   e. **Reclassifications** — wrong subfolder, bad filename, wrong tags.
   f. **Missing cross-references** — related articles with no links.

4. Write \`resources-actualize-plan.md\` with an **Operation Queue** table.
   Use this exact format:

\`\`\`markdown
---
type: meta
updated: YYYY-MM-DD
tags: []
---

# Resources Actualize Plan

Generated: YYYY-MM-DD HH:MM
Scope: <all resource articles | resources/subfolder/>

## Operation Queue

Ordered list of operations. Execute top to bottom.

| # | Op | Target | Details |
|---|-----|--------|---------|
| 1 | delete | resources/path/article.md | Reason |
| 2 | merge | resources/path/keep.md ← resources/path/absorb.md | Why; keep.md survives |
| 3 | reclassify | resources/old/path.md → resources/new/path.md | Why |
| 4 | split | resources/path/big.md → resources/path/new1.md + resources/path/new2.md | What concepts to extract |
| 5 | create | resources/subfolder/new-concept.md | What concept; mentioned in X, Y |
| 6 | actualize | resources/path/article.md | What needs enrichment |

## Missing Cross-References

| Article A | Article B | Relationship |
|---|---|---|
| path/a.md | path/b.md | How they relate |

## Notes

Observations, coverage gaps, strategic recommendations.
\`\`\`

**Operation ordering:** delete → merge → reclassify → split → create → actualize.
Within \`actualize\`, sort by \`actualized\` date (oldest first; fall back to
\`updated\` if \`actualized\` is absent).

**Every article that will exist after structural operations must appear as
an \`actualize\` operation.** This includes:
- Pre-existing articles not deleted or absorbed
- Surviving articles from merges
- New articles from splits and creates
- Moved articles from reclassifies
The plan is exhaustive — no article is left un-actualized.

5. Commit: \`git add resources-actualize-plan.md && git commit -m "Generate resources actualize plan: N operations"\`

## Rules

- Do NOT edit any resource articles, knowledge-graph.md, tags.md, or confluence-map.md.
- Be aggressive: the goal is a clean concept graph, not status quo.
- Tables may be empty if no issues found in that category.
- For new nodes, only list concepts appearing in 2+ articles or substantial
  enough to warrant a dedicated article.${scopeInstruction ? `\n\n${scopeInstruction}` : ""}`;

// ---------------------------------------------------------------------------
// Run OpenCode (30-minute timeout for full graph review)
// ---------------------------------------------------------------------------

try {
  execFileSync("opencode", ["run", PROMPT], {
    cwd: JOURNAL_DIR,
    stdio: "inherit",
    timeout: 1800_000, // 30 minutes
  });
} catch (err: unknown) {
  const error = err as { status?: number; signal?: string };
  if (error.signal === "SIGTERM") {
    console.error("ERROR: opencode run timed out after 30 minutes");
  } else {
    console.error(`ERROR: opencode run failed (exit ${error.status})`);
  }
  process.exit(error.status ?? 1);
}

// ---------------------------------------------------------------------------
// Clean up session
// ---------------------------------------------------------------------------

try {
  const output = execSync("opencode session list 2>/dev/null", {
    encoding: "utf-8",
    cwd: JOURNAL_DIR,
  });
  const afterSessions = output
    .split("\n")
    .filter((l) => /^ses_/.test(l.trim().split(/\s+/)[0]))
    .map((l) => l.trim().split(/\s+/)[0])
    .sort();

  const beforeSet = new Set(beforeSessions);
  const newSession = afterSessions.find((s) => !beforeSet.has(s));
  if (newSession) {
    execSync(`opencode session delete ${newSession}`, {
      cwd: JOURNAL_DIR,
      stdio: "inherit",
    });
    console.log(`\u2192 Deleted session: ${newSession}`);
  }
} catch {
  // ignore cleanup errors
}

// ---------------------------------------------------------------------------
// Verify output
// ---------------------------------------------------------------------------

if (existsSync(PLAN_FILE)) {
  console.log();
  console.log(`Plan generated: ${PLAN_FILE}`);
  console.log(
    "Review the plan, then run operations with: npx tsx scripts/resources-operation.ts <op-type> <target> <details>"
  );
} else {
  console.log();
  console.log(
    "WARNING: Plan file was not created. Check the OpenCode session output."
  );
  process.exit(1);
}
