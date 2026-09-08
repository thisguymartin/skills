---
name: shape-feature
description: Resolve product ambiguity when feature semantics, scope, actors, ownership, or lifecycle decisions are unclear. Use to sharpen an idea or issue before writing an implementation-ready specification.
license: MIT
---

# Shape feature

## Inputs

An idea/issue, investigation evidence, existing domain language, and any already-settled decisions. If evidence is missing, inspect the relevant system first or use `investigate-issue`.

## Process

1. Load [shaping-framework.md](references/shaping-framework.md). Define the problem, actors, outcome, and smallest useful scope using existing domain concepts. Surface overloaded terms before adding a new entity.
2. Separate FACT, DECISION, ASSUMPTION, and OPEN QUESTION. Look up facts yourself; ask the user for product choices the evidence cannot settle. Source every settled decision to a user statement or durable decision record.
3. Load [ambiguity-checklist.md](references/ambiguity-checklist.md) to find consequential gaps. Prioritize semantics, ownership, scope, irreversible actions, lifecycle, and choices that change the user flow.
4. Ask progressively: usually one question, at most three independent choices in a round. Explain the tradeoff, recommend an option when supported, and wait for answers before building dependent behavior. Continue independent investigation meanwhile.
5. Record answers immediately. Preserve prior decisions; reopen one only when new evidence contradicts it, with the conflict made explicit. Do not ask the user to choose database schemas, frameworks, or deployment targets unless the feature actually has a relevant unresolved constraint.
6. Stop the interview once implementation-relevant product semantics are settled. Implementation technique remains open for Pstack. If the user stops early, preserve the unresolved questions rather than turning defaults into accepted requirements.

## Outputs and stopping conditions

Produce a bounded feature shape and decision ledger, inline for small work or in `.issuecraft/<id-or-slug>/decisions.md`. Include rationale, scope/non-goals, rejected alternatives worth remembering, and open questions with impact and owner.

Route settled behavior to `design-user-flow` or `write-feature-spec`. Missing consequential decisions produce a blocked draft. This skill does not implement, publish issues, or declare an unreviewed spec ready.

Adapted from Matt Pocock's `grill-with-docs`, `grilling`, and `domain-modeling`, with their useful behavior incorporated directly. See [LICENSE.txt](LICENSE.txt).
