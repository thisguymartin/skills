# Artifact Patterns

Use this only when a research or planning answer should become a larger visual artifact.

## Common Sections

- Executive read: main answer, confidence, and source coverage.
- Source ledger: claim, origin, citation, freshness, confidence.
- Visual model: user flow, architecture flow, data flow, decision tree, timeline, or resource map.
- Decision view: pros, cons, tradeoffs, risks, assumptions, and open questions.
- Action plan: next steps, owner or agent handoff, validation path, and useful follow-up prompts.

## Before Emitting

Run this checklist before finalizing any larger artifact:

- [ ] Source ledger has origin label and freshness on every non-trivial claim.
- [ ] Facts separated from inference and assumptions.
- [ ] At least one visual model chosen (flow, table, timeline, scorecard, or map).
- [ ] Risks, contradictions, and open questions surfaced — not buried.
- [ ] Next step, decision, or handoff is explicit.
- [ ] No real customer data — synthetic only.
- [ ] Confidence level stated for recommendations and any extrapolation.

## Source Ledger Labels

- `local repo`: code, docs, git history, tests, config, generated files.
- `user-provided`: screenshots, graphics, maps, docs, datasets, pasted text, prior artifacts.
- `read-only MCP`: resources or templates discovered through available MCP servers.
- `web`: official docs, release notes, pricing pages, source repos, credible news, or market data.
- `model inference`: reasoning from the model without a direct source.
- `assumption`: a stated default used because the source set is incomplete.

## Visual Patterns

- Feature planning: current state -> desired user flow -> system flow -> risks -> implementation slices.
- Product or market research: problem -> target user -> alternatives -> differentiation -> evidence -> next test.
- Tool evaluation: options -> fit matrix -> adoption flow -> migration risks -> default pick.
- Repo discovery: entrypoints -> data model -> runtime flow -> missing pieces -> safe change plan.
- Pricing or monetization: offer -> customer segments -> value metric -> cost drivers -> scenario assumptions. Present this as decision framing, not a required widget.

## Resource Intake

Ask for extra resources after the first source pass, not before it. Good asks include:

- Maps, diagrams, graphics, screenshots, or brand assets for UI-heavy artifacts.
- Pricing inputs, invoices, usage numbers, or rough targets for monetization artifacts.
- Prior HTML artifacts when creating a continuation or deeper second pass.
- Docs, tickets, logs, or customer notes when the problem depends on hidden context.

For each ask, say what it improves. Example: "A screenshot would let me map the current UI flow instead of inferring it from code."

## Continuation Artifacts

When creating a follow-up artifact from an existing one:

1. Inspect the prior artifact and extract its claims, assumptions, sources, and UI structure.
2. Keep what still works.
3. Add new sources or user-provided context.
4. Mark changed conclusions and retired assumptions.
5. Name the output as a continuation, such as `<topic>-part-2-<YYYY-MM-DD>.html`.

## Agent Handoff

End planning artifacts with a compact handoff section when implementation may follow:

- Goal and success criteria.
- Important constraints and non-goals.
- Source-backed facts.
- Open questions or resources still needed.
- Suggested first implementation task or next research prompt.

If the official [caveman](https://github.com/JuliusBrussee/caveman) skill is installed, write handoff bullets in caveman `full` mode — fragments OK, drop articles, imperatives only, no hedging. Next agent reads this, not a human.
