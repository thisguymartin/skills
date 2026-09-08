# Acceptance criteria

Give each requirement a stable ID and each criterion its own ID when there are enough to cross-reference. Preserve IDs during revision; retire removed IDs rather than silently changing their meaning.

| Requirement | Criterion | Observable check |
| --- | --- | --- |
| REQ-001: saved configuration preserves its date strategy | AC-001 | Given rolling 90 days was saved, reopening on a later date evaluates the then-current 90-day interval |
| REQ-001 | AC-002 | Given fixed dates were saved, reopening uses those same date boundaries |
| REQ-002: only the owner can read the report | AC-003 | A nonowner cannot obtain the report's definition or results through a direct link or request |

These are examples; date strategy and permissions must come from the actual product decisions.

- Use Given/When/Then or equally concrete checkboxes. Specify inputs, actions, results, and preserved state.
- Give each criterion one independently checkable outcome; split bundled assertions when failures would mean different things.
- Cover the happy path, forbidden actions, important dependency errors, and meaningful boundaries. Define what retry does after an uncertain result.
- Replace “intuitive” with concrete navigation/feedback. Replace “fast” with an agreed measurement and target, or leave the target explicitly unresolved.
- Every criterion maps to a requirement; every in-scope requirement has adequate criteria. Look for additional behavior hidden inside a criterion.
- State observable compatibility, role, and data-preservation expectations. Do not prescribe unit-test file names, internal methods, mocks, or a test framework.

Pstack determines how to verify these outcomes in the real application. Passing spec review means the criteria are defined well enough to test; it does not mean the feature has been tested or implemented.
