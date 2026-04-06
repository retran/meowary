#!/usr/bin/env node
/**
 * health-lengths.js
 *
 * For each resources/ article: count non-front-matter lines.
 * Report articles over the threshold with their line count.
 *
 * Usage:
 *   node scripts/health-lengths.js [--lines N]
 *   Default: 80 lines
 *
 * Output format:
 *   - [ ] resources/domain/article.md — 143 lines
 *
 * Exit 0 always.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { stripFrontmatter } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");

// Parse --lines flag
const args = process.argv.slice(2);
let maxLines = 80;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--lines" && args[i + 1]) {
    const n = parseInt(args[i + 1], 10);
    if (!isNaN(n) && n > 0) maxLines = n;
    i++;
  }
}

const resourceFiles = findMdFiles(RESOURCES_ROOT);
let longCount = 0;

for (const f of resourceFiles) {
  const content = readFileSync(f, "utf-8");
  const body = stripFrontmatter(content);
  const lineCount = body.split("\n").filter((l) => l.trim()).length;

  if (lineCount > maxLines) {
    const rel = relative(REPO_ROOT, f);
    console.log(`- [ ] ${rel} — ${lineCount} lines`);
    longCount++;
  }
}

if (longCount === 0) {
  console.log(`health-lengths: no articles over ${maxLines} lines`);
} else {
  console.log(`\nhealth-lengths: ${longCount} article(s) over ${maxLines} lines`);
}
