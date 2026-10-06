# Martin's Brain destination

Default database: [Martin's Brain](https://app.notion.com/p/sibipro/3f11cdf909a88072ab8de3e04dac7831).

Last inspected 2026-10-06 through the connected Notion tools. This is a routing hint and schema snapshot, not permission to skip live discovery. A user-specified destination takes precedence.

- Database ID: `3f11cdf9-09a8-8072-ab8d-e3e04dac7831`.
- Data source: `collection://3f11cdf9-09a8-807f-9bb4-000b7974bb48`.
- New record parent: the live `data_source_id`; at inspection it was `3f11cdf9-09a8-807f-9bb4-000b7974bb48`.
- The database includes templates for Idea, R&D, Project, Task, Note, and Decision. Fetch the database to resolve current template IDs; do not create or edit a template as the record.

## Property mapping

| Property | Observed type | How to use it |
|---|---|---|
| Name | Title | Specific topic or question, without a duplicate title heading in content |
| Type | Select | Idea, R&D, Project, Task, Note, or Decision; choose the record's purpose |
| Status | Status | Not started, In progress, or Done; reflect the work, not upload success; leave default Not started when progress is unknown |
| Summary | Text | One or two sentences explaining the question, conclusion, and material uncertainty |
| Context | Multi-select | Reuse Cabinets, Water heaters, HVAC, or Appliances when applicable; otherwise omit and describe the area in the body |
| Tags | Multi-select | Reuse Product, Engineering, AI, Operations, Reporting, Customer experience, Business, or Learning as relevant |
| Source | URL | Primary original source; additional evidence and artifact links belong in the body; omit when no usable URL exists |
| Research date | Date | Actual day the substance was researched; preserve older dates when merely capturing earlier work |
| Review date | Date | Optional agreed revisit date; do not invent a deadline |
| Next step | Text | One concrete next action or unresolved question; omit when none exists |
| Related entries | Relation to this data source | Verified relevant entry URLs/IDs; preserve existing relations during updates |
| Issue ID | Text | Verified Linear identifier only |
| Linear issue | URL | Corresponding actual issue URL only; no issue creation implied |
| Created / Updated | System times | Read-only; never set them |

AWS costs can use Engineering, Operations, and Reporting without adding an AWS context option. More precise topics belong in the page body unless the user separately requests taxonomy changes.

## Tool encoding

Use the connected tool's current schema. For the inspected enhanced Notion MCP, page properties are a map of names to SQLite values, not REST API property objects. Multi-select columns are JSON text arrays (for example `"Tags": "[\"Engineering\",\"Operations\"]"`); relations accept arrays of fetched page URLs/IDs. Date properties expand to `date:Research date:start` and `date:Research date:is_datetime` (0 for a date); include the end only for a genuine range. Other connectors may expose different formats.

If a field or option disappeared, refetch the schema and adjust the draft. Preserve unmatched information in the body rather than mutating the schema or guessing property names. Do not invent source URLs, relation targets, statuses, dates, or issue identifiers.

Current sources: [Notion MCP overview](https://developers.notion.com/guides/mcp/overview), [supported tools](https://developers.notion.com/guides/mcp/mcp-supported-tools), and the connected fetch/create/update/query/attachment tool schemas. The live database and its R&D template were also inspected. Confidence is high for this observed mapping; access and schema must be rechecked per task.
