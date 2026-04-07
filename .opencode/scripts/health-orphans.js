#!/usr/bin/env node
/**
 * health-orphans.js
 *
 * For each .md file in resources/ (excluding resources/people/): count inbound
 * links from the rest of the repo. Report files with 0 inbound links.
 *
 * Output format:
 *   - [ ] resources/domain/article.md — 0 inbound links
 *
 * Exit 0 always.
 */

import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles, findBacklinks } from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");

const resourceFiles = findMdFiles(RESOURCES_ROOT).filter((f) => {
  const rel = relative(RESOURCES_ROOT, f);
  return !rel.startsWith("people/");
});

let orphanCount = 0;

for (const f of resourceFiles) {
  const backlinks = findBacklinks(f, REPO_ROOT);
  if (backlinks.length === 0) {
    const rel = relative(REPO_ROOT, f);
    console.log(`- [ ] ${rel} — 0 inbound links`);
    orphanCount++;
  }
}

if (orphanCount === 0) {
  console.log("health-orphans: no orphaned articles");
} else {
  console.log(`\nhealth-orphans: ${orphanCount} orphaned article(s)`);
}
