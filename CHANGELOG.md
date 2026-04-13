# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.1] - 2026-04-13

### Fixed

- README rewritten for publication quality across three review passes
- Corrected Context7, RTK, and Jira CLI install instructions
- Added `.env` excerpt, tier system explanation, and `/bootstrap` details to Quick Start
- Moved integrations table into Quick Start section
- Expanded lifecycle workflow descriptions with full per-phase detail
- Added `opencode.json` to the structure tree
- Removed stale skills directory count from structure tree
- Softened `/do debug` regression test claim to match actual workflow behavior
- Minor prose fixes: pronoun agreement, placeholder path note, reduced redundancy

## [0.1.0] - 2026-04-13

### Added

- Initial public release
- PARA-structured personal knowledge management template for [OpenCode](https://opencode.ai)
- Progressive disclosure architecture: AGENTS.md, skills, workflows, and codebase context load on demand
- Daily workflow: `/morning`, `/evening`, `/standup`, `/capture`, `/meeting`
- Weekly workflow: `/weekly` with Monday planning and Friday wrap-up
- Lifecycle workflows via `/do`: scout, research, brainstorm, plan, design, write, implement, test, self-review, resolve, debug, peer-review
- Knowledge graph workflows via `/r`: enrich, sync, plan, discover, ops, ingest
- 14 skill directories covering journal, resources, projects, areas, inbox, SCM, and more
- 24 workflow files with tiered execution (quick / standard / full)
- QMD semantic search integration for querying the knowledge base
- CLI integrations: Confluence, Jira, GitHub (`gh`), GitLab (`glab`), repomix, RTK
- Helper scripts for health checks, backlink detection, resource planning, and Confluence sync
- macOS and WSL installation paths documented

[Unreleased]: https://github.com/retran/meowary/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/retran/meowary/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/retran/meowary/releases/tag/v0.1.0
