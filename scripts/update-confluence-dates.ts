#!/usr/bin/env tsx
/**
 * update-confluence-dates.ts
 *
 * Reads all page IDs from confluence-map.md, fetches last-modified dates
 * from the Confluence REST API, and updates the "Last Modified" column in place.
 *
 * Usage: npx tsx scripts/update-confluence-dates.ts
 * Requires: ATLASSIAN_USERNAME and ATLASSIAN_API_TOKEN in .env (see .env.example)
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  CONFLUENCE_BASE,
  MAP_FILE,
  authHeader,
  loadMapIds,
  requireAtlassianCredentials,
} from "./config.js";

const BATCH_SIZE = 20;

async function fetchDate(pageId: string): Promise<[string, string]> {
  try {
    const url = `${CONFLUENCE_BASE}/rest/api/content/${pageId}?expand=version`;
    const response = await fetch(url, {
      headers: { Authorization: authHeader() },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return [pageId, "\u2014"];
    }

    const data = (await response.json()) as {
      statusCode?: number;
      version?: { when?: string };
    };

    if (data.statusCode) {
      return [pageId, "\u2014"];
    }

    const when = data.version?.when ?? "";
    return [pageId, when ? when.slice(0, 10) : "\u2014"];
  } catch {
    return [pageId, "\u2014"];
  }
}

async function main(): Promise<number> {
  requireAtlassianCredentials();

  const { ids } = loadMapIds(MAP_FILE);
  console.log(`Found ${ids.length} page IDs in ${MAP_FILE}`);
  console.log(`Fetching dates from Confluence API (batch size: ${BATCH_SIZE})...`);

  // Fetch dates in parallel batches
  const dates = new Map<string, string>();
  let done = 0;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchDate));
    for (const [id, date] of results) {
      dates.set(id, date);
    }
    done += batch.length;
    console.log(`  ${done} / ${ids.length} fetched`);
  }

  console.log(`All dates fetched. Updating ${MAP_FILE}...`);

  // Row pattern: | page_id | ... | parent | last_modified | summary | tags |
  // We replace the last_modified cell (4th column, index 3) only in data rows
  const ROW_RE =
    /^(\|\s*)(\d{7,})(\s*\|[^|]*\|[^|]*\|)\s*([^|]*?)\s*(\|.*)$/;

  const content = readFileSync(MAP_FILE, "utf-8");
  const lines = content.split("\n");
  let updated = 0;

  const linesOut = lines.map((line) => {
    const m = line.match(ROW_RE);
    if (m) {
      const pageId = m[2];
      const newDate = dates.get(pageId);
      if (newDate) {
        if (newDate !== m[4].trim()) {
          updated++;
        }
        return `${m[1]}${pageId}${m[3]} ${newDate} ${m[5]}`;
      }
    }
    return line;
  });

  writeFileSync(MAP_FILE, linesOut.join("\n"), "utf-8");
  console.log(`Done. Updated ${updated} rows.`);

  return 0;
}

main().then((code) => process.exit(code));
