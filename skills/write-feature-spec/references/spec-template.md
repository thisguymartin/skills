# Feature specification template

Use this as a menu, not a form that needs filler. Remove instructions from the resulting artifact. Include each applicable behavior; combine sections where shorter is clearer.

```markdown
# Feature name

Status: draft | blocked | ready
Spec revision: revision identifier
Source issue: real ID/URL, or unpublished
Review: matching review artifact/revision, or pending

## Summary
One paragraph: actor, problem, resulting behavior, version scope.

## Problem and evidence
Current behavior, user impact, inspected source references, confidence and limitations.

## Actors and desired outcome
Who acts, who benefits, ownership boundaries. Goals and observable success.

## Scope
Included v1 behavior and explicit non-goals. Separate future ideas from requirements.

## Stories and flows
User stories only where they clarify distinct needs. Primary/alternate paths,
entry and terminal states. Inline small flows or link flow.md and UX states.

## Visual references
Relevant frames, fidelity, flow mapping, and which choices they illustrate.

## Requirements and acceptance criteria
REQ-001: observable product behavior, source decision, linked goal/flow.
AC-001 -> REQ-001: precondition, action, expected outcome.

## Permissions and lifecycle
Visibility, roles, create/read/execute/edit/delete/share where relevant;
ownership changes, cancellation, retries, stale state, destructive effects.

## Domain and integration constraints
Concepts, identities, values preserved, lifecycle/domain events if relevant.
Existing API contracts and consumers, invariants and dependencies.
Separate established constraints from implementation choices left to Pstack.

## Failure and edge behavior
Validation, empty/loading/error/partial states, resumption, duplicates,
unavailable dependencies, concurrency, date boundaries where relevant.

## Compatibility and migration expectations
What existing users/data/callers must retain. Product rollout constraints,
not speculative schema migrations or assumed infrastructure.

## Success and observability
Outcome metric, measurement method/window, known baseline, agreed target.
Label unknowns and proposals. Operational signals needed to explain failures;
avoid collecting sensitive content unnecessarily.

## Dependencies and risks
Actual prerequisites, risk to product behavior, mitigation/decision owner.

## Decisions, assumptions, and open questions
Reference durable decisions. For each remaining question: impact, owner,
blocking/deferred, and why deferral does not leave product semantics open.

## Existing code and related context
Real paths/symbols, inspected revision, issue/document URLs, prior art.

## Implementation handoff
Reading order and verification expectations from acceptance criteria.
Native pstack:poteto-mode owns technical execution when implementation is requested.
```

A missing metric baseline can be stated honestly. A missing choice about what Save preserves is a blocker. Avoid empty “None” sections that conceal unexamined behavior. Acceptance coverage is about meaning; a table of IDs alone does not establish it.
