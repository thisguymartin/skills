# Validation record

Validation date: 2026-09-08. All examples and issue references are synthetic. No real Linear issue, customer data, global skill installation, or Pstack configuration was changed.

## Methods and observed behavior

### Baseline without these skills

A separate agent received an ambiguous saved-reports request and minimal current search/packet evidence before the skills were written. It correctly stopped on saved-definition versus frozen-result semantics and disclosed unavailable Linear access. Its draft lacked a durable artifact reading map, the native `pstack:poteto-mode` starter, and a current specification review. Its “acceptance criteria” section listed decisions to define rather than observable outcomes. This was a partial baseline, not a claim that unaided agents always fail.

### Independent forward tests

- **Vague idea:** an agent loaded the new router and relevant skills against raw source/issue fixtures, without the expected-behavior rubric or settled example decisions. It preserved existing search/packet concepts, the owner constraint, old links and ENG-98 context; returned a blocked, unpublished issue draft; and asked one consequential Save/reopen question. No implementation or invented issue URL.
- **Backend-only feature:** the same independent evaluator handled a fresh, fully stated webhook receipt contract. It produced an actor/event flow, six requirements and eighteen mapped criteria, a review with an adversarial concurrency/unknown-outcome journey, and no wireframe, storage/cloud choice, or new transport code. It distinguished missing application verification from an unresolved product decision.
- **Adversarial standalone review:** another agent loaded only `review-feature-spec` and its bundled rubric. Despite “already approved” pressure, it blocked a spec with rolling/frozen and private/public contradictions, a Delete control without semantics, and an unterminated failed-run flow. It caught the stale review after an unversioned visual change and returned findings without editing the spec.
- **Existing issue and settled decisions:** a separate forward pass read raw fixtures plus the worked artifacts. It checked and reused the complete current draft/spec rather than writing duplicate artifacts or restarting an interview. It preserved the support anecdote, owner constraint, old links, and completed export context and made no publication claim. This tested artifact reuse and reconciliation, not new spec generation from scratch.
- **Investigation only:** the same pass inspected actual fixture symbols/copy, reported a supported terminology/freshness mismatch, and distinguished that from a proven execution bug or measured usability prevalence. It stopped with findings.
- **Huge feature:** the evaluator returned a parent draft with creation/reopen, editing, scheduling, sharing, and audit journeys as demonstrable slices. It left sharing/schedule/retention choices open, asked whether team sharing changes private v1, and avoided technical-layer tickets or declaring the whole program ready.
- **Cold start on another machine:** the evaluator traced the worked handoff's complete seven-file dependency set. It gave a concrete packaging command but, under the read-only evaluation restriction, did not execute it or claim remote delivery. It reported the transfer prerequisite, synthetic issue IDs, unknown receiving Pstack availability, and missing real implementation repository/authorization.

Two supported refinements followed those runs: distinguish missing product-defining evidence from implementation code access, and identify unversioned artifact changes rather than trusting reused revision labels. The backend test remains a synthetic behavioral evaluation, not proof of an exactly-once delivery implementation.

A final independent repository review found one ownership overlap: a standalone publisher could offer direct spec review without its full rubric. The publisher now requires an existing current passing review before labeling a substantial feature ready, including explicit disposition of IMPORTANT findings. It remains independently useful for reviewed inputs and complete drafts; spec review stays with its own skill. No path that overwrites local skills was found in the upstream tooling review.

### Worked example walkthrough

The saved-search example contains one bounded canonical spec with inline decisions/flows, a low-fidelity wireframe, an explicit review, a complete unpublished Linear draft, and a cold-start handoff. The manual walkthrough maps seven requirements to sixteen criteria and walks permission loss, incomplete evaluation/retry, and old-link compatibility. See [the actual review](ui-feature/review.md). No HTML visual verification or live application test is claimed.

## Automated checks

`node scripts/validate-skills.ts` validates the maintained frontmatter subset, matching skill names, entrypoint size, actual local Markdown link destinations, exact-pin provenance, and bundled adaptation notices. It does not parse arbitrary YAML, verify remote links, evaluate prose semantics, or execute skills.

`node --test scripts/tooling.test.ts` uses isolated local Git repositories. It checks affected mappings, unrelated changes, support-file changes, license changes, removed files, pinned versus latest export, bundled notices, no overwrite, rejected symlinks/traversal/invalid manifest entries, unavailable pins, missing reference links, and mismatched skill names. Tests create synthetic commits only in their temporary repositories, using Martin Patino's required identity without attribution trailers.

The tools were first run with the helpers absent, producing the expected missing-module failure, then implemented and exercised against actual temporary Git state. Passing script tests does not establish that every future agent follows the skills.

All nine frontmatter documents were also parsed successfully with Ruby's YAML parser. The bundled skill-creator `quick_validate.py` could not run because its Python environment lacked PyYAML; no dependency was added to this repository to satisfy that optional tool.

## Live upstream smoke checks

The checker completed against all five public repositories. Matt Pocock, Open Pstack, and Builder.io matched their recorded pins. During this session Spec Kit advanced to `7a121f1ffa1df903d8acfbba806675c13df47615` and Anthropic advanced to `351fb121c99927f660e1b3de854d9ccc51fb9d81`; the checker reported those revision changes and no changes to configured reference/license paths. Research pins intentionally remain at the inspected revisions in the manifest.

The reference exporter fetched the pinned Matt Pocock `shape-feature` sources, kept the upstream license, and wrote only a fresh OS temporary review directory. All six exported source/notice files were byte-compared with the pinned research checkout and matched. The local Git tests separately cover `--latest`, changed files and rejection paths. No upstream code was executed and no local skills or manifest were replaced by either tool.

## Limits and reruns

The installation documentation was also smoke-tested with `skills@1.5.25` and Node 22.20.0 in a fresh OS temporary project, using this checkout as the local source and selecting `codex claude-code`, all nine skills, and project scope. The runtime was supplied through npm's temporary package execution; the system Node version was not upgraded. Telemetry was disabled. Installation succeeded; all 32 source files, including references and license notices, matched the installed files byte-for-byte. All nine Claude links resolved to their Codex-compatible `.agents/skills` copies. The installed directories were snapshots, not links back to the source checkout. No matching global skills were present after the test. GitHub installation awaits publication; global installation, native client invocation, and update execution were not tested.

Run the [seven scenarios and pressure probes](scenarios.md) after changing skill behavior. Native Codex/Claude Code discovery and live Linear publish/read-back remain integration smoke tests for an explicitly authorized real setup. Pstack was not installed or invoked. The current session's Linear tool inventory establishes a capability surface, not verified publishing access.

The fixture repository is not a real application. Source-backed fixture conclusions, manual contract review, independent agent responses, and script tests are separate evidence classes. Do not promote fixture totals or synthetic IDs into business claims.
