---
name: review-feature-spec
description: Challenge a feature specification for missing behavior, contradictions, unsupported assumptions, and acceptance-criteria coverage before implementation. Use as the readiness gate for substantial features or to review an existing product spec.
license: MIT
---

# Review feature spec

## Inputs

The exact current spec, decisions/evidence, relevant flows/visuals, and issue context. Missing artifacts are findings only when their information is needed; file count is not a quality measure.

## Process

1. Load [review-rubric.md](references/review-rubric.md). Read the actual artifacts, not the author's summary. Record the spec revision and versions/paths of other reviewed artifacts.
2. Attack completeness, consistency, traceability, scope, assumptions, and implementation leakage. Walk each flow, including failure/re-entry, and compare the resulting behavior to requirements and criteria. Review visuals alongside the written contract.
3. Classify each concrete finding as BLOCKING, IMPORTANT, or NICE-TO-HAVE. Include a precise reference, why it matters, and the decision or correction needed. Keep evidence distinct from inference; retrieve missing facts before asking the user.
4. A review-only request returns findings without rewriting the spec. In an authorized shaping workflow, correct evidence-backed omissions and route true product decisions to `shape-feature`; synchronize affected artifacts, then review the corrected version.
5. Mark readiness only when no BLOCKING findings remain and IMPORTANT findings are resolved or explicitly dispositioned with rationale/owner. A material product ambiguity is BLOCKING regardless of the label the author gave it. Deferred technical strategy is not a defect.

## Outputs and stopping conditions

Produce `review.md` beside the spec, or an inline review for small work: reviewed revision/artifacts, verdict (`ready` or `blocked`), findings, coverage gaps, dispositions, and the next action. Report clean reviews without inventing findings.

Stop when the gate has a supported verdict or needs a product answer. Never publish an unresolved spec as implementation-ready. After any material change, the previous review is stale until affected artifacts are reviewed again. A passing product review is not code review or runtime verification; those belong to native Pstack.
