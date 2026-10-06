---
name: gather-context
description: "Gather and reconcile research evidence from a repo, GitHub, Linear, Notion, Google Drive, Slack, and available MCP sources. Use when a question spans tools or needs a traceable source bundle rather than a single lookup."
license: MIT
---

# Gather context

Build a small, traceable evidence bundle that explains what each source supports. Adapted from Notion's research workflow; changed to cover multiple sources, local output, access-aware fallbacks, and no automatic publishing.

## Inputs

Take the research question, known links/IDs, repo, project/team, date window, and any source limits. Begin with local files and supplied links. A named source is authorization to read relevant accessible material, not permission to crawl the entire organization or write to it.

## Workflow

1. Break the question into claims to verify. Pick a source for each: code for current implementation, tickets for requested intent, documents for decisions, threads for rationale, telemetry for observed behavior. A ticket being closed does not prove deployment.
2. Discover connected tools using the host's tool inventory/search. Read relevant tool descriptions and obey their access/business-context prerequisites. For app connectors use their tools, not generic MCP resource enumeration; for other MCP servers resources/templates may help. Mark unavailable, denied, empty, and truncated results distinctly.
3. Read [connectors.md](connectors.md) only for the sources needed. Use exact IDs/links before broad keywords. Search aliases, then fetch full relevant pages, comments, threads, revisions, or logs. Search snippets are leads, not evidence.
4. Record each read: source ID/type, canonical URL or file:line with commit, source timestamp, retrieval timestamp, query scope, concise finding, and limitations. For pagination, follow the relevant continuation or label the result sampled/truncated. Stop after a bounded first pass when results stop changing the answer; deepen only to resolve a material gap.
5. Reconcile conflicts explicitly. Prefer evidence matching the exact environment/version/date being discussed. Keep contradictory claims and explain which evidence supports each. Mark inference and confidence separately; historical decisions may be stale.
6. Save a Markdown/JSON bundle in the task workspace, containing findings, source ledger, conflicts, gaps, and useful follow-up queries. Redact before writing. Record local raw-evidence locations only if necessary; never copy secrets or customer payloads into a shareable bundle. No external AI processing of customer data.

## CLI shortcut

When GitHub is relevant and gh is authenticated:

```bash
node <skill-dir>/scripts/github-evidence.ts --repo owner/repo --pr 123
node <skill-dir>/scripts/github-evidence.ts --repo owner/repo --issue 456
```

The helper performs read-only gh calls, returns JSON with retrieval time and exact command arguments, and labels comments as a bounded first page. It never runs a diff or code from the response. Run --help to see dry-run and limits. Keep any private output local; summarize only needed evidence.

## Outputs and stopping condition

Return the bundle path and enough findings to answer the question or support a research brief. Finish when important claims are supported or explicitly marked unknown, conflicts are explained, and coverage limits are visible. Do not claim a source was read merely because a connector exists. Do not create/update issues, pages, messages, reports, or MCP configuration unless separately requested.
