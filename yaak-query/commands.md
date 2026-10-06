# Native Yaak commands

Checked 2026-10-06 with `@yaakapp/cli` 2026.8.1. Examples use synthetic IDs; replace them with discovery results. Run relevant `--help` before using flags not shown here. These are direct CLI commands.

## Discover and inspect

```bash
yaak --version
yaak --help
yaak workspace list
yaak request list wk_synthetic
yaak environment list wk_synthetic
```

Lists are human-readable text in the checked version. `request list` lists HTTP requests; GraphQL is represented as HTTP. Absence from this list is not proof the workspace has no gRPC/WebSocket resources. The checked CLI cannot send gRPC or WebSocket requests. Use the app for those protocols or explain the limitation.

`request show` returns the saved model, not a fully rendered request. Environment/folder models can include secrets. Inspect locally with narrow projections rather than dumping models into a conversation. With `jq` installed:

```bash
yaak request show rq_synthetic | jq '{id, workspaceId, folderId, name, method, bodyType}'
yaak request schema http --pretty
yaak environment show --help
yaak folder show --help
yaak template-function show response.body.path
```

The projection excludes URL, headers, body and authentication. Inspect those separately in a local terminal/private file, then report sanitized host/path, operation, required variable names, and effects. Trace folder inheritance and base/sub-environment overrides. Template syntax is `${[ base_url ]}`; response templates may send another request if its response is missing. Do not evaluate a dependency merely to inspect its configuration.

## Send one request and inspect its response

Use a private, new output path. The subshell keeps file settings local to the command and refuses to overwrite an existing file:

```bash
(
  umask 077
  set -o noclobber
  yaak -e ev_synthetic request send rq_synthetic > /tmp/yaak-synthetic-response.body
)
```

Yaak also stores response history and can update the cookie jar during a send. Redact locally or apply a known JSON projection before showing body fields to an agent. Truncating a body does not make its contents safe.

Inspect metadata before and after the send. `response show <request-id>` selects its latest response; `response show <response-id>` selects that exact response. Keep the previous ID/time to detect stale results or concurrent sends:

```bash
yaak response show rq_synthetic | jq '{id, requestId, createdAt, status, statusReason, elapsed, error, state}'
yaak response list rq_synthetic --limit 5
yaak response show rs_synthetic | jq '{id, requestId, createdAt, status, statusReason, elapsed, error, state}'
```

A missing previous response is normal for a request never sent. A failed send followed by an unchanged latest response is not new evidence. If concurrent use makes attribution unclear, report the gap. `response body <response-id>` reads the exact body locally. Headers/final URL are in the full model; inspect/redact them locally when needed.

Verified with a localhost fixture: HTTP 200 and HTTP 500 both complete with exit code 0. Check stored `status`/`error` and body-level success separately. Transport failure, 401, GraphQL `errors` and an empty successful list support different conclusions. Bulk-send `--fail-fast` does not establish HTTP-level success.

## Different inputs or a new saved endpoint

The checked `request send` accepts a request ID and environment/cookie-jar selection; it has no transient query/body override. Check installed help before assuming newer versions behave the same way.

When the user asks for a saved change, inspect help/schema and use native editing commands:

```bash
yaak request create --help
yaak request update --help
yaak request schema http --pretty
yaak environment schema --pretty
```

Reuse a suitable parameterized request/environment when available. Otherwise prepare the exact JSON change or a separately named variant, preserving the original and its folder/auth context. Creating a variant or changing shared variables requires scope from the task; ask only when that saved change has not been authorized. Do not switch to curl to bypass this boundary.

`request update --json` uses a merge patch with the existing `id`; send only intended changes. Arrays are replaced wholesale, so retain unrelated headers/URL parameters when updating arrays. For a new request copied from a model, follow the create schema and omit generated identity/timestamp fields. Preserve secret templates rather than putting credentials in JSON/shell history. Inspect `urlParameters` guidance for path parameters; GraphQL variables are a JSON string in the checked HTTP body model. Schema and plugin auth definitions are the source of truth.

Import/export and bulk runs are separate modes for explicit collection/test requests. Inspect their help first; imports/updates affect the app immediately. Use `--data-dir` for isolated synthetic fixtures, not to copy a private workspace wholesale. `yaak agent install` overwrites Yaak's managed use-yaak skill; keep yaak-query separate.

## Primary sources

- [CLI and agents](https://yaak.app/docs/getting-started/cli-usage)
- [Official skill at the inspected revision](https://github.com/mountain-loop/yaak/blob/7f302536168585be4603aea09491a78b75c57070/crates-cli/yaak-cli/skills/use-yaak/SKILL.md)
- [Request commands at that revision](https://github.com/mountain-loop/yaak/blob/7f302536168585be4603aea09491a78b75c57070/crates-cli/yaak-cli/src/commands/request.rs)
- [Templating and dependent sends](https://yaak.app/docs/templating/pre-post-request-scripting)
- [Local storage and privacy](https://yaak.app/docs/getting-started/security-and-privacy)

Confidence ~95% for tested commands and response behavior; plugin/auth/environment behavior depends on the collection and was not tested against real credentials.
