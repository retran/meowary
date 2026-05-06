#!/usr/bin/env node
/**
 * fix-links.js
 *
 * Fix missing back-links in resource articles.
 *
 * Scans all resource files for asymmetric Related-section links and adds
 * the missing reverse links. Run after health-links.js identifies issues.
 *
 * Scope: resources/ only. Back-link symmetry is enforced only within resources/
 * — links from daily notes or project files into resources/ are intentionally
 * one-directional and are not added here.
 *
 * Exit 0 always.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findMdFiles,
  extractLinks,
  findRelatedSectionLines,
  resolveLink,
  isWithinDir,
} from "./lib/links.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const KB_ROOT = resolve(REPO_ROOT, "resources");
const TODAY = new Date().toISOString().slice(0, 10);

function getH1Title(content) {
  for (const line of content.split("\n")) {
    if (line.startsWith("# ")) return line.slice(2).trim();
  }
  return null;
}

function relativeLinkPath(fromFile, toFile) {
  return relative(dirname(fromFile), toFile);
}

function updateFrontmatterDate(filepath) {
  const content = readFileSync(filepath, "utf-8");
  const newContent = content.replace(
    /(^---\n[\s\S]*?)(updated:\s*)\d{4}-\d{2}-\d{2}/,
    `$1$2${TODAY}`
  );
  if (newContent !== content) writeFileSync(filepath, newContent, "utf-8");
}

function main() {
  console.log("=".repeat(70));
  console.log("FIXING MISSING BACK-LINKS");
  console.log("=".repeat(70));

  const resourceFiles = findMdFiles(KB_ROOT);
  const edges = new Set();
  const relatedLinks = new Map();

  for (const f of resourceFiles) {
    const content = readFileSync(f, "utf-8");
    const section = findRelatedSectionLines(content);
    if (section) {
      const sectionText = content.split("\n").slice(section.start, section.end).join("\n");
      const links = extractLinks(sectionText);
      const fileLinks = [];
      for (const { display, path: rawPath } of links) {
        const resolved = resolveLink(f, rawPath);
        if (existsSync(resolved) && isWithinDir(resolved, KB_ROOT)) {
          fileLinks.push({ display, target: resolved });
          edges.add(`${f}\0${resolved}`);
        }
      }
      relatedLinks.set(f, fileLinks);
    }
  }

  const missingByTarget = new Map();
  for (const edgeKey of edges) {
    const [source, target] = edgeKey.split("\0");
    const reverseKey = `${target}\0${source}`;
    if (!edges.has(reverseKey)) {
      const relSource = relative(KB_ROOT, source);
      if (relSource.startsWith("people/")) continue;
      if (!missingByTarget.has(target)) missingByTarget.set(target, []);
      missingByTarget.get(target).push(source);
    }
  }

  let totalAdded = 0;
  const filesModified = new Set();

  const sortedEntries = [...missingByTarget.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [target, sources] of sortedEntries) {
    const relTarget = relative(KB_ROOT, target);
    let content = readFileSync(target, "utf-8");
    const lines = content.split("\n");

    let section = findRelatedSectionLines(content);
    if (!section) {
      lines.push("");
      lines.push("## Related");
      lines.push("");
      section = { start: lines.length - 2, end: lines.length, headerText: "## Related" };
    }

    const sectionText = lines.slice(section.start, section.end).join("\n");
    const existingLinks = extractLinks(sectionText);
    const existingTargets = new Set(
      existingLinks.map(({ path: rawPath }) => resolveLink(target, rawPath))
    );

    const newLinks = [];
    const sortedSources = sources.sort((a, b) =>
      relative(KB_ROOT, a).localeCompare(relative(KB_ROOT, b))
    );

    for (const source of sortedSources) {
      if (existingTargets.has(source)) continue;

      const sourceContent = readFileSync(source, "utf-8");
      let title = getH1Title(sourceContent);
      if (!title) {
        const stem = basename(source, ".md");
        title = stem.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }

      const relPath = relativeLinkPath(target, source);
      newLinks.push(`- [${title}](${relPath})`);
    }

    if (newLinks.length === 0) continue;

    let insertAt = section.end;
    for (let i = section.end - 1; i > section.start; i--) {
      if (lines[i].trim()) { insertAt = i + 1; break; }
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
    for (const nl of newLinks) console.log(`    ${nl}`);
  }

  for (const relPath of filesModified) {
    updateFrontmatterDate(resolve(KB_ROOT, relPath));
  }

  console.log(`\nAdded ${totalAdded} back-links in ${filesModified.size} files\n`);
  console.log("=".repeat(70));
  console.log(`SUMMARY: Added ${totalAdded} back-links`);
  console.log("=".repeat(70));
}

main();
