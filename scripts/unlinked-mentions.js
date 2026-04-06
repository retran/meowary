#!/usr/bin/env node
/**
 * unlinked-mentions.js
 *
 * For each resource article: run a QMD semantic query (using the article's
 * title and tags) against all indexed journal collections. Report files that
 * score above the threshold but have no markdown link back to the article.
 *
 * Findings are grouped by resource article so you see which concept is
 * underlinked and in which files.
 *
 * Usage:
 *   node scripts/unlinked-mentions.js [--min-score N]
 *   Default: --min-score 0.5  (N must be a float in (0, 1])
 *   Cap: 50 results per resource article — raise with -n if needed (edit runQmdQuery)
 *
 * Prerequisite: Run `node scripts/qmd-index.js --changed` first to ensure the
 * index is current.
 *
 * Exit 0 always.
 */

import { readFileSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import { homedir } from "node:os";
import { execFileSync, execSync } from "node:child_process";
import { findMdFiles, extractLinks, resolveLink } from "./lib/links.js";
import { parseFrontmatter, stripFrontmatter } from "./lib/frontmatter.js";
import { JOURNAL_DIR } from "./config.js";

const REPO_ROOT = JOURNAL_DIR;
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");

// Collection names from qmd.yml that represent journal content.
// "skills" (agent instruction files) and "meta" (root-level system files like
// AGENTS.md, context.md) are excluded — they are not user-authored journal content
// and do not link to resource articles by convention.
const JOURNAL_COLLECTIONS = new Set([
  "resources",
  "journal",
  "inbox",
  "projects",
  "areas",
  "drafts",
  "archive",
]);

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let minScore = 0.5;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--min-score" && args[i + 1]) {
    const n = parseFloat(args[i + 1]);
    if (!isNaN(n) && n > 0 && n <= 1) {
      minScore = n;
    } else {
      console.warn(`WARNING: --min-score must be a float in (0, 1]. Ignoring "${args[i + 1]}", using default ${minScore}.`);
    }
    i++;
  }
}

// ---------------------------------------------------------------------------
// QMD availability check
// ---------------------------------------------------------------------------
try {
  execSync("qmd --version", { encoding: "utf-8", stdio: "pipe" });
} catch {
  console.log("qmd is not installed or not in PATH.");
  console.log("Install: npm install -g @tobilu/qmd (requires Node >= 22)");
  console.log("First run downloads ~2GB embedding model.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Index staleness warning
// ---------------------------------------------------------------------------
function warnIfStale() {
  const indexPath = resolve(homedir(), ".cache/qmd/index.sqlite");
  let indexMtime;
  try {
    indexMtime = statSync(indexPath).mtimeMs;
  } catch {
    // Index not found at expected path — skip staleness check.
    return;
  }

  const indexedDirs = [
    "journal",
    "resources",
    "inbox",
    "projects",
    "areas",
    "drafts",
    "archive",
  ].map((d) => resolve(REPO_ROOT, d));

  let newestMtime = 0;
  for (const dir of indexedDirs) {
    for (const f of findMdFiles(dir)) {
      try {
        const m = statSync(f).mtimeMs;
        if (m > newestMtime) newestMtime = m;
      } catch {
        // Ignore files that can't be stat'd.
      }
    }
  }

  if (newestMtime > indexMtime) {
    const diffMin = Math.round((newestMtime - indexMtime) / 60_000);
    console.warn(
      `WARNING: QMD index may be stale — newest .md is ${diffMin}min newer than the index.`
    );
    console.warn(`Run: node scripts/qmd-index.js --changed\n`);
  }
}

// ---------------------------------------------------------------------------
// Collection map: collection name → absolute path on disk
// ---------------------------------------------------------------------------
function buildCollectionMap() {
  // All collections from qmd.yml, including skills so URIs resolve correctly
  // even if we filter them out of suggestions later.
  const known = [
    "meta",
    "resources",
    "journal",
    "inbox",
    "projects",
    "areas",
    "drafts",
    "archive",
    "skills",
  ];
  const map = {};
  for (const name of known) {
    try {
      const out = execFileSync("qmd", ["collection", "show", name], {
        encoding: "utf-8",
        stdio: "pipe",
        cwd: JOURNAL_DIR,
      });
      const match = out.match(/Path:\s+(.+)/);
      if (match) map[name] = match[1].trim();
    } catch {
      // Collection not registered — skip.
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// URI → absolute path
// ---------------------------------------------------------------------------
function qmdUriToPath(uri, collectionMap) {
  // Format: qmd://<collection>/<relative-path>
  const match = uri.match(/^qmd:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const [, collName, relPath] = match;
  const root = collectionMap[collName];
  if (!root) return null;
  return resolve(root, relPath);
}

// ---------------------------------------------------------------------------
// H1 title extraction
// ---------------------------------------------------------------------------
function extractH1(content) {
  const body = stripFrontmatter(content);
  const match = body.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// QMD query → parsed JSON results
// ---------------------------------------------------------------------------
function runQmdQuery(query, score) {
  try {
    const out = execFileSync(
      "qmd",
      [
        "query",
        query,
        "--json",
        "--no-rerank",
        "--min-score",
        String(score),
        "-n",
        "50",
      ],
      {
        encoding: "utf-8",
        stdio: "pipe",
        cwd: JOURNAL_DIR,
        timeout: 30_000,
      }
    );
    return JSON.parse(out);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Check if sourceFile already has a markdown link resolving to targetFile
// ---------------------------------------------------------------------------
function fileLinksTo(sourceFile, sourceContent, targetFile) {
  const links = extractLinks(sourceContent);
  for (const { path: rawPath } of links) {
    if (resolveLink(sourceFile, rawPath) === targetFile) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
warnIfStale();

const collectionMap = buildCollectionMap();
const resourceFiles = findMdFiles(RESOURCES_ROOT);

if (resourceFiles.length === 0) {
  console.log("No resource articles found in resources/. Nothing to scan.");
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
console.log(`Unlinked Mentions Report — ${today}`);
console.log(`Resources scanned: ${resourceFiles.length} | Min score: ${minScore}`);
console.log();

let totalSuggestions = 0;
let totalArticlesWithSuggestions = 0;

for (const resourceFile of resourceFiles) {
  let content;
  try {
    content = readFileSync(resourceFile, "utf-8");
  } catch {
    continue;
  }

  const fm = parseFrontmatter(content);
  const h1 = extractH1(content) || fm.title;
  if (!h1) continue;

  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const query = [h1, ...tags].join(" ").trim();

  const results = runQmdQuery(query, minScore);
  const suggestions = [];

  for (const result of results) {
    // Only scan journal collections — skip skills, meta.
    const collMatch = result.file.match(/^qmd:\/\/([^/]+)\//);
    if (collMatch && !JOURNAL_COLLECTIONS.has(collMatch[1])) continue;

    const resultPath = qmdUriToPath(result.file, collectionMap);
    if (!resultPath) continue;

    // Skip self-match.
    if (resultPath === resourceFile) continue;

    let resultContent;
    try {
      resultContent = readFileSync(resultPath, "utf-8");
    } catch {
      continue;
    }

    if (fileLinksTo(resultPath, resultContent, resourceFile)) continue;

    suggestions.push({
      relPath: relative(REPO_ROOT, resultPath),
      score: result.score,
    });
  }

  if (suggestions.length > 0) {
    const relResource = relative(REPO_ROOT, resourceFile);
    console.log(`## ${relResource} — "${h1}"`);
    for (const { relPath, score } of suggestions) {
      console.log(`  - [ ] ${relPath} (score: ${score.toFixed(2)})`);
    }
    console.log();
    totalSuggestions += suggestions.length;
    totalArticlesWithSuggestions++;
  }
}

if (totalSuggestions === 0) {
  console.log("No unlinked mentions found.");
} else {
  console.log("---");
  console.log(
    `Total suggestions: ${totalSuggestions} across ${totalArticlesWithSuggestions} resource article(s)`
  );
}
