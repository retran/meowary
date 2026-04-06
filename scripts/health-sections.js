#!/usr/bin/env node
/**
 * health-sections.js
 *
 * Scan daily notes, project dashboards, and area dashboards.
 * Flag standard sections that have no content below them
 * (only blank lines or the next section header follows).
 *
 * Daily notes (type: daily) are checked for: Morning, Day, Evening
 * Other files are checked for: Log, Tasks, Notes, Dev Log
 *
 * Output format:
 *   - [ ] journal/daily/2026-01-01.md — empty section: ## Morning
 *
 * Exit 0 always.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");

const DAILY_SECTIONS = new Set(["Morning", "Day", "Evening"]);
const STANDARD_SECTIONS = new Set(["Log", "Tasks", "Notes", "Dev Log"]);

// Directories to scan
const scanDirs = [
  resolve(REPO_ROOT, "journal/daily"),
  resolve(REPO_ROOT, "journal/weekly"),
  resolve(REPO_ROOT, "projects"),
  resolve(REPO_ROOT, "areas"),
].filter(existsSync);

/**
 * Parse the `type` field from YAML front matter.
 * Returns the type string (e.g. "daily") or null if not found.
 */
function parseFrontMatterType(content) {
  // Find the closing --- of front matter (must start at line 0)
  if (!content.startsWith("---")) return null;
  const fmEnd = content.indexOf("\n---", 3);
  if (fmEnd === -1) return null;
  const fm = content.slice(0, fmEnd);
  const m = fm.match(/^type:\s*(\S+)/m);
  return m ? m[1] : null;
}

let issueCount = 0;

for (const dir of scanDirs) {
  const files = findMdFiles(dir);
  for (const f of files) {
    const content = readFileSync(f, "utf-8");
    const lines = content.split("\n");
    const rel = relative(REPO_ROOT, f);

    const fileType = parseFrontMatterType(content);
    const sectionsToCheck = fileType === "daily" ? DAILY_SECTIONS : STANDARD_SECTIONS;

    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^##\s+(.+)$/);
      if (!m) continue;

      const sectionName = m[1].trim();
      if (!sectionsToCheck.has(sectionName)) continue;

      // Look ahead: collect lines until next ## or end of file
      let hasContent = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (/^##\s+/.test(lines[j])) break;
        if (lines[j].trim()) { hasContent = true; break; }
      }

      if (!hasContent) {
        console.log(`- [ ] ${rel} — empty section: ## ${sectionName}`);
        issueCount++;
      }
    }
  }
}

if (issueCount === 0) {
  console.log("health-sections: no empty standard sections found");
} else {
  console.log(`\nhealth-sections: ${issueCount} empty section(s)`);
}
