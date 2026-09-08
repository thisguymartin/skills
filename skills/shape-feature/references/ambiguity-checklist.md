# Dangerous ambiguity

Investigate before asking. Use concrete situations to expose a choice; do not ask this entire list.

| Area | Probe |
| --- | --- |
| Meaning | Is “report” a query definition, current execution, or frozen packet? What does “all” include? |
| Ownership | Who can see, execute, edit, share, or delete it? What changes across organizations? |
| Time | Are dates fixed or rolling? Which timezone and boundaries apply? Does reopening refresh results? |
| Lifecycle | Draft/published? Mutable/immutable? Does editing change the saved object or just this run? |
| Failure | What survives a failed save, interrupted request, retry, or partial result? |
| Re-entry | What happens after reload, back, cancellation, duplicate submission, or stale state? |
| Destruction | What is removed, retained, or reversible? What happens to dependents and existing links? |
| Compatibility | What must keep working for existing data, callers, permissions, or flags? |
| Scope | Is v1 demonstrable? Is another feature hidden inside it? Which prerequisites are real? |

Rank questions by the cost of guessing incorrectly. Delay dependent questions until the prerequisite choice is answered. If a requested recommendation depends on current library/API facts, retrieve current official documentation and cite it; do not use product shaping as a reason to select an unsolicited technology stack.
