---
name: design-user-flow
description: Define behavioral user journeys when a feature needs explicit entry points, transitions, alternate paths, recovery, and UI states before implementation. Use for new or changed user-facing workflows.
license: MIT
---

# Design user flow

## Inputs

Actors, current surfaces, accepted product decisions, scope, and unresolved questions. Inspect missing current behavior; do not treat a guessed interaction as a decision.

## Process

1. Load [flow-guidelines.md](references/flow-guidelines.md). Start from actual entry points and actor permissions. Assign flow/state IDs when they improve cross-references.
2. Describe the primary path as actor action -> system response -> next state. Include successful termination and the resulting saved or transient state.
3. Add relevant alternate and recovery paths: back/cancel, validation, empty/loading/error/partial results, permission failure, editing, destructive actions, duplicate submission, stale data, and re-entry. Explicitly mark inapplicable states with a brief reason rather than inventing behavior.
4. For several interacting surfaces, load [state-matrix.md](references/state-matrix.md). Use a compact table to expose gaps; include only surfaces the feature touches.
5. Compare every transition to the decisions and current constraints. Return unresolved product choices to `shape-feature`; a diagram does not settle them. Label proposed alternatives distinctly.

## Outputs and stopping conditions

Produce `flow.md` with a readable sequence or Mermaid diagram, relevant state table, and links to decisions. Use `.issuecraft/<id-or-slug>/` or the existing artifact location; inline the flow in a small spec when sufficient.

Stop when every in-scope path has an outcome or explicitly identified blocker. Route visually significant UI to `wireframe-feature`, then the behavior to `write-feature-spec`. For backend-only work, document an actor/event flow if useful; report that no user-facing flow is needed when that is true. Do not create app routes or implement transitions.
