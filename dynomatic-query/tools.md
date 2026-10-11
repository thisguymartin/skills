# Dynomatic MCP: install and tool reference

Use [Dynomatic](https://app.dynomatic.io/), the desktop DynamoDB app. Tool names were originally checked against Dynomatic 1.2.0; connection guidance was reviewed against the official docs on 2026-10-10. Live `tools/list` output wins when versions differ. Sources: [tool reference](https://app.dynomatic.io/docs/mcp/tools), [connect a client](https://app.dynomatic.io/docs/mcp/connect-a-client).

## Prerequisites

1. Dynomatic desktop app installed. Open it to use its database tools.
2. In the app: Settings -> MCP Server -> enable. Direct HTTP uses loopback with a bearer token. The default port is 47474; use the endpoint shown in Settings if it differs.
3. Leave "Allow writes" and "Allow production writes" off for research use.

Sample Mode needs no AWS credentials and is the right place to test this skill.

## Register the client

Use Settings -> MCP Server -> Add Dynomatic to a client for the command or configuration with your installation's executable path. The stdio bridge proxies to the app's local HTTP server and reads its endpoint file, so no token lands in client config. The commands below assume a standard macOS installation; register the client you use.

Claude Code:

```bash
claude mcp add dynomatic -- /Applications/Dynomatic.app/Contents/MacOS/dynomatic mcp
claude mcp list
```

Codex (writes to `~/.codex/config.toml`):

```bash
codex mcp add dynomatic -- /Applications/Dynomatic.app/Contents/MacOS/dynomatic mcp
codex mcp list
```

The bridge connects even when Dynomatic is closed, returning an empty tool list and instructions to open the app. It never launches the app. Tools appear on that connection when the app is open with MCP enabled. The bridge also picks up token and port changes.

Direct HTTP alternative, if the bridge is unavailable. The token is a credential; keep it out of shared config and commits.

```bash
claude mcp add --transport http dynomatic http://127.0.0.1:47474/mcp --header "Authorization: Bearer <token>"
codex mcp add dynomatic --url http://127.0.0.1:47474/mcp --bearer-token-env-var DYNOMATIC_MCP_TOKEN
```

For Codex HTTP mode, set `DYNOMATIC_MCP_TOKEN` through your existing secret/environment tooling before launching the client. Keep its value out of prompts, shared files, and commits. Check `codex mcp add --help` if your installed CLI differs. Direct HTTP reports a connection error while the app is closed.

Troubleshooting: `app_status` missing from the tool list -> app closed or server off. Connection refused on 47474 -> server off. 401 -> stale token after regenerating it in the app.

## Tool groups

Read-only, safe for investigation:

| Tool | Use |
|---|---|
| `app_status`, `list_profiles`, `profile_status` | Reachability, which AWS profiles exist and are authenticated |
| `environment_report` | Every profile/table classified prod/staging/dev with confidence. Call first. |
| `list_tables`, `describe_table` | Discover tables; keys, indexes, item count, size, billing |
| `schema_profile`, `data_model` | Stored attribute shapes and entity map; inspect whether sampled values are included before calling |
| `get_item`, `batch_get_items` | Known keys; use only when the live schema supports a safe projection or the data is synthetic |
| `query` | Key condition on PK (and SK range) or an index. Pass a safe projection and `limit`. |
| `partiql` | SELECT named safe attributes with a WHERE on keys; never SELECT *. Writes are outside this skill. |
| `scan` | Last resort. Safe projection + `limit` + filter + one page. |
| `stream_records` | Cached change records; raw old/new images need masking before reaching the model |
| `list_saved_queries` | Reuse saved queries only when discovery excludes embedded secrets |
| `show_table`, `show_item`, `list_commands` | Open views without fetching item values, or discover command metadata |

Resources: `dynomatic://table/{profile}/{region}/{name}/schema` and `.../data-model`.

Side effects or cost; only when the user names them:

| Tool | Why it is gated |
|---|---|
| `semantic_search` | Vector search; may call an embedding provider and incur cost |
| `export_start`, `export_status`, `export_cancel` | Full-table read, writes files |
| `run_script`, `invoke_command` | Executes user code or app commands; may write |
| `save_query` | Persists into the user's saved queries |
| `infer_data_model` | Local write: re-infers and replaces the stored data model; outside read-only investigation |
| `render_template` | Resolves secure values to plaintext in its response; avoid secret-bearing templates |
| `list_saved_scripts` | Returns saved code, which may contain credentials; inspect only synthetic or sanitized scripts |

Writes, blocked by app toggles and outside this skill:

`put_item`, `update_item`, `delete_item`, `batch_write_items`, `create_table`, `delete_table`, `import_schema`.

## Bounded read pattern

```text
environment_report
  -> list_tables(profile, region)
  -> describe_table(table)            # keys, GSIs, count, size
  -> data_model(table)                # only if key layout unclear
  -> verify projection/masking excludes sensitive values
  -> projected key read | query(projection, limit=25) | partiql(SELECT safe fields WHERE pk=...)
  -> safe evidence record
```

Example argument shape (synthetic):

```json
{"profile":"research-dev","region":"us-west-2","table":"app-main","keyCondition":"PK = :pk AND begins_with(SK, :sk)","values":{":pk":"ORG#demo-1",":sk":"ORDER#"},"limit":25}
```

This illustrates key selection and limits only. Add the live tool's projection parameter before reading real data; if no safe projection is supported, use Sample Mode or metadata instead. Exact parameter names come from the live schema.

For complete prompts and the checks each question needs, see the [investigation examples](examples.md).
