# Feature to Pstack

The boundary is an implementation-ready product contract: actors, scope, flow/states, permissions, semantics, requirements, criteria, and real constraints. Confirm the substantive feature's review matches the current spec, decisions, flow, and visuals.

Use `handoff` to provide the [native Pstack starter](../skills/handoff/references/pstack-handoff.md), with real accessible references and the exact requested implementation endpoint. Typical reading order: Linear -> spec -> flow -> UI wireframe -> decisions/open questions -> review.

The starter names **native `pstack:poteto-mode`**. Pstack owns architecture, implementation, tests, real-app verification, review, CI, PR preparation, recovery, and implementation orchestration. It should surface a newly discovered product contradiction rather than silently choose different semantics.

This workflow ends after preparing the handoff unless the user also requested implementation. Preserve already-granted authorization. Do not install Pstack, copy its skills, prescribe its internal routing, or initiate a deployment because a feature is ready. If it is unavailable, return the complete handoff and point to its [native setup](https://github.com/ericlitman/open-pstack#install).

An unpublished local spec can be a valid implementation source. An inaccessible local spec cannot be a valid remote handoff until the contract is transferred. If product decisions remain open, hand off to continued shaping instead.
