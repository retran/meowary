#!/usr/bin/env node
/**
 * fetch-source.js
 *
 * Fetch a URL and emit clean markdown to stdout.
 * Strips navigation, sidebars, ads, and other non-content HTML heuristically.
 *
 * Usage:
 *   node scripts/fetch-source.js <url>
 *
 * Exit 0 always.
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/fetch-source.js <url>");
  process.exit(0);
}

const url = args[0];
if (!/^https?:\/\//.test(url)) {
  console.error(`ERROR: URL must start with http:// or https://`);
  process.exit(0);
}

/**
 * Heuristically strip non-content HTML elements:
 * nav, header, footer, aside, scripts, styles, forms, ads.
 */
function stripHtml(html) {
  // Remove script/style blocks entirely
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Remove nav, aside, footer, form, header elements.
  // Note: nested same-tag elements (e.g. <nav>...<nav>...</nav>...</nav>) are not
  // handled — the inner close tag terminates the outer match, leaving trailing content.
  // Intentional heuristic limitation; output is good-enough for LLM input.
  text = text
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Convert heading tags to markdown
  text = text
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n")
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n")
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");

  // Convert common inline elements
  text = text
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "_$1_")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Convert lists
  text = text
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<\/[uo]l>/gi, "\n");

  // Convert paragraphs and line breaks
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "\n");

  // Convert code blocks
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n\n```\n$1\n```\n\n");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));

  // Collapse excessive blank lines
  text = text
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return text;
}

try {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; journal-fetch/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    console.error(`ERROR: HTTP ${response.status} fetching ${url}`);
    process.exit(0);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    const html = await response.text();
    const markdown = stripHtml(html);
    // Add source annotation at top
    console.log(`<!-- Source: ${url} -->\n`);
    console.log(markdown);
  } else if (contentType.includes("text/plain") || contentType.includes("text/markdown")) {
    const text = await response.text();
    console.log(`<!-- Source: ${url} -->\n`);
    console.log(text);
  } else {
    console.error(`ERROR: Unsupported content type: ${contentType}`);
    process.exit(0);
  }
} catch (err) {
  console.error(`ERROR: Failed to fetch ${url}: ${err.message}`);
}
