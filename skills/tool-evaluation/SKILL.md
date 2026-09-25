---
name: tool-evaluation
description: Use when comparing libraries, APIs, SaaS tools, infra providers, MCPs, frameworks, or developer tools for adoption, replacement, planning, or production use.
license: MIT
---

# Tool Evaluation

Use this before recommending a tool or technology.

## Required Checks

- Current docs or release notes, using official sources when available.
- Maintenance health: recent commits or releases, open issue load, maintainer activity, and bus factor signals.
- License and commercial constraints.
- Production adoption signals.
- Fit with the user's stack, especially Go and TypeScript unless another stack is specified.
- Pricing, free tier limits, and expected monthly cost.
- Deprecations, breaking changes, migration risk, and lock-in.
- Available MCP resources or templates when evaluating local tools, integrations, or internal context. Treat MCP usage as read-only discovery unless the user explicitly asks to create, update, or delete.
- Source origin labels for important claims: `local repo`, `user-provided`, `read-only MCP`, `web`, `model inference`, or `assumption`.

## Recommendation Shape

Use this structure:

1. Problem being solved.
2. Shortlist of options.
3. Comparison table.
4. Recommended default.
5. Risks and migration notes.
6. Confidence level with source quality.

## Artifact Shape

If the output should be visual or shareable, create sections that make tradeoffs easy to scan:

- Fit matrix by use case, stack, cost, maturity, and risk.
- Architecture or adoption flow: current state -> integration point -> operational owner.
- Decision scorecard with clear weights when the user provides priorities.
- Pros, cons, migration steps, and rollback concerns.
- Source ledger that links docs, repos, pricing pages, issues, benchmarks, or MCP queries.
- For larger visual artifacts, see `../scribble-research/references/artifact-patterns.md` for shared section types, source ledger labels, and handoff format.
- If the official [caveman](https://github.com/JuliusBrussee/caveman) skill is installed, write tradeoff and recommendation copy in caveman `lite` mode — drop marketing voice, keep readable sentences.

## Defaults

- Prefer simple and cheap options that cover most of the need.
- Do not assume a deployment target. Ask or state the assumption when infrastructure choice matters.
- Do not suggest sending real customer data to third-party AI services.
- Clearly flag anything based on inference instead of verified sources.
- After the first source pass, ask for missing resources only when they would materially improve the artifact or change the recommendation. State what each ask unlocks.

## When Not To Use

- The user has already chosen the tool and just needs help using it.
- Trivial library swaps inside the same ecosystem with no comparison required.
- The question is about implementation or migration mechanics, not selection — pair with `source-synthesis` for handoff structure instead.
