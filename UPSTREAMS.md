# Upstreams

Research date: 2026-09-08. All five repositories were shallow-cloned into an OS temporary directory and inspected at the exact revisions below. No upstream working tree is part of this repository. Paths are verified against those revisions.

The [manifest](upstreams/manifest.json) is the machine-readable source map. `adapted` means materially rewritten from upstream instructions; `inspiration` means concepts studied with locally authored prose; `external` means a native dependency whose content is not shipped. License labels record inspected files, not a substitute for their actual terms. Confidence: high for recorded revisions, paths, and license text.

## mattpocock-skills

Repository: https://github.com/mattpocock/skills

Pinned research revision: `3cca18b368ae95cdbdebbff572ccafa662551015`

Relationship: **adapted**. License: MIT.

Inspected license/notices: [LICENSE](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/LICENSE).

### issue-workflow

Upstream sources:

- [skills/engineering/ask-matt/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/ask-matt/SKILL.md)
- [skills/engineering/ask-matt/PHASE-BOUNDARIES.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/ask-matt/PHASE-BOUNDARIES.md)

Local adaptation: [skills/issue-workflow/SKILL.md](skills/issue-workflow/SKILL.md) and its references.

Changes: Product-only routing, conditional artifacts, resumable decisions, explicit native Pstack boundary; no implementation flow or uninterrupted-context dependency.

### shape-feature

Upstream sources:

- [skills/engineering/grill-with-docs/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/grill-with-docs/SKILL.md)
- [skills/productivity/grilling/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/grilling/SKILL.md)
- [skills/engineering/domain-modeling/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/domain-modeling/SKILL.md)
- [skills/engineering/domain-modeling/CONTEXT-FORMAT.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/domain-modeling/CONTEXT-FORMAT.md)
- [skills/engineering/domain-modeling/ADR-FORMAT.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/domain-modeling/ADR-FORMAT.md)

Local adaptation: [skills/shape-feature/SKILL.md](skills/shape-feature/SKILL.md) and its references.

Changes: Incorporates wrapper dependencies directly; small progressive question rounds, evidence before questions, fact/decision/assumption ledger; no forced global glossary or architecture decisions.

### wireframe-feature

Upstream sources:

- [skills/engineering/prototype/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/prototype/SKILL.md)
- [skills/engineering/prototype/LOGIC.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/prototype/LOGIC.md)
- [skills/engineering/prototype/UI.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/prototype/UI.md)

Local adaptation: [skills/wireframe-feature/SKILL.md](skills/wireframe-feature/SKILL.md) and its references.

Changes: Keeps the question-driven prototype idea; defaults to Markdown, isolated synthetic-data HTML only when useful; removes app-route edits, production promotion, throwaway branches, and infrastructure dependencies.

### write-feature-spec

Upstream sources:

- [skills/engineering/to-spec/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/to-spec/SKILL.md)

Local adaptation: [skills/write-feature-spec/SKILL.md](skills/write-feature-spec/SKILL.md) and its references.

Changes: Preserves synthesis of settled decisions; adds flows, permissions, observable criteria and revisioned review; separates publishing and implementation/test strategy.

### publish-linear

Upstream sources:

- [skills/engineering/to-tickets/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/engineering/to-tickets/SKILL.md)

Local adaptation: [skills/publish-linear/SKILL.md](skills/publish-linear/SKILL.md) and its references.

Changes: Linear-first enrichment, supported vertical slices, context preservation, current quality gate, verified writes, duplicate avoidance and offline fallback; no setup-matt-pocock-skills dependency or ready-for-agent label assumption.

### handoff

Upstream sources:

- [skills/productivity/handoff/SKILL.md](https://github.com/mattpocock/skills/blob/3cca18b368ae95cdbdebbff572ccafa662551015/skills/productivity/handoff/SKILL.md)

Local adaptation: [skills/handoff/SKILL.md](skills/handoff/SKILL.md) and its references.

Changes: Durable project artifacts, access-aware cold starts, Linear context, readiness checks and native Pstack continuation instead of temporary-only storage.

## open-pstack

Repository: https://github.com/ericlitman/open-pstack

Pinned research revision: `56bfd14418fa733e34d98f714f357d28788470e3`

Relationship: **external**. License: MIT (multiple copyright holders).

Inspected license/notices: [LICENSE](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/LICENSE), [LICENSE-cursor-team-kit](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/LICENSE-cursor-team-kit), [LICENSE-superpowers](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/LICENSE-superpowers), [NOTICE.md](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/NOTICE.md).

Studied paths:

- [README.md](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/README.md)
- [plugins/pstack/skills/poteto-mode/SKILL.md](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/plugins/pstack/skills/poteto-mode/SKILL.md)
- [plugins/pstack/skills/poteto-mode/references/codex-tools.md](https://github.com/ericlitman/open-pstack/blob/56bfd14418fa733e34d98f714f357d28788470e3/plugins/pstack/skills/poteto-mode/references/codex-tools.md)

Native `poteto-mode` already routes architecture, implementation, real-app verification, review, CI and PR work. Installation uses upstream plugin support for Codex and Claude Code. This repository provides a product-intent handoff only. No source or notices from Pstack are redistributed.

## spec-kit

Repository: https://github.com/github/spec-kit

Pinned research revision: `3a19a6ba900e34a9f5e02848fb8737d1c364a04b`

Relationship: **inspiration**. License: MIT.

Inspected license/notices: [LICENSE](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/LICENSE).

Studied paths:

- [templates/commands/specify.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/specify.md)
- [templates/commands/clarify.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/clarify.md)
- [templates/commands/checklist.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/checklist.md)
- [templates/commands/analyze.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/analyze.md)
- [templates/commands/tasks.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/tasks.md)
- [templates/commands/taskstoissues.md](https://github.com/github/spec-kit/blob/3a19a6ba900e34a9f5e02848fb8737d1c364a04b/templates/commands/taskstoissues.md)

Borrowed ideas: quality-check the specification itself; detect ambiguity, contradiction and missing coverage; organize deliverable work around behavior; avoid duplicate issues on rerun. The local review rubric and publisher are newly written. We omit its constitution, branch scaffolding, task framework, hooks and implementation commands.

## knowledge-work-plugins

Repository: https://github.com/anthropics/knowledge-work-plugins

Pinned research revision: `785ee867160961a2e6061eb46c8db8b88676e43f`

Relationship: **inspiration**. License: Apache-2.0.

Inspected license/notices: [LICENSE](https://github.com/anthropics/knowledge-work-plugins/blob/785ee867160961a2e6061eb46c8db8b88676e43f/LICENSE).

Studied paths:

- [product-management/skills/write-spec/SKILL.md](https://github.com/anthropics/knowledge-work-plugins/blob/785ee867160961a2e6061eb46c8db8b88676e43f/product-management/skills/write-spec/SKILL.md)

Borrowed concepts: evidence-backed problem definition, actors, measurable outcomes, explicit non-goals, prior art, acceptance criteria and scope control. The scoped [product-management/LICENSE](https://github.com/anthropics/knowledge-work-plugins/blob/785ee867160961a2e6061eb46c8db8b88676e43f/product-management/LICENSE) is standard Apache-2.0. The root LICENSE also contains that license followed by unrelated appended text at this revision; the manifest tracks both. No NOTICE in the studied plugin was found. No source text/template is copied or adapted from this repository, so no Apache-derived content is distributed here. Recheck licensing before any future copying.

## builderio-skills

Repository: https://github.com/BuilderIO/skills

Pinned research revision: `8cd59582774e0badf23796a6fc86c26c7117988e`

Relationship: **inspiration**. License: MIT.

Inspected license/notices: [LICENSE](https://github.com/BuilderIO/skills/blob/8cd59582774e0badf23796a6fc86c26c7117988e/LICENSE).

Studied paths:

- [skills/visual-plan/SKILL.md](https://github.com/BuilderIO/skills/blob/8cd59582774e0badf23796a6fc86c26c7117988e/skills/visual-plan/SKILL.md)
- [skills/visual-plan/references/wireframe.md](https://github.com/BuilderIO/skills/blob/8cd59582774e0badf23796a6fc86c26c7117988e/skills/visual-plan/references/wireframe.md)

Borrowed concept: UI plans should expose actual screens/states for review. No Builder tools, hosted-service mechanics, renderer tokens, code or template text are copied. Our low-fidelity reference is independently written.

## Local work

`investigate-issue`, `design-user-flow`, and `review-feature-spec` are independently authored for this workflow. The six adaptations above are deliberately different from upstream. References/templates are locally written for these boundaries, with the originating skill behavior credited where applicable. Workflow docs, artifact/compatibility guidance, fixtures, worked example, and maintenance tooling are locally authored.

## Updating safely

1. Run `node scripts/check-upstreams.ts` (or pass one source ID). It compares pinned and current default-branch revisions, reports affected mappings and license/reference changes, and never updates the manifest or skills.
2. Run `node scripts/pull-upstream-reference.ts <source-id> [skill-name]` to export **pinned** source files into a fresh OS temporary review directory. Add `--latest` to inspect the current default branch instead. The output records the revision and keeps license files. It never executes upstream code.
3. Review changes and licenses manually. Preserve our product/implementation boundary and any required notices. Apply intentional local edits; never copy an entire upstream skill tree over `skills/`.
4. After review, update the pin and source paths in the manifest and this document together; update notices if necessary. Run structural/tooling validation and the relevant behavioral fixtures.

The tools check configured paths, not every future dependency upstream may add. A renamed/deleted path is reported; read the new references before updating mappings. A pin means reviewed source, not an automatic upgrade policy.
