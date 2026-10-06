# Connector reading guide

Tool names differ between Claude, Codex, plugins, and MCP versions. Discover the actual schema instead of copying a hardcoded name. These are source strategies, not promises of access.

| Source | Targeted read | Evidence to preserve |
|---|---|---|
| Local repo | rg, relevant tests/config, git log/show; record HEAD and dirty files | path:line, commit, observed vs inferred behavior |
| GitHub | gh pr/issue view, review comments, commits/checks; fetch discussion around the linked line | canonical URL, head/base SHA, status/check timestamp, pagination |
| Yaak | Discover saved requests/environments with native CLI, inspect effects and send a scoped query; [yaak-query](../yaak-query/SKILL.md) is optional guidance | request/environment/response IDs, sanitized scope, retrieval time, HTTP/application outcome, pagination |
| Linear | Search/fetch exact issue/project; read description and relevant comments/relations | issue ID/URL, updated date, acceptance criteria, status vs actual release |
| Notion | Discover tool access first if required; use available AI search or keyword fallback, then fetch page content/blocks | page URL, source date, relevant block/section, incomplete child blocks |
| Google Drive | Search title/topic; fetch actual Docs text, selected Sheets ranges or Slides content; read relevant revision/comments when needed | file URL/ID, revision/date, paragraph/range/slide, access limits |
| Slack | Search within project/channel and date window; fetch matching thread context and permalinks | author/date, thread URL, decision vs suggestion, relevant replies |
| Datadog | Read any required domain guide; narrow logs/traces/events by environment, service, time and correlation ID | query, UTC window, event/trace IDs, sample/limits; redact payloads |
| Mixpanel | Load required business context before selecting project/events; use aggregate queries | project/event definitions, date/time zone, filters, denominator and sample |
| Vantage | Inspect access, workspace, provider/account; scoped cost query with dates/currency | actual vs forecast, billing scope/lag, filters, unit cost vs total |
| Other MCP | Inspect descriptions, prerequisites and read methods before calling | source identity, exact scope, freshness, query, result limit |

For Notion, a tool requiring get_tool_access must receive it before search; choose the search variant from the returned capability. A generic search tool may not search page body content. For Drive fetch the linked content rather than treating a file listing as its text. For Slack, a single message may be superseded later in the same thread.

For Vantage, if multiple workspaces are available and none was named, ask which to use; use account IDs resolved from account names and provider/service identifiers returned by the tool. For Mixpanel do not guess event meanings from names. For any connector, denied access is a gap, not a zero count. Never install/connect a missing service as a research side effect.

Use official current docs when tool schemas do not settle a behavior question: [GitHub CLI](https://cli.github.com/manual/), [Linear MCP](https://linear.app/docs/mcp), [Notion MCP](https://developers.notion.com/docs/mcp), [Drive files](https://developers.google.com/workspace/drive/api/guides/search-files), [Slack search](https://docs.slack.dev/reference/methods/search.messages/), [Vantage MCP](https://docs.vantage.sh/mcp).
