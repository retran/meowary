#!/usr/bin/env node
/**
 * health-projects.js
 *
 * Scan projects/<slug>/README.md and flag:
 * (a) status: Active with no dev log entry in last 30 days
 * (b) status: Active with all tasks [x] (complete but not marked Done)
 *
 * Output format:
 *   - [ ] projects/foo/README.md — Active but no dev log entry in 30 days
 *   - [ ] projects/bar/README.md — Active but all tasks complete
 *
 * Exit 0 always.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { getFrontmatterField } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const PROJECTS_ROOT = resolve(REPO_ROOT, "projects");

if (!existsSync(PROJECTS_ROOT)) {
  console.log("health-projects: no projects/ directory found");
  process.exit(0);
}

const projectReadmes = findMdFiles(PROJECTS_ROOT).filter((f) =>
  f.endsWith("/README.md")
);

const now = Date.now();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Match dev log date entries: **YYYY-MM-DD:**
const DEV_LOG_DATE_RE = /\*\*(\d{4}-\d{2}-\d{2}):\*\*/g;
// Match task checkboxes
const OPEN_TASK_RE = /^- \[ \]/m;
const DONE_TASK_RE = /^- \[x\]/im;

let issueCount = 0;

for (const f of projectReadmes) {
  const content = readFileSync(f, "utf-8");
  const status = getFrontmatterField(content, "status");
  if (!status || status.toString().toLowerCase() !== "active") continue;

  const rel = relative(REPO_ROOT, f);

  // (a) Check last dev log entry date
  const dateMatches = [...content.matchAll(DEV_LOG_DATE_RE)];
  if (dateMatches.length > 0) {
    const lastDate = dateMatches
      .map((m) => new Date(m[1]).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a)[0];

    if (lastDate && now - lastDate > THIRTY_DAYS_MS) {
      const daysAgo = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));
      console.log(`- [ ] ${rel} — Active but no dev log entry in ${daysAgo} days`);
      issueCount++;
    }
  } else {
    // No dev log entries at all
    console.log(`- [ ] ${rel} — Active with no dev log entries`);
    issueCount++;
  }

  // (b) Check if all tasks are complete
  const hasOpenTask = OPEN_TASK_RE.test(content);
  const hasDoneTask = DONE_TASK_RE.test(content);
  if (!hasOpenTask && hasDoneTask) {
    console.log(`- [ ] ${rel} — Active but all tasks complete (consider marking Done)`);
    issueCount++;
  }
}

if (issueCount === 0) {
  console.log("health-projects: all active projects look healthy");
} else {
  console.log(`\nhealth-projects: ${issueCount} issue(s)`);
}
