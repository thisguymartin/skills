# Changelog

## Unreleased

- Added notion-brain to save chained research, planning, and artifacts as one Martin's Brain record, recall sourced context, and update a named entry with dated findings. Included live schema routing, attachment/retry handling, draft mode, and synthetic behavior scenarios.
- Added yaak-query for native CLI discovery, scoped saved-request queries, response evidence, and requested saved-query edits. Documented Yaak installation and retained the official skill's MIT notice.
- Replaced the previous product-shaping/artifact collection with five independent research skills: project-research, gather-context, plan-artifact, session-history and cloud-investigate.
- Preserved Excalidraw and its launcher; removed the parallel-lanes entrypoint and its sibling dependency.
- Added helpers for GitHub reads, scoped local conversation searches, and dependency-free HTML/SVG brief rendering. AWS queue/log investigation uses native AWS CLI commands with an account check in the workflow.
- Documented required CLI installs, authentication, MCP fallbacks, local installation and removal of older global copies.
- Added pinned online research, retained/adapted license notices, synthetic scenarios and runtime tests. Updated repository guidance to the research toolkit scope without automatic Pstack invocation.
- Unified validation and CI so flat layout, local links, packaging and helper behavior are checked together.

## 0.2.0 — 2026-09-25

- Migrated the four research/artifact skills (`scribble`, `scribble-research`, `source-synthesis`, `tool-evaluation`) from the scribble repository, normalizing frontmatter to the `name`/`description`/`license` subset and dropping command shims and plugin manifests.
- Documented the quartet's shared-reference grouping and updated install/remove commands and skill counts from nine to thirteen.
- Replaced pre-publication wording now that the repository is live at `thisguymartin/skills`.
- Added `docs/execution-plan.md`: consolidation decisions, provider-lane research, risks, and ordered follow-ups.
- Added `docs/pstack-fork-bootstrap.md`: a standalone prompt that generates the `pstack-flex` fork of Open Pstack with optional model families and MiniMax/DeepSeek lanes.
- Merged scribble's privacy, authoring, and communication rules into `AGENTS.md`.

## 0.1.0 — 2026-09-08

- Added nine composable feature-preparation skills, from investigation through reviewed specs, Linear, and cold-start handoffs.
- Established native Open Pstack as the implementation destination without vendoring its skills.
- Added portable references, workflows, synthetic scenario fixtures, and a worked UI feature example.
- Documented pinned upstream provenance, redistribution notices, and Codex/Claude Code compatibility.
- Added direct GitHub and local Skills CLI installation for Codex and Claude Code, plus removal commands scoped to the nine skill names.
- Added dependency-free structural validation and safe upstream inspection tools with isolated Git tests.
