# Handoff: clarified saved-search run

## Objective and current state

Demonstrate a cold-start product handoff from a reviewed synthetic feature. Shaping is complete for spec revision 1; no application code was changed and no Linear issue was published. This directory belongs to the `thisguyskills` checkout; it is not a product implementation repository.

## Decisions and constraints

Read the decision section in [spec.md](spec.md) and the supplied fixture authority it links. Keep private saved-search ownership, rolling reevaluation, and immutable packets. Creation/editing/sharing/deletion and packet changes are outside this scope. No product questions remain for the example. Pstack retains technical strategy.

## Artifacts to read

1. [linear.md](linear.md): complete unpublished issue contract and preserved original context.
2. [spec.md](spec.md): canonical revision 1, including flows and AC-001–AC-016.
3. [wireframe.md](wireframe.md): visual revision 1 and UI states.
4. [review.md](review.md): coverage and readiness of that exact artifact set.
5. [fixture context](../fixtures/context.md): supplied evidence and decisions.

## Linear and code

ENG-123 and ENG-98 are synthetic references, not live identifiers to fetch or update. [product.ts](../fixtures/product.ts) contains navigation examples: `reopen`, `makePacket`, and `screenCopy`; a real implementation must find the corresponding actual code and deployment context.

## Open work and verification

The real application, target repository, and implementation authorization are not supplied. A different machine needs this example directory plus `../fixtures/`, or an accessible repository revision. Local-only paths do not make this transferable by themselves. No runtime tests, usability measurements, or live Linear checks have been performed.

## Recommended next action and suggested skill

For a fixture evaluation, read the artifacts and demonstrate understanding without starting implementation. For a real implementation task, first establish the actual product repository and replace synthetic evidence/IDs with verified references. Then give native `pstack:poteto-mode` the following starter with the actual authorization and target filled in:

```text
Use pstack:poteto-mode.
Implement the clarified saved-search behavior from the supplied spec revision 1
in the explicitly selected product repository. Read the spec, inline flows,
wireframe, decisions, and matching review linked by this handoff.
Treat the spec as product intent. Own technical implementation strategy and
verify the real application against AC-001–AC-016. Surface product contradictions
instead of silently choosing different semantics.
```

Pstack availability was not established for the receiving session. This file neither installs it nor authorizes implementation. The full specification is deliberately referenced, not reproduced here.
