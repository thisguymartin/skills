# Research -> artifact -> Martin's Brain

notion-brain is the final capture step or the starting point for recalling prior knowledge. It works without sibling skills and reuses their output when present. gather-context remains the general multi-source reader; notion-brain adds the destination mapping, one-record capture, and dated maintenance of Martin's Brain.

```text
Martin's Brain -> notion-brain recall -> decisions, constraints, and open questions
Local code + MCP evidence -> gather-context / cloud-investigate
  -> project-research when explanation or evaluation is needed
  -> plan-artifact or an existing artifact builder
  -> notion-brain save -> one new Martin's Brain record
Later evidence -> notion-brain update -> the identified record with a dated change
```

## Prompts

> "Investigate this AWS cost increase in the confirmed Vantage workspace, make an HTML artifact, and save the research plus artifact as one R&D record in Martin's Brain."

Confirm the cloud scope through cloud-investigate, then retain account/service/date/currency/billing coverage in the record. Reuse the source bundle and actual artifact. A local artifact can be attached directly through an available Notion upload tool; public artifact hosting is a separate request. If the question needs a missing workspace/account, ask while collecting independent local context.

> "Before we plan this, read what I already have in Martin's Brain about cabinet intake. Summarize decisions, constraints, and unanswered questions."

Search only the confirmed destination, fetch relevant pages, keep source/research dates, and return reusable context. Do not turn assistant proposals into accepted decisions or change any record while recalling.

> "Save this conversation's useful decisions and plan to my brain as one new record. Include the artifact we just made."

Read the current outputs, curate a record rather than exporting the transcript, inspect the artifact, and create one page. Match existing field options; link verified related entries without editing them. A save request authorizes that capture without another confirmation.

> "Preview how this research would look in Martin's Brain."

Prepare a local body and properties. Do not upload attachments or write Notion content. The [synthetic payload](examples/notion-brain-record.json) illustrates one composed record; its parent and URLs are fake. Never send this fixture to a live connection.

> "Update this entry with today's new findings and mark the old cost assumption as superseded."

Fetch the supplied entry, preserve its old observation dates and manual notes, add dated findings with sources, and verify the targeted edit. Formatting alone does not advance Research date. If the entry is ambiguous, prepare the local update while resolving its identity.

## Connector and failure behavior

Discover current tools and access per connection; do not copy host-specific names. Fetch the live database/data-source schema and the connector's enhanced Markdown specification before writes. [Notion's supported tools](https://developers.notion.com/guides/mcp/mcp-supported-tools) document search routing, uploads, and asynchronous operations; the runtime schemas settle the exact payload.

If Notion is missing or denied, finish the local draft/bundle and report the access gap. If text saved but the requested artifact did not attach, report a partial record and keep the local artifact. If creation timed out, resolve the original task/capture ID before retrying. A new request for a new record may link prior research; it does not silently overwrite it.

The destination and schema snapshot were inspected read-only on 2026-10-06. High confidence in the observed routing, but live writes and uploads are not established by that inspection. See [Notion verification](notion-brain-verification.md) for the checks actually completed.
