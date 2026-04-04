#!/usr/bin/env tsx
/**
 * fetch-confluence-updates.ts
 *
 * Fetches all Confluence pages modified on or after a given date across one or
 * more spaces, and cross-references with confluence-map.md to show which local
 * map entries need to be re-read.
 *
 * Usage:
 *   npx tsx scripts/fetch-confluence-updates.ts YYYY-MM-DD [SPACE1 SPACE2 ...]
 *   Default spaces: set CONFLUENCE_SPACES in .env (space-separated list)
 */

import {
  CONFLUENCE_BASE,
  CONFLUENCE_DEFAULT_SPACES,
  MAP_FILE,
  authHeader,
  loadMapIds,
  requireAtlassianCredentials,
} from "./config.js";

const PAGE_SIZE = 50;

interface ConfluenceResult {
  id: string;
  title: string;
  version?: { when?: string };
}

interface SearchResponse {
  results: ConfluenceResult[];
}

async function main(): Promise<number> {
  // Parse args
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: fetch-confluence-updates.ts YYYY-MM-DD [SPACE1 SPACE2 ...]");
    return 1;
  }

  const since = args[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    console.error("ERROR: Date must be in YYYY-MM-DD format.");
    return 1;
  }

  requireAtlassianCredentials();

  const spaces = args.length > 1 ? args.slice(1) : CONFLUENCE_DEFAULT_SPACES;
  if (spaces.length === 0) {
    console.error("ERROR: No spaces specified and CONFLUENCE_SPACES not set.");
    return 1;
  }

  const { ids, inMap } = loadMapIds(MAP_FILE);
  const spaceList = spaces.map((s) => `"${s}"`).join(", ");
  const cql = `space in (${spaceList}) AND type=page AND lastModified>='${since}'`;

  console.log(`Map contains ${ids.length} page IDs.`);
  console.log(`Spaces to scan: ${spaces.join(" ")}`);
  console.log(`Fetching pages modified on or after ${since}...`);
  console.log();

  // Table header
  console.log(
    `${"PAGE ID".padEnd(14)} ${"MODIFIED".padEnd(12)} ${"IN MAP".padEnd(8)}  TITLE`
  );
  console.log(
    `${"---------".padEnd(14)} ${"----------".padEnd(12)} ${"------".padEnd(8)}  -----`
  );

  let start = 0;
  let totalFetched = 0;
  let inMapCount = 0;
  let notInMapCount = 0;

  while (true) {
    const params = new URLSearchParams({
      cql,
      expand: "version",
      limit: String(PAGE_SIZE),
      start: String(start),
    });

    const url = `${CONFLUENCE_BASE}/rest/api/content/search?${params}`;
    let response: Response;
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

    const data = (await response.json()) as SearchResponse;
    const results = data.results ?? [];

    for (const r of results) {
      if (r.id.startsWith("att")) continue; // skip attachments

      const when = r.version?.when ?? "";
      const date = when ? when.slice(0, 10) : "\u2014";
      const title = r.title.replace(/\t/g, " ");
      const status = inMap.has(r.id) ? "YES" : "NO";

      if (status === "YES") inMapCount++;
      else notInMapCount++;

      console.log(
        `${r.id.padEnd(14)} ${date.padEnd(12)} ${status.padEnd(8)}  ${title}`
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
  console.log(`In confluence-map.md             : ${inMapCount}`);
  console.log(`Not in confluence-map.md         : ${notInMapCount}`);

  return 0;
}

main().then((code) => process.exit(code));
