---
name: scribble-research
description: Use when researching a repo, workflow, product idea, market, pricing, UI plan, or technical topic where the result should be sourced, visual, shareable, revisable, or saved as an HTML artifact.
license: MIT
---

# Scribble Research

Use this for sourced discovery and visual planning reports.

## Source Policy

- Default sources: local codebase, git history, and files the user provided.
- Check available MCP resources and resource templates when they may contain useful context. Treat MCP usage as read-only discovery unless the user explicitly asks to create, update, or delete.
- Web, Linear, Slack, Datadog, Mixpanel, Notion, and other non-local sources are opt-in unless the user asks for latest/current market, tool, API, or technical guidance.
- Never include real customer data in generated examples or HTML. Use synthetic data.
- Cite every non-trivial claim with file paths, URLs, issue IDs, PRs, or tool query context.
- Label source origins as `local repo`, `user-provided`, `read-only MCP`, `web`, `model inference`, or `assumption`.
- Include a confidence level for recommendations and any extrapolation.

## Clarification And Resources

- Explore local and available read-only sources before asking questions.
- After the first source pass, ask for missing resources only when they would materially improve the artifact or change the recommendation. State what each ask unlocks.
- Good asks include maps, graphics, screenshots, datasets, pricing inputs, brand assets, examples, customer notes, or architecture docs.

## When Not To Use

- One-line answers, commit messages, PR bodies, or anything under ~30 lines — Markdown is enough.
- Quick lookups where the user wants a single fact, not a sourced report.
- Tasks already owned by `source-synthesis` (combining provided sources) or `tool-evaluation` (picking between options).

## Output Choice

- Use Markdown for short answers, commit messages, PR bodies, and anything under about 30 lines.
- Use a single-file HTML artifact when the result should be re-read, shared, compared, explored, or presented.
- If generating HTML, write one valid HTML5 file with inline CSS and JS under `./html-artifacts/<topic>-<YYYY-MM-DD>.html`.
- If `./design-system.html` or `./html-artifacts/design-system.html` exists, inspect it and reuse the visual language.
- For detailed artifacts, prefer decision-useful UI over decoration: flows, tables, scorecards, source maps, tradeoff panels, assumptions, and next actions.
- For artifact pattern guidance, read `references/artifact-patterns.md` only when creating or revising a larger artifact.

## Research Flow

1. Restate the question and sources used.
2. Gather evidence from the narrowest reliable sources first.
3. Build a source ledger with origin labels and freshness notes.
4. Separate confirmed facts from inference, assumptions, and missing inputs.
5. Model the problem visually when useful: user journey, system flow, data flow, decision tree, roadmap, or resource map.
6. Highlight risks, gaps, contradictions, stale information, and tradeoffs.
7. Finish with actionable next steps, a decision recommendation, or a handoff plan when requested.

## Continuation Flow

- If the user points at an existing artifact, inspect that artifact first and preserve its useful structure.
- Create a deeper "part two" artifact when the user wants to modify, expand, compare, or go deeper.
- Make the delta explicit: what changed, what new sources were added, and which prior assumptions were revised.

## HTML Report Rules

- Put the main conclusion above the fold.
- Use tables for comparisons and timelines.
- Use diagrams for architecture, workflow, user journey, data flow, or decision maps when they clarify the problem.
- Keep copy dense and scannable. Avoid marketing-style hero pages.
- If the official [caveman](https://github.com/JuliusBrussee/caveman) skill is installed, write artifact body copy in caveman `lite` mode — drop filler and marketing voice, keep articles and full sentences so humans read it cleanly. Install: `npx skills add JuliusBrussee/caveman -g`.
- Include a visible sources section with links or local file references.
