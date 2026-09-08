# Behavioral flow guidelines

For each flow, name the actor, entry point, preconditions, trigger, state transitions, and terminal outcome. Stable IDs such as `FLOW-01` and `STATE-saving` let requirements and acceptance criteria reference the same behavior.

| Step | Actor action / event | System response | Next state | Persistent change |
| --- | --- | --- | --- | --- |
| 1 | Opens an existing saved report | Loads the definition; evaluates its date strategy | Preview loading | None |
| 2 | Evaluation succeeds | Shows results and evaluated interval | Preview ready | None |
| 3 | Cancels the current execution | Returns to the list | List | Saved definition unchanged |

This is an illustrative flow, not default semantics for every report feature.

Review paths beyond success:

- Distinguish navigation back, closing, cancellation, and deletion. State whether edits survive each.
- Define what can be edited while loading, what retry means, and whether a repeated submission creates a duplicate.
- Separate zero results from partial results and failure. A user should know whether the data is complete.
- Specify permission loss after entry, missing/deleted objects, and re-entry from a stale link when relevant.
- Describe irreversible changes, confirmation/undo behavior, and effects on dependents when relevant.
- Include keyboard/focus behavior where interaction would otherwise be unclear; preserve the existing accessibility convention.

A flow terminates in success, cancellation, recoverable failure, or an explicitly blocked state. “Handle errors” is not a transition. Labels and controls added in a wireframe must map back to written behavior.
