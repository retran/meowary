#!/usr/bin/env node
/**
 * health-kg-coverage.js
 *
 * List all .md files in resources/ and report which ones are NOT referenced
 * in any table row in knowledge-graph.md.
 *
 * Output format:
 *   - [ ] resources/domain/article.md — not in knowledge-graph.md
 *
 * Exit 0 always.
 */

import { resolve, relative, basename } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { listResourceFiles, readKnowledgeGraph, getGraphEntry } from "./lib/graph.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const RESOURCES_ROOT = resolve(REPO_ROOT, "resources");
const GRAPH_FILE = resolve(REPO_ROOT, "knowledge-graph.md");

if (!existsSync(GRAPH_FILE)) {
  console.log("health-kg-coverage: knowledge-graph.md not found — skipping");
  process.exit(0);
}

const graphContent = readKnowledgeGraph(GRAPH_FILE);
const resourceFiles = listResourceFiles(RESOURCES_ROOT);

let missingCount = 0;

for (const f of resourceFiles) {
  const entries = getGraphEntry(f, graphContent);
  if (entries.length === 0) {
    const rel = relative(REPO_ROOT, f);
    console.log(`- [ ] ${rel} — not in knowledge-graph.md`);
    missingCount++;
  }
}

if (missingCount === 0) {
  console.log("health-kg-coverage: all resource files referenced in knowledge-graph.md");
} else {
  console.log(`\nhealth-kg-coverage: ${missingCount} file(s) missing from knowledge-graph.md`);
}
