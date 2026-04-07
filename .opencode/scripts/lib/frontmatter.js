/**
 * lib/frontmatter.js — YAML front matter parsing utilities.
 *
 * Exports:
 *   parseFrontmatter(content)         — parse YAML front matter → object (or {})
 *   hasFrontmatter(content)           — boolean: does the file start with ---?
 *   getFrontmatterField(content, field) — get a single field value (or undefined)
 *   stripFrontmatter(content)         — return body text without front matter block
 */

/**
 * Returns true if content starts with a YAML front matter block (---\n...\n---).
 */
export function hasFrontmatter(content) {
  return /^---\r?\n/.test(content);
}

/**
 * Parse the YAML front matter of a markdown file.
 * Returns a plain object. Does not require a full YAML parser — handles
 * the simple key: value / key: [list] patterns used in this journal.
 *
 * Returns {} if no front matter is present or parsing fails.
 */
export function parseFrontmatter(content) {
  if (!hasFrontmatter(content)) return {};

  const endMatch = content.match(/^---\r?\n([\s\S]*?)\n---\r?\n?/);
  if (!endMatch) return {};

  const block = endMatch[1];
  const result = {};

  // Parse line by line — handles scalar and flow-list values
  const lines = block.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) { i++; continue; }

    const key = line.slice(0, colonIdx).trim();
    const rawValue = line.slice(colonIdx + 1).trim();

    if (!key) { i++; continue; }

    // Flow list: [a, b, c]
    if (rawValue.startsWith("[")) {
      const inner = rawValue.replace(/^\[|\]$/g, "");
      result[key] = inner
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      i++;
      continue;
    }

    // Block list: next lines starting with "- "
    if (rawValue === "") {
      const items = [];
      i++;
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
        i++;
      }
      result[key] = items;
      continue;
    }

    // Scalar: strip quotes
    const scalar = rawValue.replace(/^["']|["']$/g, "");

    // Coerce booleans
    if (scalar === "true") { result[key] = true; i++; continue; }
    if (scalar === "false") { result[key] = false; i++; continue; }

    // Coerce integers
    if (/^\d+$/.test(scalar)) { result[key] = parseInt(scalar, 10); i++; continue; }

    result[key] = scalar;
    i++;
  }

  return result;
}

/**
 * Get a single field from front matter. Returns undefined if missing.
 */
export function getFrontmatterField(content, field) {
  const fm = parseFrontmatter(content);
  return fm[field];
}

/**
 * Return the content body with the front matter block stripped.
 * If no front matter, returns content unchanged.
 */
export function stripFrontmatter(content) {
  if (!hasFrontmatter(content)) return content;
  const match = content.match(/^---\r?\n[\s\S]*?\n---\r?\n?/);
  if (!match) return content;
  return content.slice(match[0].length);
}
