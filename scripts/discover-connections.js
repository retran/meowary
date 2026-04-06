#!/usr/bin/env node
/**
 * discover-connections.js
 *
 * For each pair of resource articles: score their connection strength from:
 *   shared tags      +1 per shared tag
 *   shared sources   +2 per shared source
 *   entity co-occurrence (same person/team/project mention in body)  +1
 *   structural proximity (same subfolder)  +1
 *
 * Output only pairs with score >= 1.
 *
 * Usage:
 *   node scripts/discover-connections.js [--scope <path>] [--limit N]
 *   Default scope: resources/
 *
 * Exit 0 always.
 */

import { readFileSync } from "node:fs";
import { resolve, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { getFrontmatterField } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// Parse flags
const args = process.argv.slice(2);
let scope = resolve(REPO_ROOT, "resources");
let limit = Infinity;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scope" && args[i + 1]) {
    scope = resolve(REPO_ROOT, args[i + 1]);
    i++;
  } else if (args[i] === "--limit" && args[i + 1]) {
    const n = parseInt(args[i + 1], 10);
    if (!isNaN(n) && n > 0) limit = n;
    i++;
  }
}

const files = findMdFiles(scope);

// Gather per-file data
const fileData = files.map((f) => {
  const content = readFileSync(f, "utf-8");
  const rel = relative(REPO_ROOT, f);

  const tags = getFrontmatterField(content, "tags");
  const tagSet = new Set(Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : []);

  const sources = getFrontmatterField(content, "sources");
  const sourceSet = new Set(Array.isArray(sources) ? sources.map((s) => s.toLowerCase()) : []);

  const body = content.toLowerCase();

  return { f, rel, tags: tagSet, sources: sourceSet, body, dir: dirname(rel) };
});

// Score all pairs
const pairs = [];
for (let i = 0; i < fileData.length; i++) {
  for (let j = i + 1; j < fileData.length; j++) {
    const a = fileData[i];
    const b = fileData[j];

    let score = 0;

    // Shared tags
    for (const t of a.tags) {
      if (b.tags.has(t)) score += 1;
    }

    // Shared sources
    for (const s of a.sources) {
      if (b.sources.has(s)) score += 2;
    }

    // Entity co-occurrence: does b's basename appear in a's body or vice versa?
    // Note: generic filenames (e.g. "api.md", "process.md") produce false-positive
    // scores. Output is for LLM consumption; noisy matches are acceptable.
    const aName = basename(a.f, ".md");
    const bName = basename(b.f, ".md");
    if (b.body.includes(aName) || a.body.includes(bName)) score += 1;

    // Structural proximity: same subfolder
    if (a.dir === b.dir) score += 1;

    if (score >= 1) {
      pairs.push({ a: a.rel, b: b.rel, score });
    }
  }
}

// Sort by score descending
pairs.sort((x, y) => y.score - x.score);
const output = limit !== Infinity ? pairs.slice(0, limit) : pairs;

// Print table
const COL_A = 45;
const COL_B = 45;
console.log(
  `${"Article A".padEnd(COL_A)} ${"Article B".padEnd(COL_B)} ${"Score".padStart(6)}`
);
console.log("-".repeat(COL_A + COL_B + 8));

for (const { a, b, score } of output) {
  const aCell = a.length > COL_A ? "…" + a.slice(-(COL_A - 1)) : a.padEnd(COL_A);
  const bCell = b.length > COL_B ? "…" + b.slice(-(COL_B - 1)) : b.padEnd(COL_B);
  console.log(`${aCell} ${bCell} ${String(score).padStart(6)}`);
}

console.log(`\nTotal pairs: ${output.length} (of ${pairs.length} scored >= 1)`);
