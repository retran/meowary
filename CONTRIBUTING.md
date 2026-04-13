# Contributing to Meowary

Thank you for your interest in Meowary. This project is in early development (v0.1.0) and maintained by a single developer. Contributions are welcome — response times may vary.

## Project Status

Meowary is a personal knowledge management template built around [OpenCode](https://opencode.ai). The architecture is stabilizing, but expect changes to workflows, skills, and scripts between releases.

## Reporting Issues

Open a [GitHub Issue](https://github.com/retran/meowary/issues) with:

- A clear title describing the problem
- Steps to reproduce (if applicable)
- Expected behavior vs. actual behavior
- Your environment: macOS or WSL, Node.js version, OpenCode version

## Proposing Changes

For non-trivial changes, **open an issue first** to discuss the approach before writing code. This saves time for both of us.

When you are ready:

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Submit a pull request with a description of *what* changed and *why*

## Code Style

- **Markdown files** follow the rules in `.markdownlint.yaml` (whitespace hygiene: no trailing spaces, no hard tabs, blank lines around headings, code blocks, and lists)
- **JavaScript files** (`.opencode/scripts/`) use ESM (`import`/`export`), no TypeScript, no build step — scripts run directly with Node.js >= 22
- **Front matter** in all `.md` content files must include `updated` and `tags` fields
- **American English** spelling throughout

## What Makes a Good PR

- Small and focused — one concern per pull request
- Includes a description of the change and its motivation
- Does not break existing workflows or scripts
- Follows the code style conventions above

## Tests

The project includes vitest tests in `.opencode/scripts/lib/`. Run them with:

```bash
cd .opencode/scripts && npm test
```

If your change affects script behavior, add or update tests.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
