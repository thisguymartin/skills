# Set up the Excalidraw canvas

Use [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw). Its npm package includes the MCP server and local canvas. Setup changes local tools/configuration; run it when requested.

## Quick setup with the upstream MCP

With Node 20+ installed, register the server in the client you use:

```bash
claude mcp add excalidraw --scope user -- npx -y mcp-excalidraw-server@2.1.2
codex mcp add excalidraw -- npx -y mcp-excalidraw-server@2.1.2
```

Start the canvas explicitly, or let the MCP start it on launch:

```bash
npx -y mcp-excalidraw-server@2.1.2 start
npx -y mcp-excalidraw-server@2.1.2 status
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) to watch and annotate. Verify the MCP tools with `read_diagram_guide`, draw two labeled boxes with `batch_create_elements`, then inspect `get_canvas_screenshot`. Screenshots and image exports work without a browser; Mermaid conversion and viewport control need an open tab.

Export your work before stopping:

```bash
npx -y mcp-excalidraw-server@2.1.2 export --out /tmp/order-flow.excalidraw
npx -y mcp-excalidraw-server@2.1.2 screenshot --out /tmp/order-flow.png
npx -y mcp-excalidraw-server@2.1.2 stop
```

The standard canvas is in memory by default. Save an editable export for restart/reuse. Do not clear or replace an existing canvas without checking whose work it contains.

### Use a different port

Set the same URL for the client and CLI. For example, in Codex:

```bash
codex mcp add excalidraw --env EXPRESS_SERVER_URL=http://127.0.0.1:3100 -- npx -y mcp-excalidraw-server@2.1.2
npx -y mcp-excalidraw-server@2.1.2 start --url http://127.0.0.1:3100
npx -y mcp-excalidraw-server@2.1.2 status --url http://127.0.0.1:3100
```

Use that URL for subsequent export/stop commands too. The MCP is a stdio process; the canvas URL is its browser/REST endpoint, not an HTTP MCP endpoint.

## Add the annotation inbox

The bundled `excalidraw-inbox` records a baseline, reads annotation changes, and supports per-session canvases. It is optional for drawing through the upstream MCP, and required for this skill's annotation-diff workflow.

Keep `scripts/run-canvas.mjs` beside `scripts/excalidraw-inbox`. Put the inbox on PATH from its actual installed folder:

```bash
mkdir -p ~/.local/bin
ln -s /absolute/path/to/excalidraw/scripts/excalidraw-inbox ~/.local/bin/excalidraw-inbox
```

To use the standard canvas already running on port 3000:

```bash
export EXPRESS_SERVER_URL=http://127.0.0.1:3000
excalidraw-inbox --handoff
```

Draw or edit in the browser, tell the agent you are done, then run `excalidraw-inbox` without flags to read the changes. Run `--handoff` again after the agent revises the diagram. Manual annotation works with the standard frontend; `--watch` needs a verified customized Send button.

## Per-session canvases from source

Use this setup when you need the bundled supervisor to start a canvas for each session and save/restore its scene. It requires a built upstream checkout, the inbox, and a long-lived owner PID.

### 1. Build the MCP server

Build [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw). Its standard frontend supports manual annotation. The historical `send-to-claude` frontend adds an optional Send button; do not assume that branch or button exists in a fresh checkout.

```bash
git clone https://github.com/yctimlin/mcp_excalidraw.git ~/mcp/excalidraw
cd ~/mcp/excalidraw
npm ci
npm run build
```

Rebuild (`npm run build`) after every pull, then restart affected canvas processes to load the new server/frontend.

### 2. Create the launcher

The MCP process reads this session's canvas URL from `excalidraw-inbox --url` at startup. Save this as `~/mcp/run_excalidraw.sh` and `chmod +x` it:

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

### 3. Start a session canvas

The bundled supervisor launches `dist/server.js`, restores/saves scenes, and stops its child when the owner exits; no separate `~/mcp/run_excalidraw_canvas.sh` is needed. Install the inbox as described above.

The inbox accepts `EXCALIDRAW_SESSION_ID`, `CLAUDE_CODE_SESSION_ID`, `CODEX_SESSION_ID`, or `CODEX_THREAD_ID`, in that order. It hashes the ID into a port between 20000 and 39999; collisions remain possible. An explicit `EXPRESS_SERVER_URL` overrides that URL. Startup requires the server's health response to identify its PID, as current upstream does. Update an older server that lacks that identity before restoring a scene.

Starting a canvas requires the long-lived harness PID in `EXCALIDRAW_OWNER_PID`, `CLAUDE_PID`, or `CODEX_PID`. Do not use a temporary command shell's PID. In Codex, use its exposed session/PID variables or set an explicit stable ID and the harness PID for this task, then reuse them for every inbox command:

```bash
export EXCALIDRAW_SESSION_ID=diagram-task-2026-10-07
export EXCALIDRAW_OWNER_PID=<long-lived-agent-pid>
excalidraw-inbox --url
excalidraw-inbox --start
```

For an already running canvas, either host can set `EXPRESS_SERVER_URL` without session/owner variables. The MCP process and inbox must resolve the same URL. When the host does not propagate session variables to MCP, configure an explicit URL with the host's supported environment settings. That selects one shared canvas; automatic per-session isolation requires the session-aware launcher.

The server binds the local network for tablet annotation. Set `HOST=127.0.0.1` when starting it for local-only access, and omit the LAN URL in that mode.

### 4. Register the session launcher

```bash
claude mcp add excalidraw --scope user -- ~/mcp/run_excalidraw.sh
codex mcp add excalidraw -- ~/mcp/run_excalidraw.sh
```

Reconnect the host and verify its tools resolve the intended canvas URL. Its tools fail until a canvas exists; `excalidraw-inbox --start` creates one with the settings above.

### Verify session recovery

In a fresh session:

```bash
excalidraw-inbox --start     # prints http://127.0.0.1:<port>
```

Run `excalidraw-inbox --handoff`, open the URL, draw a box, and tell the agent you are done. `excalidraw-inbox` with no flag should report the box as `added`. Use `--watch` only when the installed frontend has a verified Send button that creates `claude-send-*` snapshots. Manual annotation works without it.

The supervisor saves every 15 seconds and on orderly shutdown, including intentionally empty scenes. Verify restart restores the saved scene. Abrupt process/machine termination may lose edits since the last save. External canvases do not inherit this persistence. If MCP points at another port, fix the shared URL and reconnect before drawing.
