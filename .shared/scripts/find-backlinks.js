#!/usr/bin/env node
/**
 * find-backlinks.js
 *
 * Find all .md files in the repo that link to a given file.
 *
 * Usage:
 *   node .opencode/scripts/find-backlinks.js <file>
 *
 * Output: one absolute file path per line for each file that links to <file>.
 *
 * Used by Workflow D structural operations as the replacement for inline
 * `rg "<old-path>"` — run before deleting, merging, or reclassifying a file
 * to find all inbound links that need updating.
 *
 * Exit 0 always (issues reported, not thrown).
 */

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { findBacklinks } from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node .opencode/scripts/find-backlinks.js <file>");
  process.exit(0);
}

const targetArg = args[0];
const targetAbs = resolve(REPO_ROOT, targetArg);

if (!existsSync(targetAbs)) {
  console.error(`Warning: file not found: ${targetAbs}`);
  // Still search — the file may have been deleted but links not yet updated
}

try {
  const backlinks = findBacklinks(targetAbs, REPO_ROOT);
  for (const f of backlinks) {
    console.log(f);
  }
} catch (err) {
  console.error(`Error scanning for backlinks: ${err.message}`);
}
