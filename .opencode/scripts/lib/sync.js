/**
 * lib/sync.js — Confluence sync registry utilities.
 *
 * Reads/writes meta/confluence-sync.json.
 * This file is the authoritative registry of Confluence pages we monitor,
 * with the date each was last ingested into a local resource article.
 *
 * Schema:
 *   {
 *     [pageId: string]: {
 *       title:     string           — page title (informational)
 *       space:     string           — Confluence space key
 *       synced:    string | null    — YYYY-MM-DD of last ingest, or null if never
 *       resources: string[]         — optional list of resource article paths this page informs
 *     }
 *   }
 *
 * Exports:
 *   SYNC_FILE                    — absolute path to meta/confluence-sync.json
 *   loadSyncConfig(repoRoot)     — read JSON → entries object (skips _comment/_schema keys)
 *   saveSyncConfig(repoRoot, entries) — write entries to file (preserves _comment/_schema)
 *   markSynced(repoRoot, pageId, date) — update synced date for one page
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export const SYNC_FILENAME = "meta/confluence-sync.json";

/**
 * Return the absolute path to meta/confluence-sync.json.
 */
export function syncFilePath(repoRoot) {
  return resolve(repoRoot, SYNC_FILENAME);
}

/**
 * Read confluence-sync.json and return only the page-entry keys
 * (strips _comment and _schema metadata keys).
 *
 * Returns {} if the file does not exist or has no entries.
 *
 * @param {string} repoRoot
 * @returns {Record<string, { title: string, space: string, synced: string|null, resource?: string }>}
 */
export function loadSyncConfig(repoRoot) {
  const path = syncFilePath(repoRoot);
  if (!existsSync(path)) return {};
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
  const entries = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("_")) continue;
    if (value && typeof value === "object") entries[key] = value;
  }
  return entries;
}

/**
 * Write entries back to confluence-sync.json.
 * Preserves _comment and _schema keys from the existing file.
 *
 * @param {string} repoRoot
 * @param {Record<string, object>} entries
 */
export function saveSyncConfig(repoRoot, entries) {
  const path = syncFilePath(repoRoot);
  let meta = {};
  if (existsSync(path)) {
    try {
      const existing = JSON.parse(readFileSync(path, "utf-8"));
      for (const [k, v] of Object.entries(existing)) {
        if (k.startsWith("_")) meta[k] = v;
      }
    } catch {
      // ignore parse errors — start fresh meta
    }
  }
  const output = { ...meta, ...entries };
  writeFileSync(path, JSON.stringify(output, null, 2) + "\n", "utf-8");
}

/**
 * Update the `synced` date for a single page ID.
 * Creates the entry if it doesn't exist (with title/space as empty strings).
 *
 * @param {string} repoRoot
 * @param {string} pageId
 * @param {string} date — YYYY-MM-DD
 */
export function markSynced(repoRoot, pageId, date) {
  const entries = loadSyncConfig(repoRoot);
  entries[pageId] = { title: "", space: "", ...entries[pageId], synced: date };
  saveSyncConfig(repoRoot, entries);
}
