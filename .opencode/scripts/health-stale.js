#!/usr/bin/env node
/**
 * health-stale.js
 *
 * For each resources/ article: read `actualized` field (fall back to `updated`).
 * Report articles older than the threshold with age in days.
 *
 * Usage:
 *   node .opencode/scripts/health-stale.js [--days N]
 *   Default: 90 days
 *
 * Output format:
 *   - [ ] resources/domain/article.md — 120 days (actualized: 2025-09-01)
 *
 * Exit 0 always.
 */

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { getFrontmatterField } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");

// Parse --days flag
const args = process.argv.slice(2);
let days = 90;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--days" && args[i + 1]) {
    const n = parseInt(args[i + 1], 10);
    if (!isNaN(n) && n > 0) days = n;
    i++;
  }
}

const now = Date.now();
const thresholdMs = days * 24 * 60 * 60 * 1000;

const resourceFiles = findMdFiles(RESOURCES_ROOT);
let staleCount = 0;

for (const f of resourceFiles) {
  const content = readFileSync(f, "utf-8");
  const actualized = getFrontmatterField(content, "actualized");
  const updated = getFrontmatterField(content, "updated");
  const dateStr = (actualized || updated || "").toString();

  if (!dateStr) continue;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) continue;

  const age = Math.floor((now - date.getTime()) / (24 * 60 * 60 * 1000));
  if (age > days) {
    const rel = relative(REPO_ROOT, f);
    const label = actualized ? `actualized: ${dateStr}` : `updated: ${dateStr}`;
    console.log(`- [ ] ${rel} — ${age} days (${label})`);
    staleCount++;
  }
}

if (staleCount === 0) {
  console.log(`health-stale: no articles older than ${days} days`);
} else {
  console.log(`\nhealth-stale: ${staleCount} stale article(s) (threshold: ${days} days)`);
}
