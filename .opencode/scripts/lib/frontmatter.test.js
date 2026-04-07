/**
 * lib/frontmatter.test.js — unit tests for lib/frontmatter.js
 */

import { describe, it, expect } from "vitest";
import {
  hasFrontmatter,
  parseFrontmatter,
  getFrontmatterField,
  stripFrontmatter,
} from "./frontmatter.js";

// ---------------------------------------------------------------------------
// hasFrontmatter
// ---------------------------------------------------------------------------

describe("hasFrontmatter", () => {
  it("returns true when content starts with ---", () => {
    expect(hasFrontmatter("---\ntitle: Test\n---\n# Body")).toBe(true);
  });

  it("returns false when no front matter", () => {
    expect(hasFrontmatter("# Just a heading")).toBe(false);
  });

  it("returns false when --- is not on first line", () => {
    expect(hasFrontmatter("\n---\ntitle: Test\n---\n")).toBe(false);
  });

  it("handles CRLF line endings", () => {
    expect(hasFrontmatter("---\r\ntitle: Test\r\n---\r\n")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------

describe("parseFrontmatter", () => {
  it("parses scalar string fields", () => {
    const content = "---\ntitle: Hello World\nupdated: 2026-01-15\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.title).toBe("Hello World");
    expect(fm.updated).toBe("2026-01-15");
  });

  it("parses a flow list", () => {
    const content = "---\ntags: [foo, bar, baz]\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.tags).toEqual(["foo", "bar", "baz"]);
  });

  it("parses an empty flow list", () => {
    const content = "---\ntags: []\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.tags).toEqual([]);
  });

  it("parses a block list", () => {
    const content = "---\nsources:\n  - alpha\n  - beta\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.sources).toEqual(["alpha", "beta"]);
  });

  it("parses boolean values", () => {
    const content = "---\ndraft: true\npublished: false\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.draft).toBe(true);
    expect(fm.published).toBe(false);
  });

  it("parses integer values", () => {
    const content = "---\nweight: 42\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm.weight).toBe(42);
  });

  it("strips quotes from string values", () => {
    const content = '---\ntitle: "Quoted Title"\n---\n';
    const fm = parseFrontmatter(content);
    expect(fm.title).toBe("Quoted Title");
  });

  it("returns {} when no front matter", () => {
    expect(parseFrontmatter("# Just a heading")).toEqual({});
  });

  it("handles multifield front matter correctly", () => {
    const content =
      "---\ntitle: My Article\nupdated: 2026-03-01\ntags: [a, b]\nstatus: active\n---\n# Body";
    const fm = parseFrontmatter(content);
    expect(fm.title).toBe("My Article");
    expect(fm.updated).toBe("2026-03-01");
    expect(fm.tags).toEqual(["a", "b"]);
    expect(fm.status).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// getFrontmatterField
// ---------------------------------------------------------------------------

describe("getFrontmatterField", () => {
  const content = "---\ntitle: Test\ntags: [x, y]\nupdated: 2026-01-01\n---\n";

  it("returns the correct value for an existing field", () => {
    expect(getFrontmatterField(content, "title")).toBe("Test");
  });

  it("returns an array for list fields", () => {
    expect(getFrontmatterField(content, "tags")).toEqual(["x", "y"]);
  });

  it("returns undefined for missing field", () => {
    expect(getFrontmatterField(content, "nonexistent")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// stripFrontmatter
// ---------------------------------------------------------------------------

describe("stripFrontmatter", () => {
  it("strips the front matter block", () => {
    const content = "---\ntitle: Test\n---\n# Heading\n\nBody text.";
    const body = stripFrontmatter(content);
    expect(body).toBe("# Heading\n\nBody text.");
    expect(body).not.toContain("title:");
  });

  it("returns content unchanged when no front matter", () => {
    const content = "# No front matter";
    expect(stripFrontmatter(content)).toBe(content);
  });
});
