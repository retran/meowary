/**
 * config.ts — shared environment config for journal scripts.
 *
 * Loads credentials and instance settings from .env (repo root) with
 * fallback to ~/.secrets for backward compatibility (legacy installs only).
 *
 * Exports:
 *   ATLASSIAN_USERNAME, ATLASSIAN_API_TOKEN
 *   CONFLUENCE_BASE        — Confluence REST API base URL
 *   CONFLUENCE_DEFAULT_SPACES — array of default spaces to scan
 *   SCRIPTS_DIR, JOURNAL_DIR, MAP_FILE
 *   loadMapIds()           — parse confluence-map.md for page IDs
 */

import { config } from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
export const SCRIPTS_DIR = dirname(__filename);
export const JOURNAL_DIR = resolve(SCRIPTS_DIR, "..");
export const MAP_FILE = resolve(JOURNAL_DIR, "confluence-map.md");

// Load .env from repo root (preferred)
const envFile = resolve(JOURNAL_DIR, ".env");
if (existsSync(envFile)) {
  config({ path: envFile });
}

// Fallback: ~/.secrets (legacy)
const secretsFile = resolve(homedir(), ".secrets");
if (!process.env.ATLASSIAN_USERNAME && existsSync(secretsFile)) {
  config({ path: secretsFile });
}

export const ATLASSIAN_USERNAME = process.env.ATLASSIAN_USERNAME ?? "";
export const ATLASSIAN_API_TOKEN = process.env.ATLASSIAN_API_TOKEN ?? "";
export const CONFLUENCE_BASE = process.env.CONFLUENCE_URL ?? "";
export const CONFLUENCE_DEFAULT_SPACES: string[] = (
  process.env.CONFLUENCE_SPACES ?? ""
)
  .split(/\s+/)
  .filter(Boolean);

/**
 * Parse confluence-map.md and return a Set of page IDs and an array of IDs.
 */
export function loadMapIds(
  mapFile: string = MAP_FILE
): { ids: string[]; inMap: Set<string> } {
  const content = readFileSync(mapFile, "utf-8");
  const idRegex = /^\| (\d{7,}) \|/gm;
  const ids: string[] = [];
  const inMap = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
    inMap.add(match[1]);
  }
  return { ids, inMap };
}

/**
 * Build the Basic auth header value for Confluence REST API calls.
 */
export function authHeader(): string {
  return (
    "Basic " +
    Buffer.from(`${ATLASSIAN_USERNAME}:${ATLASSIAN_API_TOKEN}`).toString(
      "base64"
    )
  );
}

/**
 * Validate that required Atlassian credentials are present.
 * Exits with error if missing.
 */
export function requireAtlassianCredentials(): void {
  if (!ATLASSIAN_USERNAME || !ATLASSIAN_API_TOKEN) {
    console.error(
      "ERROR: ATLASSIAN_USERNAME and ATLASSIAN_API_TOKEN must be set (see .env.example)."
    );
    process.exit(1);
  }
  if (!CONFLUENCE_BASE) {
    console.error("ERROR: CONFLUENCE_URL must be set (see .env.example).");
    process.exit(1);
  }
}
