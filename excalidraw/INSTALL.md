# Installing the canvas

The skill needs a local **excalidraw MCP server** and the bundled **`excalidraw-inbox`** CLI. Setup changes local tools/configuration; run it only when requested.

## 1. The MCP server

Build [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw). Its standard frontend supports manual annotation. The historical `send-to-claude` frontend adds an optional Send button; do not assume that branch or button exists in a fresh checkout.

```bash
git clone https://github.com/yctimlin/mcp_excalidraw.git ~/mcp/excalidraw
cd ~/mcp/excalidraw
pnpm install
pnpm run build
```

Rebuild (`pnpm run build`) after every pull; running canvases pick the new frontend up when their session's MCP reconnects.

## 2. The launcher

The MCP process has to talk to *this session's* canvas, so it reads the port from `excalidraw-inbox --url` at startup rather than a fixed value. Save this as `~/mcp/run_excalidraw.sh` and `chmod +x` it:

```bash
#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/excalidraw"
NODE=/absolute/path/to/node
EXPRESS_SERVER_URL="${EXPRESS_SERVER_URL:-$("$NODE" "$HOME/.local/bin/excalidraw-inbox" --url)}"
export EXPRESS_SERVER_URL EXCALIDRAW_NO_AUTOSTART=1 EXCALIDRAW_EXPORT_DIR="$HOME"
exec "$NODE" dist/index.js
```

Replace `NODE` with the path from `which node`. MCP hosts may not inherit your version manager on PATH. If the checkout is elsewhere, update the `cd` path and set `EXCALIDRAW_REPO` for the inbox.

## 3. The CLI

Keep `scripts/run-canvas.mjs` beside `scripts/excalidraw-inbox`. This bundled supervisor launches `dist/server.js`, restores/saves scenes, and stops its child when the owner exits; no separate `~/mcp/run_excalidraw_canvas.sh` is needed. Put the inbox on PATH from its actual installed folder:

```bash
mkdir -p ~/.local/bin
ln -s /absolute/path/to/excalidraw/scripts/excalidraw-inbox ~/.local/bin/excalidraw-inbox
```

The inbox accepts `EXCALIDRAW_SESSION_ID`, `CLAUDE_CODE_SESSION_ID`, `CODEX_SESSION_ID`, or `CODEX_THREAD_ID`, in that order. It hashes the ID into a port between 20000 and 39999; collisions remain possible. An explicit `EXPRESS_SERVER_URL` overrides that URL. Startup requires the server's health response to identify its PID, as current upstream does; an older server without that identity must be updated rather than restoring over an unverified process.

Starting a canvas requires the long-lived harness PID in `EXCALIDRAW_OWNER_PID`, `CLAUDE_PID`, or `CODEX_PID`. Do not use a temporary command shell's PID. In Codex, use its exposed session/PID variables or set an explicit stable ID and the harness PID for this task, then reuse them for every inbox command:

```bash
export EXCALIDRAW_SESSION_ID=diagram-task-2026-10-07
export EXCALIDRAW_OWNER_PID=<long-lived-agent-pid>
excalidraw-inbox --url
excalidraw-inbox --start
```

For an already running canvas, either host can set `EXPRESS_SERVER_URL` without session/owner variables. The MCP process and inbox must resolve the same URL. When the host does not propagate session variables to MCP, configure that explicit URL with the host's supported environment settings; this selects one canvas rather than providing automatic per-session isolation.

The server binds the local network for tablet annotation. Set `HOST=127.0.0.1` when starting it for local-only access, and omit the LAN URL in that mode.

## 4. Register the MCP

```bash
claude mcp add excalidraw --scope user -- ~/mcp/run_excalidraw.sh
codex mcp add excalidraw -- ~/mcp/run_excalidraw.sh
```

Reconnect the host and verify its tools resolve the intended canvas URL. Its tools fail until a canvas exists; `excalidraw-inbox --start` creates one with the settings above.

## Verify

In a fresh session:

```bash
excalidraw-inbox --start     # prints http://127.0.0.1:<port>
```

Run `excalidraw-inbox --handoff`, open the URL, draw a box, and tell the agent you are done. `excalidraw-inbox` with no flag should report the box as `added`. Use `--watch` only when the installed frontend has a verified Send button that creates `claude-send-*` snapshots. Manual annotation works without it.

The supervisor saves every 15 seconds and on orderly shutdown, including intentionally empty scenes. Verify restart restores the saved scene. Abrupt process/machine termination may lose edits since the last save. External canvases do not inherit this persistence. If MCP points at another port, fix the shared URL and reconnect before drawing.
