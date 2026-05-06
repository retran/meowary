#!/usr/bin/env node
/**
 * confluence-ingest.js
 *
 * Ingests stale Confluence pages into local resource articles.
 *
 * A page is "stale" when its Confluence lastModified date is newer than
 * the `synced` date in confluence-sync.json, OR when synced is null.
 *
 * For each stale page this script:
 *   1. Builds a prompt asking OpenCode to read the Confluence page and
 *      update all relevant resource articles accordingly.
 *   2. Runs `opencode run <prompt>` (like run-operation.js).
 *   3. Updates the `synced` date in confluence-sync.json to today.
 *
 * Usage:
 *   node .opencode/scripts/confluence-ingest.js [--all] [pageId ...]
 *
 *   --all         Process all stale entries (default if no pageIds given)
 *   pageId ...    Process only the listed page IDs
 *
 * Exit 0 always.
 */

import { execSync, execFileSync } from "node:child_process";
import { JOURNAL_DIR, REPO_ROOT, CONFLUENCE_BASE, authHeader, requireAtlassianCredentials } from "./config.js";
import { loadSyncConfig, markSynced } from "./lib/sync.js";

const today = new Date().toISOString().slice(0, 10);

async function fetchPageMeta(pageId) {
  const url = `${CONFLUENCE_BASE}/rest/api/content/${pageId}?expand=version,space`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: authHeader() },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title ?? "",
      space: data.space?.key ?? "",
      apiDate: data.version?.when ? data.version.when.slice(0, 10) : null,
      url: data._links?.webui
        ? `${CONFLUENCE_BASE}${data._links.webui}`
        : null,
    };
  } catch {
    return null;
  }
}

function isStale(entry, apiDate) {
  if (!entry.synced) return true;
  if (!apiDate) return false;
  return apiDate > entry.synced;
}

function buildPrompt(pageId, meta, entry) {
  const pageUrl = meta?.url ?? `${CONFLUENCE_BASE}/pages/viewpage.action?pageId=${pageId}`;
  const title = meta?.title ?? entry.title ?? pageId;
  const apiDate = meta?.apiDate ?? "unknown";
  const lastSynced = entry.synced ?? "never";

  const resourceHints =
    entry.resources && entry.resources.length > 0
      ? `\n\nKnown related resource articles (hints — there may be others):\n${entry.resources.map((r) => `- ${r}`).join("\n")}`
      : "";

  return `Load the \`resources\` skill first.

Ingest an updated Confluence page into the local knowledge base.

Page: **${title}**
Page ID: ${pageId}
URL: ${pageUrl}
Confluence updated: ${apiDate}
Last ingested: ${lastSynced}
${resourceHints}

Instructions:
1. Fetch and read the Confluence page at the URL above using the confluence CLI or by loading it directly.
2. Identify which resource articles in \`resources/\` are relevant to the content on this page. Use QMD search and the hints above. There may be multiple articles, or none yet.
3. For each relevant existing article: apply Workflow A (actualize) — update facts, add new sections, update cross-references, set \`updated:\` to today.
4. If no existing article covers this topic, create a new resource article following the resources skill conventions.
5. Append to \`resources-log.md\`: one line noting this page was ingested.
6. Do NOT update confluence-sync.json — the script will handle that after you finish.`;
}

async function main() {
  requireAtlassianCredentials();

  const args = process.argv.slice(2).filter((a) => a !== "--all");
  const syncEntries = loadSyncConfig(REPO_ROOT);

  let targets;
  if (args.length > 0) {
    targets = args.map((id) => [id, syncEntries[id] ?? { title: "", space: "", synced: null }]);
  } else {
    // all stale entries — need API dates; fetch them
    targets = Object.entries(syncEntries);
  }

  if (targets.length === 0) {
    console.log("No entries in confluence-sync.json. Add pages to monitor first.");
    return;
  }

  console.log(`Checking ${targets.length} page(s)...`);

  const staleTargets = [];
  for (const [pageId, entry] of targets) {
    const meta = await fetchPageMeta(pageId);
    if (isStale(entry, meta?.apiDate ?? null)) {
      staleTargets.push({ pageId, entry, meta });
    }
  }

  if (staleTargets.length === 0) {
    console.log("All tracked pages are up to date.");
    return;
  }

  console.log(`Found ${staleTargets.length} stale page(s) to ingest.\n`);

  for (const { pageId, entry, meta } of staleTargets) {
    const title = meta?.title ?? entry.title ?? pageId;
    console.log(`\u2192 [${pageId}] ${title} (Confluence: ${meta?.apiDate ?? "?"}, last synced: ${entry.synced ?? "never"})`);

    const prompt = buildPrompt(pageId, meta, entry);

    // Snapshot sessions before run
    let beforeSessions = [];
    try {
      const out = execSync("opencode session list 2>/dev/null", { encoding: "utf-8", cwd: JOURNAL_DIR });
      beforeSessions = out.split("\n").filter((l) => /^ses_/.test(l.trim().split(/\s+/)[0])).map((l) => l.trim().split(/\s+/)[0]).sort();
    } catch { /* ignore */ }

    let success = true;
    try {
      execFileSync("opencode", ["run", prompt], {
        cwd: JOURNAL_DIR,
        stdio: "inherit",
        timeout: 900_000,
      });
    } catch (err) {
      if (err.signal === "SIGTERM") {
        console.error(`  ERROR: opencode run timed out after 15 minutes for page ${pageId}`);
      } else {
        console.error(`  ERROR: opencode run failed (exit ${err.status}) for page ${pageId}`);
      }
      success = false;
    }

    // Clean up new session
    try {
      const out = execSync("opencode session list 2>/dev/null", { encoding: "utf-8", cwd: JOURNAL_DIR });
      const afterSessions = out.split("\n").filter((l) => /^ses_/.test(l.trim().split(/\s+/)[0])).map((l) => l.trim().split(/\s+/)[0]).sort();
      const beforeSet = new Set(beforeSessions);
      const newSession = afterSessions.find((s) => !beforeSet.has(s));
      if (newSession) {
        execSync(`opencode session delete ${newSession}`, { cwd: JOURNAL_DIR, stdio: "inherit" });
      }
    } catch { /* ignore */ }

    if (success) {
      markSynced(REPO_ROOT, pageId, today);
      console.log(`  \u2713 Marked synced: ${today}\n`);
    } else {
      console.log(`  \u2717 Skipped sync date update due to error.\n`);
    }
  }

  console.log("Done.");
}

main().catch((err) => console.error(`Unexpected error: ${err.message}`));
