#!/usr/bin/env node
/**
 * confluence-updates.js
 *
 * Fetches all Confluence pages modified on or after a given date across one or
 * more spaces, and cross-references with confluence-sync.json to show which
 * tracked pages are stale (Confluence updated more recently than last synced).
 *
 * Usage:
 *   node scripts/confluence-updates.js YYYY-MM-DD [SPACE1 SPACE2 ...]
 *   Default spaces: set CONFLUENCE_SPACES in .env (space-separated list)
 *
 * Exit 0 always.
 */

import {
  CONFLUENCE_BASE,
  CONFLUENCE_DEFAULT_SPACES,
  REPO_ROOT,
  authHeader,
  requireAtlassianCredentials,
} from "./config.js";
import { loadSyncConfig } from "./lib/sync.js";

const PAGE_SIZE = 50;

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: confluence-updates.js YYYY-MM-DD [SPACE1 SPACE2 ...]");
    return;
  }

  const since = args[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    console.error("ERROR: Date must be in YYYY-MM-DD format.");
    return;
  }

  requireAtlassianCredentials();

  const spaces = args.length > 1 ? args.slice(1) : CONFLUENCE_DEFAULT_SPACES;
  if (spaces.length === 0) {
    console.error("ERROR: No spaces specified and CONFLUENCE_SPACES not set.");
    return;
  }

  const syncEntries = loadSyncConfig(REPO_ROOT);
  const trackedIds = new Set(Object.keys(syncEntries));
  const spaceList = spaces.map((s) => `"${s}"`).join(", ");
  const cql = `space in (${spaceList}) AND type=page AND lastModified>='${since}'`;

  console.log(`Tracking ${trackedIds.size} pages in confluence-sync.json.`);
  console.log(`Spaces to scan: ${spaces.join(" ")}`);
  console.log(`Fetching pages modified on or after ${since}...`);
  console.log();

  console.log(
    `${"PAGE ID".padEnd(14)} ${"MODIFIED".padEnd(12)} ${"SYNCED".padEnd(12)} ${"STALE".padEnd(6)}  TITLE`
  );
  console.log(
    `${"---------".padEnd(14)} ${"----------".padEnd(12)} ${"----------".padEnd(12)} ${"-----".padEnd(6)}  -----`
  );

  let start = 0;
  let totalFetched = 0;
  let trackedCount = 0;
  let staleCount = 0;

  while (true) {
    const params = new URLSearchParams({
      cql,
      expand: "version",
      limit: String(PAGE_SIZE),
      start: String(start),
    });

    const url = `${CONFLUENCE_BASE}/rest/api/content/search?${params}`;
    let response;
    try {
      response = await fetch(url, {
        headers: { Authorization: authHeader() },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      console.error(`ERROR: fetch failed for start=${start}: ${err}`);
      break;
    }

    if (!response.ok) {
      console.error(
        `ERROR: Confluence API returned HTTP ${response.status} for start=${start}`
      );
      break;
    }

    const data = await response.json();
    const results = data.results ?? [];

    for (const r of results) {
      if (r.id.startsWith("att")) continue;

      const apiDate = r.version?.when ? r.version.when.slice(0, 10) : "\u2014";
      const title = r.title.replace(/\t/g, " ");
      const entry = syncEntries[r.id];
      const synced = entry?.synced ?? "\u2014";
      const isTracked = trackedIds.has(r.id);
      const isStale = isTracked && entry?.synced && apiDate > entry.synced;

      if (isTracked) trackedCount++;
      if (isStale) staleCount++;

      const staleFlag = !isTracked ? "—" : isStale ? "YES" : "no";

      console.log(
        `${r.id.padEnd(14)} ${apiDate.padEnd(12)} ${String(synced).padEnd(12)} ${staleFlag.padEnd(6)}  ${title}`
      );
      totalFetched++;
    }

    if (results.length < PAGE_SIZE) break;
    start += PAGE_SIZE;
  }

  console.log();
  console.log("--- Summary ---");
  console.log(`Spaces scanned                   : ${spaces.join(" ")}`);
  console.log(`Total pages modified since ${since} : ${totalFetched}`);
  console.log(`Tracked in confluence-sync.json  : ${trackedCount}`);
  console.log(`Stale (Confluence newer)         : ${staleCount}`);
  console.log();
  if (staleCount > 0) {
    console.log(`Run: node scripts/confluence-ingest.js   — to ingest stale pages`);
  }
}

main().catch((err) => console.error(`Unexpected error: ${err.message}`));
