---
name: wireframe-feature
description: Make product UI intent visually reviewable when layout, controls, navigation, or state differences are hard to judge from prose. Use for feature wireframes or small interaction prototypes before production design and coding.
license: MIT
---

# Wireframe feature

## Inputs

Current UI evidence, the feature's flow and accepted decisions, and a concrete visual question. If the feature has no meaningful UI change, skip the wireframe; a state/data-flow diagram may still help.

## Process

1. Load [wireframe-guidelines.md](references/wireframe-guidelines.md). State what the visual should help the reviewer decide and its fidelity: low-fidelity wireframe, interaction prototype, or production design request. Production design is a separate task.
2. Inspect the existing screen/shell and follow its vocabulary and navigation. Draw the smallest set of states that makes hierarchy, controls, relationships, and recovery reviewable. A Markdown/ASCII wireframe is the baseline.
3. Create a standalone HTML interaction prototype only when clicking through a transition answers a question that static frames cannot. Use synthetic data and in-memory state, label it a planning artifact, and keep it outside application code under `.issuecraft/<id-or-slug>/visuals/` or the chosen artifact directory.
4. Annotate each meaningful control/state with a flow or decision reference outside the product frame. Mark unresolved variants as proposals. Incorporate newly accepted behavior into the written decisions/flow/spec before treating it as settled.
5. Inspect the rendered artifact where possible. Check readability, state coverage, meaningful control behavior, and consistency with the written flow. Report visual verification limitations if rendering is unavailable.

## Outputs and stopping conditions

Return `wireframe.md`, optionally `wireframe.html` or a useful diagram, plus review notes and the visual question's status. Stop when the intended behavior is reviewable or a product choice blocks it. Route accepted visuals to `write-feature-spec` and `review-feature-spec`.

Do not edit production routes, add app dependencies, connect a database, or promote prototype code into implementation. Native Pstack chooses how to implement the accepted product behavior.

Adapted from Matt Pocock's `prototype`; production-route mechanics removed. See [LICENSE.txt](LICENSE.txt).
