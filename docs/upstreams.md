# Upstream research

Researched 2026-10-06. The machine-readable pins are in [.github/upstreams.json](../.github/upstreams.json). Upstream skill helper scripts are not installed or executed. The official Yaak CLI was separately installed in a temporary directory for synthetic verification; it is not bundled. No Pstack code is bundled or invoked.

## Notion research documentation -> local research skills

[Source at 49f948faa9258a0c61caceaf225e179651397431](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/notion-research-documentation/SKILL.md).

The skill carries Copyright 2025 Notion Labs, Inc. and MIT terms in its LICENSE.txt. Adapted its search -> fetch -> choose a format -> synthesize -> cite pattern for gather-context and project-research. Our versions gather multiple sources and write local evidence/HTML; they do not auto-publish to Notion or copy its old MCP configuration steps. Each adaptation includes the original MIT notice plus this repository's notice.

Verified GitHub API snapshot: repository not archived; main pin dated 2026-06-24, pushed_at 2026-09-08; open_issues_count 300 (GitHub's aggregate includes pull requests). The particular entrypoint was inspected at the pin. Maintainer continuity/bus factor and production usage were not independently established; official ownership is a provenance signal, not proof of production adoption. Fit: a Markdown workflow works in both agents and needs no new library. Confidence ~95% on license/pinned content, ~75% that its general workflow transfers well; behavioral fit needs usage beyond fixtures.

## Anthropic web artifacts -> design inspiration

[Source at 683bc88e56f3e09ba94f7055977f3d3aa499f202](https://github.com/anthropics/skills/blob/683bc88e56f3e09ba94f7055977f3d3aa499f202/skills/web-artifacts-builder/SKILL.md).

The skill-local LICENSE.txt is Apache-2.0 with Copyright 2026 Anthropic, PBC. Studied its standalone HTML delivery and artifact design guidance. Its implementation uses React/Tailwind/shadcn, Vite/Parcel and dependency-installing scripts; none are copied here. plan-artifact is original Node/TypeScript, inline CSS/SVG and no runtime downloads. For a richer UI the existing artifact skill remains a valid optional renderer.

Verified snapshot: repository not archived; main pin/push dated 2026-10-05; open_issues_count 1387 including pull requests. Recent activity and official maintenance are positive signals; no claim about bus factor or production deployment is made. Fit: the output idea suits research briefs, while the build stack is unnecessary for the included renderer. Confidence ~95% on license/pinned content, ~85% on the simpler local fit. React 18/tooling pins in the source are not copied as current recommendations.

## Yaak CLI -> saved endpoint research

[Official skill at 7f302536168585be4603aea09491a78b75c57070](https://github.com/mountain-loop/yaak/blob/7f302536168585be4603aea09491a78b75c57070/crates-cli/yaak-cli/skills/use-yaak/SKILL.md), with the repository's MIT LICENSE, Copyright (c) 2024 Yaak. Adapted native discovery/schema/response guidance into yaak-query. Removed automatic global install/refresh and broad sends; added local redaction, environment/effect checks and fresh-response evidence. Retained the complete MIT notice. Do not edit Yaak's managed use-yaak skill: `yaak agent install` replaces it.

The npm registry reported stable `@yaakapp/cli` 2026.8.1 on 2026-10-06. Its packaged commands were checked in an isolated temporary database against a synthetic localhost HTTP API: workspace/request/environment discovery, request model/schema, explicit-environment sends, HTTP 200/500 behavior, saved request update, and fresh response IDs/status. The source pin is a research revision, not a claim that the npm binary was built from exactly that commit. Installed help/schema is authoritative.

Verified GitHub API snapshot: not archived; main pin commit dated 2026-09-26, repository pushed_at 2026-10-06; open_issues_count 18 including pull requests; 19,291 stars. Recent release/repository activity are maintenance signals. Bus factor and production deployment were not independently established; stars do not prove production adoption. Fit: reuses existing saved requests/auth in a native Rust CLI distributed through npm, with no separate API wrapper or service. Confidence ~95% for inspected license/commands and synthetic HTTP behavior, ~80% for research fit before real use. The checked CLI sends HTTP/GraphQL; gRPC/WebSocket sending is unsupported. No private workspace or live credentials were tested.

Sources: [official CLI guide](https://yaak.app/docs/getting-started/cli-usage), [npm package](https://www.npmjs.com/package/@yaakapp/cli), [repository](https://github.com/mountain-loop/yaak), [pinned request implementation](https://github.com/mountain-loop/yaak/blob/7f302536168585be4603aea09491a78b75c57070/crates-cli/yaak-cli/src/commands/request.rs).

## Excalidraw retained from this checkout

Existing local material came from [sibipro/bowstaff-skills](https://github.com/sibipro/bowstaff-skills); inspected tree revision 34577dddf94d44594b146f6eebeec2742473b783 contains excalidraw/SKILL.md, INSTALL.md and scripts/excalidraw-inbox. This source revision is a research reference, not a claim that the untracked local copy was originally taken at that exact commit. Kept the launcher unchanged; replaced the removed excalidraw-lanes sibling link with optional parallel-drawing guidance.

No LICENSE or NOTICE appeared in the inspected upstream tree, and root LICENSE returned 404. Retention in this local directory does not establish permission to redistribute it publicly. Do not invent a license or mark this retained folder MIT. Resolve source permission before any separate public distribution task. Canvas behavior was not exercised during research.

## Current primary references

- [Agent Skills packaging](https://agentskills.io/specification): names/descriptions, progressive disclosure, scripts.
- [Skills CLI](https://github.com/vercel-labs/skills): local/GitHub install and removal.
- [GitHub CLI PR view](https://cli.github.com/manual/gh_pr_view): JSON fields and read commands.
- [AWS queue attributes](https://docs.aws.amazon.com/cli/latest/reference/sqs/get-queue-attributes.html), [log filtering](https://docs.aws.amazon.com/cli/latest/reference/logs/filter-log-events.html), [receive behavior](https://docs.aws.amazon.com/cli/latest/reference/sqs/receive-message.html).
- [Vantage MCP](https://docs.vantage.sh/mcp): cost-source integration; actual tool descriptions supply query prerequisites.
- [AWS install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), [SSO profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html), [Node native TypeScript](https://nodejs.org/en/learn/typescript/run-natively).

Documentation changes over time; refresh when using it. Source pin checks validate contents, not continuing suitability.

## Local history signals

Read the user's Claude prompt index with targeted skill/research/artifact/Excalidraw terms. Relevant prompts asked for understandable team diagrams, detailed HTML research, follow-up comparisons, reports for product/leadership, and optional artifact uploads. Original full conversation files for two selected older session IDs were not found, so these are prompt-level signals, not reconstructed accepted decisions. No transcript, private customer context, or local archive is bundled.

## Upstream maintenance

```bash
node .github/scripts/check-upstreams.ts
node .github/scripts/pull-upstream-reference.ts openai-skills gather-context
```

Checking uses temporary clones. Exporting returns a temporary reference directory at the pin; it never overwrites skills. Review changed license and workflow content manually, then update both provenance and notices. Previously adapted Matt Pocock material was removed with the old collection; historical CHANGELOG entries remain as history.
