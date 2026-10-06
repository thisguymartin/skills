---
name: yaak-query
description: "Use existing Yaak requests and environments to query HTTP or GraphQL endpoints with the native Yaak CLI, inspect response history, and collect evidence for research or debugging. Also use when the user asks to add or adjust a saved Yaak query."
license: MIT
---

# Yaak query

Use the user's saved API collection as the starting point: find the request -> resolve environment and inputs -> query -> explain the result. Adapted from Yaak's official use-yaak skill, narrowed to endpoint research and explicit saved-request changes. Run native `yaak` commands; no custom wrapper is needed.

## Inputs and setup

Take the question, workspace/request name or ID, environment, relevant IDs/filters, and expected result. Reuse established scope from the conversation. If the environment or target is ambiguous, inspect available choices and ask only for what is missing; continue useful local research while waiting.

Check `yaak --version` and `yaak --help`. If the CLI is absent or too old, explain which command is missing and point to the repository README's installation steps. Do not install, upgrade, log in, or run `yaak agent install` as a side effect. The CLI uses the desktop app's local database by default; an explicit `--data-dir` selects another collection. Do not search raw SQLite files or edit the database directly.

Read [commands.md](commands.md) for verified commands, response inspection, and conditional request edits. Installed help/schema wins when versions differ. Yaak's official use-yaak skill is an optional command helper; this skill works independently.

## Find and inspect

1. List workspaces, select the one matching the user's project, then list requests and environments within it. Use exact request IDs once known. Match by purpose, method and path, not just a similar name. Do not send a whole folder/workspace to discover what it contains.
2. Inspect the selected request locally: method, URL/path/query/body, GraphQL operation and variables, inherited folder headers/auth, environment overrides, cookie jar, and template dependencies. Resolve the actual host and tenant/account scope without exposing secrets. An environment name such as "staging" alone does not prove the URL targets staging.
3. Establish effects. A GraphQL POST can be a read; inspect its operation rather than classifying by verb alone. Template functions can send dependent requests, and redirects can change the target. Include those calls in scope. Use existing authorization for the requested query; ask only if effects or scope exceed it. Research does not authorize API mutations, replay, bulk sends, or destructive saved-data changes.
4. Prefer the existing request unchanged when its inputs fit. Native send in the checked version has no per-call URL/body override. If different inputs require an edit, use commands.md's conditional workflow; do not silently overwrite a saved request or shared environment for a one-off question.

## Query and explain

- Send one selected request with an explicit environment. Reuse saved auth; a missing key, expired token, or keychain problem is an access gap, not an empty result. `yaak auth` is for the plugin registry, not the user's API.
- Keep request details and raw responses local. Redirect bodies to a new private file and allowlist/redact fields locally before output enters a model prompt or artifact. Avoid verbose output by default because headers can contain credentials. Never send real customer payloads to external AI services.
- Capture the previous response ID when one exists. After sending, confirm the response ID/time belongs to this invocation. Prefer the exact response ID for further inspection; another client may send the same request. Do not substitute old history after a failed send.
- Check HTTP status and transport error, then application-level errors, content type, and expected shape. A clean CLI exit is not proof of API success; GraphQL can return HTTP 200 with `errors`. Keep denied, failed, empty, stale, and incomplete responses distinct.
- Bound results using the endpoint's supported filters, date range, page size or cursor. Do not guess pagination fields or claim a complete dataset from one page. Stop once the question is answered; expand only to close a material gap. Avoid automatic retries when effects are uncertain.

## Add or adjust requests when asked

If the task explicitly includes saving an endpoint, changing inputs/auth references, or importing a collection, follow commands.md's schema-driven editing mode. Preserve workspace/folder context and secret references. Describe what changed and which request IDs were affected. Creation/update is persistent user data, not a disposable command option. Do not auto-send newly created mutating requests to verify them.

## Outputs and stopping condition

Return the answer plus a small evidence record: workspace/request/environment IDs, sanitized endpoint and input scope, retrieval time, fresh response ID, HTTP/application outcome, findings, and pagination/access gaps. Keep raw local paths only where useful. For history-only requests, label results historical and do not resend.

Finish when the question is supported by fresh scoped evidence or the remaining blocker is clear. A research brief or diagram is an optional output; sibling skills, uploads, publication, and installation are not required. Test instructions with isolated synthetic data, never the user's live endpoints unless requested.
