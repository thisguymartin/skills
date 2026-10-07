# Working brief and scoped issues

Choose sections based on the request. Keep relevant detail even when the PR is short. Replace placeholders with evidence, user decisions, or explicitly unresolved items; remove empty sections. The user's supplied template takes precedence.

## Detailed working brief

```markdown
# <Outcome or issue title>

## Problem and desired behavior

<Who encounters the problem, the trigger, what happens today, and why it matters.>
<What changes and the smallest useful outcome.>
Destination: <research / scoped issue drafts / implementation and PRs>.
Related issues: <links and each issue's responsibility>.

### Concrete scenarios

| Scenario | Current behavior | Desired behavior | Source |
|---|---|---|---|
| <User action with synthetic example> | <Observed or reported> | <Agreed outcome> | <Evidence or answer> |
| <Failure or boundary case> | <Observed or unknown> | <Agreed outcome> | <Evidence or answer> |

## Domain and invariants

- <Entity/value, identity, ownership, and lifecycle.>
- <What must remain true across the operation, persistence, and consumers.>
- <Terms that needed clarification and their agreed meaning.>

## Current implementation and evidence

| Repo | Path, branch, HEAD | Responsibility |
|---|---|---|
| <Repo> | <Exact checkout and revision> | <Observed ownership> |

Flow: <User action -> local state -> API -> backend rule -> persisted data -> rendering>.
<Include only stages that actually exist, with exact paths/symbols beside important steps.>

| Boundary or consumer | Current contract/behavior | Evidence | Proposed change |
|---|---|---|---|
| <Frontend state or action> | <Fields and behavior> | <path:symbol> | <Change or unchanged> |
| <Request/response> | <Names, types, defaults, validation/errors> | <Both sides> | <Change or unchanged> |
| <Saved representation> | <Identity, version/defaults, read/write behavior> | <path:symbol> | <Change or unchanged> |
| <Other consumer> | <Rendering/export/background behavior> | <path:symbol> | <Change or unchanged> |

Existing work: <Relevant PRs/branches and what they already cover>.
Access gaps: <Missing source, why it matters, and what remains unverified>.

## Decisions from the interview

| Question | Answer/decision | Rationale | Consequence | Source |
|---|---|---|---|---|
| <Focused question> | <User answer or delegated choice> | <Why> | <Behavior/scope/check> | <Reply or source> |

Assumptions: <Each unconfirmed assumption and the impact if wrong>.
Open questions: <Question, consequence, who can answer, and dependent work>.

## Scope and ownership

| Deliverable | Owner/repo | Included | Excluded | Dependency |
|---|---|---|---|---|
| <Frontend change> | <Repo> | <Observable behavior> | <Explicit adjacent work> | <Contract, if needed> |
| <Backend change, only if needed> | <Repo> | <Proven rule/persistence work> | <Adjacent work> | <Prerequisite> |
| <Shared contract, only if needed> | <Owning repo(s)> | <Precise contract delta> | <Unchanged contracts> | <Consumer order> |

<Explain why each responsibility exists. State when one layer needs no changes.>
<Map existing issues to these scopes before proposing new issues.>

## Proposed implementation

| Step | Repo and paths/symbols | Change and reason | Dependency | Done when |
|---|---|---|---|---|
| <Step> | <Exact locations> | <Specific approach> | <Earlier step or none> | <Observable proof> |

Contract/storage delta: <Before/after fields, semantics, defaults, and error behavior>.
Old saved data: <Required read behavior; migration only when evidence requires it>.
Failure/recovery: <Partial success, retry, rollback, concurrency when relevant>.
Alternatives: <Credible choice, tradeoff, reason for recommendation, evidence/confidence>.

## Acceptance and verification

| Criterion | Given / when / then | Verification | Evidence/status |
|---|---|---|---|
| <AC1> | <Precondition, action, observable result> | <Test/manual/integration method> | <Not run until checked> |
| <AC2> | <Failure or boundary behavior> | <Method> | <Actual result> |

<Include relevant save/reload, repeated-operation, older-record, and other-consumer cases.>
<Identify an integration environment when needed; distinguish local proof from live proof.>

## Delivery and limits

<Dependency/rollout order if contracts span repos; specific risks and mitigations.>
<PR boundaries and links once published; issue drafts if that is the destination.>
<Passed checks, actual failures, baseline noise, pending CI, unavailable verification.>
Security scan: <Reviewed revision/diff per repo, confirmed findings and disposition, recheck result, gaps>.
```

A file-level plan should explain what changes and why each location owns it. A list of filenames without behavior is insufficient. An acceptance criterion such as "works correctly" is insufficient; describe a result someone can observe.

## Scoped issue draft

Use for explicitly requested issue drafting or a supported proposal to split work. One issue should have an independently testable outcome. A cross-layer feature does not automatically require two issues; use evidence and delivery boundaries.

```markdown
Title: <Layer/repo when useful>: <Concrete outcome>

## Problem

<Specific current behavior, affected user/consumer, and evidence.>

## Outcome and scope

<The behavior this issue delivers.>
- <Included responsibility.>
- <Another responsibility only if needed for the same outcome.>

Out of scope: <Adjacent work owned elsewhere or deliberately deferred>.

## Approach and ownership

Repo: <Exact owner>.
Entry points: <Paths/symbols supported by investigation>.
<Domain rule, source of truth, contract delta, and persistence implications.>
<Explain backend/frontend separation when relevant.>

## Acceptance criteria

- Given <state>, when <action>, then <observable outcome>.
- Given <failure/boundary>, when <action>, then <recovery or preserved invariant>.

## Verification

<Focused automated cases and relevant UI/persistence/integration checks.>
<Evidence still needed; do not present planned checks as passed.>

## Dependencies and open decisions

<Existing issue/PR links, blocking contract, required order, remaining product choice.>
```

Keep implementation detail here when it helps delivery. Do not prescribe a file or schema that investigation has not established. Use issue references without claiming closure unless this scope completes them.

## PR handoff

The PR body comes from `pr-automation` and its repository template. Pass it the final behavior and diff, approved scope, issue links, critical invariants, actual checks, and security-scan result. Use its Excalidraw workflow with the mer-inkdrop backup when a diagram helps review or is requested. The brief explains the full reasoning; the PR explains the change a reviewer is reviewing. Preserve material risks and verification limits in both.
