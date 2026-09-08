# Issue deep dive

Start: “Figure out why saved searches are confusing.” Use `investigate-issue`.

Trace current behavior before designing a solution. Inspect terminology, routes, permissions, persistence, API contracts, tests, history, docs, and related work as relevant. Record evidence and distinguish inferred cause from verified behavior; state what is unknown about the live application.

Possible conclusions:

- Bug or regression with a concrete observed-versus-expected difference.
- Feature or redesign justified by the user problem.
- Documentation or configuration issue.
- Duplicate or already-fixed work with a source reference.
- More evidence needed, with a specific next observation.
- No change recommended, with rationale.

Stop at findings for an investigation-only request. Do not turn every symptom into a feature ticket or code fix. If a feature is warranted and further shaping is requested, continue with `shape-feature`. If a code fix is requested, an evidence-based handoff can direct native `pstack:poteto-mode`; no speculative feature spec is required merely to hand off a diagnosed bug.
