/**
 * lib/graph.js — knowledge graph utilities.
 *
 * Exports:
 *   readKnowledgeGraph(path)   — read knowledge-graph.md → raw string
 *   listResourceFiles(root)    — list all .md files under resources/
 *   getGraphEntry(file, graph) — return the table row(s) for a given file path, or null
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { findMdFiles } from "./links.js";

/**
 * Read the knowledge-graph.md file and return its content as a string.
 */
export function readKnowledgeGraph(graphPath) {
  return readFileSync(graphPath, "utf-8");
}

/**
 * List all .md files under the given resources root directory.
 * Returns absolute paths.
 */
export function listResourceFiles(root) {
  return findMdFiles(root);
}

/**
 * Search the knowledge graph content for any table row that references
 * the given file path (by basename or relative path).
 *
 * Returns all matching lines as an array of strings, or [] if none found.
 */
export function getGraphEntry(filePath, graphContent) {
  if (!graphContent) return [];
  // Match any table row containing the filename (with or without path prefix)
  const basename = filePath.split("/").pop();
  const lines = graphContent.split("\n");
  return lines.filter((line) => line.includes(basename) && line.startsWith("|"));
}
