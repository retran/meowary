#!/usr/bin/env node
/**
 * migrate-daily-notes.js
 *
 * Migrate daily notes from the old five-section format to the new
 * three-zone format (Morning / Day / Evening).
 *
 * Old format:
 *   ## Tasks
 *   ## Events & Meetings
 *   ## Blockers & Time Off
 *   ## Log & Notes
 *   ## Day Summary
 *
 * New format:
 *   ## Morning
 *     Focus: ...
 *     ★ MIT 1: ...
 *     Calendar: ...
 *   ## Day
 *     ### Inbox
 *     ### Events
 *     ### Waiting
 *   ## Evening
 *     ### Completed
 *     ### Carried / Dropped
 *     ### Insights → Resources
 *     ### Day Summary
 *
 * Usage:
 *   node .opencode/scripts/migrate-daily-notes.js          # dry-run (default)
 *   node .opencode/scripts/migrate-daily-notes.js --write  # apply changes in place
 *
 * Behavior:
 *   - Dry-run by default — prints what would change without writing.
 *   - Idempotent — skips files already in the new format (detected by presence of ## Morning).
 *   - Never deletes content — only restructures headings.
 *   - Processes all journal/daily/*.md files.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const DAILY_DIR = resolve(REPO_ROOT, "journal/daily");
const DRY_RUN = !process.argv.includes("--write");

if (DRY_RUN) {
  console.log("migrate-daily-notes: DRY RUN (pass --write to apply changes)\n");
} else {
  console.log("migrate-daily-notes: WRITE MODE — changes will be applied in place\n");
}

if (!existsSync(DAILY_DIR)) {
  console.log("No journal/daily/ directory found. Nothing to migrate.");
  process.exit(0);
}

const files = findMdFiles(DAILY_DIR);

let skipped = 0;
let changed = 0;
let unchanged = 0;

for (const f of files) {
  const rel = relative(REPO_ROOT, f);
  const content = readFileSync(f, "utf-8");

  // Already in new format — skip
  if (/^## Morning$/m.test(content)) {
    skipped++;
    continue;
  }

  // Not a daily note (no type: daily in front matter) — skip
  if (!/^type:\s*daily/m.test(content)) {
    skipped++;
    continue;
  }

  const migrated = migrateContent(content);

  if (migrated === content) {
    unchanged++;
    continue;
  }

  changed++;

  if (DRY_RUN) {
    console.log(`[would migrate] ${rel}`);
    console.log(diffSummary(content, migrated));
    console.log();
  } else {
    writeFileSync(f, migrated, "utf-8");
    console.log(`[migrated] ${rel}`);
  }
}

console.log(`\nSummary: ${changed} to migrate, ${skipped} skipped (already new format or non-daily), ${unchanged} no changes needed`);
if (DRY_RUN && changed > 0) {
  console.log("Run with --write to apply.");
}

// ---------------------------------------------------------------------------

/**
 * Migrate a single file's content from old to new format.
 * Returns the transformed content string.
 */
function migrateContent(content) {
  // Extract front matter and body separately
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return content; // Malformed front matter — skip

  const frontMatter = `---\n${fmMatch[1]}\n---\n`;
  const body = fmMatch[2];

  // Extract H1 + navigation bar (everything up to the first ##)
  const firstSectionIdx = body.search(/^## /m);
  const header = firstSectionIdx === -1 ? body : body.slice(0, firstSectionIdx);

  // Extract each section's content
  const tasks = extractSection(body, "Tasks");
  const events = extractSection(body, "Events & Meetings");
  const blockers = extractSection(body, "Blockers & Time Off");
  const log = extractSection(body, "Log & Notes");
  const summary = extractSection(body, "Day Summary");

  // Build MIT lines from tasks content
  const mitLines = buildMITLines(tasks);

  // Build new body
  const newBody = [
    header,
    "## Morning\n",
    "Focus:\n",
    mitLines,
    "\nCalendar:",
    events ? "\n" + events.trim() : "",
    "\n\n## Day\n",
    "### Inbox\n",
    log ? "\n" + log.trim() + "\n" : "",
    blockers ? "\n" + blockers.trim() + "\n" : "",
    "\n### Events\n",
    "\n### Waiting\n",
    "\n## Evening\n",
    "### Completed\n",
    "\n### Carried / Dropped\n",
    "\n### Insights → Resources\n",
    "\n### Day Summary\n",
    summary ? "\n" + summary.trim() + "\n" : "",
  ].join("");

  return frontMatter + newBody;
}

/**
 * Extract content under a ## section heading.
 * Returns the content lines as a trimmed string, or "" if empty/missing.
 */
function extractSection(body, sectionName) {
  // Two-pass: find the section start, then collect until the next ## or end
  const startRe = new RegExp(`^## ${escapeRegex(sectionName)}[ \\t]*$`, "m");
  const startM = body.match(startRe);
  if (!startM) return "";

  const startIdx = startM.index + startM[0].length;
  const rest = body.slice(startIdx);
  const nextSection = rest.search(/^## /m);
  const sectionBody = nextSection === -1 ? rest : rest.slice(0, nextSection);
  return sectionBody.trim();
}

/**
 * Convert task checkbox lines to MIT lines.
 * Primary MIT gets ★ prefix; subsequent ones get indent.
 */
function buildMITLines(tasksContent) {
  if (!tasksContent) {
    return "★ MIT 1:\n  MIT 2:\n  MIT 3:";
  }

  const lines = tasksContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return "★ MIT 1:\n  MIT 2:\n  MIT 3:";
  }

  const mitLines = lines.map((line, i) => {
    // Strip checkbox prefix if present
    const text = line.replace(/^-\s*\[[ xX]\]\s*/, "").trim();
    if (i === 0) return `★ MIT 1: ${text}`;
    if (i <= 2) return `  MIT ${i + 1}: ${text}`;
    // More than 3 tasks: append as extra MIT with a migration note
    return `  MIT ${i + 1}: ${text} *(migrated — review and trim to 3)*`;
  });

  // Pad to 3 slots if fewer
  while (mitLines.length < 3) {
    const idx = mitLines.length + 1;
    mitLines.push(`  MIT ${idx}:`);
  }

  return mitLines.join("\n");
}

/**
 * Produce a short human-readable diff summary (sections found/mapped).
 */
function diffSummary(before, after) {
  const oldSections = [...before.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const newSections = [...after.matchAll(/^##+ (.+)$/gm)].map((m) => m[1]);
  return (
    `  Before sections: ${oldSections.join(", ")}\n` +
    `  After sections:  ${newSections.join(", ")}`
  );
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
