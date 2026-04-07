#!/usr/bin/env node
/**
 * report-resources.js
 *
 * For each resources/ article: emit a table row with:
 *   path, line count, tag count, actualized date, inbound link count, outbound link count
 *
 * Usage:
 *   node scripts/report-resources.js [--sort actualized|lines|inlinks]
 *   Default sort: actualized (oldest first)
 *
 * Exit 0 always.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getFrontmatterField, stripFrontmatter } from "./lib/frontmatter.js";
import { findMdFiles, extractLinks, resolveLink, findBacklinks } from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");

// Parse --sort flag
const args = process.argv.slice(2);
let sortBy = "actualized";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sort" && args[i + 1]) {
    sortBy = args[i + 1];
    i++;
  }
}

const VALID_SORTS = ["actualized", "lines", "inlinks"];
if (!VALID_SORTS.includes(sortBy)) {
  console.error(`ERROR: --sort must be one of: ${VALID_SORTS.join(", ")}`);
  process.exit(0);
}

const resourceFiles = findMdFiles(RESOURCES_ROOT);

// Gather data
const rows = [];
for (const f of resourceFiles) {
  const content = readFileSync(f, "utf-8");
  const body = stripFrontmatter(content);
  const lineCount = body.split("\n").filter((l) => l.trim()).length;

  const tags = getFrontmatterField(content, "tags");
  const tagCount = Array.isArray(tags) ? tags.length : 0;

  const actualized = getFrontmatterField(content, "actualized");
  const updated = getFrontmatterField(content, "updated");
  const dateStr = (actualized || updated || "—").toString();

  const outLinks = extractLinks(content);
  const outCount = outLinks.length;

  const inLinks = findBacklinks(f, REPO_ROOT);
  const inCount = inLinks.length;

  rows.push({
    path: relative(REPO_ROOT, f),
    lines: lineCount,
    tags: tagCount,
    date: dateStr,
    inlinks: inCount,
    outlinks: outCount,
    dateMs: dateStr !== "—" ? new Date(dateStr).getTime() : Infinity,
  });
}

// Sort
rows.sort((a, b) => {
  if (sortBy === "actualized") return a.dateMs - b.dateMs;
  if (sortBy === "lines") return b.lines - a.lines;
  if (sortBy === "inlinks") return b.inlinks - a.inlinks;
  return 0;
});

// Print table
const COL_PATH = 50;
const header =
  `${"Path".padEnd(COL_PATH)} ${"Lines".padStart(6)} ${"Tags".padStart(5)} ${"Actualized".padEnd(12)} ${"InLinks".padStart(8)} ${"OutLinks".padStart(9)}`;
const sep = "-".repeat(header.length);

console.log(header);
console.log(sep);

for (const r of rows) {
  const pathCell = r.path.length > COL_PATH ? "…" + r.path.slice(-(COL_PATH - 1)) : r.path.padEnd(COL_PATH);
  console.log(
    `${pathCell} ${String(r.lines).padStart(6)} ${String(r.tags).padStart(5)} ${r.date.padEnd(12)} ${String(r.inlinks).padStart(8)} ${String(r.outlinks).padStart(9)}`
  );
}

console.log(sep);
console.log(`Total: ${rows.length} articles`);
