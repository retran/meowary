/**
 * resources-links-common.ts — shared utilities for resource link auditing and fixing.
 *
 * Used by audit-resources-links.ts and fix-resources-links.ts.
 */

import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync, readFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const KB_ROOT = resolve(__dirname, "..", "resources");

/**
 * Match markdown links: [text](path.md) or [text](path.md#anchor)
 * Supports nested brackets in display text like [[ADR-001] Title](path.md)
 */
export const LINK_RE =
  /\[((?:[^\[\]]|\[[^\]]*\])+)\]\(([^)]+\.md(?:#[^)]*)?)\)/g;

/**
 * Section headers that contain cross-references.
 */
export const RELATED_HEADERS =
  /^##\s+(Related|Related Docs|Cross-references)\s*$/i;

/**
 * Any H2 section header.
 */
export const SECTION_RE = /^##\s+/;

/**
 * Recursively find all .md files under a directory.
 */
export function findMdFiles(dir: string): string[] {
  const results: string[] = [];
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
 * Extract the Related/Related Docs section content as text.
 */
export function findRelatedSectionText(content: string): string | null {
  const lines = content.split("\n");
  let inRelated = false;
  const relatedLines: string[] = [];
  for (const line of lines) {
    if (RELATED_HEADERS.test(line)) {
      inRelated = true;
      continue;
    }
    if (inRelated) {
      if (SECTION_RE.test(line)) {
        break;
      }
      relatedLines.push(line);
    }
  }
  return relatedLines.length > 0 ? relatedLines.join("\n") : null;
}

/**
 * Find the Related section line positions.
 *
 * Returns { start, end, headerText } where:
 * - start is the line index of the header
 * - end is the line index of the next section header (or end of file)
 * - headerText is the actual header line
 *
 * Returns null if no Related section found.
 */
export function findRelatedSectionLines(
  content: string
): { start: number; end: number; headerText: string } | null {
  const lines = content.split("\n");
  let start: number | null = null;
  let headerText: string = "";
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
 * Extract all (displayText, path) from markdown links in text.
 * Strips anchors. Excludes http(s) links.
 */
export function extractLinks(text: string): Array<{ display: string; path: string }> {
  const results: Array<{ display: string; path: string }> = [];
  // Reset lastIndex since LINK_RE has global flag
  const re = new RegExp(LINK_RE.source, LINK_RE.flags);
  let match: RegExpExecArray | null;
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
export function resolveLink(sourceFile: string, linkPath: string): string {
  return resolve(dirname(sourceFile), linkPath);
}

/**
 * Check if a resolved path is within the KB_ROOT directory.
 */
export function isWithinKb(filePath: string): boolean {
  const resolved = resolve(filePath);
  const kbResolved = resolve(KB_ROOT);
  return resolved.startsWith(kbResolved + "/") || resolved === kbResolved;
}
