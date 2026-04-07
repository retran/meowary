/**
 * lib/links.test.js — unit tests for lib/links.js
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

import {
  findMdFiles,
  extractLinks,
  resolveLink,
  findBacklinks,
  findRelatedSectionText,
  findRelatedSectionLines,
  isWithinDir,
} from "./links.js";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let fixtureDir;

beforeEach(() => {
  fixtureDir = resolve(tmpdir(), `links-test-${Date.now()}`);
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

// ---------------------------------------------------------------------------
// extractLinks
// ---------------------------------------------------------------------------

describe("extractLinks", () => {
  it("extracts a simple relative link", () => {
    const links = extractLinks("[Foo](foo.md)");
    expect(links).toEqual([{ display: "Foo", path: "foo.md" }]);
  });

  it("extracts a link with an anchor and strips it", () => {
    const links = extractLinks("[Bar](bar.md#section)");
    expect(links).toEqual([{ display: "Bar", path: "bar.md" }]);
  });

  it("excludes http links", () => {
    const links = extractLinks("[External](https://example.com/page.md)");
    expect(links).toHaveLength(0);
  });

  it("handles nested brackets in display text", () => {
    const links = extractLinks("[[ADR-001] Title](adr/001.md)");
    expect(links).toHaveLength(1);
    expect(links[0].path).toBe("adr/001.md");
  });

  it("extracts multiple links from text", () => {
    const text = "See [Alpha](alpha.md) and [Beta](sub/beta.md)";
    const links = extractLinks(text);
    expect(links).toHaveLength(2);
    expect(links[0].path).toBe("alpha.md");
    expect(links[1].path).toBe("sub/beta.md");
  });

  it("returns empty array when no links present", () => {
    expect(extractLinks("No links here")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// resolveLink
// ---------------------------------------------------------------------------

describe("resolveLink", () => {
  it("resolves a relative link from the source file directory", () => {
    const source = "/repo/resources/eng/alpha.md";
    const result = resolveLink(source, "beta.md");
    expect(result).toBe("/repo/resources/eng/beta.md");
  });

  it("resolves a parent-relative link", () => {
    const source = "/repo/resources/eng/alpha.md";
    const result = resolveLink(source, "../tools/tool.md");
    expect(result).toBe("/repo/resources/tools/tool.md");
  });

  it("resolves a subdirectory link", () => {
    const source = "/repo/resources/index.md";
    const result = resolveLink(source, "eng/alpha.md");
    expect(result).toBe("/repo/resources/eng/alpha.md");
  });
});

// ---------------------------------------------------------------------------
// findMdFiles
// ---------------------------------------------------------------------------

describe("findMdFiles", () => {
  it("returns all .md files recursively", () => {
    write("a.md", "# A");
    write("sub/b.md", "# B");
    write("sub/c.txt", "not markdown");
    const files = findMdFiles(fixtureDir);
    const rels = files.map((f) => f.replace(fixtureDir + "/", "")).sort();
    expect(rels).toEqual(["a.md", "sub/b.md"]);
  });

  it("returns sorted results", () => {
    write("z.md", "");
    write("a.md", "");
    write("m.md", "");
    const files = findMdFiles(fixtureDir);
    const rels = files.map((f) => f.replace(fixtureDir + "/", ""));
    expect(rels).toEqual([...rels].sort());
  });

  it("returns empty array for empty directory", () => {
    const files = findMdFiles(fixtureDir);
    expect(files).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// findBacklinks
// ---------------------------------------------------------------------------

describe("findBacklinks", () => {
  it("finds files that link to a target", () => {
    const target = write("target.md", "# Target");
    write("a.md", "See [Target](target.md)");
    write("b.md", "No link here");
    write("c.md", "Also see [Target](target.md)");

    const backlinks = findBacklinks(target, fixtureDir);
    const rels = backlinks.map((f) => f.replace(fixtureDir + "/", "")).sort();
    expect(rels).toEqual(["a.md", "c.md"]);
  });

  it("excludes the target file itself", () => {
    const target = write("self.md", "Self [link](self.md)");
    const backlinks = findBacklinks(target, fixtureDir);
    expect(backlinks).toHaveLength(0);
  });

  it("returns empty array when no files link to target", () => {
    const target = write("lonely.md", "# Lonely");
    write("other.md", "No links here");
    const backlinks = findBacklinks(target, fixtureDir);
    expect(backlinks).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// findRelatedSectionText
// ---------------------------------------------------------------------------

describe("findRelatedSectionText", () => {
  it("returns Related section content", () => {
    const content = "# Title\n\n## Overview\n\nText\n\n## Related\n\n- [A](a.md)\n\n## Other\n\nFoo";
    const text = findRelatedSectionText(content);
    expect(text).toContain("[A](a.md)");
    expect(text).not.toContain("## Other");
  });

  it("matches Cross-references header", () => {
    const content = "## Cross-references\n\n- [B](b.md)\n\n## Next\n";
    const text = findRelatedSectionText(content);
    expect(text).toContain("[B](b.md)");
  });

  it("returns null when no Related section", () => {
    const content = "# Title\n\n## Overview\n\nText\n";
    expect(findRelatedSectionText(content)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isWithinDir
// ---------------------------------------------------------------------------

describe("isWithinDir", () => {
  it("returns true for a file inside the dir", () => {
    expect(isWithinDir("/repo/resources/eng/foo.md", "/repo/resources")).toBe(true);
  });

  it("returns false for a file outside the dir", () => {
    expect(isWithinDir("/repo/journal/daily.md", "/repo/resources")).toBe(false);
  });

  it("returns true for the dir itself", () => {
    expect(isWithinDir("/repo/resources", "/repo/resources")).toBe(true);
  });
});
