# Linear issue contract

Keep the issue scannable and independently useful. Fit detail to the feature; do not impose a word limit that removes required behavior.

```markdown
# Actor can achieve outcome

Readiness: draft | blocked | ready
Spec revision and matching review: reference

## Problem / current behavior
Observed behavior, impact, source evidence, and relevant original context.

## What changes
Accepted scope, actors, permissions, lifecycle, primary flow, important recovery
and edge behavior. Preserve domain terminology and existing compatibility rules.

## Requirements and acceptance criteria
Requirement IDs and independently observable criteria mapped to them.
Include implementation-critical negative/error cases, not just happy-path demos.

## Out of scope
Version boundary and related work already covered elsewhere.

## Dependencies / open questions
Actual blocking relationships; consequential open choices keep this blocked.

## Artifacts and related work
Canonical spec and review revision, flow/wireframe/decisions when useful,
parent/related issue URLs, relevant code navigation. Explain access requirements.

## Handoff
Use native pstack:poteto-mode when implementation is requested.
The spec defines product intent; Pstack owns technical implementation and verification.
```

## Existing issues

Read the complete current description and comments. Merge by meaning; keep useful context and sources, and explain which former expectations were superseded by a cited decision. If a small managed section is suitable, update just that section. If the connector only replaces the entire body, construct the merged full body from a fresh read, then verify it. A connector without conditional updates cannot guarantee conflict-free writes; minimize the interval and report detected conflicts rather than claiming atomicity.

Creating/updating an issue when explicitly requested needs no redundant confirmation. An unresolved team/project choice matters only when it prevents safe routing; inspect available teams and user context before asking. Do not automatically create a project or alter status/assignee because an issue body is ready.

## Access and retries

For local-only artifacts, include all required behavior in the issue and describe the fuller local references as unavailable remotely. A local absolute path is not a share link. Uploads or publishing private artifacts require appropriate existing authorization; never silently make them public.

Use actual returned identifiers in subsequent writes. Record each confirmed issue/slice in the local publication ledger. On rerun, match known IDs first and search related open/closed issues before creating. If the result of a write remains uncertain, stop additional dependent writes and report the uncertainty with a ready-to-paste fallback.
