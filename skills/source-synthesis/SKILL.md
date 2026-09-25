---
name: source-synthesis
description: Use when combining documents, links, issues, PRs, logs, artifacts, MCP context, or research sources into a sourced summary, decision memo, or planning handoff.
license: MIT
---

# Source Synthesis

Use this when the user provides or requests multiple sources and wants the useful truth, not a pile of excerpts.

## Process

1. Identify the source set and freshness of each source.
2. Check available MCP resources and resource templates when they may contain useful context. Treat MCP usage as read-only discovery unless the user explicitly asks to create, update, or delete.
3. Extract claims that matter to the user's decision.
4. Group claims by theme, not by source order.
5. Mark contradictions, missing evidence, and assumptions.
6. Separate confirmed facts from inference.
7. Capture source origin for important claims: `local repo`, `user-provided`, `read-only MCP`, `web`, `model inference`, or `assumption`.
8. If a visual artifact is likely, shape findings into sections an artifact can render: flows, comparison tables, source maps, risk panels, and next-step plans.

## Resource Gaps

- After the first source pass, ask for missing resources only when they would materially improve the artifact or change the recommendation. State what each ask unlocks.
- Good asks include maps, screenshots, graphics, datasets, docs, pricing inputs, examples, or prior artifacts.
- If the user points at an existing artifact, treat it as a source and identify what a follow-up artifact should deepen or revise.

## When Not To Use

- The user wants a raw excerpt, a single quote, or a verbatim file dump — synthesis adds friction there.
- Pure tool or library comparison — defer to `tool-evaluation`.
- Greenfield discovery with no sources yet provided — defer to `scribble-research`.

## Output

- Lead with the answer or decision-relevant finding.
- Include citations for non-trivial claims.
- Use exact dates for current or time-sensitive claims.
- Add confidence levels when sources vary in quality or recency.
- Keep direct quotes short and only when wording matters.
- Make source origin visible when it affects trust or freshness.
- For larger visual artifacts, see `../scribble-research/references/artifact-patterns.md` for shared section types, source ledger labels, and handoff format.

## Decision Memo Format

Use this structure when the user asks for a recommendation:

1. Recommendation.
2. Why.
3. Evidence.
4. Risks or open questions.
5. Next action.

## Planning Handoff Format

Use this structure when the result should feed Claude, Codex, design, or implementation work:

1. Goal and success criteria.
2. Evidence-backed current state.
3. Proposed flows or artifact sections.
4. Pros, cons, risks, and assumptions.
5. Open questions or resources needed.
6. Next agent/task prompt — if the official [caveman](https://github.com/JuliusBrussee/caveman) skill is installed, write in caveman `full` mode (fragments OK, drop articles, imperatives only).
