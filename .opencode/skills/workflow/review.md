---
name: workflow/review
description: "Review code changes or documents against project conventions, find issues, suggest fixes."
compatibility: opencode
depends_on:
  - workflow
---

# Review Phase

Systematically review code changes or documents for correctness, style, completeness, and quality.

## When to Use

- User asks to review code, a diff, a PR/MR, or a document
- After implementation, before merging or publishing
- When examining unfamiliar code or content to assess quality

## Workflow

### Step 0: Load Context

**Code mode:**
1. Read `style.md`, `patterns.md`, `testing.md`, `safety.md`
2. If reviewing a PR/MR, fetch the diff and description:
   - **GitLab MR:** load the `scm` skill, use `glab mr diff <id>`
   - **GitHub PR:** load the `scm` skill, use `gh pr diff <id>`
3. To review commit messages against convention, read `.opencode/reference/conventions.md`

**Document mode:**
1. Load the `writing` skill for style and formatting rules
2. Read the document and any related spec or plan

### Step 1: Gather the Material

**Code mode — determine what to review:**
- **Git diff:** `git --no-pager diff` or `git --no-pager diff branch...HEAD`
- **Specific files:** Read the files the user specified
- **MR/PR:** Use `glab` or `gh` to fetch the diff
- **Recent changes:** `git --no-pager log --oneline -10` + diffs of relevant commits

**Document mode — determine what to review:**
- Read the document in full
- Read the spec/plan it was based on (if any)
- Check cross-links and referenced resources

### Step 2: Analyze

#### Code Mode Categories

Review in this order — stop early if critical issues are found.

**Correctness:** Does the code do what it claims? Edge cases handled? Error paths covered? Does it break existing behavior or contracts?

**Security:**
- No secrets, tokens, or credentials in code or comments
- Input validated and sanitised at all trust boundaries
- Parameterized queries — no string concatenation for SQL/commands
- Auth checks present where required
- No insecure deserialization, path traversal, or prototype pollution patterns

**Performance:**
- No unnecessary allocations in hot paths
- No N+1 queries — check loops that call DB/API
- No blocking calls in async contexts
- No unbounded loops or quadratic algorithms on untrusted input

**Style:** Matches project conventions? Consistent naming? Appropriate abstraction level? No dead code left in?

**Testing:** New code has tests? Tests cover important paths and edge cases? Tests describe behavior, not implementation details?

#### Document Mode Categories

**Completeness:** Does it cover everything the spec/plan outlined? Are there gaps?

**Accuracy:** Are facts correct? Do cross-references point to the right targets? Are dates and names accurate?

**Clarity:** Is the writing clear and concise? Does it follow `writing` skill rules? No filler or jargon without explanation?

**Structure:** Does it follow the expected template? Are sections in the right order? Is front matter complete?

**Audience fit:** Will the intended reader understand this? Is the level of detail appropriate?

### Step 3: Write Findings

Present findings in structured format:

```
### <severity>: <short title>

**Location:** `path/to/file.ts:42`
**Issue:** <what's wrong and why it matters>
**Recommendation:** <specific fix or alternative>
```

For document reviews, use section references instead of file:line:
```
**Location:** Section: Background, paragraph 2
```

Severity levels:

| Severity | Meaning | Action |
|----------|---------|--------|
| `critical` | Bug, security issue, factual error, data loss risk | Must fix before merge/publish |
| `warning` | Wrong pattern, missing content, misleading text, missing tests | Should fix |
| `nit` | Style, naming, minor improvement | Nice to have |

### Step 4: Summary

After all findings:
1. Total finding count by severity: e.g. "2 critical, 1 warning, 3 nits"
2. Overall assessment: **"Approve"**, **"Approve with nits"**, or **"Request changes"**
3. Offer: "Want me to fix the critical/warning issues?"

If there are no critical or warning findings: approve. If there are critical findings: request changes regardless of anything else.

## Review Principles

- **Be specific.** "This function doesn't handle the case where `userId` is undefined" beats "needs better error handling."
- **Be constructive.** Every criticism includes a recommendation.
- **Be proportional.** Do not block a merge over nits. Do not approve with unhandled security issues or factual errors.
- **Respect intent.** Understand what the author was trying to do before suggesting a different approach.
- **No style wars.** If the codebase/document set is inconsistent, point it out once. Do not rewrite everything.
