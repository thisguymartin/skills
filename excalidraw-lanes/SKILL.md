---
name: excalidraw-lanes
description: Let several subagents draw on this session's Excalidraw canvas at once, each in its own labeled lane, while the user watches them work. Use when dispatching subagents that should show their work visually ("have the agents draw it", "each agent gets a frame", "draw it in parallel"), or when a dispatch prompt hands you an Excalidraw lane.
---

# Excalidraw lanes

Subagents spawned with the Agent tool share this session's `excalidraw` MCP and `CLAUDE_CODE_SESSION_ID` or `CODEX_SESSION_ID`, so they already draw on the parent's canvas. A lane is a dashed frame with a title and a status line that one agent owns. Lanes stop agents drawing over each other and let the user tell them apart.

Codex and other external processes have their own session and cannot reach this canvas.

## Parent

1. Start the canvas and open a tab per the [excalidraw](../excalidraw/SKILL.md) skill (`--start`, then `--handoff`). Screenshots need an open tab.
2. `excalidraw-inbox --lanes <name>,<name>,...`, one kebab-case name per agent. It draws each lane below whatever is already on the canvas and prints one JSON line per lane. Re-running it keeps existing lanes where they are.
3. Dispatch all agents in one message. Give each its line verbatim: "You have an Excalidraw lane. Read `~/.claude/skills/excalidraw-lanes/SKILL.md` and follow its Lane section. Your lane: `<json>`."
4. When an agent reports back, `get_canvas_screenshot` to check its lane, then `excalidraw-inbox --handoff` so the user's next Send does not report the agent's drawing as theirs.
5. Reading a Send while agents still run: `added` or `changed` entries whose id starts with a running agent's `prefix` are that agent's own drawing. Everything else is the user talking, including changes to a finished agent's elements.
6. Only you get Send clicks. Each diff entry drawn inside a lane carries `lane`, and an arrow carries the lane its tip points into. A note written outside every lane with an arrow into one is addressed to that lane. Forward the user's entries for a lane, with the note's id and position and what the screenshot shows there, to that lane's agent with SendMessage. A running agent picks it up mid-task and a finished one resumes with its context. Entries with no `lane` are for you.
7. When the agent answers, repeat its answer in the conversation and `set_viewport` to the question and the answer together. An answer drawn only on the canvas is easy to miss among the lanes.

## Lane

For an agent handed a lane.

- Every element id you create starts with your `prefix`. Touch no element without it.
- Never pass `text` on a shape. The browser turns it into a label with an id it picks, ignores `fontSize` and grows the box. Put each shape's words in their own prefixed `text` element placed inside it.
- Leave at least 60px between shapes an arrow joins. Shorter bound arrows collapse to a dot.
- Keep every element inside your `draw` box. When the box is too small, say so in your report instead of growing past it.
- Draw with `batch_create_elements`, a few batches as you learn more, so the user watches it grow. Bind arrows with `startElementId`/`endElementId`.
- Keep your `status` line current with `update_element` (`text` only): what you are doing now, then `done` or what failed.
- `get_canvas_screenshot` shows the whole canvas. Check your lane and ignore the rest.
- Never call `clear_canvas`, `import_scene`, `restore_snapshot` or `set_viewport`, and never run `excalidraw-inbox`. They act on the whole canvas or the user's view.
- A message from the parent relaying the user's annotations in your lane is the user talking to you. Screenshot, then answer each note right beside it, touching it or one gap away, even when the note sits outside your box. That is the only thing you may place outside it. Fix the drawing too if the note asks, and report the answer's text.
- Report the ids of your top-level shapes and a one-line summary of what the drawing shows.
