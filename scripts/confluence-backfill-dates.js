#!/usr/bin/env node
/**
 * confluence-backfill-dates.js
 *
 * Reads all page IDs from confluence-map.md, fetches last-modified dates
 * from the Confluence REST API, and updates the "Last Modified" column in place.
 *
 * Usage: node scripts/confluence-backfill-dates.js
 * Requires: ATLASSIAN_USERNAME and ATLASSIAN_API_TOKEN in .env (see .env.example)
 *
 * Exit 0 always.
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

async function fetchDate(pageId) {
  try {
    const url = `${CONFLUENCE_BASE}/rest/api/content/${pageId}?expand=version`;
    const response = await fetch(url, {
      headers: { Authorization: authHeader() },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return [pageId, "\u2014"];

    const data = await response.json();
    if (data.statusCode) return [pageId, "\u2014"];

    const when = data.version?.when ?? "";
    return [pageId, when ? when.slice(0, 10) : "\u2014"];
  } catch {
    return [pageId, "\u2014"];
  }
}

async function main() {
  requireAtlassianCredentials();

  const { ids } = loadMapIds(MAP_FILE);
  console.log(`Found ${ids.length} page IDs in ${MAP_FILE}`);
  console.log(`Fetching dates from Confluence API (batch size: ${BATCH_SIZE})...`);

  const dates = new Map();
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

  // Row pattern: match a data row whose second cell is a 7+-digit page ID.
  // Group layout: m[1]=leading pipe+space, m[2]=pageId, m[3]=next two cells,
  // m[4]=last_modified cell value, m[5]=remainder of row.
  // Replaces the last_modified cell in place regardless of column count changes.
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
        if (newDate !== m[4].trim()) updated++;
        return `${m[1]}${pageId}${m[3]} ${newDate} ${m[5]}`;
      }
    }
    return line;
  });

  writeFileSync(MAP_FILE, linesOut.join("\n"), "utf-8");
  console.log(`Done. Updated ${updated} rows.`);
}

main().catch((err) => console.error(`Unexpected error: ${err.message}`));
