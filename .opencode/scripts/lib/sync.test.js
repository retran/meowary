/**
 * lib/sync.test.js — unit tests for lib/sync.js
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  loadSyncConfig,
  saveSyncConfig,
  markSynced,
  syncFilePath,
} from "./sync.js";

let dir;

beforeEach(() => {
  dir = mkdtempSync(resolve(tmpdir(), "sync-test-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// loadSyncConfig
// ---------------------------------------------------------------------------

describe("loadSyncConfig", () => {
  it("returns {} when file does not exist", () => {
    expect(loadSyncConfig(dir)).toEqual({});
  });

  it("returns {} when file is empty JSON object", () => {
    saveSyncConfig(dir, {});
    expect(loadSyncConfig(dir)).toEqual({});
  });

  it("loads page entries, skipping _ keys", () => {
    const path = syncFilePath(dir);
    const raw = {
      _comment: "ignore me",
      _schema: { pageId: {} },
      "12345678": { title: "Auth Flow", space: "ENG", synced: "2026-03-15" },
    };
    writeFileSync(path, JSON.stringify(raw));
    const entries = loadSyncConfig(dir);
    expect(entries["12345678"]).toEqual({ title: "Auth Flow", space: "ENG", synced: "2026-03-15" });
    expect(entries["_comment"]).toBeUndefined();
    expect(entries["_schema"]).toBeUndefined();
  });

  it("returns {} when file contains invalid JSON", () => {
    writeFileSync(syncFilePath(dir), "{ bad json");
    expect(loadSyncConfig(dir)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// saveSyncConfig
// ---------------------------------------------------------------------------

describe("saveSyncConfig", () => {
  it("writes entries as formatted JSON", () => {
    const entries = { "12345678": { title: "T", space: "S", synced: null } };
    saveSyncConfig(dir, entries);
    const raw = JSON.parse(readFileSync(syncFilePath(dir), "utf-8"));
    expect(raw["12345678"]).toEqual({ title: "T", space: "S", synced: null });
  });

  it("preserves _comment and _schema keys from existing file", () => {
    writeFileSync(
      syncFilePath(dir),
      JSON.stringify({ _comment: "keep me", _schema: {} })
    );
    saveSyncConfig(dir, { "99887766": { title: "X", space: "Y", synced: null } });
    const raw = JSON.parse(readFileSync(syncFilePath(dir), "utf-8"));
    expect(raw._comment).toBe("keep me");
    expect(raw["99887766"].title).toBe("X");
  });

  it("roundtrips through load/save", () => {
    const entries = {
      "11111111": { title: "One", space: "A", synced: "2026-01-01" },
      "22222222": { title: "Two", space: "B", synced: null },
    };
    saveSyncConfig(dir, entries);
    expect(loadSyncConfig(dir)).toEqual(entries);
  });
});

// ---------------------------------------------------------------------------
// markSynced
// ---------------------------------------------------------------------------

describe("markSynced", () => {
  it("updates synced date for an existing entry", () => {
    saveSyncConfig(dir, { "12345678": { title: "T", space: "S", synced: "2026-01-01" } });
    markSynced(dir, "12345678", "2026-04-07");
    expect(loadSyncConfig(dir)["12345678"].synced).toBe("2026-04-07");
  });

  it("creates a new entry if pageId does not exist", () => {
    markSynced(dir, "99999999", "2026-04-07");
    const entry = loadSyncConfig(dir)["99999999"];
    expect(entry.synced).toBe("2026-04-07");
  });

  it("preserves other fields when updating synced", () => {
    saveSyncConfig(dir, {
      "12345678": { title: "Auth Flow", space: "ENG", synced: null, resources: ["resources/eng/auth.md"] },
    });
    markSynced(dir, "12345678", "2026-04-07");
    const entry = loadSyncConfig(dir)["12345678"];
    expect(entry.title).toBe("Auth Flow");
    expect(entry.resources).toEqual(["resources/eng/auth.md"]);
    expect(entry.synced).toBe("2026-04-07");
  });
});
