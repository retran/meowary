#!/usr/bin/env node
/**
 * health-all.js
 *
 * Run all health scripts in sequence and emit a unified grouped report
 * with issue counts per check type.
 *
 * Usage:
 *   node .opencode/scripts/health-all.js
 *
 * Exit 0 always.
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = resolve(fileURLToPath(import.meta.url), "..");

const CHECKS = [
  { name: "frontmatter",  script: "health-frontmatter.js",  label: "Front Matter" },
  { name: "orphans",      script: "health-orphans.js",       label: "Orphaned Articles" },
  { name: "tags",         script: "health-tags.js",          label: "Tag Registry" },
  { name: "stale",        script: "health-stale.js",         label: "Stale Articles" },
  { name: "lengths",      script: "health-lengths.js",       label: "Article Lengths" },
  { name: "links",        script: "health-links.js",         label: "Link Health" },
  { name: "projects",     script: "health-projects.js",      label: "Project Health" },
  { name: "sections",     script: "health-sections.js",      label: "Empty Sections" },
];

const SEP = "=".repeat(70);
const results = [];

for (const check of CHECKS) {
  const scriptPath = resolve(SCRIPTS_DIR, check.script);
  let output = "";
  try {
    output = execFileSync(process.execPath, [scriptPath], {
      encoding: "utf-8",
      timeout: 120_000,
    });
  } catch (err) {
    output = err.stdout || "";
    if (err.stderr) output += `\nSTDERR: ${err.stderr}`;
  }

  // Count issues: lines starting with "- [ ]"
  const issueLines = output.split("\n").filter((l) => l.startsWith("- [ ]"));
  results.push({ ...check, output: output.trim(), issues: issueLines.length });
}

// Print report
console.log(SEP);
console.log("HEALTH REPORT");
console.log(SEP);
console.log();

let totalIssues = 0;

for (const { label, output, issues } of results) {
  console.log(`--- ${label} (${issues} issue${issues === 1 ? "" : "s"}) ---`);
  if (output) console.log(output);
  console.log();
  totalIssues += issues;
}

console.log(SEP);
console.log(`TOTAL ISSUES: ${totalIssues}`);
console.log(SEP);
