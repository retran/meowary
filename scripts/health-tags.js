#!/usr/bin/env node
/**
 * health-tags.js
 *
 * Two checks:
 * (a) Collect all `tags:` front matter values across repo; compare to tags.md;
 *     report used-but-unregistered tags.
 * (b) Report tags in tags.md that are not used in any file.
 *
 * Exit 0 always.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMdFiles } from "./lib/links.js";
import { getFrontmatterField } from "./lib/frontmatter.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const TAGS_FILE = resolve(REPO_ROOT, "tags.md");

// Collect all used tags across repo
const allFiles = findMdFiles(REPO_ROOT).filter((f) => {
  const rel = relative(REPO_ROOT, f);
  return !rel.startsWith("scripts/node_modules/") && !rel.startsWith(".git/");
});

const usedTags = new Set();
for (const f of allFiles) {
  const content = readFileSync(f, "utf-8");
  const tags = getFrontmatterField(content, "tags");
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (t && typeof t === "string") usedTags.add(t.toLowerCase().trim());
    }
  }
}

// Read registered tags from tags.md
const registeredTags = new Set();
if (existsSync(TAGS_FILE)) {
  const tagsContent = readFileSync(TAGS_FILE, "utf-8");
  // Extract tags — look for lines like `- tag-name` or `**tag-name**` or bare words
  for (const line of tagsContent.split("\n")) {
    const m = line.match(/[`*-]\s*([a-z][a-z0-9-]*)/i);
    if (m) registeredTags.add(m[1].toLowerCase().trim());
  }
} else {
  console.log("health-tags: tags.md not found — skipping registered-tags checks");
}

// (a) Used but not registered
const unregistered = [...usedTags].filter((t) => !registeredTags.has(t)).sort();
if (unregistered.length > 0) {
  console.log("=== USED BUT NOT REGISTERED IN tags.md ===");
  for (const t of unregistered) console.log(`- [ ] ${t}`);
  console.log();
} else {
  console.log("health-tags (a): all used tags are registered");
}

// (b) Registered but not used
const unused = [...registeredTags].filter((t) => !usedTags.has(t)).sort();
if (unused.length > 0) {
  console.log("=== REGISTERED IN tags.md BUT NOT USED ===");
  for (const t of unused) console.log(`- [ ] ${t}`);
  console.log();
} else {
  console.log("health-tags (b): all registered tags are in use");
}

const totalIssues = unregistered.length + unused.length;
if (totalIssues > 0) {
  console.log(`health-tags: ${totalIssues} tag issue(s)`);
}
