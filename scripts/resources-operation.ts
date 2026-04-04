#!/usr/bin/env tsx
/**
 * resources-operation.ts
 *
 * Executes a single resource graph operation via OpenCode (Workflow D from the
 * resources skill).
 *
 * Usage:
 *   npx tsx scripts/resources-operation.ts <op-type> <target> <details>
 *
 * Op types: delete, merge, split, create, reclassify, actualize
 *
 * Examples:
 *   npx tsx scripts/resources-operation.ts delete  "resources/maia/stale.md" "Stub, no content"
 *   npx tsx scripts/resources-operation.ts merge   "resources/eng/a.md ← resources/eng/b.md" "Same concept"
 *   npx tsx scripts/resources-operation.ts split   "resources/eng/big.md → resources/eng/new1.md + resources/eng/new2.md" "Two concepts"
 *   npx tsx scripts/resources-operation.ts create  "resources/tools/new-tool.md" "Concept X; mentioned in a, b"
 *   npx tsx scripts/resources-operation.ts reclassify "resources/eng/wrong.md → resources/platform/right.md" "Platform concept"
 *   npx tsx scripts/resources-operation.ts actualize "resources/maia/copilot.md" "Enrich with latest facts"
 */

import { execSync, execFileSync } from "node:child_process";
import { JOURNAL_DIR } from "./config.js";

const VALID_OPS = [
  "delete",
  "merge",
  "split",
  "create",
  "reclassify",
  "actualize",
] as const;
type OpType = (typeof VALID_OPS)[number];

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error("Usage: resources-operation.ts <op-type> <target> <details>");
  console.error(`Op types: ${VALID_OPS.join(", ")}`);
  process.exit(1);
}

const opType = args[0] as OpType;
const target = args[1];
const details = args[2];

if (!VALID_OPS.includes(opType)) {
  console.error(`ERROR: Unknown operation type: ${opType}`);
  console.error(`Valid types: ${VALID_OPS.join(", ")}`);
  process.exit(1);
}

console.log(`\u2192 Operation: ${opType}`);
console.log(`  Target: ${target}`);
console.log(`  Details: ${details}`);

// ---------------------------------------------------------------------------
// Snapshot sessions
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
// Build operation-specific prompt
// ---------------------------------------------------------------------------

const COMMON_PREAMBLE =
  "Load the `resources` and `writing` skills first. Read `resources-actualize-plan.md` for full context.";

const prompts: Record<OpType, string> = {
  delete: `${COMMON_PREAMBLE}

Execute a **delete** operation (Workflow D from the resources skill).

Target article: \`${target}\`
Reason: ${details}

Follow the Workflow D Delete procedure exactly:
1. Read the article to confirm deletion.
2. Search resources/ for all inbound links.
3. Remove or redirect every inbound link.
4. Delete the file.
5. Remove the row from knowledge-graph.md.
6. Commit: \`Resources: delete ${target} — ${details}\``,

  merge: `${COMMON_PREAMBLE}

Execute a **merge** operation (Workflow D from the resources skill).

Target: \`${target}\`
Rationale: ${details}

The format is: \`surviving-article ← absorbed-article\`. The surviving article
absorbs content from the absorbed one.

Follow the Workflow D Merge procedure exactly — all mandatory steps. Do not just
    concatenate. Restructure sections to flow naturally. Search resources/ for ALL
    inbound links to the absorbed article and redirect them.`,

  split: `${COMMON_PREAMBLE}

Execute a **split** operation (Workflow D from the resources skill).

Target: \`${target}\`
Details: ${details}

The format is: \`source → new1 + new2\`. Extract the listed concepts into
separate articles.

Follow the Workflow D Split procedure exactly — all mandatory steps. Each new
    article must be real content, not a stub. Add bidirectional cross-references.
    Update all inbound links that reference the extracted content.`,

  create: `${COMMON_PREAMBLE}

Execute a **create** operation (Workflow D from the resources skill).

Target path: \`${target}\`
Details: ${details}

Follow the Workflow D Create procedure exactly — all mandatory steps. Search
    Confluence, Jira, codebase, and existing resource articles for facts about
    this concept. Write a real article with Overview and substantive sections.
    No stubs. Add bidirectional cross-references.`,

  reclassify: `${COMMON_PREAMBLE}

Execute a **reclassify** (move/rename) operation (Workflow D from the resources skill).

Target: \`${target}\`
Rationale: ${details}

The format is: \`old-path → new-path\`.

Follow the Workflow D Reclassify procedure exactly — all 7 steps. Search
resources/ for ALL inbound links to the old path and update them.`,

  actualize: `${COMMON_PREAMBLE}

Actualize the resource article \`${target}\`. Apply Workflow A (all mandatory steps,
0 through 8) from the resources skill. Do not skip any step, even if the article
looks recent.

Context from the plan: ${details}

Step 0 will read the plan file for additional context including missing
cross-references and notes.`,
};

const prompt = prompts[opType];

// ---------------------------------------------------------------------------
// Run OpenCode (15-minute timeout per operation)
// ---------------------------------------------------------------------------

try {
  execFileSync("opencode", ["run", prompt], {
    cwd: JOURNAL_DIR,
    stdio: "inherit",
    timeout: 900_000, // 15 minutes
  });
} catch (err: unknown) {
  const error = err as { status?: number; signal?: string };
  if (error.signal === "SIGTERM") {
    console.error("ERROR: opencode run timed out after 15 minutes");
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
