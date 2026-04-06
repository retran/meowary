#!/usr/bin/env node
/**
 * run-operation.js
 *
 * Executes a single resource graph operation via OpenCode (Workflow D from the
 * resources skill).
 *
 * Usage:
 *   node scripts/run-operation.js <op-type> <target> <details>
 *
 * Op types: delete, merge, split, create, reclassify, actualize
 *
 * Examples:
 *   node scripts/run-operation.js delete  "resources/maia/stale.md" "Stub, no content"
 *   node scripts/run-operation.js merge   "resources/eng/a.md ← resources/eng/b.md" "Same concept"
 *   node scripts/run-operation.js split   "resources/eng/big.md → resources/eng/new1.md + resources/eng/new2.md" "Two concepts"
 *   node scripts/run-operation.js create  "resources/tools/new-tool.md" "Concept X; mentioned in a, b"
 *   node scripts/run-operation.js reclassify "resources/eng/wrong.md → resources/platform/right.md" "Platform concept"
 *   node scripts/run-operation.js actualize "resources/maia/copilot.md" "Enrich with latest facts"
 *
 * Exit 0 always.
 */

import { execSync, execFileSync } from "node:child_process";
import { JOURNAL_DIR } from "./config.js";

const VALID_OPS = ["delete", "merge", "split", "create", "reclassify", "actualize"];

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error("Usage: run-operation.js <op-type> <target> <details>");
  console.error(`Op types: ${VALID_OPS.join(", ")}`);
  process.exit(0);
}

const opType = args[0];
const target = args[1];
const details = args[2];

if (!VALID_OPS.includes(opType)) {
  console.error(`ERROR: Unknown operation type: ${opType}`);
  console.error(`Valid types: ${VALID_OPS.join(", ")}`);
  process.exit(0);
}

console.log(`\u2192 Operation: ${opType}`);
console.log(`  Target: ${target}`);
console.log(`  Details: ${details}`);

// ---------------------------------------------------------------------------
// Snapshot sessions
// ---------------------------------------------------------------------------

let beforeSessions = [];
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

const prompts = {
  delete: `${COMMON_PREAMBLE}

Execute a **delete** operation (Workflow D from the resources skill).

Target article: \`${target}\`
Reason: ${details}

Follow the Workflow D Delete procedure exactly:
1. Read the article to confirm deletion.
2. Run \`node scripts/find-backlinks.js ${target}\` to find all inbound links.
3. Remove or redirect every inbound link.
4. Delete the file.
5. Commit: \`Resources: delete ${target} — ${details}\``,

  merge: `${COMMON_PREAMBLE}

Execute a **merge** operation (Workflow D from the resources skill).

Target: \`${target}\`
Rationale: ${details}

The format is: \`surviving-article ← absorbed-article\`. The surviving article
absorbs content from the absorbed one.

Follow the Workflow D Merge procedure exactly — all mandatory steps. Do not just
    concatenate. Restructure sections to flow naturally. Run
    \`node scripts/find-backlinks.js <absorbed-article>\` to find ALL inbound links
    and redirect them to the survivor.`,

  split: `${COMMON_PREAMBLE}

Execute a **split** operation (Workflow D from the resources skill).

Target: \`${target}\`
Details: ${details}

The format is: \`source → new1 + new2\`. Extract the listed concepts into
separate articles.

Follow the Workflow D Split procedure exactly — all mandatory steps. Each new
    article must be real content, not a stub. Add bidirectional cross-references.
    Run \`node scripts/find-backlinks.js <source>\` to find links referencing
    the extracted content and update them as appropriate.`,

  create: `${COMMON_PREAMBLE}

Execute a **create** operation (Workflow D from the resources skill).

Target path: \`${target}\`
Details: ${details}

Follow the Workflow D Create procedure exactly — all mandatory steps. Search
    Confluence, Jira, codebase, and existing resource articles for facts about
    this concept. Write a real article with Overview and substantive sections.
    No stubs. Add bidirectional cross-references. After creation, run
    \`node scripts/health-orphans.js\` to verify the new article has inbound links.`,

  reclassify: `${COMMON_PREAMBLE}

Execute a **reclassify** (move/rename) operation (Workflow D from the resources skill).

Target: \`${target}\`
Rationale: ${details}

The format is: \`old-path → new-path\`.

Follow the Workflow D Reclassify procedure exactly — all mandatory steps. Run
    \`node scripts/find-backlinks.js <old-path>\` to find ALL inbound links
    to the old path and update them to the new path.`,

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
    timeout: 900_000,
  });
} catch (err) {
  if (err.signal === "SIGTERM") {
    console.error("ERROR: opencode run timed out after 15 minutes");
  } else {
    console.error(`ERROR: opencode run failed (exit ${err.status})`);
  }
  process.exit(0);
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
