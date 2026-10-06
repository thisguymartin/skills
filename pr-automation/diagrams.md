# Excalidraw for PRs

Draw the changed behavior so a reviewer can follow it without tracing every file. The editable source is an Excalidraw scene; the PR displays a rendered image.

## Decide what to show

Use one diagram, usually four to eight nodes. Name real actors/components from the diff. Label arrows with the operation or data when useful. Mark the changed step directly, and include the failure/retry/duplicate branch when that is the point of the change.

Compare before/after only when a single flow would hide the difference. Use one orientation and short labels. Do not diagram every function, unchanged infrastructure, or hypothetical architecture. A contract or config-only change can still need a diagram if it changes ownership or routing; file type alone does not decide.

Caption: one sentence explaining what changed and the invariant to review. Example: "The event claim and pending job commit together; duplicate delivery returns the existing result."

## Generate and inspect

1. Discover the installed `excalidraw` skill and current drawing/export tools. Read its entrypoint before using it. When installed alongside this collection, its setup reference is `excalidraw/INSTALL.md`; runtime details belong there and in the collection's compatibility documentation.
2. Reuse the intended session canvas, checking its actual URL and existing content before editing. Follow that skill's startup rules for the current host. Do not clear unrelated drawings or assume Claude Code's listener exists in Codex.
3. Draw the flow, fit the viewport, and inspect a screenshot. Fix overlaps, clipped labels, arrow direction, and missing failure branches. Match each edge to the diff.
4. Export an editable `.excalidraw` scene and a PNG, or SVG if the chosen attachment route supports it. Save them in a task-local temporary/artifact directory, never in the installed skill folder. Use available export tools; for an existing local integration, consult [Excalidraw's official export APIs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export).
5. Open the actual exported image and verify its layout. A valid scene file or an export exit code alone is not a visual check. Give the image meaningful alt text and humanize the caption.

No live canvas/tools? If a local Excalidraw renderer is available, use it to create and inspect the same outputs. Otherwise finish the body, keep a short `A -> B -> C` explanation, and report the missing Excalidraw output. Do not install a renderer automatically, fabricate an image URL, or present a different diagram format as Excalidraw. An explicit diagram request remains incomplete until generated and checked.

## Put the image in the PR

A request for a PR diagram authorizes attaching the sanitized image to that target PR. It does not authorize public artifact hosting, another service, or adding generated files to the codebase. Keep raw customer data, credentials, and private payloads out of the scene.

Prefer a GitHub attachment through an available authenticated route. Check installed `gh pr create --help` or `gh pr edit --help` for `--attach` before using it; some versions lack it. If supported, pass the local image as an attachment alongside the body file, following the command's current reference-rewriting rules. Verify the fetched PR body contains the uploaded asset URL and the image actually opens for the intended reviewers.

If the CLI lacks attachment support, use a connected GitHub upload tool or the existing authenticated GitHub browser, when available. Follow its returned tool schema rather than inventing an upload API. Respect repository visibility and audience.

Reuse an existing approved, reviewer-accessible asset URL when suitable. Use a repository-hosted image only when the repository already has that convention and adding diagram assets is in scope; link the image/source at the correct head revision. Otherwise return the local scene/image, publish the concise text flow, and report that the image could not be attached. Never put localhost, a local filesystem path, or a temporary canvas URL into the PR as if reviewers could open it.

Attachment errors can leave the PR created or partially updated. Fetch it first, preserve successfully uploaded assets, and retry only the missing attachment. On repeated runs, reuse a still-current image or replace the flow section once; do not append duplicate images.

Keep the editable scene available locally and report its path when requested. Verify any separately shared source link before calling it available to reviewers. Canvas annotation/listening is optional for PR generation; do not wait for user annotations to complete the PR.
