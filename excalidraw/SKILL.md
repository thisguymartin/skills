---
name: excalidraw
description: Work through a diagram with the user on this session's own local Excalidraw canvas alongside the Claude Code conversation — draw it, hand it over, and act on what they annotate when they click "▶ Send to Claude". Use when they say "draw this in excalidraw", "show me a diagram", "let me annotate it", "check the canvas", or /excalidraw.
---

# Excalidraw canvas

Nothing runs until this skill does. Each Claude Code session gets its own canvas on a port derived from `CLAUDE_CODE_SESSION_ID`. The `excalidraw` MCP already points at that port, and its tools fail until the canvas is started. The canvas stops on its own when the session's Claude process exits.

Setup (MCP server, launcher, CLI): [INSTALL.md](./INSTALL.md).

If the user explicitly requests parallel drawing, subagents share this canvas; give each an agreed region so edits do not overlap. Parallel drawing is optional.

Per-session files live in `~/mcp/excalidraw-data/sessions/$CLAUDE_CODE_SESSION_ID/`: `scene.excalidraw`, `canvas.log`.

## Round trip

0. **Start.** `excalidraw-inbox --start` — idempotent; prints the local URL, then the LAN URL (`http://<host>.local:<port>`). The canvas listens on `0.0.0.0`, so the user can draw on it from a tablet on the same network — always give them the LAN URL alongside the local one.
1. **Draw.** Build the diagram with the MCP tools, `get_canvas_screenshot` to check it, fix clipped labels and overlaps, then `set_viewport` to fit.
2. **Hand off.** `excalidraw-inbox --handoff` snapshots the canvas as the baseline and opens the browser if no tab is connected; its JSON carries `url` and `lanUrl`. Tell them to annotate and click **▶ Send to Claude**.
3. **Listen.** Arm a Monitor on `excalidraw-inbox --watch` (description "Send to Claude clicks", `timeout_ms` 1800000; re-arm on expiry while the conversation is still about the diagram). One line per click:
   `{sent, baseline, added, changed: [{..., keys, was?}], deleted}`. Bound labels are folded into their shape, so `text` is what a person reads.
4. **Read the message.** Everything in the diff is the user talking — a note, a strike-out, a recolor, a deleted box, a new arrow. Always `get_canvas_screenshot` before interpreting: freehand circles and scribbles only appear as `freedraw added`.
5. **Answer in the conversation and on the canvas.** A question written on the canvas gets its answer drawn right beside it, touching it or one gap away. Change the drawing too when the annotations ask for a change.
6. **Re-hand off after every canvas edit you make** (`--handoff` again). The next click diffs against the newest `claude-*` snapshot, so skipping this reports your own edits back as theirs.

**Status that changes goes in its own text element.** After a canvas restart, `update_element` on a shape's label reports success but the old bound text keeps rendering. Put each changing status line in a standalone `text` element with an id you chose (`s-<ticket>`), place it under its shape, and update that element instead of the label. Screenshot after the first update to confirm it rendered.

`excalidraw-inbox` with no flag prints the diff since the last handoff/send without waiting for a click.

## Storage

In-memory upstream. The scene autosaves every 15s and on exit to the session's `scene.excalidraw`, and is restored when a canvas starts for the same session ID. Snapshots are not saved, so after a restart the first send has no baseline and reports everything as added — hand off again. An empty canvas is never saved; clearing it leaves the last save on disk. A scene from another session can be pulled in with `import_scene` from its folder.

The button lives on the `send-to-claude` branch of `~/mcp/excalidraw` (`frontend/src/App.tsx`, `sendToClaude`). After pulling upstream, `pnpm run build`; running canvases pick it up when their session's MCP reconnects.
