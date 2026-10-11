# Dynomatic investigation examples

Use these prompts with [dynomatic-query](SKILL.md) after [connecting Dynomatic](tools.md#register-the-client). All profile names, tables, keys, and item values below are synthetic. Replace them with the confirmed scope for your investigation. They do not describe an existing AWS account.

For real data, inspect the live tool schema before reading items. The response must exclude sensitive values through server-side projection or masking. If the tool cannot do that, use metadata, Sample Mode, or an already redacted export. The calls below describe the intended reads; parameter names come from the connected server.

## Learn the tools without AWS credentials

```text
Use dynomatic-query in Dynomatic's Sample Mode. Check app_status and
confirm Sample Mode is active. Read the environment report, list the
available profiles and tables, and describe one table. Explain which
fields are the partition key and sort key, and which indexes exist.
```

Identify the sample table and explain which access patterns its keys support. If Sample Mode is off, report that before reading items. Discover the sample table names. Dynomatic's [Sample Mode guide](https://app.dynomatic.io/docs/getting-started/sample-mode) explains how to enable it.

## An order still shows as pending

The UI shows `pending` after the worker was expected to finish. First establish what the stored record says.

```text
Use dynomatic-query to inspect demo order 1042.
Profile: research-dev. Region: us-west-2. Table: app-main.
PK: ORG#demo-1. SK: ORDER#1042.

Check the account, environment, and key schema. If the live tool supports
a safe projection, read PK, SK, status, updatedAt, and version only.
Explain what the stored state establishes and what it leaves open.
Then use the repo to find where the worker writes status and where the
API reads it. Keep the data investigation read-only.
```

Use a projected `get_item` when supported, or an exact-key `query` with a safe projection. A stored status of `pending` establishes the value in the selected table at read time. Worker logs and the write path are still needed to explain why. If it is `completed`, check the API's table/index and response before attributing the UI state to caching.

Return the selected account/profile, table/index, projected fields, actual status, and next code or log check. A missing item, an access error, and a wrong-environment read are different outcomes.

## An order is missing from a list

```text
Use dynomatic-query to investigate the demo organization's recent orders.
Profile: research-dev. Region: us-west-2. Table: app-main.
Expected key pattern: PK = ORG#demo-1, SK begins with ORDER#.

Describe the table and indexes first. Check whether the app's list query
uses the base table or a secondary index. Query at most one page with
limit 25 and a safe projection of synthetic keys, status, and createdAt.
Keep the cursor. Explain whether the result can establish why order 1042
is missing, and which check would distinguish the remaining causes.
```

A first page can leave the order unobserved. Report whether `LastEvaluatedKey` is present and whether filters removed evaluated items. If a cursor remains, an empty result page does not prove absence. Use the known full key for a separate projected lookup when that fits the authorized question, and compare its index attributes with the list's key condition.

Do not scan the whole table to answer a paginated-list question. If the index contract is unclear, trace the repository query builder before proposing another read.

## Explain a single-table model before adding a feature

```text
Use dynomatic-query to explain the single-table layout of app-main in
research-dev, us-west-2. Start with environment_report and describe_table.
Read the stored data_model or schema_profile only if its response is
safe. Compare the key patterns with the repo's order and cart models.
Explain ownership and the queries each pattern supports. Plan only.
```

Separate the table's declared key schema from observed entity patterns. An index definition proves that an index exists; it does not prove every entity populates it. A stored model or sampled schema can be incomplete.

If `data_model` returns `null`, report that and trace key construction in code. `infer_data_model` replaces the stored model, so it is outside this read-only workflow. When a diagram would help, add:

```text
Use Excalidraw to draw the confirmed entities and key patterns. Use
synthetic keys and mark patterns that came only from a sample. Export
the editable scene with a PNG for the feature plan.
```

## Check a few fields with PartiQL

This statement illustrates an exact-key read against synthetic data:

```sql
SELECT PK, SK, status, updatedAt, version
FROM "app-main"
WHERE PK = 'ORG#demo-1' AND SK = 'ORDER#1042'
```

```text
Use dynomatic-query with research-dev in us-west-2. Confirm the table's
keys and that PartiQL is available. Use the exact-key SELECT above only
after verifying the selected fields contain synthetic or safe values.
Report the returned fields and any truncation. Keep the statement read-only.
```

Named fields limit the result shape. They still need review: a field name or key can contain sensitive data. Keep equality on the confirmed partition key in `WHERE` to avoid a full-table scan. `SELECT *` is outside this investigation pattern. PartiQL `INSERT`, `UPDATE`, and `DELETE` are writes and are outside this skill. See [AWS's SELECT reference](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.select.html) and Dynomatic's [tool reference](https://app.dynomatic.io/docs/mcp/tools).

## Prepare a query for manual review

```text
Use dynomatic-query to prepare the order-list query for app-main in
research-dev, us-west-2. Confirm the key schema and use show_table to
open it in Dynomatic with the query filled in. I will review and run it
in the app. Do not fetch item values into this conversation.
```

`show_table` fills the query builder without executing the query. `show_item` can open a specific key for manual review. Explain that the user still needs to run the query; opening a view is not evidence of its result. See [exports and show in the app](https://app.dynomatic.io/docs/mcp/exports-and-show).

## What a useful answer includes

An investigation should leave enough detail to repeat the relevant check:

- Confirmed profile/account, region, table, environment classification, and index.
- Tool calls and arguments, selected fields, page limit, and cursor state.
- Sanitized findings, including errors or truncation that affect the answer.
- What the result establishes, what remains unchecked, and the next check.

Keep raw customer payloads, secret-bearing templates, and saved script contents out of the answer and model context. Exporting a table, running a script, saving a query, or changing an item needs a request for that action; these examples stay within investigation.
