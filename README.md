# thisguyskills

My opinionated collection of coding-agent skills for deciding **what should be built**.

Coding agents can implement a lot. They still build the wrong thing when a ticket is vague, nobody checks existing behavior, product choices get mixed with technical choices, UI flows stay implicit, specs contradict themselves, or the reasoning disappears between sessions.

Thisguyskills turns an idea or issue into a reviewed product contract, a useful Linear issue, and a handoff another agent can actually resume. Intended repository: `thisguymartin/skills`. **Issuecraft** is the optional artifact layer under `.issuecraft/` in the product workspace.

```text
Issue / Idea
    ↓
Investigate -> Shape -> Flow -> Wireframe (when UI matters)
    ↓
Spec -> Review -> Linear -> Handoff
    ↓
Native Open Pstack
    ↓
Build / Verify / Review / PR
```

## Start anywhere

Ask your agent to use `issue-workflow`:

> We should make saved reports easier to understand. Investigate what happens today and shape the smallest useful change.

> Take ENG-123 and fully shape it before we give it to Pstack.

> Turn this discussion into an implementation-ready Linear issue. The behavior is already decided.

Use a focused skill directly when you know what you need. Investigation can end with “already fixed,” “configuration issue,” or “no change needed.” An already-decided feature can go straight to synthesis. Missing product decisions leave a blocked draft; they do not become guessed requirements.

## Nine skills, clear responsibilities

| Skill | Owns |
| --- | --- |
| [issue-workflow](skills/issue-workflow/SKILL.md) | Starting-point detection and routing through feature preparation |
| [investigate-issue](skills/investigate-issue/SKILL.md) | Current behavior, code paths, evidence, domain language, related work |
| [shape-feature](skills/shape-feature/SKILL.md) | Product decisions, scope, assumptions, and consequential open questions |
| [design-user-flow](skills/design-user-flow/SKILL.md) | User journeys, alternate paths, state coverage, recovery |
| [wireframe-feature](skills/wireframe-feature/SKILL.md) | Reviewable UI hierarchy and interactions; low fidelity by default |
| [write-feature-spec](skills/write-feature-spec/SKILL.md) | Durable product intent, requirements, and observable acceptance criteria |
| [review-feature-spec](skills/review-feature-spec/SKILL.md) | Contradictions, omissions, unsupported assumptions, and readiness |
| [publish-linear](skills/publish-linear/SKILL.md) | Issue drafts, respectful enrichment, vertical slices, verified publication |
| [handoff](skills/handoff/SKILL.md) | Durable reading map and exact cold-start continuation |

Small entrypoints load their own references only when needed. Each skill is independently useful. The router composes them; there are no mandatory artifact bundles or extra orchestration services.

## Product intent first

Investigate factual questions before asking the user. Ask progressively for actual product decisions. Keep FACT, DECISION, ASSUMPTION, and OPEN QUESTION distinct. A saved report preserving a date-range strategy belongs in the spec. Whether it uses JSON or normalized tables usually belongs to implementation.

Substantial features must pass a specification review. The gate checks behavior, flows, permissions, failures, scope, evidence, and requirement/criterion coverage. BLOCKING findings prevent an implementation-ready label. Material changes invalidate the old review. Visual controls cannot silently introduce behavior absent from the written contract.

Linear is a first-class destination. Existing context survives enrichment; large features use demonstrable vertical slices. Publishing uses whatever real integration is available and only within the requested scope. Without access, the result is complete ready-to-paste content, clearly marked unpublished.

## Relationship with Open Pstack

This repository complements [Open Pstack](https://github.com/ericlitman/open-pstack). It does not vendor or fork Open Pstack. Feature shaping stops at an implementation-ready contract, after which native Pstack can own technical execution.

Pstack retains architecture, implementation, code changes, tests, real-application verification, code review, CI, PR preparation, implementation-session recovery, and implementation orchestration. The handoff names **`pstack:poteto-mode`**, which performs native routing. There is no copied implementation stack or long manual skill chain.

Keep Pstack installed and configured through its [own native installation workflow](https://github.com/ericlitman/open-pstack#install). Thisguyskills does not change that setup.

## Install and use

Once this repository is published at `thisguymartin/skills`, install all nine skills for **Codex and Claude Code** from anywhere:

```bash
DISABLE_TELEMETRY=1 npx skills@latest add https://github.com/thisguymartin/skills -g -a codex claude-code -s '*'
```

Before publication, run from this checkout's root instead:

```bash
DISABLE_TELEMETRY=1 npx skills@latest add . -g -a codex claude-code -s '*'
```

This uses the existing [Skills CLI](https://github.com/vercel-labs/skills). Its current release requires **Node 22.20+** to install; using the skills afterward needs no Node runtime. `-g` makes them available across projects. To install for just one host, use `-a codex` or `-a claude-code`. The CLI installs the complete skill folders where each host discovers them. Start a fresh session and use `$issue-workflow` in Codex or `/issue-workflow` in Claude Code.

The installer can replace same-name skills. See [compatibility and installation](docs/compatibility.md) for selected skills, project installs, updates, and a manual option that skips existing entries. A temporary project install verified all nine skills and their bundled references/notices; native client invocation remains untested.

### Remove

Remove these nine skill names from personal Codex and Claude Code installations:

```bash
DISABLE_TELEMETRY=1 npx skills@latest remove \
  issue-workflow investigate-issue shape-feature \
  design-user-flow wireframe-feature write-feature-spec \
  review-feature-spec publish-linear handoff \
  -g -a codex claude-code
```

Removal matches names, not the source repository. Check the selection before confirming; avoid `--all`, which selects other skills too. For project installs, run from the target project and omit `-g`. Start a fresh agent session afterward. No separate install or removal script is required.

## Workflows and artifacts

- [Idea -> Linear](workflows/idea-to-linear.md)
- [Existing Linear issue -> shaped feature](workflows/linear-to-feature.md)
- [Investigation-only deep dive](workflows/issue-deep-dive.md)
- [Feature -> native Pstack](workflows/feature-to-pstack.md)

Use the [artifact convention](docs/artifacts.md) only as needed. A small spec can contain its own decisions and flow. A substantial UI feature might use separate spec, decisions, review, and wireframe files. Handoffs reference these durable artifacts instead of copying them. Local files must be made accessible before a remote agent can use them.

For a complete synthetic example, start with [the saved-search handoff](examples/ui-feature/handoff.md). The [seven behavioral fixtures](examples/scenarios.md) cover vague ideas, existing issues, investigation only, backend work, settled decisions, oversized features, and cold starts. Synthetic issue IDs are never live publication targets.

## Validate and maintain

Repository tools need **Node 22.18+ and Git**, with no installed packages:

```bash
node scripts/validate-skills.ts
node --test scripts/tooling.test.ts
node scripts/check-upstreams.ts
node scripts/pull-upstream-reference.ts mattpocock-skills shape-feature
# Optional: inspect the current upstream instead of the recorded pin
node scripts/pull-upstream-reference.ts mattpocock-skills shape-feature --latest
```

Validation checks this repository's deliberately small frontmatter subset, names, file links, and provenance. It is not a general YAML parser or a test of agent judgment. [Validation notes](examples/validation.md) distinguish automated checks from behavioral walkthroughs and integration limitations.

Upstream tools use temporary Git clones and compare configured source/dependency/license paths. Exports go to a fresh OS temporary review directory, never `skills/`. They do not execute upstream code, update pins, or overwrite adaptations. Review changes manually, then update the manifest, attribution, and tests together. Git calls time out after 30 seconds and failures exit nonzero; reported upstream changes alone exit zero.

## Credits and license

| Source | Relationship |
| --- | --- |
| [Matt Pocock Skills](https://github.com/mattpocock/skills) | **Adapted:** six skills draw from routing, grilling/domain modeling, prototype, spec synthesis, ticket slicing, and handoff instructions |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | **Conceptual inspiration:** requirements quality gates, consistency and coverage checks |
| [Anthropic Knowledge Work Plugins](https://github.com/anthropics/knowledge-work-plugins) | **Conceptual inspiration:** problem, actors, goals/non-goals, metrics, and scope management |
| [Builder.io Skills](https://github.com/BuilderIO/skills) | **Conceptual inspiration:** UI plans should be visually reviewable |
| [Open Pstack](https://github.com/ericlitman/open-pstack) | **External integration:** native technical execution after shaping |

Exact research revisions, verified paths, wrapper dependencies, licensing notes, and intentional changes are in [UPSTREAMS.md](UPSTREAMS.md) and [upstreams/manifest.json](upstreams/manifest.json). Locally authored investigation, user-flow, and spec-review skills complete the product workflow. Adapted material is credited and carries its upstream notice.

[MIT](LICENSE), with required notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the adapted skills' bundled license files.
