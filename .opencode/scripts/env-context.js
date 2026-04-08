#!/usr/bin/env node
/**
 * env-context.js — probe installed CLI tools and write a snapshot to env-snapshot.md.
 *
 * Detects: node, npm, confluence, jira, gh, glab, qmd, ctx7, repomix (all globally installed).
 * Writes/replaces env-snapshot.md at repo root (gitignored — machine-specific data).
 * Does NOT modify context.md — that file is a committed template.
 *
 * Usage:
 *   node scripts/env-context.js
 *
 * Exit 0 always.
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPTS_DIR, "../..");
const SNAPSHOT_FILE = resolve(REPO_ROOT, "context/env-snapshot.md");

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["pipe", "pipe", "pipe"], timeout: 5000 })
      .toString()
      .trim()
      .split("\n")[0];
  } catch {
    return null;
  }
}

/** Extract the first semver-like token (vX.Y.Z or X.Y.Z) from a raw version string. */
function extractVersion(raw) {
  if (!raw) return null;
  const match = raw.match(/v?\d+\.\d+\.\d+/);
  return match ? match[0] : raw;
}

function checkTool(name, whichName, versionCmd) {
  const path = run(`which ${whichName}`);
  if (!path) return { name, installed: false, version: null, path: null };
  const raw = run(versionCmd);
  const version = raw ? extractVersion(raw) ?? raw : "unknown";
  return { name, installed: true, version, path };
}

const today = new Date().toISOString().slice(0, 10);

const tools = [
  checkTool("node", "node", "node --version"),
  checkTool("npm", "npm", "npm --version"),
  checkTool("confluence", "confluence", "confluence --version"),
  checkTool("jira", "jira", "jira version"),
  checkTool("gh", "gh", "gh --version"),
  checkTool("glab", "glab", "glab --version"),
  checkTool("qmd", "qmd", "qmd --version"),
  checkTool("ctx7", "ctx7", "ctx7 --version"),
  checkTool("repomix", "repomix", "repomix --version"),
];

// Build the snapshot file
const rows = tools.map(({ name, installed, version, path }) => {
  const status = installed ? "yes" : "no";
  const ver = version ?? "—";
  const loc = path ?? "—";
  return `| \`${name}\` | ${status} | ${ver} | ${loc} |`;
});

const content = [
  "---",
  "type: meta",
  `updated: ${today}`,
  "tags: []",
  "---",
  "",
  "# CLI Environment Snapshot",
  "",
  `_Last probed: ${today} via \`node scripts/env-context.js\`_`,
  "",
  "| Tool | Installed | Version | Path |",
  "|------|-----------|---------|------|",
  ...rows,
  "",
].join("\n");

writeFileSync(SNAPSHOT_FILE, content, "utf-8");

// Summary report to stdout
console.log(`Written ${SNAPSHOT_FILE}`);
console.log();
for (const { name, installed, version } of tools) {
  const mark = installed ? "+" : "-";
  const ver = version ? ` (${version})` : "";
  console.log(`  ${mark} ${name}${ver}`);
}
