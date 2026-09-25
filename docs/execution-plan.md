# Consolidation and model-optional Pstack — execution plan

Facts in this document were verified against live sources on **2026-09-25** unless a different date is shown. Re-verify prices and model IDs before acting on them.

## Context and goal

Two goals, decided together:

1. Make `thisguymartin/skills` the single official personal skills repository by absorbing the four research/artifact skills from `thisguymartin/scribble`, which was never publicly finished (its manifests still pointed at `mpatino117/scribble`).
2. Get a model-optional version of Pstack: Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) assumes frontier models on Cursor's compute, and [Open Pstack](https://github.com/ericlitman/open-pstack) (the Claude Code/Codex port this repository hands off to) requires all four frontier model families at setup. The goal is explicit control over which models run and what they cost — including open-weight labs like DeepSeek and MiniMax — down to a zero-subscription mode that runs on two API keys.

## Current state

- This repository: thirteen skills after the migration recorded below; distribution stays Skills-CLI-only.
- `thisguymartin/scribble`: still exists unmodified; archival is a follow-up (F2). Open issue #5 (`/deploy-html`) and the closed draft PR #6 carry an unfinished proposal (F3).
- Open Pstack pin: `upstreams/manifest.json` pins `56bfd14` (= v1.3.0, syncing Cursor pstack 0.14.7, 2026-09-04). Upstream released v1.4.0 (2026-09-08) and v1.4.1 (2026-09-10), and upstream issue #88 plans a 1.5.0 sync of pstack 0.15.5. The pin is two releases stale (F1).
- Upstream pstack (Cursor) is very active (0.15.5 as of 2026-09-23) and rejects multi-host support PRs; Open Pstack is a faithful single-maintainer port with 16 open community PRs. No issue or PR in either project mentions MiniMax, DeepSeek, GLM, Kimi, Qwen, or OpenRouter — the provider gap is open.

## Decisions

| Decision | Rationale |
| --- | --- |
| Skills-only migration (no plugin manifests, no command shims) | The Skills CLI already reaches Codex, Claude Code, Cursor, and other hosts; a second plugin distribution surface adds per-host testing without new capability. Scribble's own plan noted marketplace validation was never completed. |
| Frontmatter normalized to `name`/`description`/`license` | This repository's validator deliberately accepts only that subset; scribble's `metadata: commands:` block is not needed once command shims are gone. |
| Cross-skill references kept, grouping documented | `scribble`, `source-synthesis`, and `tool-evaluation` reference `scribble-research/references/artifact-patterns.md`; duplicating it four times would drift. The install-together caveat lives in [compatibility](compatibility.md). |
| `agents/openai.yaml` kept inside the scribble skill | Host-optional Codex interface metadata that travels with the skill folder; stale display name updated to "Scribble". |
| Per-skill `LICENSE.txt` added to the quartet | Uniform folder shape with the adapted skills; notices travel with the skill when installed standalone. |
| Fork Open Pstack as `pstack-flex` (new repo) | See fork strategy below. Alternatives considered: upstream-PR-only (slower, single-maintainer dependency — still pursued in parallel as F5); a standalone lanes plugin (loses pstack's panel/playbook integration); a gateway-only setup such as claude-code-router (no panel semantics or diversity guarantees). |

## Migration record

Source: `thisguymartin/scribble` at `b4f5f7a` (main). Everything below moved verbatim except the noted edits.

| Source | Destination | Edits |
| --- | --- | --- |
| `skills/scribble/` | [`skills/scribble/`](../skills/scribble/SKILL.md) | Frontmatter: removed `metadata:`/`commands:`, added `license: MIT`. Body: entry-point sentence no longer names `commands/scribble.md`; the validation checklist item about placeholder text reworded to avoid this repo's scaffold-scan tokens. `agents/openai.yaml` display name updated to "Scribble". |
| `skills/scribble-research/` | [`skills/scribble-research/`](../skills/scribble-research/SKILL.md) | Frontmatter normalization only. |
| `skills/source-synthesis/` | [`skills/source-synthesis/`](../skills/source-synthesis/SKILL.md) | Added `license: MIT`. |
| `skills/tool-evaluation/` | [`skills/tool-evaluation/`](../skills/tool-evaluation/SKILL.md) | Added `license: MIT`. |

Deliberately not migrated: `commands/*.md` (thin shims only useful to plugin installs; hosts invoke the skills directly), `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.agents/plugins/` (plugin distribution dropped), and scribble's `README.md`/`PLAN.md`/`AGENTS.md` (superseded by this repository's docs; durable ideas captured in the follow-ups below).

## pstack-flex fork strategy

A new repository, `thisguymartin/pstack-flex`, forks `ericlitman/open-pstack` at its latest release tag and changes as little as possible:

- Setup accepts any subset of model families; missing families become disabled lanes with recorded reasons instead of fatal errors.
- A single lane registry describes every lane; stock lanes stay the defaults.
- New lanes reuse the CLIs Open Pstack already spawns. There is no custom agent loop and no raw API client: an API lane spawns the same `claude` binary with `ANTHROPIC_BASE_URL` pointed at the lab's Anthropic-compatible endpoint and that lab's token, in an isolated `CLAUDE_CONFIG_DIR`. Both DeepSeek and MiniMax officially document this setup.
- Zero-subscription mode is a first-class, tested configuration: driver session and all lanes on DeepSeek + MiniMax API keys only. Two labs are two distinct model families, so adversarial panels keep real diversity.
- The complete build specification is the standalone prompt in [pstack-fork-bootstrap.md](pstack-fork-bootstrap.md).

This repository's boundary does not move: shaping ends here, and the handoff still names `pstack:poteto-mode`. When pstack-flex is in use, its plugin exposes the same skill names, so handoffs work unchanged.

## Provider lanes and costs

Verified 2026-09-25; every figure drifts, re-check at build time.

| Lane | Family | Access | Model | Cost basis |
| --- | --- | --- | --- | --- |
| claude | claude | subscription (signed-in `claude` CLI) | fable / opus | Claude plan |
| codex | gpt | subscription (signed-in `codex` CLI) | gpt-5.6-sol | ChatGPT/Codex plan |
| grok | grok | subscription (signed-in `grok` CLI) | grok-4.6 | Grok plan |
| deepseek | deepseek | API key, env-injected `claude` CLI | deepseek-flash (V4.1) | $0.30/$1.20 per M tokens peak; $0.15/$0.60 off-peak (01:00–04:00 and 06:00–10:00 UTC weekdays); cache hits near-free. V4-Pro $1.32/$3.96 peak for harder work. MIT weights. |
| minimax | minimax | API key, env-injected `claude` CLI | MiniMax-M3 | $0.30/$1.20 per M tokens at ≤512K input; 1M context. Custom community model license (API use unaffected). |
| openrouter (optional, off by default) | any | API key through a local Anthropic-format translator (claude-code-router or a pinned LiteLLM) | any | Provider list price plus roughly 5.5% credit fee. Only lane needing an extra local process. |
| local (deferred) | local | Ollama (Anthropic-compatible API since v0.14) | open weights | Hardware only. Planned for a later version. |

## Risks

- **Unsupported, not prohibited.** Anthropic's docs state Claude Code routing to non-Claude models through gateways is not supported. No terms clause or enforcement against pointing the unmodified binary at third-party endpoints was found (2026-09-25), but a CLI update can break compatibility without notice. Mitigation: pin the `claude` CLI version per API lane and bump deliberately.
- **Credential isolation.** Never run a lane with a live claude.ai login while `ANTHROPIC_BASE_URL` points elsewhere; the saved credential could be sent to the third-party host. Every API lane uses an isolated `CLAUDE_CONFIG_DIR`, and the runner refuses to start if it detects an OAuth login in the effective config dir.
- **Privacy.** Third-party lanes are opt-in per project. Client or customer code and data never go to DeepSeek/MiniMax/OpenRouter by default — same rule as `AGENTS.md`.
- **Drift.** Model IDs, endpoints, and prices change quickly (DeepSeek retired its legacy model names in July 2026; MiniMax repriced during 2026). Lane configs carry a `verified` date and the fork's docs require re-verification.
- **Upstream sync burden.** Open Pstack is single-maintainer and tracks a fast upstream. pstack-flex keeps changes additive and rehearses `git merge upstream/main` in CI so the delta stays cheap.
- **Name collisions in the Skills CLI.** Generic-ish names (`handoff`, now also `scribble`) can collide with other installed collections; removal commands in this repo stay name-scoped, never `--all`.

## Follow-ups (ordered)

1. **F1 — Bump the Open Pstack pin.** `56bfd14` -> v1.4.1 (or 1.5.0 once released). Use this repository's own procedure: `node scripts/check-upstreams.ts`, review the diff at the exact revision, then update `upstreams/manifest.json`, `UPSTREAMS.md`, and the pinned workflow snippet in [compatibility](compatibility.md) together.
2. **F2 — Archive `thisguymartin/scribble`.** After this PR lands: smoke-install the quartet from this repository, port issue #5 forward (F3), add a pointer note to scribble's README, then archive the repo on GitHub.
3. **F3 — Re-scope the `/deploy-html` idea.** Scribble issue #5 proposed a Cloudflare Worker + D1 BLOB store for publishing HTML artifacts. Its skill names predate the scribble rename, so the proposal needs re-scoping against the current quartet — either as a future skill here or a pstack-flex playbook.
4. **F4 — Future skill candidates from scribble's plan.** `market-research`, `architecture-discovery`, `competitor-landscape`, `business-model-review`. Each must earn its own entrypoint per `AGENTS.md`.
5. **F5 — Upstream PR to Open Pstack.** Propose optional model families (their issue #72 already tracks the pain). Every merged piece shrinks the pstack-flex delta.
6. **F6 — Refresh the install smoke test.** Rerun the isolated Skills-CLI install/removal test against all thirteen skills and update the dated records in [compatibility](compatibility.md).

## Appendix: plugin-manifest variant (not chosen)

The superpowers-style alternative would add `.claude-plugin/plugin.json` + `marketplace.json`, `.codex-plugin/plugin.json` with `"skills": "./skills/"` and an interface block, `.cursor-plugin/`, `.agents/plugins/marketplace.json`, restored command shims, and per-release version bumps across every manifest. Deferred because it creates a second distribution surface to test on every host for no new capability; it can be revisited if marketplace presence ever matters.
