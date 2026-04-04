/**
 * lib/graph.test.js — unit tests for lib/graph.js
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

import { readKnowledgeGraph, listResourceFiles, getGraphEntry } from "./graph.js";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let fixtureDir;

beforeEach(() => {
  fixtureDir = resolve(tmpdir(), `graph-test-${Date.now()}`);
  mkdirSync(fixtureDir, { recursive: true });
});

afterEach(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

function write(rel, content) {
  const full = join(fixtureDir, rel);
  mkdirSync(resolve(full, ".."), { recursive: true });
  writeFileSync(full, content, "utf-8");
  return full;
}

const GRAPH_CONTENT = `---
type: meta
updated: 2026-01-01
tags: []
---

# Knowledge Graph

## Resources

| File | Topics | Tags | People | Teams | Projects |
|------|--------|------|--------|-------|---------|
| [Alpha](resources/eng/alpha.md) | architecture | eng | | platform-team | p-infra |
| [Beta](resources/tools/beta.md) | ci, deployment | devops | alice | | |
| [Gamma](resources/people/gamma.md) | | | gamma | | |
`;

// ---------------------------------------------------------------------------
// readKnowledgeGraph
// ---------------------------------------------------------------------------

describe("readKnowledgeGraph", () => {
  it("reads the file and returns its content", () => {
    const graphFile = write("knowledge-graph.md", GRAPH_CONTENT);
    const content = readKnowledgeGraph(graphFile);
    expect(content).toContain("Knowledge Graph");
    expect(content).toContain("alpha.md");
  });
});

// ---------------------------------------------------------------------------
// listResourceFiles
// ---------------------------------------------------------------------------

describe("listResourceFiles", () => {
  it("returns only .md files under the resources root", () => {
    write("resources/eng/alpha.md", "# Alpha");
    write("resources/tools/beta.md", "# Beta");
    write("resources/tools/beta.txt", "not markdown");
    write("resources/eng/notes.md", "# Notes");

    const resourcesDir = join(fixtureDir, "resources");
    const files = listResourceFiles(resourcesDir);
    const rels = files.map((f) => f.replace(fixtureDir + "/", "")).sort();
    expect(rels).toEqual([
      "resources/eng/alpha.md",
      "resources/eng/notes.md",
      "resources/tools/beta.md",
    ]);
  });

  it("returns an empty array for an empty directory", () => {
    mkdirSync(join(fixtureDir, "resources"), { recursive: true });
    const files = listResourceFiles(join(fixtureDir, "resources"));
    expect(files).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getGraphEntry
// ---------------------------------------------------------------------------

describe("getGraphEntry", () => {
  it("returns matching table rows for a file by basename", () => {
    const entries = getGraphEntry("resources/eng/alpha.md", GRAPH_CONTENT);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toContain("alpha.md");
  });

  it("returns multiple rows if basename appears multiple times", () => {
    const multiContent = GRAPH_CONTENT +
      "| [Alpha Dup](resources/archive/alpha.md) | duplicate | | | | |\n";
    const entries = getGraphEntry("alpha.md", multiContent);
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty array when file not in graph", () => {
    const entries = getGraphEntry("resources/missing/unknown.md", GRAPH_CONTENT);
    expect(entries).toEqual([]);
  });

  it("only returns table rows (lines starting with |)", () => {
    const entries = getGraphEntry("alpha.md", GRAPH_CONTENT);
    for (const entry of entries) {
      expect(entry.startsWith("|")).toBe(true);
    }
  });
});
