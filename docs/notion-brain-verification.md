# Notion brain verification

Checked 2026-10-06 in the uncommitted worktree on refactor/flat-layout, based on HEAD `0b1292d16f082a3bf678f09d7f34beddee1c7ed1`. Other worktree changes, including yaak-query, were present and preserved. No staging, commit, push, or global installation was performed for this task.

## Completed checks

- `npm run check`: all eight current skill folders passed layout, frontmatter, local links, README entries, and provenance validation. notion-brain's entrypoint is 63 lines, below the 200-line repository limit.
- `npm test`: all 20 existing tooling/runtime tests passed on Node 24.21.0. These tests do not execute Notion writes or prove an agent follows the new instructions.
- `git diff --check`: passed.
- Parsed the synthetic one-page fixture and checked its property names, expanded dates, and select/status/multi-select values against the live fetched schema. Its parent remains an explicitly fake UUID; no payload was sent to Notion.
- Read-only connector inspection: fetched Martin's Brain, its data source, and its R&D template; inspected tool availability and current fetch/search/create/update/query/attachment schemas; read the connector's enhanced-Markdown specification.
- Read [Notion's current MCP overview](https://developers.notion.com/guides/mcp/overview) and [supported tools](https://developers.notion.com/guides/mcp/mcp-supported-tools). The skill is original repository guidance with an MIT license, not a vendored upstream skill.

## Manual scenario walkthrough

Reviewed the new [behavior scenarios](examples/scenarios.md) against the entrypoint and supporting guides. This is an instruction walkthrough, not independent agent forward-testing.

| Scenario | Result of the walkthrough |
|---|---|
| Cloud evidence + plan + artifact -> save | One composed body and one page object; retains scope/currency/freshness and original citations; no extra record per contributing skill |
| Recall before planning | Destination-scoped search -> fetch -> dated decisions/findings/open questions; no write or status change |
| Search filter dropped | Notices inspected; fetched parent checked before using a match |
| Preview only | Local draft/property map; no uploads or page creation |
| Local HTML artifact | Inspect/redact -> supported upload -> returned embed in the same page -> fetch block; local paths and unattached uploads are not called complete |
| Queued/ambiguous creation | Persist original task/capture ID; resolve it before retry; uncertain outcome is reported without blindly creating another record |
| Attachment unavailable | Preserve one useful text record and local file; label partial result |
| Named-entry update | Targeted dated update, superseded conclusion labeled, manual notes/dates/relations preserved; ambiguous retries refetch before appending |
| Missing Notion access | Local draft/context with explicit gap; no credential setup or invented save URL |

Existing research/privacy boundaries still apply to the chain: no implementation or public publishing merely from research, no inferred AWS account/workspace, no receiving SQS messages as a passive read, no raw logs/customer payloads in the saved artifact, and no proposals promoted to accepted decisions.

## Limits

Live page creation, page updates, file uploads/embeds, search recall across saved records, and retry behavior were not executed. The connector read/schema inspection confirms the observed destination and current advertised access, not successful write behavior or future access. No live Notion record or attachment was created for testing. No new automated tests were added for Markdown instructions.
