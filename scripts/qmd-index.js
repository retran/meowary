#!/usr/bin/env node
/**
 * qmd-index.js
 *
 * Update the qmd semantic search index.
 *
 * Usage:
 *   node scripts/qmd-index.js              # incremental: re-index changed files,
 *                                          #   embed new chunks only
 *   node scripts/qmd-index.js --changed    # git-aware: exit early if no indexed
 *                                          #   .md files changed; otherwise update
 *   node scripts/qmd-index.js --full       # force re-embed all chunks
 *
 * `qmd update` is incremental by design — it hashes file content and skips
 * unchanged documents. `qmd embed` only processes chunks not yet embedded.
 * Use --full only when switching embedding models or recovering a corrupt index.
 *
 * Requires: qmd CLI (npm install -g @tobilu/qmd or https://github.com/tobi/qmd)
 * Node >= 22 required for qmd.
 *
 * Exit 0 always (exits with message if qmd not installed).
 */

import { execFileSync, execSync } from "node:child_process";
import { JOURNAL_DIR } from "./config.js";

// Check if qmd is installed
try {
  execSync("qmd --version", { encoding: "utf-8", stdio: "pipe" });
} catch {
  console.log("qmd is not installed or not in PATH.");
  console.log("Install: npm install -g @tobilu/qmd");
  console.log("Requires Node >= 22. First run downloads ~2GB model.");
  process.exit(0);
}

// Parse flags
const args = process.argv.slice(2);
const full = args.includes("--full");
const changedOnly = args.includes("--changed");

// Must match collections in qmd.yml
const COLLECTION_PREFIXES = {
  resources: "resources/",
  journal:   "journal/",
  inbox:     "inbox/",
  projects:  "projects/",
  areas:     "areas/",
  drafts:    "drafts/",
  archive:   "archive/",
};

// ---------------------------------------------------------------------------
// --changed: exit early if no indexed .md files have changed
// ---------------------------------------------------------------------------
if (changedOnly) {
  try {
    const modified = execSync(
      "git diff --name-only HEAD",
      { encoding: "utf-8", cwd: JOURNAL_DIR, stdio: "pipe" }
    ).trim();
    const untracked = execSync(
      "git ls-files --others --exclude-standard",
      { encoding: "utf-8", cwd: JOURNAL_DIR, stdio: "pipe" }
    ).trim();

    const changedFiles = [...modified.split("\n"), ...untracked.split("\n")]
      .map((f) => f.trim())
      .filter((f) => f.endsWith(".md"));

    const affected = new Set();
    for (const f of changedFiles) {
      for (const [name, prefix] of Object.entries(COLLECTION_PREFIXES)) {
        if (f.startsWith(prefix)) { affected.add(name); break; }
      }
    }

    if (affected.size === 0) {
      console.log("No changed markdown files in indexed collections. Nothing to reindex.");
      process.exit(0);
    }

    console.log(`Changed files: ${changedFiles.length} — affected collections: ${[...affected].join(", ")}`);
  } catch (err) {
    console.error(`WARNING: git query failed (${err.message}). Proceeding with full update.`);
  }
}

// ---------------------------------------------------------------------------
// qmd update — incremental: re-indexes only changed/new files
// ---------------------------------------------------------------------------
try {
  console.log("Running: qmd update...");
  execFileSync("qmd", ["update"], {
    cwd: JOURNAL_DIR,
    stdio: "inherit",
    timeout: 300_000,
  });
} catch (err) {
  console.error(`qmd update failed: ${err.message}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// qmd embed — generates embeddings for new/changed chunks
// ---------------------------------------------------------------------------
try {
  const embedArgs = ["embed"];
  if (full) embedArgs.push("-f");
  console.log(`Running: qmd ${embedArgs.join(" ")}...`);
  execFileSync("qmd", embedArgs, {
    cwd: JOURNAL_DIR,
    stdio: "inherit",
    timeout: 300_000,
  });
  console.log("qmd index complete.");
} catch (err) {
  console.error(`qmd embed failed: ${err.message}`);
}
