---
name: issue-workflow
description: Shape an idea or existing Linear issue into a reviewed product specification and implementation handoff. Use for end-to-end feature preparation before coding, including requests to figure out what should actually be built.
license: MIT
---

# Issue workflow

Route feature preparation. Own the next shaping step, not implementation orchestration.

## Inputs

A rough idea, problem, issue ID/URL, discussion, or existing feature artifacts; the user's requested destination; a workspace and connected tools when available.

## Process

1. Read workspace instructions and existing artifacts. For an issue, fetch its full body, comments, and relationships first. Discover available Linear tools; missing access is a limitation, not permission to invent issue contents.
2. Load [routing.md](references/routing.md) to choose the shortest route that meets the request. State the starting point, intended output, and genuinely missing access. Inspect current behavior before asking product questions.
3. Run the relevant skills by name, loading only the current step. Reuse settled decisions and current artifacts. Each step can also be performed independently; if a named skill is unavailable, say which capability is missing and produce the best supported draft rather than pretend it ran.
4. Track FACT, DECISION, ASSUMPTION, and OPEN QUESTION separately. Save durable decisions as they settle. A new product ambiguity returns to shaping; stale evidence returns to investigation.
5. For substantial features, require `review-feature-spec` before calling the result implementation-ready. Resolve blocking findings, synchronize changed flows/visuals/specs, and review the resulting version. Do not turn missing answers into requirements.
6. Publish only within the user's requested scope using `publish-linear`; existing authorization persists. A request to investigate or draft is not a request to publish. Finish with `handoff` when continuation is useful.

## Outputs and stopping conditions

Return artifact paths, issue URLs or ready-to-paste content, readiness (`draft`, `blocked`, or `ready`), and the precise next step. Stop at the requested destination, an evidence-backed investigation conclusion, or a product decision requiring the user. Continue independent work while a decision is pending.

An implementation handoff names native `pstack:poteto-mode`. Do not launch implementation just because shaping is complete. If Pstack is unavailable, leave a usable handoff and report the missing dependency.

Adapted from Matt Pocock's `ask-matt`; rewritten around product preparation. See [LICENSE.txt](LICENSE.txt).
