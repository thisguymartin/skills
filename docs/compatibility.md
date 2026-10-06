# Runtime and installation

## CLI-first behavior

Cloud investigation uses native `aws` commands and needs AWS CLI v2 plus an authenticated profile. It has no custom wrapper or Node requirement. The three bundled helpers are dependency-free TypeScript for Node 22.18+; the GitHub helper uses `gh` on PATH with argument arrays. Every helper supports --help; the GitHub helper supports --dry-run without calling `gh`. No tool installs, credential changes, MCP setup, or global skill installation happen as a side effect.

Use a newer supported Node release if available; plain skill instructions work without Node, while bundled helpers require it. A browser is needed to view HTML. Native TypeScript availability is documented in [Node's guide](https://nodejs.org/en/learn/typescript/run-natively).

Claude Code and Codex discover SKILL.md instructions. Invoke according to the host UI (for example /project-research in Claude or $project-research in Codex). Tool inventories differ: discover current schemas; never assume a hardcoded MCP tool name or a particular connector is available.

The repository has eight root skill folders. Supporting Markdown stays flat; only scripts/ and agents/ may be subdirectories inside a skill. General documentation/examples and fixtures live under docs/. Generated research files belong in the target task workspace, not in the installed collection.

## Local installation and migration

Install from `.` while reviewing unpublished changes. Installation changes skill directories and remains a separate user task. The upstream Skills CLI documents the flags in its [README](https://github.com/vercel-labs/skills).

The previous thirteen skills and excalidraw-lanes have been replaced in this checkout. Existing global copies are not removed by adding the current collection. If you want to remove the old global collection, run this separately:

```bash
npx skills remove issue-workflow investigate-issue shape-feature design-user-flow wireframe-feature write-feature-spec review-feature-spec publish-linear handoff scribble scribble-research source-synthesis tool-evaluation excalidraw-lanes -g
```

Omit a host filter only when you intend to remove canonical shared copies as well. Do not remove unrelated installed skills. `artifact-upload` is external and remains separate.

## Excalidraw

The existing launcher and local round trip are preserved. Read [INSTALL.md](../excalidraw/INSTALL.md) for the local MCP, launcher, branch and rebuild details. Its Send to Claude listener assumes Claude Code's session ID and Monitor capability. Codex may need an explicit session URL and host-specific listening workflow; do not claim that round trip has been verified in Codex. The new research/HTML skills do not depend on a live canvas.

The source describes a session-derived port; hash-based selection can collide, so check the actual running canvas before sharing or editing. Canvas data and internal screenshots stay local unless the user requests sharing.

## Notion capture and recall

notion-brain uses the host's existing Notion connection and discovers tools/access at runtime. No Node helper, REST token, new database, or connector setup is required. Saving/updating needs page-write access; read-only connections can still recall context or produce a local draft. Local artifact attachment requires a supported upload capability; an existing stable URL can be linked instead.

Martin's Brain is the configured default, with its URL and a dated schema snapshot in the skill. Fetch the live schema before mapping properties, and read the connected enhanced-Markdown specification before content writes. A database's view ID is not its collection ID. A request to chain research -> artifact -> save authorizes that single capture; invoking research alone does not. Global installation remains a separate task. See [workflow prompts](notion-brain-workflow.md).

## Yaak

yaak-query uses `@yaakapp/cli` directly and has no custom script. The CLI selects the desktop app's local collection unless `--data-dir` is supplied. Discovery and query examples were checked on 2026.8.1; inspect installed help before using newer flags. Request sends retain response history and may update cookies. HTTP was exercised locally; GraphQL uses its HTTP model but was not queried end to end. gRPC/WebSocket sends are unsupported in the checked CLI.

Yaak's separate `yaak agent install` writes a managed use-yaak skill into detected hosts and the shared agent skill directory. Keep custom research guidance in yaak-query so refreshing Yaak's skill does not overwrite it. Neither the CLI nor that official skill is installed globally by this repository's checks. The CLI's `auth` command is for plugin publishing; saved endpoint credentials remain local in Yaak.

## History

Claude defaults to ~/.claude/history.jsonl. Scoped messages live under ~/.claude/projects when retained. Codex reads ~/.codex/sessions and uses session metadata to filter cwd/session. `--root` accepts the corresponding local provider directory. Neither mode logs into web chat history. An index match can exist without a retained conversation file.

Searches are bounded, include coverage metadata, and are not newest-first. Hidden reasoning and tool outputs are excluded. Keep output local and sanitize excerpts before including private context in shareable artifacts.

## Verification limits

Tests use local synthetic JSONL, JSON and Git fixtures. GitHub CLI argument plans are exercised without network. AWS command examples are reviewed against official docs. Live credentials, MCP scopes, AWS permissions, Vantage results, canvas startup, and publication are not verified by these tests. A visual HTML inspection is recorded separately when performed.
