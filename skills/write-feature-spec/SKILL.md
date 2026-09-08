---
name: write-feature-spec
description: Turn settled product decisions, issue context, or a shaped feature into a durable feature specification. Use when the behavior is already decided or the discussion needs an implementation-ready product contract.
license: MIT
---

# Write feature spec

## Inputs

The problem, evidence/current behavior, accepted decisions, actors, scope, and existing flows/visuals. Read the supplied artifacts first. Inspect relevant code/glossary/ADRs when current context is missing.

## Process

1. Synthesize what was decided. Do not restart an interview or invent decisions to complete a template. Identify actual consequential gaps; `shape-feature` can resolve those while the supported portions remain draftable.
2. Load [spec-template.md](references/spec-template.md). Select useful sections and combine overlaps such as Non-Goals/Out of Scope. Include relevant lifecycle, permissions, domain invariants, compatibility, integration, and failure behavior. Small specs may inline their flows and decision rationale.
3. Load [acceptance-criteria.md](references/acceptance-criteria.md). Use stable requirement/criterion IDs where useful and map criteria to requirements. Each criterion describes independently observable behavior, including important negative/error/edge cases.
4. Reference inspected code as navigation evidence, with symbols/revision when available. Record existing technical constraints separately from suggested implementation choices. Product intent must be precise while Pstack retains technical strategy and test design.
5. Reconcile the spec with decisions, flow, and wireframes. Label FACT, DECISION, ASSUMPTION, and OPEN QUESTION; cite evidence/decision sources. Do not manufacture metric baselines, numeric targets, permission defaults, or deployment choices.
6. Give the spec a revision and draft status. Route substantial features to `review-feature-spec`. Any material edit after review requires checking affected artifacts and renewing the review before readiness.

## Outputs and stopping conditions

Produce `spec.md` in the project's artifact location or `.issuecraft/<id-or-slug>/`, or complete saveable Markdown when no workspace exists. Return supported scope, unresolved blockers, and the review destination. A drafted spec is not automatically implementation-ready.

This skill does not publish to Linear or create an implementation plan. Use `publish-linear` after the product quality gate.

Adapted from Matt Pocock's `to-spec`; expanded for product behavior and separated from tracker writes and implementation decisions. See [LICENSE.txt](LICENSE.txt).
