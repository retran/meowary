---
updated: 2026-04-01
---

# Testing Conventions

## Journal Repo

No automated tests — this is a Markdown-only repo. Quality assurance:
- Front matter validation: all required fields present, correct types
- Link checking: all relative links resolve to existing files
- Tag consistency: tags in files match `tags.md` registry

## Journal Scripts

Scripts in `scripts/` are plain JavaScript (ESM). No compilation step.

### Framework
- Vitest for unit tests (works with ESM `.js` files)

### Structure
- Co-locate test files: `foo.js` → `foo.test.js` in the same directory
- Test utility functions from `scripts/lib/` (parsing, link extraction, graph reads)
- Scripts with side-effects (fetch, file writes) are not unit-tested; verify by smoke-running against the repo

### Conventions
- Test names describe behavior: `"returns empty array when file has no links"`
- Arrange-Act-Assert. One assertion per test when practical.
- Mock the filesystem with fixtures for lib/ unit tests; never mock the unit under test.

## TypeScript Projects

### Framework
- Vitest for unit and integration tests (preferred over Jest)
- Playwright for E2E (if applicable)

### Structure
- Co-locate test files: `foo.ts` → `foo.test.ts` in same directory
- Test file names mirror source: `getUserPermissions.ts` → `getUserPermissions.test.ts`
- Group with `describe` blocks matching the function or class name

### Conventions
- Test names describe behavior: `"returns empty array when user has no permissions"`
- Arrange-Act-Assert pattern. One assertion per test when practical.
- No test interdependency. Each test sets up its own state.
- Mock external dependencies (network, database, filesystem). Never mock the unit under test.
- Use factories for test data. Never hardcode fixture objects inline.

### Coverage
- Aim for meaningful coverage, not line count. Test edge cases and error paths.
- Every bug fix includes a regression test.
- Skip flaky tests with `it.skip` + TODO comment linking to the fix issue.

## C# / .NET Projects

- xUnit for test framework
- Co-locate or use `*.Tests` project alongside source project
- `Fact` for simple tests, `Theory` + `InlineData` for parameterized
- Use `FluentAssertions` for readable assertions
