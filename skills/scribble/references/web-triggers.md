# Web Triggers

Canonical list of phrases and flags that open the **web / external-source gate** in `scribble`. The skill defaults to closed: no `WebSearch`, no `WebFetch`, no external MCP calls unless one of the triggers below is present in the user's prompt for this run.

Update this file when adding new triggers. Do not edit `SKILL.md`.

## Default Behavior

- Closed. Sources are local-only: codebase, git, files the user pasted, prior artifacts in `./html-artifacts/`.
- If a request seems to need external data but no trigger fires, pause and ask the user one sentence: *"Open the web gate for this run?"* — do not infer consent from the topic alone.
- Ambiguity defaults to closed.

## Triggers That Open the General Web Gate

When any of these appear in the user's prompt, `WebSearch` and `WebFetch` are permitted for this run.

### Explicit flags

- `--web`
- `--online`
- `--internet`

### Phrases

- "search online"
- "search the web"
- "use the web"
- "look it up online"
- "check the web"
- "fetch from web"
- "google it"
- "find current docs"
- "latest"
- "current"
- "recent"
- "as of today"
- "what's new"

## Triggers That Open a Single Named External Source

When the user names a specific external system, the gate opens for **that system only**. The general web stays closed.

| Phrase pattern | What opens |
|---|---|
| "check Linear", "Linear ticket", "INGEST project" | Linear MCP |
| "search GitHub", "GitHub issue", "GitHub PR" | GitHub MCP / `gh` CLI |
| "look at Slack", "Slack thread", "channel" | Slack MCP |
| "Notion doc", "Notion page", "meeting notes" | Notion MCP |
| "Datadog dashboard", "Datadog logs", "metric" | Datadog MCP |
| "Mixpanel event", "Mixpanel dashboard", "funnel" | Mixpanel MCP |
| "Sentry error", "Sentry issue" | Sentry MCP |
| Any other named MCP / system | That MCP only |

If the user names multiple systems explicitly, open the gate for each named system. Do not let "check Linear and find the latest blog post" open the general web — Linear opens, web stays closed unless the user also said "latest" in a web-search sense. Use judgement; when in doubt, ask.

## Triggers That Do NOT Open the Gate

These look like triggers but are not:

- A topic that *could* benefit from web data ("how does HTTP/3 work") — topic alone is not consent.
- "Look at the code" — local.
- "Check the file" — local.
- "Latest commit" — local git, not web.
- "Recent changes" — local git, not web.

## Closing the Gate

The gate is per-run. It does not persist across `scribble` invocations. A user who opened the gate for one artifact must re-trigger it for the next one.

## Adding New Triggers

When new patterns emerge, append them to the appropriate section above. Keep the list short and unambiguous. If a phrase is too ambiguous to add safely, leave it out and rely on the explicit-ask fallback.
