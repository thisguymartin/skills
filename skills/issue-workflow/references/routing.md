# Routing and durable state

| Starting point | Route | Early exit |
| --- | --- | --- |
| Existing Linear issue | Read issue/comments/related work -> investigate-issue -> shape-feature for gaps -> design-user-flow -> wireframe-feature when UI matters -> write-feature-spec -> review-feature-spec -> publish-linear update -> handoff | An inaccessible issue needs its content before an evidence-backed update |
| Rough idea | investigate-issue -> shape-feature -> flow -> conditional wireframe -> spec -> review -> new Linear issue -> handoff | Missing product decisions leave a blocked draft |
| Confusing behavior or possible bug | investigate-issue first; classify the outcome | Stop with findings if the user requested investigation or no feature is justified |
| Already-decided feature | Read decisions and relevant system constraints -> synthesize spec -> fill only actual flow/visual gaps -> review | Do not reopen settled decisions without contradictory evidence |
| Reviewed feature | Confirm review still matches all current artifacts -> publish if requested -> handoff | Changed semantics invalidate the old review |
| Large feature | Investigate and shape one parent contract -> outline demonstrable slices -> review parent and slice contracts -> publish supported hierarchy -> handoff | Do not fully specify distant speculative slices |

“Substantial” means a new or changed workflow, permission/ownership rule, persistence semantics, external contract, destructive action, or multiple interacting requirements. A tiny copy-only clarification can use an inline review with the same readiness criteria. A section count never determines readiness.

`design-user-flow` covers user behavior; backend-only work can use an actor/event flow in the spec. `wireframe-feature` is conditional on a meaningful UI review question. Refer to siblings by skill name, using the host's actual discovery/invocation mechanism. Do not prescribe a series of native Pstack skills.

## Artifact convention

Use the project's existing artifact convention when present. Otherwise optionally create `.issuecraft/<issue-id-or-slug>/` in the target product repository. Start with a slug before an issue exists; record the real ID after publishing without requiring a rename.

Possible files: `investigation.md`, `decisions.md`, `flow.md`, `spec.md`, `review.md`, `linear.md`, `handoff.md`, and `visuals/wireframe.md` or `.html`. Create only useful files. Inline small flows and decisions in the spec instead of duplicating them. Read existing files before updating; preserve unrelated content.

No workspace: return complete Markdown blocks the user can save, with a suggested filename. Temporary files are temporary; do not describe them as shared or durable. Never assume local paths are accessible to a Linear reader or a remote agent.

The spec is the accepted product contract. Decisions explain its rationale; flows and visuals illustrate it; review applies to a particular version. Linear condenses it. The handoff is a reading map. Contradictions are resolved explicitly, not by silently picking one artifact.
