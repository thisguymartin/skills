---
name: dynomatic-query
description: "Query DynamoDB through the Dynomatic desktop app's MCP server to collect bounded, sourced evidence for bug investigation, data questions, and brainstorming about how data is actually shaped. Use when the user asks what is in a table, why an item looks wrong, how a single-table model is laid out, or wants DynamoDB facts for a plan. Also use to set up the Dynomatic MCP in Claude Code or Codex."
license: MIT
---

# Dynomatic query

Turn a question about DynamoDB data into a small, bounded evidence record: which profile/table, what was read, what came back, what it means. Dynomatic's MCP server runs inside the desktop app and is read-only by default; this skill stays read-only. It inspects data; it does not fix, backfill, delete, or migrate it.

## Inputs and setup

Take the question, AWS profile name, region, table name, the key or filter that identifies the item(s), and the expected result. Reuse scope already established in the conversation. If the profile or table is unknown, discover it with the tools below and ask only for what is still missing.

Check the MCP is reachable: call `app_status` (or list tools and confirm `dynomatic` tools exist). If no Dynomatic tools are present, the app is not running, its MCP server is off, or the client is not registered. Read [tools.md](tools.md) for the install commands for Claude Code and Codex, then stop and tell the user which step is missing. Do not install, start the app, or edit client config as a side effect.

Tool names and schemas come from the live `tools/list`; the names in tools.md were checked against Dynomatic 1.2.0 and may differ in newer versions. Installed schema wins.

## Find scope

1. `environment_report` first. It classifies every profile and table as prod/staging/dev with a confidence. Prefer a non-production profile when one holds the same data. A profile named "staging" is a hint, not proof; trust the report plus the table ARN region/account.
2. `list_tables` for the chosen profile/region, then `describe_table` for the target: partition key, sort key, GSIs/LSIs, item count, size, billing mode. Record these; they decide whether the question can be answered with a `query` or needs a `scan`.
3. When key layout is unclear (single-table designs), read `data_model` or `schema_profile`. `infer_data_model` replaces the app's stored model and is outside this read-only workflow. If no model exists, trace the key layout in source or use a projected synthetic sample.

## Read with bounds

- Before an item read, inspect the live schema for a server-side projection and allowlist only nonsensitive attributes. Prefer a projected key read, then `query` on a key condition, then a `partiql` SELECT of named fields with a WHERE on keys. Never use SELECT *. `scan` is last resort: always pass a projection, a `limit` (start at 25), a filter, and stop after one page unless the user asks for more.
- Never run an unbounded `scan` or a full-table export on a table the environment report calls production. If the question needs a full pass, say so, give the item count and estimated read cost from `describe_table`, and get explicit go-ahead.
- Set a small page size and keep the pagination token. One page does not prove absence; say "not in the first N items" rather than "does not exist".
- `semantic_search` and `run_script` can be expensive or have side effects; use them only when the user names them. `run_script` executes user scripts and may write; treat it as outside research scope.
- Writes (`put_item`, `update_item`, `delete_item`, `batch_write_items`, `create_table`, `delete_table`, `import_schema`) are off by default in the app and never part of an investigation request. If the user wants a fix, hand off with the exact key and proposed change instead of performing it.

## Handle the data

MCP tool responses enter the model context immediately. Redacting an answer afterward does not prevent exposure. Before calling an item-returning tool, require a server-side projection or masking that excludes customer payloads, names, emails, phone numbers, addresses, and tokens, including nested fields. Keys can also contain sensitive values; inspect their layout before selecting them. If the tool cannot return a safe shape, stop that read and use Sample Mode, schema metadata, or an already redacted local export. Do not fetch a full real item to decide which fields to redact.

`render_template` can resolve secret references to plaintext, and saved scripts can contain credentials. Neither is an ordinary discovery read; avoid returning their contents to the model. Attribute values with `S`/`N`/`M` type wrappers are DynamoDB JSON; translate safe projected shapes when explaining.

Distinguish outcomes: access denied, table not found, empty page, throttled, and "found but not matching" are different findings. A tool error is not an empty result.

## Explain

Return the answer plus an evidence record:

- profile, region, table, environment classification and confidence
- key schema and the index used
- the exact tool calls and arguments (keys, limit, filter), with pagination state
- sanitized findings: counts, key values, relevant attributes, timestamps
- what was not checked and why

For a bug: state what the data shows versus what the code or UI expects, and name the next check (a code path, a log, another table) rather than guessing the cause. For brainstorming or planning: summarize the actual shape (entities, key patterns, GSIs, sizes, hot attributes) so the plan rests on real data, and mark anything inferred from a sample. A diagram of the data model is an optional output; use the excalidraw or plan-artifact skills only when asked.

## Stopping condition

Finish when the question is answered with bounded, sourced reads or the blocker is explicit (MCP not connected, no non-prod copy, needs a full scan that was not authorized). Do not expand into neighboring tables or more pages once the question is answered. Test any instruction changes with Dynomatic's Sample Mode or synthetic tables, never live customer tables unless the user requested it.
