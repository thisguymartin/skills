# Verification record

Checked 2026-10-06 against the uncommitted worktree on refactor/flat-layout, based on HEAD 0b1292d16f082a3bf678f09d7f34beddee1c7ed1. The pre-existing index was left unchanged; these results describe the worktree, not the staged snapshot or a published revision.

## Automated checks

- npm run check: eight skill entrypoints in the current checkout, including yaak-query and the separately added notion-brain; frontmatter, flat layout, local references, README entries and pinned provenance pass.
- npm test: 20 tests pass on Node 24.21.0.
- The same 20 tests pass on Node 22.18.0, matching the CI runtime.
- git diff --check passes.
- Live upstream check: all three recorded revisions match current upstream default branches; configured adaptation/reference/license paths exist, including Yaak's new manifest entry.
- The Excalidraw launcher is byte-for-byte identical to the pre-change backup.

The tests cover HTML escaping, executable-link rejection, source/diagram reference integrity, output preservation, GitHub CLI dry-run without installed tools, symlinked skill paths, bounded history scans, and exclusion of tool output/hidden reasoning. Existing provenance tooling tests use synthetic Git repositories. AWS uses native CLI commands; its examples and account/pagination workflow were reviewed against current official docs, without live execution.

The optional system skill-creator quick_validate.py could not start because its Python environment lacks PyYAML. The repository validator and runtime tests are the completed checks; PyYAML is not a skill runtime requirement.

## HTML and history

The synthetic [research brief](examples/research-brief.html) was opened in Chrome through a temporary localhost server. Verified the desktop layout, narrow viewport at 390 x 844, source anchors with no dangling targets, six expandable detail sections, keyboard activation, rendered SVG flow and current/proposed labels. The temporary viewport was reset, the tab closed, and the localhost server stopped.

The print button triggered the beforeprint expansion, but Chrome's print dialog did not respond reliably through browser automation. Print/PDF visual output remains unverified; no PDF was saved and no physical print was submitted.

Ran the history helper on a targeted, bounded Claude prompt-index query. Useful prompt matches were found; no full transcript or customer material was bundled. Two older selected transcript files were unavailable. The synthetic history tests cover Claude and Codex message formats; live Codex archive coverage was not audited.

## Yaak CLI verification

Installed official `@yaakapp/cli` 2026.8.1 only under `/private/tmp/thisguyskills-yaak-cli-OSP4dz`, with no install scripts. Used an explicit separate data directory for every database command and disabled its update check during fixture runs. The user's collection was not read or modified. The CLI was absent from the shell's normal PATH; no global CLI or agent skill was installed.

A temporary localhost-only synthetic HTTP server exercised workspace/request/environment discovery, request show/schema, explicit-environment send, saved request update and fresh stored response IDs/status. Both HTTP 200 and HTTP 500 completed with exit code 0; actual status was read from response metadata. The fixture server was stopped. The temporary smoke script is verification material, not a bundled helper.

Reviewed Yaak scenarios for environment/effect scope, dependent sends, GraphQL errors, stale history, query inputs and saved-data edits. No real credentials, private response bodies, live API requests, gRPC/WebSocket, or end-to-end GraphQL operation were tested. This is a synthetic CLI check and manual instruction review, not independent agent forward-testing.

## Behavior and integration limits

Walked through [scenarios](examples/scenarios.md) against the skill entrypoints: missing connectors, contradictory sources, current/proposed separation, history scope, queue receiving effects, log continuation, cost workspace selection, and local artifact creation. This is a manual instruction review, not independent agent forward-testing.

No live AWS resources, Vantage costs, Linear/Notion/Drive/Slack content writes, connector setup, global skill installation, canvas startup, public upload, commit, or push occurred. GitHub network access was used only for upstream research/checking. Excalidraw's existing source has unresolved redistribution terms, recorded in [upstream notes](upstreams.md).

The pre-change worktree and staged/unstaged patches are saved locally at /private/tmp/thisguyskills-before-research-cwewovus. Global copies of removed skill names remain a separate migration task documented in compatibility.md.
