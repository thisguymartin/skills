# Changelog

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
