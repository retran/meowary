/**
 * lib/confluence.test.js — unit tests for lib/confluence.js
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { loadConfluenceIds } from "./confluence.js";

let dir;

beforeEach(() => {
  dir = mkdtempSync(resolve(tmpdir(), "confluence-test-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(relPath, content) {
  const abs = resolve(dir, relPath);
  mkdirSync(resolve(abs, ".."), { recursive: true });
  writeFileSync(abs, content, "utf-8");
}

// ---------------------------------------------------------------------------
// loadConfluenceIds
// ---------------------------------------------------------------------------

describe("loadConfluenceIds", () => {
  it("returns empty result when no .md files exist", () => {
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
    expect(inMap.size).toBe(0);
  });

  it("collects IDs from confluence: flow list", () => {
    write("resources/article.md", "---\ntags: []\nconfluence: [12345678, 99887766]\n---\n# Body\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(ids).toHaveLength(2);
    expect(inMap.has("12345678")).toBe(true);
    expect(inMap.has("99887766")).toBe(true);
  });

  it("collects IDs from confluence: block list", () => {
    write("resources/article.md", "---\ntags: []\nconfluence:\n  - 11223344\n  - 55667788\n---\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(inMap.has("11223344")).toBe(true);
    expect(inMap.has("55667788")).toBe(true);
  });

  it("skips files with no confluence field", () => {
    write("resources/no-confluence.md", "---\ntags: []\n---\n# Body\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
    expect(inMap.size).toBe(0);
  });

  it("skips files with confluence: []", () => {
    write("resources/empty.md", "---\ntags: []\nconfluence: []\n---\n# Body\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
    expect(inMap.size).toBe(0);
  });

  it("deduplicates IDs across multiple files", () => {
    write("resources/a.md", "---\nconfluence: [11111111, 22222222]\n---\n");
    write("resources/b.md", "---\nconfluence: [22222222, 33333333]\n---\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(ids).toHaveLength(3);
    expect(inMap.has("11111111")).toBe(true);
    expect(inMap.has("22222222")).toBe(true);
    expect(inMap.has("33333333")).toBe(true);
  });

  it("skips .git directory", () => {
    write(".git/COMMIT_EDITMSG", "fix: something");
    write(".git/config.md", "---\nconfluence: [99999999]\n---\n");
    const { ids } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
  });

  it("skips node_modules directory", () => {
    write("node_modules/pkg/README.md", "---\nconfluence: [88888888]\n---\n");
    const { ids } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
  });

  it("skips .opencode directory", () => {
    write(".opencode/commands/cmd.md", "---\nconfluence: [77777777]\n---\n");
    const { ids } = loadConfluenceIds(dir);
    expect(ids).toEqual([]);
  });

  it("inMap is the same Set as the source of ids", () => {
    write("resources/article.md", "---\nconfluence: [12345678]\n---\n");
    const { ids, inMap } = loadConfluenceIds(dir);
    expect(inMap).toBeInstanceOf(Set);
    for (const id of ids) {
      expect(inMap.has(id)).toBe(true);
    }
  });

  it("ignores non-array confluence field (scalar)", () => {
    write("resources/bad.md", "---\nconfluence: 12345678\n---\n");
    const { ids } = loadConfluenceIds(dir);
    // scalar string — parseFrontmatter returns a string, not array → skipped
    expect(ids).toEqual([]);
  });
});
