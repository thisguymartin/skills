# pstack-flex bootstrap prompt

This document is a self-contained build specification. How to use it:

1. Create an empty GitHub repository `thisguymartin/pstack-flex`.
2. Open a coding-agent session with network and GitHub access in a workspace for that repository (Bun and git available).
3. Paste everything below the horizontal rule as the opening prompt. The agent should read this whole document before writing anything.

Context for future readers: strategy and rationale live in [execution-plan.md](execution-plan.md). Facts and prices below were verified 2026-09-25 and drift; the prompt instructs re-verification.

---

## Mission

Build **pstack-flex**: a friendly fork of [ericlitman/open-pstack](https://github.com/ericlitman/open-pstack) (the MIT-licensed Claude Code/Codex port of Lauren Tan's Cursor pstack plugin) that

- makes the four frontier model families **optional** instead of required,
- adds a **provider-lane registry** with DeepSeek and MiniMax lanes (plus an optional OpenRouter lane and a stub for a later local/Ollama lane),
- adds **per-lane budget and cost visibility**,
- and supports a **zero-subscription mode** (no Claude/ChatGPT/Grok plans — only DeepSeek and MiniMax API keys),

while keeping pstack's skills, playbooks, and Open Pstack's upstream-sync process intact.

## Execution model (do not deviate)

pstack-flex is **not** an API-calling orchestrator. Open Pstack's runner already spawns a headless CLI subprocess per lane (for example `claude -p ...` or a `codex` exec); that subprocess is the full agent with its own loop, tools, and file access. pstack-flex changes only *which subprocess gets spawned and with what environment*:

- A **subscription lane** spawns a signed-in CLI as upstream does today.
- An **API lane** spawns the same `claude` binary with `ANTHROPIC_BASE_URL` pointed at the lab's Anthropic-compatible endpoint and that lab's token, inside an **isolated `CLAUDE_CONFIG_DIR`**, so every model request bills the lab's key and never touches Anthropic.
- No custom agent loop. No raw API client. No new harness dependency (not OpenCode, not MiniMax Code, not DeepSeek Harness).

Zero-subscription mode follows directly: the Claude Code binary is a free download — a subscription is only needed to reach Anthropic's servers — so both the interactive driver session and every lane can run `claude` pointed at DeepSeek or MiniMax.

## Step 1 — Fork mechanics

1. Clone `https://github.com/ericlitman/open-pstack` with full history.
2. Check out the **latest release tag** (v1.4.1 as of 2026-09-25 — resolve the actual latest at run time; upstream issue #88 plans a 1.5.0 sync of pstack 0.15.5).
3. `git remote add upstream https://github.com/ericlitman/open-pstack` and keep `origin` as `thisguymartin/pstack-flex`.
4. Record the tag and exact commit SHA in an addendum to the fork's UPSTREAM.md.
5. Push `main` to origin before making changes, so the fork point is inspectable.

## Step 2 — Verify the upstream baseline before editing

Read the code first and write down (in a scratch file, later distilled into LANES.md) the actual locations of:

- the setup flow that probes model families — upstream behavior: it probes all four baseline families and **requires every one** (upstream issue #72 tracks this);
- the stock lane definitions — expected: `claude:fable@max`, `codex:gpt-5.6-sol@max`, `grok:grok-4.6@xhigh`, `claude:opus@xhigh`, each via that model's own signed-in CLI and subscription;
- the lane dispatch/spawn code (the Bun runner under the poteto-mode skill);
- the "does not quietly replace a failed model with a weaker one" guarantee;
- the budget level (max/xhigh/high/medium) upstream added at setup;
- the multi-model panel skills (`interrogate`, `arena`, `swarm`, `architect`) — upstream principle to preserve: "the adversarial signal comes from model diversity, not assigned personas";
- the UPSTREAM.md sync process.

If any expectation above does not match the checked-out code, trust the code and note the difference.

## Step 3 — Goals (each must end up testable)

- **G1 — Optional families.** Setup succeeds with any subset of ≥1 configured lane. A missing family becomes a *disabled lane with a recorded reason* (CLI not found, no auth, probe failed), never a fatal error.
- **G2 — Lane registry.** One config file describes every lane; the four stock lanes remain the defaults so a stock install behaves exactly like upstream.
- **G3 — DeepSeek and MiniMax lanes** via the env-injected `claude` CLI as described above. Optionally document (not build) the Codex alternative: both labs' OpenAI-format endpoints support the Responses API Codex requires (`wire_api = "responses"` in a `[model_providers.<id>]` block; Codex removed Chat Completions support in early 2026).
- **G4 — Budgets and cost visibility.** Per-lane budget level plus a pricing annotation surfaced in cost output, including DeepSeek's off-peak discount window (surface it; do not auto-schedule work around it).
- **G5 — Diversity rule.** Adversarial panels require ≥2 *distinct families* by default (`min_family_diversity`, overridable per panel). Any user-chosen panel of ≥2 diverse families is legal — DeepSeek + MiniMax counts. A single-family panel runs only behind an explicit override.
- **G6 — Never silently downgrade.** A failed lane halts or asks, per config. Substitution happens only by explicit user choice. This preserves upstream's guarantee.
- **G7 — Zero-subscription mode.** A documented, tested configuration where the only credentials on the machine are `DEEPSEEK_API_KEY` and `MINIMAX_API_KEY`.

## Non-goals

- No rewriting of pstack skills or playbooks. Keep changes additive and isolated so upstream merges stay cheap.
- Keep the UPSTREAM.md sync process working; pstack-flex-specific files live beside upstream files, not inside them.
- No telemetry of any kind.
- No secrets in committed files — `${VAR}` interpolation from the environment only.
- Do not remove or rename the four stock lanes.

## Config schema (the load-bearing design — do not guess an alternative)

Ship `pstack-flex.example.jsonc` in the repo root; the real config is user-local and gitignored.

```jsonc
{
  "version": 1,
  "defaults": {
    "min_family_diversity": 2,
    "budget": "high",
    "on_lane_failure": "halt"        // "halt" | "ask" — never auto-substitute
  },
  "lanes": {
    "claude": { "kind": "subscription", "cli": "claude", "family": "claude", "model": "fable", "budget": "max", "enabled": "auto" },
    "codex":  { "kind": "subscription", "cli": "codex",  "family": "gpt",    "model": "gpt-5.6-sol", "budget": "max", "enabled": "auto" },
    "grok":   { "kind": "subscription", "cli": "grok",   "family": "grok",   "model": "grok-4.6", "budget": "xhigh", "enabled": "auto" },
    "opus":   { "kind": "subscription", "cli": "claude", "family": "claude", "model": "opus", "budget": "xhigh", "enabled": "auto" },
    "deepseek": {
      "kind": "api", "cli": "claude", "family": "deepseek", "model": "deepseek-flash",
      "config_dir": "~/.pstack-flex/deepseek",   // isolated CLAUDE_CONFIG_DIR — never reuses a claude.ai login
      "cli_version_pin": "",                      // optional exact claude CLI version; bump deliberately
      "env": {
        "ANTHROPIC_BASE_URL": "<from DeepSeek's official Claude Code guide — verify at build time>",
        "ANTHROPIC_AUTH_TOKEN": "${DEEPSEEK_API_KEY}",
        "ANTHROPIC_MODEL": "deepseek-flash",
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
        "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
        "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "<per DeepSeek docs>",
        "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
      },
      "budget": "high",
      "pricing": { "note": "V4.1-Flash: $0.30/$1.20 per M peak; $0.15/$0.60 off-peak (01:00-04:00 and 06:00-10:00 UTC weekdays); cache hits near-free", "verified": "2026-09-25" }
    },
    "minimax": {
      "kind": "api", "cli": "claude", "family": "minimax", "model": "MiniMax-M3",
      "config_dir": "~/.pstack-flex/minimax",
      "cli_version_pin": "",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "${MINIMAX_API_KEY}",
        "ANTHROPIC_MODEL": "MiniMax-M3",
        "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
      },
      "budget": "high",
      "pricing": { "note": "M3: $0.30/$1.20 per M at <=512K input; 1M context; custom community model license", "verified": "2026-09-25" }
    },
    "openrouter": {
      "kind": "gateway", "cli": "claude", "family": "varies", "enabled": false,
      "note": "Optional. OpenRouter has no Anthropic-format endpoint, so this lane needs a local /v1/messages translator (musistudio/claude-code-router, or a version-pinned LiteLLM). Document setup; keep out of defaults."
    },
    "local": {
      "kind": "local", "cli": "claude", "family": "local", "via": "ollama", "enabled": false,
      "note": "Deferred. Ollama serves an Anthropic-compatible API since v0.14; wire in a later version."
    }
  },
  "panels": {
    "arena": { "lanes": ["claude", "codex", "deepseek"] },
    "budget-duo": { "lanes": ["deepseek", "minimax"] }
  }
}
```

Semantics to implement exactly:

- `enabled: "auto"` = probe at setup (CLI on PATH plus auth check) and record pass/fail with reason; `true`/`false` force it.
- `${VAR}` values interpolate from the environment only; a missing variable disables the lane with that reason. Secrets never land in any file.
- `family` is the diversity key for panels. Panel resolution uses `panels.<name>.lanes` when present, otherwise the enabled defaults.
- If resolved active lanes fall below `min_family_diversity`, refuse with an actionable message listing disabled lanes and their reasons — never substitute.
- Every `kind: "api"` lane spawns the CLI with its isolated `CLAUDE_CONFIG_DIR`; the runner **refuses to start such a lane** if it detects an OAuth login in the effective config dir. This is the guard that keeps a claude.ai credential from ever being sent to a third-party host.
- `cli_version_pin`, when set, makes the runner check the spawned CLI's version and warn or refuse on mismatch (mitigation for the "unsupported gateway" risk below).

## Provider mechanics reference (verify each item against official docs at build time)

- Claude Code third-party env vars: `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL` / `..._SONNET_MODEL` / `..._HAIKU_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL`, `CLAUDE_CODE_MAX_CONTEXT_TOKENS`, `CLAUDE_CODE_ATTRIBUTION_HEADER`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`.
- DeepSeek: official Claude Code guide in the `deepseek-ai/awesome-deepseek-agent` repository (`docs/claude_code.md`); their guide maps a Pro-tier model to the opus/sonnet aliases and a Flash-tier model to haiku — mirror whatever it currently says. Model names changed during 2026 (legacy names retired 2026-07); trust the current docs, not this snapshot.
- MiniMax: Anthropic-compatible endpoint `https://api.minimax.io/anthropic`; official Claude Code and Codex guides on platform.minimax.io.
- Codex alternative: `[model_providers.<id>]` in `config.toml` with `base_url`, `env_key`, and `wire_api = "responses"`.
- OpenRouter (optional lane): local translator required, roughly 5.5% credit fee on top of provider prices.

## Safety and policy (document in the fork README)

- Anthropic states that routing Claude Code to non-Claude models through gateways is **not supported**. Not supported is not prohibited, but compatibility can break on any CLI update — hence `cli_version_pin`.
- Hard rule: never a live claude.ai OAuth session while pointed at a third-party base URL. Isolated config dirs are mandatory and the runner enforces the check.
- Privacy: third-party lanes are opt-in per project. Never send client or customer code/data to third-party providers by default.
- MiniMax M3's model weights use a custom community license (not MIT); irrelevant for API use, relevant if weights are ever self-hosted.

## Implementation order

1. Read and map the upstream setup/probe and dispatch code (Step 2).
2. Lane-registry module (Bun/TypeScript): schema parsing, env interpolation, validation.
3. Refactor the setup probe to iterate the registry; subset-tolerant results.
4. Env-injection runner: spawn the per-lane CLI with merged env, isolated config dir, OAuth guard, version-pin check.
5. Panel diversity resolution and the failure policy (halt/ask).
6. Budget plumbing and cost annotations in output.
7. Docs: README fork notice, LANES.md (lane concepts + zero-subscription walkthrough), UPSTREAM.md addendum.
8. Example config plus `.gitignore` entries for real configs and config dirs.

## Licensing and attribution

- Preserve **every** license and notice file present at the fork tag (at the research pin these were `LICENSE`, `LICENSE-cursor-team-kit`, `LICENSE-superpowers`, and `NOTICE.md` — keep whatever the tag actually contains).
- Append Martin Patino's copyright line without removing existing holders. License stays MIT.
- Extend NOTICE.md with the provenance chain: pstack-flex <- ericlitman/open-pstack <- Lauren Tan's pstack (Cursor).

## Verification (all must pass before calling it done)

- `bun install`, typecheck, and the test suite green.
- Setup matrix with **mocked probes** (CI must never call paid APIs): (a) all four CLIs present; (b) only `claude` signed in; (c) zero subscriptions with `DEEPSEEK_API_KEY` + `MINIMAX_API_KEY` only; (d) a single API key. Assert: setup succeeds in a–c, disabled lanes carry reasons, (d) refuses panels without the explicit single-family override, nothing is fatal.
- Kill a lane mid-panel: expect halt-or-ask per config; assert no silent substitution.
- Unit tests for panel diversity resolution and env interpolation (including the missing-variable and OAuth-detected paths).
- Upstream-sync rehearsal: `git fetch upstream && git merge --no-ff --no-commit upstream/main` merges without conflicts in pstack-flex-owned files.
- `grep` the tree for remaining hardcoded four-family assumptions; none may survive outside upstream-owned files.

Deliverables: pushed `main` with the fork point recorded, README fork section, LANES.md, `pstack-flex.example.jsonc`, UPSTREAM.md addendum, green tests. Tagging the first release is Martin's call.
