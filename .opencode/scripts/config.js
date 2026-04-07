/**
 * config.js — shared environment config for journal scripts.
 *
 * Loads credentials and instance settings from .env (repo root) with
 * fallback to ~/.secrets for backward compatibility (legacy installs only).
 *
 * Exports:
 *   ATLASSIAN_USERNAME, ATLASSIAN_API_TOKEN
 *   CONFLUENCE_BASE        — Confluence REST API base URL
 *   CONFLUENCE_DEFAULT_SPACES — array of default spaces to scan
 *   SCRIPTS_DIR, JOURNAL_DIR, REPO_ROOT
 *   authHeader()           — Basic auth header value
 *   requireAtlassianCredentials() — validate credentials, exit 1 if missing
 */

import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

export const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
export const JOURNAL_DIR = resolve(SCRIPTS_DIR, "../..");
/** Alias for JOURNAL_DIR — the repo root. Derived from import.meta.url so scripts
 *  work regardless of the working directory they are invoked from. */
export const REPO_ROOT = JOURNAL_DIR;

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
export const CONFLUENCE_DEFAULT_SPACES = (process.env.CONFLUENCE_SPACES ?? "")
  .split(/\s+/)
  .filter(Boolean);

/**
 * Build the Basic auth header value for Confluence REST API calls.
 */
export function authHeader() {
  return (
    "Basic " +
    Buffer.from(`${ATLASSIAN_USERNAME}:${ATLASSIAN_API_TOKEN}`).toString("base64")
  );
}

/**
 * Validate that required Atlassian credentials are present.
 * Intentionally exits with code 1 on missing credentials — this is a hard failure
 * that should surface as an error in CI and shell scripts. Explicit exception to the
 * "exit 0 always" convention used by health/report scripts.
 */
export function requireAtlassianCredentials() {
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
