# Installing the canvas

The skill needs two things that don't come with it: the **excalidraw MCP server** and the **`excalidraw-inbox`** CLI. Both are local — nothing is hosted.

## 1. The MCP server

The canvas is [yctimlin/mcp_excalidraw](https://github.com/yctimlin/mcp_excalidraw) on the `send-to-claude` branch, which adds the **▶ Send to Claude** button the skill's round trip depends on. Upstream `main` has no button.

```bash
git clone git@github.com:yctimlin/mcp_excalidraw.git ~/mcp/excalidraw
cd ~/mcp/excalidraw
git checkout send-to-claude
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
NODE="$HOME/.local/share/fnm/aliases/default/bin/node"
EXPRESS_SERVER_URL="$("$NODE" "$HOME/.local/bin/excalidraw-inbox" --url)"
export EXPRESS_SERVER_URL EXCALIDRAW_NO_AUTOSTART=1 EXCALIDRAW_EXPORT_DIR="$HOME"
exec "$NODE" dist/index.js
```

`NODE` is an absolute path on purpose — Claude Code launches MCP servers without your shell's version manager on `PATH`. Point it at whatever `which node` prints.

## 3. The CLI

`scripts/excalidraw-inbox` in this skill is the whole thing: it starts the per-session canvas, snapshots handoffs, and polls for clicks. Put it on your `PATH`:

```bash
ln -s ~/.claude/skills/excalidraw/scripts/excalidraw-inbox ~/.local/bin/excalidraw-inbox
```

It derives the port from `CLAUDE_CODE_SESSION_ID` (`20000 + sha256(session)[0:4] % 20000`), so every session gets its own canvas and two sessions never collide. Outside Claude Code it asserts unless `EXPRESS_SERVER_URL` is set.

## 4. Register the MCP

```bash
claude mcp add excalidraw --scope user -- ~/mcp/run_excalidraw.sh
```

Restart Claude Code, then check `/mcp` lists `excalidraw`. Its tools fail until a canvas exists — that's expected; step 0 of the skill (`excalidraw-inbox --start`) creates one.

## Verify

In a fresh session:

```bash
excalidraw-inbox --start     # prints http://127.0.0.1:<port>
```

Open the URL, draw a box by hand, click **▶ Send to Claude**, and run `excalidraw-inbox` with no flag — it should report the box as `added`. If the canvas starts but the MCP tools error, the MCP is pointed at a different port: restart the session so the launcher re-reads `--url`.
