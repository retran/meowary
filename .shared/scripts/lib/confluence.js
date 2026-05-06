/**
 * lib/confluence.js — frontmatter-based Confluence ID utilities.
 *
 * Reads `confluence: [...]` from every .md file in the repo and aggregates
 * all declared page IDs. This replaces the old approach of parsing a
 * central confluence-map.md file.
 *
 * Exports:
 *   loadConfluenceIds(repoRoot) — walk repo, collect IDs → { ids, inMap }
 *
 * Skips: .git/, node_modules/, .opencode/
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";

const SKIP_DIRS = new Set([".git", "node_modules", ".opencode"]);

/**
 * Walk all .md files under dir, skipping SKIP_DIRS.
 * Returns an array of absolute paths.
 */
function walkMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      results.push(...walkMdFiles(resolve(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(resolve(dir, entry.name));
    }
  }
  return results;
}

/**
 * Walk all .md files under repoRoot, read `confluence: [...]` from front matter,
 * and return a deduplicated list of page IDs plus a Set for O(1) lookup.
 *
 * @param {string} repoRoot — absolute path to the journal repo root
 * @returns {{ ids: string[], inMap: Set<string> }}
 */
export function loadConfluenceIds(repoRoot) {
  const seen = new Set();
  for (const file of walkMdFiles(repoRoot)) {
    let content;
    try {
      content = readFileSync(file, "utf-8");
    } catch {
      continue;
    }
    const fm = parseFrontmatter(content);
    const field = fm.confluence;
    if (!Array.isArray(field)) continue;
    for (const id of field) {
      if (typeof id === "string" && id.length > 0) seen.add(id);
    }
  }
  const ids = [...seen];
  return { ids, inMap: seen };
}
