# Shaping framework

Start with the domain: who acts, what they own, which concepts have an identity, which values are preserved, and which lifecycle transitions matter. Product language can settle “a report saves a date-range strategy”; it need not settle table layout.

Establish only what the feature needs:

- Problem and evidence: whose task fails today, and how do we know?
- Desired outcome: what can that actor accomplish afterward?
- Scope: the smallest useful version and explicit non-goals.
- Semantics: meaning of key terms, saved versus executed state, ownership, visibility, edit/delete behavior.
- Constraints: existing product invariants, integrations, compatibility, real timing/cost constraints.
- Success: an observable outcome; label unmeasured baselines and proposed metric targets.

## Decision ledger

| ID | Type | Statement | Source / rationale | Consequence or next action |
| --- | --- | --- | --- | --- |
| F-01 | FACT | Current behavior verified from the system | Evidence reference | Constraint or reuse opportunity |
| D-01 | DECISION | Accepted product behavior | User/date or existing decision source | Flow and scope impact |
| A-01 | ASSUMPTION | Unverified premise | Why plausible; confidence | Validation method and owner |
| Q-01 | OPEN QUESTION | A specific unresolved choice | What evidence cannot resolve | Impact, owner, blocking or deferred |

Do not reclassify an assumption as a decision because it seems conventional. A requirement depending on an unverified material assumption cannot be ready. A harmless assumption may remain if explicitly bounded and accepted, with no hidden product semantics.

When a decision changes, mark the previous entry superseded and reconcile affected artifacts. Update an existing glossary/ADR only when requested or appropriate to the project's convention; do not create a second terminology system. Preserve accepted domain constraints without prematurely designing implementation modules.
