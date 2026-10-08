---
name: excalidraw
description: Work through a diagram with the user on a local Excalidraw canvas in Claude Code or Codex, hand it over for annotation, and apply their changes. Use when they say "draw this in excalidraw", "show me a diagram", "let me annotate it", "check the canvas", or /excalidraw.
---

# Excalidraw canvas

Start or select the intended canvas before drawing. The inbox derives a port from an explicit session ID or the Claude/Codex session environment; its bundled supervisor stops a canvas it starts when the configured owner process exits. An existing canvas can be selected with `EXPRESS_SERVER_URL`. Verify the MCP and inbox point to the same URL; do not assume the host configured them already.

Setup (MCP server, launcher, CLI): [INSTALL.md](./INSTALL.md).

If the user explicitly requests parallel drawing, subagents share this canvas; give each an agreed region so edits do not overlap. Parallel drawing is optional.

Per-session files live in `~/mcp/excalidraw-data/sessions/<session-id>/`: `scene.excalidraw`, `canvas.log`. Codex may require explicit `EXCALIDRAW_SESSION_ID` and `EXCALIDRAW_OWNER_PID`; see setup before starting it.

## Round trip

0. **Start.** `excalidraw-inbox --start` — idempotent; prints the local URL, then the LAN URL (`http://<host>.local:<port>`). The canvas listens on `0.0.0.0` by default for tablet annotation; give both URLs in that mode. With `HOST=127.0.0.1`, give the local URL only.
1. **Draw.** Build the diagram with the MCP tools, `get_canvas_screenshot` to check it, fix clipped labels and overlaps, then `set_viewport` to fit.
2. **Hand off.** `excalidraw-inbox --handoff` snapshots the baseline and opens the browser if no tab is connected; its JSON carries `url` and `lanUrl`. Ask the user to annotate and tell you when done. A verified **▶ Send to Claude** button can signal completion instead when present.
3. **Listen or read.** Use the host's background-process capability for `excalidraw-inbox --watch` only when the Send button exists. Otherwise run `excalidraw-inbox` after the user reports annotations. One line per Send click:
   `{sent, baseline, added, changed: [{..., keys, was?}], deleted}`. Bound labels are folded into their shape, so `text` is what a person reads.
4. **Read the message.** Everything in the diff is the user talking — a note, a strike-out, a recolor, a deleted box, a new arrow. Always `get_canvas_screenshot` before interpreting: freehand circles and scribbles only appear as `freedraw added`.
5. **Answer in the conversation and on the canvas.** A question written on the canvas gets its answer drawn right beside it, touching it or one gap away. Change the drawing too when the annotations ask for a change.
6. **Re-hand off after every canvas edit you make** (`--handoff` again). The next click diffs against the newest `claude-*` snapshot, so skipping this reports your own edits back as theirs.

**Status that changes goes in its own text element.** After a canvas restart, `update_element` on a shape's label reports success but the old bound text keeps rendering. Put each changing status line in a standalone `text` element with an id you chose (`s-<ticket>`), place it under its shape, and update that element instead of the label. Screenshot after the first update to confirm it rendered.

`excalidraw-inbox` with no flag prints the diff since the last handoff/send without waiting for a click.

## Storage

In-memory upstream. Canvases started by the bundled supervisor save every 15s and on orderly shutdown to the session's `scene.excalidraw`, then restore it on restart, including intentionally empty scenes. External canvases do not inherit this persistence. Snapshots are not saved, so hand off again after restarting. Import a scene from another session only when requested.

The historical Send button belongs to a customized frontend, not the standard setup. Use the manual annotation round trip when it is absent. Rebuild the server/frontend after updating its checkout.
