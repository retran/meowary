#!/usr/bin/env tsx
/**
 * fetch-missing-pages.ts
 *
 * Enumerates ALL pages in one or more Confluence spaces and reports which ones
 * are not yet in confluence-map.md.
 *
 * Usage:
 *   npx tsx scripts/fetch-missing-pages.ts [SPACE1 SPACE2 ...]
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

interface ContentResponse {
  results: ConfluenceResult[];
}

async function main(): Promise<number> {
  requireAtlassianCredentials();

  const args = process.argv.slice(2);
  const spaces = args.length > 0 ? args : CONFLUENCE_DEFAULT_SPACES;
  if (spaces.length === 0) {
    console.error("ERROR: No spaces specified and CONFLUENCE_SPACES not set.");
    return 1;
  }

  const { ids, inMap } = loadMapIds(MAP_FILE);
  console.log(`Map contains ${ids.length} page IDs.`);
  console.log(`Spaces to scan: ${spaces.join(" ")}`);
  console.log();

  console.log(
    `${"SPACE".padEnd(10)} ${"PAGE ID".padEnd(14)} ${"MODIFIED".padEnd(12)}  TITLE`
  );
  console.log(
    `${"-----".padEnd(10)} ${"---------".padEnd(14)} ${"----------".padEnd(12)}  -----`
  );

  let totalSeen = 0;
  let missingCount = 0;
  let inMapCount = 0;

  for (const space of spaces) {
    process.stderr.write(`  --- Scanning space: ${space} ---\n`);
    let start = 0;

    while (true) {
      const params = new URLSearchParams({
        spaceKey: space,
        type: "page",
        status: "current",
        expand: "version",
        limit: String(PAGE_SIZE),
        start: String(start),
      });

      const url = `${CONFLUENCE_BASE}/rest/api/content?${params}`;
      let response: Response;
      try {
        response = await fetch(url, {
          headers: { Authorization: authHeader() },
          signal: AbortSignal.timeout(30_000),
        });
      } catch (err) {
        console.error(
          `ERROR: fetch failed for space=${space} start=${start}: ${err}`
        );
        break;
      }

      if (!response.ok) {
        console.error(
          `ERROR: Confluence API returned HTTP ${response.status} for space=${space} start=${start}`
        );
        break;
      }

      const data = (await response.json()) as ContentResponse;
      const results = data.results ?? [];

      for (const r of results) {
        totalSeen++;
        const when = r.version?.when ?? "";
        const date = when ? when.slice(0, 10) : "\u2014";
        const title = r.title.replace(/\t/g, " ");

        if (inMap.has(r.id)) {
          inMapCount++;
        } else {
          missingCount++;
          console.log(
            `${space.padEnd(10)} ${r.id.padEnd(14)} ${date.padEnd(12)}  ${title}`
          );
        }
      }

      if (results.length < PAGE_SIZE) break;
      start += PAGE_SIZE;
      process.stderr.write(`  ... ${totalSeen} pages scanned so far\n`);
    }
  }

  console.log();
  console.log("--- Summary ---");
  console.log(`Spaces scanned        : ${spaces.join(" ")}`);
  console.log(`Total pages seen      : ${totalSeen}`);
  console.log(`Already in map        : ${inMapCount}`);
  console.log(`Missing from map      : ${missingCount}`);

  return 0;
}

main().then((code) => process.exit(code));
