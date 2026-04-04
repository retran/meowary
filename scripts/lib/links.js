/**
 * lib/links.js — shared link utilities for resource link auditing and fixing.
 *
 * Exports:
 *   LINK_RE              — regex matching markdown links to .md files
 *   RELATED_HEADERS      — regex matching Related/Cross-references section headers
 *   SECTION_RE           — regex matching any H2 header
 *   findMdFiles(dir)     — recursively find all .md files under a directory
 *   extractLinks(text)   — extract [{display, path}] from markdown text (excludes http)
 *   resolveLink(from, to) — resolve a relative link path against the source file
 *   findBacklinks(file, root) — find all .md files under root that link to file
 *   findRelatedSectionText(content) — return the Related section text (or null)
 *   findRelatedSectionLines(content) — return {start, end, headerText} or null
 *   isWithinDir(filePath, dir) — check if a path is within a given directory
 */

import { resolve, dirname, relative } from "node:path";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";

/** Match markdown links: [text](path.md) or [text](path.md#anchor) */
export const LINK_RE =
  /\[((?:[^\[\]]|\[[^\]]*\])+)\]\(([^)]+\.md(?:#[^)]*)?)\)/g;

/** Section headers that contain cross-references. */
export const RELATED_HEADERS =
  /^##\s+(Related|Related Docs|Cross-references)\s*$/i;

/** Any H2 section header. */
export const SECTION_RE = /^##\s+/;

/**
 * Recursively find all .md files under a directory.
 * Returns sorted array of absolute paths.
 */
export function findMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

/**
 * Extract all (display, path) from markdown links in text.
 * Strips anchors. Excludes http(s) links.
 */
export function extractLinks(text) {
  const results = [];
  const re = new RegExp(LINK_RE.source, LINK_RE.flags);
  let match;
  while ((match = re.exec(text)) !== null) {
    const display = match[1];
    const rawPath = match[2].split("#")[0];
    if (rawPath && !rawPath.startsWith("http")) {
      results.push({ display, path: rawPath });
    }
  }
  return results;
}

/**
 * Resolve a relative link path from the source file's directory.
 */
export function resolveLink(sourceFile, linkPath) {
  return resolve(dirname(sourceFile), linkPath);
}

/**
 * Find all .md files under root that contain a markdown link pointing to file.
 * Returns an array of absolute paths.
 */
export function findBacklinks(file, root) {
  const absFile = resolve(file);
  const allFiles = findMdFiles(root);
  const results = [];
  for (const f of allFiles) {
    if (f === absFile) continue;
    const content = readFileSync(f, "utf-8");
    const links = extractLinks(content);
    for (const { path: rawPath } of links) {
      const resolved = resolveLink(f, rawPath);
      if (resolved === absFile) {
        results.push(f);
        break;
      }
    }
  }
  return results;
}

/**
 * Extract the Related/Related Docs section content as text.
 * Returns null if no such section found.
 */
export function findRelatedSectionText(content) {
  const lines = content.split("\n");
  let inRelated = false;
  const relatedLines = [];
  for (const line of lines) {
    if (RELATED_HEADERS.test(line)) {
      inRelated = true;
      continue;
    }
    if (inRelated) {
      if (SECTION_RE.test(line)) break;
      relatedLines.push(line);
    }
  }
  return relatedLines.length > 0 ? relatedLines.join("\n") : null;
}

/**
 * Find the Related section line positions.
 * Returns { start, end, headerText } or null.
 * start = line index of header; end = line index of next section header (or EOF).
 */
export function findRelatedSectionLines(content) {
  const lines = content.split("\n");
  let start = null;
  let headerText = "";
  for (let i = 0; i < lines.length; i++) {
    if (RELATED_HEADERS.test(lines[i])) {
      start = i;
      headerText = lines[i];
      continue;
    }
    if (start !== null && SECTION_RE.test(lines[i])) {
      return { start, end: i, headerText };
    }
  }
  if (start !== null) {
    return { start, end: lines.length, headerText };
  }
  return null;
}

/**
 * Check if a path is within a given directory.
 */
export function isWithinDir(filePath, dir) {
  const resolved = resolve(filePath);
  const dirResolved = resolve(dir);
  return resolved.startsWith(dirResolved + "/") || resolved === dirResolved;
}
