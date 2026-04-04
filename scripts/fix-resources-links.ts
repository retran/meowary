#!/usr/bin/env tsx
/**
 * fix-resources-links.ts
 *
 * Fix missing back-links in resource articles.
 *
 * Scans all resource files for asymmetric Related-section links and adds
 * the missing reverse links. Run after audit-resources-links.ts identifies issues.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { relative, dirname } from "node:path";
import path from "node:path";
import {
  KB_ROOT,
  findMdFiles,
  extractLinks,
  findRelatedSectionLines,
  isWithinKb,
  resolveLink,
} from "./resources-links-common.js";

const TODAY = new Date().toISOString().slice(0, 10);

function getH1Title(content: string): string | null {
  for (const line of content.split("\n")) {
    if (line.startsWith("# ")) {
      return line.slice(2).trim();
    }
  }
  return null;
}

function relativeLinkPath(fromFile: string, toFile: string): string {
  return path.relative(dirname(fromFile), toFile);
}

function updateFrontmatterDate(filepath: string): void {
  const content = readFileSync(filepath, "utf-8");
  // Match updated: YYYY-MM-DD in front matter
  const newContent = content.replace(
    /(^---\n[\s\S]*?)(updated:\s*)\d{4}-\d{2}-\d{2}/,
    `$1$2${TODAY}`
  );
  if (newContent !== content) {
    writeFileSync(filepath, newContent, "utf-8");
  }
}

function fixMissingBacklinks(): number {
  console.log("=".repeat(70));
  console.log("FIXING MISSING BACK-LINKS");
  console.log("=".repeat(70));

  // Step 1: Collect all resource files and parse their Related sections
  const resourceFiles = findMdFiles(KB_ROOT);

  // Build edge set: (source, target) from Related sections
  const edges = new Set<string>(); // "source\0target"
  const relatedLinks = new Map<
    string,
    Array<{ display: string; target: string }>
  >();

  for (const f of resourceFiles) {
    const content = readFileSync(f, "utf-8");
    const section = findRelatedSectionLines(content);
    if (section) {
      const sectionText = content
        .split("\n")
        .slice(section.start, section.end)
        .join("\n");
      const links = extractLinks(sectionText);
      const fileLinks: Array<{ display: string; target: string }> = [];
      for (const { display, path: rawPath } of links) {
        const resolved = resolveLink(f, rawPath);
        if (existsSync(resolved) && isWithinKb(resolved)) {
          fileLinks.push({ display, target: resolved });
          edges.add(`${f}\0${resolved}`);
        }
      }
      relatedLinks.set(f, fileLinks);
    }
  }

  // Step 2: Find missing back-links (skip people -> topic)
  const missingByTarget = new Map<string, string[]>();

  for (const edgeKey of edges) {
    const [source, target] = edgeKey.split("\0");
    const reverseKey = `${target}\0${source}`;
    if (!edges.has(reverseKey)) {
      const relSource = relative(KB_ROOT, source);
      if (relSource.startsWith("people/")) {
        continue;
      }
      if (!missingByTarget.has(target)) {
        missingByTarget.set(target, []);
      }
      missingByTarget.get(target)!.push(source);
    }
  }

  // Step 3: For each target, add missing back-links
  let totalAdded = 0;
  const filesModified = new Set<string>();

  const sortedEntries = [...missingByTarget.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [target, sources] of sortedEntries) {
    const relTarget = relative(KB_ROOT, target);
    let content = readFileSync(target, "utf-8");
    const lines = content.split("\n");

    let section = findRelatedSectionLines(content);

    if (!section) {
      // No Related section — create one at the end
      lines.push("");
      lines.push("## Related");
      lines.push("");
      section = { start: lines.length - 2, end: lines.length, headerText: "## Related" };
    }

    // Collect existing links in the Related section to avoid duplicates
    const sectionText = lines.slice(section.start, section.end).join("\n");
    const existingLinks = extractLinks(sectionText);
    const existingTargets = new Set<string>();
    for (const { path: rawPath } of existingLinks) {
      existingTargets.add(resolveLink(target, rawPath));
    }

    // Build new link lines to add
    const newLinks: string[] = [];
    const sortedSources = sources.sort((a, b) =>
      relative(KB_ROOT, a).localeCompare(relative(KB_ROOT, b))
    );

    for (const source of sortedSources) {
      if (existingTargets.has(source)) {
        continue; // already linked
      }

      // Get display name from source file's H1
      const sourceContent = readFileSync(source, "utf-8");
      let title = getH1Title(sourceContent);
      if (!title) {
        const stem = path.basename(source, ".md");
        title = stem
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      const relPath = relativeLinkPath(target, source);
      newLinks.push(`- [${title}](${relPath})`);
    }

    if (newLinks.length === 0) {
      continue;
    }

    // Insert new links at the end of the Related section (before next section)
    let insertAt = section.end;
    for (let i = section.end - 1; i > section.start; i--) {
      if (lines[i].trim()) {
        insertAt = i + 1;
        break;
      }
    }
    if (insertAt === section.end && section.end === section.start + 1) {
      insertAt = section.start + 1;
    }

    for (let j = 0; j < newLinks.length; j++) {
      lines.splice(insertAt + j, 0, newLinks[j]);
    }

    writeFileSync(target, lines.join("\n"), "utf-8");
    filesModified.add(relTarget);
    totalAdded += newLinks.length;
    console.log(`  ${relTarget}: added ${newLinks.length} back-link(s)`);
    for (const nl of newLinks) {
      console.log(`    ${nl}`);
    }
  }

  // Update front matter dates
  for (const relPath of filesModified) {
    updateFrontmatterDate(path.resolve(KB_ROOT, relPath));
  }

  console.log(`\nAdded ${totalAdded} back-links in ${filesModified.size} files\n`);
  return totalAdded;
}

function main(): number {
  console.log(`Resources root: ${KB_ROOT}`);
  console.log(`Date: ${TODAY}\n`);

  const backlinksAdded = fixMissingBacklinks();

  console.log("=".repeat(70));
  console.log(`SUMMARY: Added ${backlinksAdded} back-links`);
  console.log("=".repeat(70));

  return 0;
}

process.exit(main());
