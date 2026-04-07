#!/usr/bin/env node
/**
 * health-links.js
 *
 * Audit all resource article links for:
 * 1. Broken links (target file doesn't exist)
 * 2. Missing back-links (A links to B in Related section, but B doesn't link back to A)
 *
 * Usage:
 *   node scripts/health-links.js [--scope resources|journal|all]
 *
 * Scope defaults to "resources".
 *
 * Exit 0 always (issues reported, not thrown).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findMdFiles,
  extractLinks,
  findRelatedSectionText,
  resolveLink,
} from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let scope = "resources";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scope" && args[i + 1]) {
    scope = args[i + 1];
    i++;
  }
}

const VALID_SCOPES = ["resources", "journal", "all"];
if (!VALID_SCOPES.includes(scope)) {
  console.error(`ERROR: --scope must be one of: ${VALID_SCOPES.join(", ")}`);
  process.exit(0);
}

const scanDirs =
  scope === "all"
    ? [resolve(REPO_ROOT, "resources"), resolve(REPO_ROOT, "journal")]
    : scope === "journal"
    ? [resolve(REPO_ROOT, "journal")]
    : [resolve(REPO_ROOT, "resources")];

const KB_ROOT = resolve(REPO_ROOT, "resources");

// ---------------------------------------------------------------------------
// Collect files
// ---------------------------------------------------------------------------

let scanFiles = [];
for (const dir of scanDirs) {
  if (existsSync(dir)) scanFiles = scanFiles.concat(findMdFiles(dir));
}

console.log(`Scope: ${scope}`);
console.log(`Found ${scanFiles.length} files\n`);

// Phase 1: Parse all files
const relatedLinks = new Map(); // file -> [{display, target}]
const allLinks = new Map();     // file -> [{display, resolved, raw}]
const scanFileSet = new Set(scanFiles);

for (const f of scanFiles) {
  const content = readFileSync(f, "utf-8");

  const fileLinks = extractLinks(content);
  allLinks.set(
    f,
    fileLinks.map((l) => ({
      display: l.display,
      resolved: resolveLink(f, l.path),
      raw: l.path,
    }))
  );

  const relatedText = findRelatedSectionText(content);
  if (relatedText) {
    const relLinks = extractLinks(relatedText);
    relatedLinks.set(
      f,
      relLinks.map((l) => ({
        display: l.display,
        target: resolveLink(f, l.path),
      }))
    );
  }
}

// Phase 2: Broken links
console.log("=".repeat(70));
console.log("BROKEN LINKS (target file doesn't exist)");
console.log("=".repeat(70));
let brokenCount = 0;
for (const [source, links] of [...allLinks.entries()].sort()) {
  for (const { display, resolved, raw } of links) {
    if (!existsSync(resolved)) {
      const relSource = relative(REPO_ROOT, source);
      console.log(`- [ ] ${relSource}: [${display}](${raw}) -> NOT FOUND`);
      brokenCount++;
    }
  }
}
if (brokenCount === 0) console.log("  None found!");
console.log(`\nTotal broken links: ${brokenCount}\n`);

// Phase 3: Missing back-links (resources scope only — journal notes don't require back-links)
if (scope !== "journal") {
  console.log("=".repeat(70));
  console.log("MISSING BACK-LINKS (A links to B in Related, B doesn't link back)");
  console.log("=".repeat(70));

  const edges = new Set();
  const edgePairs = [];

  for (const [source, links] of relatedLinks) {
    for (const { target } of links) {
      if (existsSync(target) && scanFileSet.has(target)) {
        const key = `${source}\0${target}`;
        if (!edges.has(key)) {
          edges.add(key);
          edgePairs.push([source, target]);
        }
      }
    }
  }

  let missingCount = 0;
  const missingByTarget = new Map();

  for (const [source, target] of edgePairs.sort()) {
    const reverseKey = `${target}\0${source}`;
    if (!edges.has(reverseKey)) {
      const relSource = relative(KB_ROOT, source);
      if (relSource.startsWith("people/")) continue;
      const relTarget = relative(KB_ROOT, target);
      console.log(
        `- [ ] ${relSource} -> ${relTarget}  (missing back-link in ${relTarget})`
      );
      missingCount++;
      if (!missingByTarget.has(target)) missingByTarget.set(target, []);
      missingByTarget.get(target).push(source);
    }
  }

  if (missingCount === 0) console.log("  None found!");
  console.log(`\nTotal missing back-links: ${missingCount}\n`);

  if (missingByTarget.size > 0) {
    console.log("=".repeat(70));
    console.log("TARGETS NEEDING MOST BACK-LINKS");
    console.log("=".repeat(70));
    const sorted = [...missingByTarget.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [target, sources] of sorted) {
      const relTarget = relative(KB_ROOT, target);
      console.log(`  ${relTarget} (${sources.length} missing):`);
      for (const s of sources.sort()) {
        console.log(`    <- ${relative(KB_ROOT, s)}`);
      }
    }
    console.log();
  }
}
