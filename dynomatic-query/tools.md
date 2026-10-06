# Dynomatic MCP: install and tool reference

Checked against Dynomatic 1.2.0 on 2026-10-06. Live `tools/list` output wins when versions differ. Sources: [MCP feature page](https://app.dynomatic.io/features/mcp-server), [tool reference](https://app.dynomatic.io/docs/mcp/tools), [connect a client](https://app.dynomatic.io/docs/mcp/connect-a-client).

## Prerequisites

1. Dynomatic desktop app installed and running. The MCP server lives inside the app; nothing works while the app is closed.
2. In the app: Settings -> MCP Server -> enable. It binds `127.0.0.1:47474` behind a bearer token shown in that panel.
3. Leave "Allow writes" and "Allow production writes" off for research use.

Sample Mode needs no AWS credentials and is the right place to test this skill.

## Register the client

Recommended: stdio bridge. The app's own binary proxies to the local HTTP server, so no token lands in client config.

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

Direct HTTP alternative, if the bridge is unavailable. The token is a credential; keep it out of shared config and commits.

```bash
claude mcp add --transport http dynomatic http://127.0.0.1:47474/mcp --header "Authorization: Bearer <token>"
codex mcp add dynomatic --url http://127.0.0.1:47474/mcp
```

Codex HTTP mode may need the bearer header set in `config.toml`; check `codex mcp add --help` for the current flag. Tools appear without restarting the client once the server is on.

Troubleshooting: `app_status` missing from the tool list -> app closed or server off. Connection refused on 47474 -> server off. 401 -> stale token after regenerating it in the app.

## Tool groups (35 tools, 2 resources)

Read-only, safe for investigation:

| Tool | Use |
|---|---|
| `app_status`, `list_profiles`, `profile_status` | Reachability, which AWS profiles exist and are authenticated |
| `environment_report` | Every profile/table classified prod/staging/dev with confidence. Call first. |
| `list_tables`, `describe_table` | Discover tables; keys, indexes, item count, size, billing |
| `schema_profile`, `data_model`, `infer_data_model` | Attribute shapes and single-table entity map inferred from a sample |
| `get_item`, `batch_get_items` | Known keys. Cheapest reads. |
| `query` | Key condition on PK (and SK range) or an index. Pass `limit`. |
| `partiql` | SQL-like read; keep a WHERE on keys. Can also write if allowed, so read the statement before sending. |
| `scan` | Last resort. Always `limit` + filter + one page. |
| `stream_records` | DynamoDB Streams viewer records for change history |
| `list_saved_queries`, `list_saved_scripts` | Reuse what the user already saved in the app |
| `show_table`, `show_item`, `render_template`, `list_commands` | Open views in the app UI; cosmetic |

Resources: `dynomatic://table/{profile}/{region}/{name}/schema` and `.../data-model`.

Side effects or cost; only when the user names them:

| Tool | Why it is gated |
|---|---|
| `semantic_search` | Vector search; may call an embedding provider and incur cost |
| `export_start`, `export_status`, `export_cancel` | Full-table read, writes files |
| `run_script`, `invoke_command` | Executes user code or app commands; may write |
| `save_query` | Persists into the user's saved queries |

Writes, blocked by app toggles and outside this skill:

`put_item`, `update_item`, `delete_item`, `batch_write_items`, `create_table`, `delete_table`, `import_schema`.

## Bounded read pattern

```text
environment_report
  -> list_tables(profile, region)
  -> describe_table(table)            # keys, GSIs, count, size
  -> data_model(table)                # only if key layout unclear
  -> get_item | query(limit=25) | partiql(WHERE pk=...)
  -> redact locally -> evidence record
```

Example argument shape (synthetic):

```json
{"profile":"research-dev","region":"us-west-2","table":"app-main","keyCondition":"PK = :pk AND begins_with(SK, :sk)","values":{":pk":"ORG#demo-1",":sk":"ORDER#"},"limit":25}
```

Exact parameter names come from the live schema.
