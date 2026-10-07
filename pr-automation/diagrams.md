# Diagrams for PRs

Draw the changed behavior so a reviewer can follow it without tracing every file. Prefer Excalidraw; use [mer-inkdrop](https://github.com/thisguymartin/mer-inkdrop) as the backup when Excalidraw generation/export is unavailable or fails. Preserve editable source (`.excalidraw` or `.mmd`); the PR displays a checked rendered image. A request specifically requiring Excalidraw still needs that output unless the user accepts the backup.

## Decide what to show

Use one diagram, usually four to eight nodes. Name real actors/components from the diff. Label arrows with the operation or data when useful. Mark the changed step directly, and include the failure/retry/duplicate branch when that is the point of the change.

Compare before/after only when a single flow would hide the difference. Use one orientation and short labels. Do not diagram every function, unchanged infrastructure, or hypothetical architecture. A contract or config-only change can still need a diagram if it changes ownership or routing; file type alone does not decide.

Caption: one sentence explaining what changed and the invariant to review. Example: "The event claim and pending job commit together; duplicate delivery returns the existing result."

## Excalidraw: generate and inspect

1. Discover the installed `excalidraw` skill and current drawing/export tools. Read its entrypoint before using it. When installed alongside this collection, its setup reference is `excalidraw/INSTALL.md`; runtime details belong there and in the collection's compatibility documentation.
2. Reuse the intended session canvas, checking its actual URL and existing content before editing. Follow that skill's startup rules for the current host. Do not clear unrelated drawings or assume Claude Code's listener exists in Codex.
3. Draw the flow, fit the viewport, and inspect a screenshot. Fix overlaps, clipped labels, arrow direction, and missing failure branches. Match each edge to the diff.
4. Export an editable `.excalidraw` scene and a PNG, or SVG if the chosen attachment route supports it. Save them in a task-local temporary/artifact directory, never in the installed skill folder. Use available export tools; for an existing local integration, consult [Excalidraw's official export APIs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export).
5. Open the actual exported image and verify its layout. A valid scene file or an export exit code alone is not a visual check. Give the image meaningful alt text and humanize the caption.

No live canvas/tools? If a local Excalidraw renderer is available, use it to create and inspect the same outputs. Otherwise use the mer-inkdrop backup below. Do not install a renderer automatically, fabricate an image URL, or present Mermaid output as Excalidraw.

## Backup: mer-inkdrop

1. Discover `mer-inkdrop` on PATH and inspect its installed `--help`. Use the [repository's current README](https://github.com/thisguymartin/mer-inkdrop#usage) if the interface differs. Do not install it or copy its separate PR command as a side effect; this skill still owns PR delivery.
2. Write a small Mermaid flowchart to a task-local `.mmd` file. Use the same real components, changed steps, and failure branches as the intended Excalidraw diagram. Keep source and images in temporary/artifact storage and preserve existing files.
3. Download a PNG to a new path using the installed CLI:
   ```bash
   mer-inkdrop --input <flow.mmd> --output <flow.png> --format png --bg white
   ```
   Replace the paths with properly quoted literal values. Input files avoid interpolating diagram prose into shell commands. SVG is available when the attachment route supports it.
4. Open the actual image. Verify readable labels, edge direction, missing branches, and agreement with the final diff. Fix the source and rerender if necessary. A generated URL or successful CLI exit alone is not proof of a valid diagram.
5. Prefer attaching the checked local image through the GitHub route below. When using the fallback's hosted image URL, generate it from the same source and rendering options, then fetch/open that exact URL and verify it before writing it to the PR:
   ```bash
   mer-inkdrop --input <flow.mmd> --format png --bg white --url
   ```
   Keep `.mmd` as the editable source and identify the output as Mermaid/mer-inkdrop when reporting the fallback.

mer-inkdrop uses the external `mermaid.ink` renderer even for `--output`; its URL contains reversibly encoded diagram source. This workflow permits that renderer for sanitized backup diagrams. Keep customer data, credentials, private logs, and sensitive details out of the source. Honor any task restriction against external rendering. It does not authorize uploading to other hosting services.

If both renderers are unavailable, or rendering/download/visual verification fails, finish the body with a short `A -> B -> C` explanation and report the missing output. An explicit image-diagram request remains incomplete. Do not repeatedly retry an unchanged failure or report an unverified image as attached.

## Put the image in the PR

A request for a PR diagram authorizes attaching the sanitized image to that target PR and using the designated mer-inkdrop/mermaid.ink backup above. It does not authorize other public artifact hosting or adding generated files to the codebase. Keep raw customer data, credentials, and private payloads out of the diagram.

Prefer a GitHub attachment through an available authenticated route. Check installed `gh pr create --help` or `gh pr edit --help` for `--attach` before using it; some versions lack it. If supported, pass the local image as an attachment alongside the body file, following the command's current reference-rewriting rules. Verify the fetched PR body contains the uploaded asset URL and the image actually opens for the intended reviewers.

If the CLI lacks attachment support, use a connected GitHub upload tool or the existing authenticated GitHub browser, when available. Follow its returned tool schema rather than inventing an upload API. Respect repository visibility and audience.

Reuse an existing approved, reviewer-accessible asset URL when suitable. A verified mer-inkdrop hosted URL is also an allowed backup route as described above. Use a repository-hosted image only when the repository already has that convention and adding diagram assets is in scope; link the image/source at the correct head revision. Otherwise return the local source/image, publish the concise text flow, and report that the image could not be attached. Never put localhost, a local filesystem path, or a temporary canvas URL into the PR as if reviewers could open it.

Attachment errors can leave the PR created or partially updated. Fetch it first, preserve successfully uploaded assets, and retry only the missing attachment. On repeated runs, reuse a still-current image or replace the flow section once; do not append duplicate images.

Keep the editable source available locally and report its path when requested. Verify any separately shared source link before calling it available to reviewers. Canvas annotation/listening is optional for PR generation; do not wait for user annotations to complete the PR.
