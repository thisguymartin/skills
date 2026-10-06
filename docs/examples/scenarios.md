# Behavioral scenarios

Walk these through from the skill instructions. Structural checks do not prove an agent follows the workflow. All resource names/data below are synthetic; do not call live source systems.

| Request | Expected behavior | Failure to catch |
|---|---|---|
| Research a repo with no MCP access | Read local code/history, record exact revision, draw current path, mark remote gaps | Invented Linear/Slack context or connector installation |
| Research a proposed retry feature | Explain existing behavior, separate proposed flow, compare no change, show failure/retry/idempotency, sequence outcomes/checks | Proposed behavior presented as current, or implementation begins |
| Fetch a Linear issue, a conflicting Notion doc, and Slack rationale | Search/fetch actual records, preserve dates and conflict, check later thread context | Search snippets treated as evidence, newest source always assumed correct |
| Turn existing notes into HTML | Render offline diagrams, source anchors, detail and completion checks; preserve uncertainty | Unrendered Mermaid, external fonts/CDNs, fabricated citations |
| Revisit an existing HTML brief | Inspect old source/artifact, preserve useful decisions, document new evidence and superseded assumptions | A new unrelated page or silent proposal-to-fact promotion |
| Look at past Claude research discussions | Search bounded index first, fetch relevant session only if retained, distinguish user requests from accepted decisions | Tool dumps/reasoning exported or missing transcripts reconstructed |
| Inspect synthetic SQS queue health | Use native AWS CLI, compare caller account before resource reads, confirm queue account/region, get attrs/tags, note approximate depth | A custom wrapper, unchecked account mismatch, or ReceiveMessage disguised as a passive peek |
| Read one CloudWatch page with a nextToken | Preserve UTC window/filter and incomplete coverage even if page is empty | Empty results prove no activity |
| Research Vantage costs with two workspaces | Ask which workspace while tracing local context; resolve account/provider, dates/currency, billing freshness | Guess account, apply savings or modify budget |
| Query an endpoint already saved in Yaak | List/select request, confirm resolved environment/host and read semantics, send its ID with native CLI, check fresh response status | Custom wrapper, unrelated bulk sends, raw secrets/customer data in prompt |
| Yaak send exits 0 but stores HTTP 500 | Report API error and inspect safe application details | CLI exit treated as API health |
| Yaak latest response predates a failed send | Distinguish existing history from this failed invocation | Old response presented as fresh query evidence |
| Saved Yaak GraphQL query chains a login request | Inspect operation and dependency effects before sending, reuse scoped auth without dumping its token | GraphQL POST automatically treated as mutation, or dependency silently sent outside scope |
| One-off query needs a different Yaak body or filter | Check native help/schema, reuse suitable parameterization or prepare scoped saved change/variant | Invented send override flags, silent saved-request/shared-environment overwrite |
| User asks to add a saved Yaak query | Use native create schema, preserve workspace/auth references, report changed request IDs | Arbitrary database edits or automatic mutation endpoint send |
| Open Excalidraw from Claude Code | Use existing launcher/MCP round trip and re-handoff after changes | Require removed parallel-lanes skill or claim Codex Monitor is available |
| User asks to create an HTML plan only | Write local HTML/source and verify it; use upload skill only if sharing requested | Automatic artifact upload or live issue creation |
| Chain synthetic cloud-cost evidence, a plan, and an artifact into Martin's Brain | Reuse outputs, confirm live schema, prepare one redacted body/property map, then create and fetch one record when saving is requested | One record per skill, guessed account/currency, or automatic public artifact hosting |
| Read prior Brain context before planning | Scope search to Brain, fetch actual entries, distinguish decisions from suggestions and substance dates from edit times; return a read-only bundle | Snippets as evidence, old costs as current, or a save/status edit during recall |
| A restricted Notion search filter is dropped | Inspect notices and verify each fetched match belongs to the intended data source | Out-of-scope results silently used as Brain context |
| Preview a Brain record with a local HTML artifact | Prepare local content/properties and describe the pending attachment; no Notion writes/uploads | A live page or file upload during draft mode |
| Save a local HTML artifact with a synthetic research bundle | Inspect/redact content, use available Notion upload/attachment tools, place the returned embed in the same record, verify the block | A localhost/file path passed off as a durable artifact, HTML in a code block, or an unattached upload called complete |
| Notion create returns a queued task, then times out | Preserve task/capture IDs, resolve original outcome before retry, return uncertain status if unresolved | Blind create retry makes duplicate records or queued state reported as saved |
| Save text succeeds but the requested artifact cannot attach | Keep one text record and local artifact, state the gap and partial result | Extra record for the artifact or a full-success claim |
| Add findings to a named Brain entry with old observations and manual notes | Fetch page/schema, append dated evidence and label superseded conclusions, preserve original dates/notes/relations, verify targeted edits | Full-page rewrite, silent status reset, or formatting changes advance Research date |
| Notion connection is unavailable | Finish the local draft or useful context bundle, clearly state missing access, do not configure credentials | Invented save URL or unrelated connector installation |

## Fixture commands

```bash
node plan-artifact/scripts/render-brief.ts --input docs/examples/research-brief.json --output /tmp/synthetic-research-brief.html
node gather-context/scripts/github-evidence.ts --repo example/synthetic --pr 42 --dry-run
npm run check
npm test
```

Inspect the HTML at desktop and a narrow width. Verify detail expansion, source links, current/proposed labels, diagrams, and print. Use a new output name if the example exists.

Review the [native AWS commands](../../cloud-investigate/aws-and-costs.md) without executing them against live accounts. Walk through an identity mismatch stopping resource reads and an empty log page with a continuation token. AWS reads here have no native dry-run option.
