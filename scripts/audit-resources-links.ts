#!/usr/bin/env tsx
/**
 * audit-resources-links.ts
 *
 * Audit all resource article links for:
 * 1. Broken links (target file doesn't exist)
 * 2. Missing back-links (A links to B in Related section, but B doesn't link back to A)
 *
 * Scans all .md files under resources/ and checks their ## Related / ## Related Docs sections.
 */

import { readFileSync, existsSync } from "node:fs";
import { relative } from "node:path";
import {
  KB_ROOT,
  findMdFiles,
  extractLinks,
  findRelatedSectionText,
  isWithinKb,
  resolveLink,
} from "./resources-links-common.js";

function main(): number {
  // Collect all resource files
  const resourceFiles = findMdFiles(KB_ROOT);
  console.log(`Found ${resourceFiles.length} resource files\n`);

  // Phase 1: Parse all files — extract Related section links
  // file -> [{display, resolvedTarget}]
  const relatedLinks = new Map<string, Array<{ display: string; target: string }>>();
  // Also track all links for broken link detection
  const allLinks = new Map<
    string,
    Array<{ display: string; resolved: string; raw: string }>
  >();

  const resourceFileSet = new Set(resourceFiles);

  for (const f of resourceFiles) {
    const content = readFileSync(f, "utf-8");

    // All links in the file (for broken link check)
    const fileLinks = extractLinks(content);
    allLinks.set(
      f,
      fileLinks.map((l) => ({
        display: l.display,
        resolved: resolveLink(f, l.path),
        raw: l.path,
      }))
    );

    // Related section links only (for back-link check)
    const relatedText = findRelatedSectionText(content);
    if (relatedText) {
      const relLinks = extractLinks(relatedText);
      relatedLinks.set(
        f,
        relLinks.map((l) => ({
          display: l.display,
          target: resolveLink(f, l.path),
        }))
      );
    }
  }

  // Phase 2: Find broken links
  console.log("=".repeat(70));
  console.log("BROKEN LINKS (target file doesn't exist)");
  console.log("=".repeat(70));
  let brokenCount = 0;
  for (const [source, links] of [...allLinks.entries()].sort()) {
    for (const { display, resolved, raw } of links) {
      if (!existsSync(resolved)) {
        const relSource = relative(KB_ROOT, source);
        console.log(`  ${relSource}: [${display}](${raw}) -> NOT FOUND`);
        brokenCount++;
      }
    }
  }
  if (brokenCount === 0) {
    console.log("  None found!");
  }
  console.log(`\nTotal broken links: ${brokenCount}\n`);

  // Phase 3: Find missing back-links
  console.log("=".repeat(70));
  console.log("MISSING BACK-LINKS (A links to B in Related, B doesn't link back)");
  console.log("=".repeat(70));

  // Build set of (source, target) edges from Related sections
  const edges = new Set<string>(); // "source\0target"
  const edgePairs: Array<[string, string]> = [];

  for (const [source, links] of relatedLinks) {
    for (const { target } of links) {
      if (existsSync(target) && resourceFileSet.has(target)) {
        const key = `${source}\0${target}`;
        if (!edges.has(key)) {
          edges.add(key);
          edgePairs.push([source, target]);
        }
      }
    }
  }

  let missingCount = 0;
  const missingByTarget = new Map<string, string[]>();

  for (const [source, target] of edgePairs.sort()) {
    // Check if reverse edge exists
    const reverseKey = `${target}\0${source}`;
    if (!edges.has(reverseKey)) {
      // Exception: people -> topic doesn't need back-link
      const relSource = relative(KB_ROOT, source);
      if (relSource.startsWith("people/")) {
        continue;
      }
      const relTarget = relative(KB_ROOT, target);
      console.log(
        `  ${relSource} -> ${relTarget}  (missing back-link in ${relTarget})`
      );
      missingCount++;
      if (!missingByTarget.has(target)) {
        missingByTarget.set(target, []);
      }
      missingByTarget.get(target)!.push(source);
    }
  }

  if (missingCount === 0) {
    console.log("  None found!");
  }
  console.log(`\nTotal missing back-links: ${missingCount}\n`);

  // Summary: targets with most missing back-links
  if (missingByTarget.size > 0) {
    console.log("=".repeat(70));
    console.log("TARGETS NEEDING MOST BACK-LINKS");
    console.log("=".repeat(70));
    const sorted = [...missingByTarget.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );
    for (const [target, sources] of sorted) {
      const relTarget = relative(KB_ROOT, target);
      console.log(`  ${relTarget} (${sources.length} missing):`);
      for (const s of sources.sort()) {
        console.log(`    <- ${relative(KB_ROOT, s)}`);
      }
    }
    console.log();
  }

  return brokenCount > 0 || missingCount > 0 ? 1 : 0;
}

process.exit(main());
