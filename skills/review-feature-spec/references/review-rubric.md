# Product specification quality gate

Review requirements as a contract. Do not merely check headings or grammar.

| Dimension | Challenge |
| --- | --- |
| Completeness | Can every primary/alternate path terminate? Are relevant empty, loading, error, partial, validation, permission, cancel, edit/delete, destructive, retry, and re-entry states defined? |
| Consistency | Do requirements agree with one another, decisions, domain invariants, existing constraints, flow, and wireframes? Does a criterion introduce an unrequested capability? |
| Traceability | Can each major problem -> goal -> flow -> requirement -> criterion be followed? Are there orphan requirements, uncovered requirements, or criteria with no requirement? |
| Scope | Does v1 solve the stated problem? Is there a hidden feature/prerequisite? Should one parent contract be delivered as vertical slices? Are later ideas clearly deferred? |
| Evidence | Which claims have code, issue, observation, or decision support? Are guesses labeled? Is current code being mistaken for a user decision or live deployed behavior? |
| Implementation boundary | Does the spec freeze tables, libraries, modules, test internals, or deployment without an established constraint? Does it state enough product behavior for Pstack to choose safely? |

## Severity

- **BLOCKING:** An implementer would need to invent a consequential product decision; a contradiction changes behavior; an essential path/permission/destructive rule is absent; or a requirement lacks a testable outcome. Missing context blocks readiness when it is needed to determine the product contract. Code access needed later to implement a fully stated preservation requirement is an implementation prerequisite, not automatically an unresolved product decision. A missing canonical contract still blocks a handoff that relies on it.
- **IMPORTANT:** A meaningful omission that does not require guessing core product semantics. Resolve it or record an accepted disposition, owner, and bounded follow-up. If deferring changes observable required behavior, reclassify BLOCKING.
- **NICE-TO-HAVE:** Clarity or optional improvements that do not change the contract. Do not expand v1 to clear these.

## Review record

```markdown
# Feature review
Spec revision: exact revision
Reviewed artifacts: paths/versions, including flow and visuals used
Verdict: ready | blocked

| Finding | Severity | Reference | Consequence | Required resolution | Disposition |
| --- | --- | --- | --- | --- | --- |

| Goal / flow | Requirements | Criteria | Coverage gap |
| --- | --- | --- | --- |

Remaining questions and accepted deferrals:
Next action:
```

Exercise at least one adversarial journey: invalid input, permission loss, failed/uncertain save, duplicate action, or stale data, chosen for the feature. Check the whole journey, not only individual cells. Do not report coverage percentages unless you actually enumerated the set and explain what the metric counts.

If a revision label was reused after edits, identify the exact supplied snapshot or a content hash when available; record unversioned changes explicitly. A matching label alone does not establish that a prior review covered today's artifacts.
