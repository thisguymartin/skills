---
name: publish-linear
description: Prepare, create, or enrich Linear issues from a shaped feature or reviewed specification, including vertical slices for large features. Use when the user wants issue-ready content or explicitly requests publishing or updating Linear.
license: MIT
---

# Publish Linear

## Inputs

The product contract, review result/version, existing issue if any, target team/project if known, and the requested operation. This skill prepares and publishes product issues; it does not generate implementation tasks.

## Process

1. Discover the actual integration: native connector, MCP/plugin, CLI, or already-configured API access. Read available tool schemas/help; do not invent calls, fields, labels, or issue IDs. Read existing issue body/comments/relations and related issues before drafting. Never print credentials.
2. Load [linear-template.md](references/linear-template.md). Prepare a complete concrete issue body first. Preserve useful original context, links, decisions, and unresolved discussion. Identify contradictory older text explicitly. Keep workflow status, assignee, labels, and project unchanged unless the requested update includes them.
3. For a substantial feature, require an existing review covering the current spec, flow, decisions, and visuals before labeling it ready. Confirm no unresolved BLOCKING findings and that IMPORTANT findings are resolved or explicitly dispositioned with rationale/owner. A missing or stale review leaves a complete draft pending review; do not invent a passing verdict. Standalone use accepts a current review as input without requiring sibling skills to be installed. Publish a blocked draft only when requested, with readiness stated honestly.
4. For a large feature, load [issue-splitting.md](references/issue-splitting.md). Keep one parent product contract and demonstrable vertical slices with real dependencies. Present the concrete breakdown before mutation; proceed if already authorized, otherwise ask once for the missing publication scope/target.
5. If publishing is authorized and supported, refresh the existing issue immediately before writing; reconcile concurrent changes. Search for duplicates and record returned IDs as you go. Write only supported fields, in dependency order. Never blindly retry a timed-out create: search/read to establish whether it succeeded first.
6. Read back written issues and relationships. Compare important requirements, criteria, links, and preserved context. On partial failure, report confirmed successes and remaining drafts; do not roll back useful issues or create duplicates.

## Outputs and stopping conditions

Return verified IDs/URLs and changes, or complete ready-to-paste issue content with missing destination metadata and the exact access limitation. Save `linear.md` beside the spec when useful. Local artifact paths need an accessible repository/revision or shared document; include the full implementation-critical contract in Linear when richer artifacts are local-only.

Stop after verified publication or the complete fallback. Do not claim a prepared issue was published. Route continuation to `handoff`.

Adapted from Matt Pocock's `to-tickets`; tracker setup dependency removed. See [LICENSE.txt](LICENSE.txt).
