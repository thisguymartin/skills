# Brief template

Use this as a question checklist, not a fixed page count. Front-load the answer; keep the technical appendix available without making everyone read it.

| Section | Project mode | Feature mode |
|---|---|---|
| Question and audience | What are we trying to understand? | What decision are we making, and for whom? |
| Answer | What happens today, in plain language? | What change is recommended, why, and how confident are we? |
| Scope and freshness | Exact repo/HEAD, dirty files, observation window | Same boundary, plus issue/spec version |
| Domain | Actors, entities, states, ownership, event vocabulary | New or changed domain rules and invariants |
| Concrete example | One synthetic input -> observable outcome | Current experience -> proposed experience |
| Current flow | Rendered user/system/data diagrams, important failure branches | Same, with friction points supported by evidence |
| Proposed flow | Include only if requested | Separate diagram with changes, failure paths, and boundaries |
| Evidence | Source-backed findings, dates, contradictions, missing access | What supports the problem and proposed scope? |
| Alternatives | Include if a decision is needed | Smallest useful option, alternatives, no change; cost and migration |
| Plan | Next investigation or action if useful | Ordered outcomes, dependencies, completion checks, rollout/rollback |
| Verification | What was actually run or observed? | Acceptance examples and planned checks, clearly unexecuted |
| Questions and sources | What remains unknown? Stable source ledger | Decisions still needed and exact citations |

For a product idea also cover target user, problem, MVP, business model, competitor differentiation, and domain-first architecture. Use current dated sources for market/pricing claims. For an incident emphasize observed path, timestamps/time zone, affected scope, hypotheses, and the next discriminating check.

In follow-up mode preserve the prior question and decisions. Add a revision note: new evidence, changed conclusion, superseded assumptions, and remaining questions. Never silently turn a proposed flow into a current flow.

An optional structured renderer is described in the plan-artifact skill's artifact-format.md. Its sections accept full paragraphs and evidence IDs, so the summary need not replace the detailed explanation.
