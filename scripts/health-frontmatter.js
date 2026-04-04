#!/usr/bin/env node
/**
 * health-frontmatter.js
 *
 * Scan all .md files (except AGENTS.md) and report those missing required
 * front matter fields: `updated` and `tags`.
 *
 * Output format:
 *   - [ ] path/to/file.md — missing: updated, tags
 *
 * Exit 0 always.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { hasFrontmatter, getFrontmatterField } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const EXCLUDE = new Set(["AGENTS.md"]);

const allFiles = findMdFiles(REPO_ROOT).filter((f) => {
  const rel = relative(REPO_ROOT, f);
  // Exclude node_modules and .opencode internals
  if (rel.startsWith("scripts/node_modules/")) return false;
  if (rel.startsWith(".git/")) return false;
  return !EXCLUDE.has(rel);
});

const REQUIRED_FIELDS = ["updated", "tags"];

let issueCount = 0;

for (const f of allFiles) {
  const content = readFileSync(f, "utf-8");
  if (!hasFrontmatter(content)) {
    const rel = relative(REPO_ROOT, f);
    console.log(`- [ ] ${rel} — missing: front matter block entirely`);
    issueCount++;
    continue;
  }

  const missing = REQUIRED_FIELDS.filter((field) => {
    const val = getFrontmatterField(content, field);
    return val === undefined || val === null || val === "";
  });

  if (missing.length > 0) {
    const rel = relative(REPO_ROOT, f);
    console.log(`- [ ] ${rel} — missing: ${missing.join(", ")}`);
    issueCount++;
  }
}

if (issueCount === 0) {
  console.log("health-frontmatter: all files OK");
} else {
  console.log(`\nhealth-frontmatter: ${issueCount} file(s) with missing fields`);
}
