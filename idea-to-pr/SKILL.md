---
name: idea-to-pr
description: "Turn a rough sentence, paragraph, or Linear issue into detailed, agreed work through progressive questions, repository investigation, scoped implementation, verification, and a concise GitHub PR. Use when the user wants to dig into an idea before building it, interview them about requirements, or take an issue through to a PR. Supports narrower requests for plans or frontend/backend issue drafts."
license: MIT
---

# Idea to PR

Draw out what the user means, prove how it fits the existing system, and carry the agreed work to its requested destination. Keep the investigation and implementation brief detailed; keep the PR readable and short.

## Inputs and destination

Accept a sentence, paragraph, pasted discussion, issue ID/URL, multiple related issues, or an existing template. Reuse the user's wording and prior answers. Their template takes precedence; fill its gaps with the relevant parts of [templates.md](templates.md).

Default destination: questions -> detailed working brief -> implementation -> verification -> `security-scan` -> `pr-automation` + Humanizer -> a verified GitHub PR. An explicit request for only research, issue drafts, or a plan stops there. A local PR description and a GitHub draft PR are different destinations.

An explicit invocation of this workflow to deliver a PR authorizes its ordinary scoped implementation, commit, push, and PR creation/update. Ambient discovery alone does not expand a request into delivery. Merging, deployment, tracker writes, and messages to others need their own request. Keep earlier authorization and constraints; avoid repeated permission questions.

## 1. Establish the actual problem

Read repository instructions, status, branch, and existing work. Resolve supplied paths rather than assuming the current directory is the target. For multiple repos, record each path, branch, HEAD, and responsibility.

For Linear input, discover its connected tools and read the full issue body, relevant comments, relations, and linked PRs. Fetch only related material that changes the scope or a decision. Missing access is a gap: ask for the needed issue content and continue available repository investigation. Treat titles and URLs as leads, not complete requirements.

State your understanding in a few sentences: who is affected, what happens today, what they want to happen, and the intended destination. Distinguish user requirements, code evidence, recommendations, assumptions, and unanswered questions. An issue may propose a solution without proving its cause.

Use `gather-context` or `project-research` when their capability is useful and available. Load only the needed skill; a small request does not require their full artifact workflows. Do not invoke Pstack unless the user or applicable repository instructions request it.

## 2. Interview progressively

**Always ask at least one meaningful discovery question for a new request, even if the input seems complete.** Ask about a real scenario, success criterion, boundary, or product choice. Use a focused scope-verification question when all other decisions are already settled; do not manufacture unrelated uncertainty.

Read [interview.md](interview.md) for question selection and examples. Ask one to three related questions per round, usually one. Give concrete options and the behavior each produces when options help; allow a free-form answer. Prefer questions anchored in the user's example or a finding from the code.

Investigate facts yourself. Ask the user about intent, tradeoffs, domain meaning, and constraints that evidence cannot settle. Wait for replies before implementing behavior that depends on them. A timeout or preselected option is not an answer. Continue independent reads while questions are pending.

After each round, record the answer and its consequence for behavior, scope, or verification. Use it to select the next question. Explain contradictions between an answer, issue, and current contract; ask only for the unresolved decision. Do not reopen settled choices without new evidence.

Stop asking when the relevant product choices, success criteria, and scope are settled. If the user asks to stop the interview, preserve unanswered decisions and deliver the supported draft. If they explicitly delegate a choice, recommend and record it as delegated rather than pretending they specified it.

## 3. Investigate the full path

Model the affected entities, ownership, identities, lifecycle, and invariants before proposing storage or folder changes. Trace the concrete path from the user action through local state, requests, backend logic, persistence, response, and rendering. Inspect other consumers of the same contract.

For cross-repo work, verify both sides of every relevant boundary: field names/types, defaults, serialization, validation, errors, and old saved records. Explain where each rule belongs and why. A frontend symptom does not establish backend work; backend work needs evidence of a contract or persistence change. Frontend-only work should remain frontend-only when that satisfies the behavior.

Record exact paths/symbols, branch/HEAD, observed current behavior, proposed behavior, and evidence gaps. Inspect existing branches/PRs before proposing duplicate work. Use current official documentation for unfamiliar libraries/APIs. Keep recommendations sourced and give confidence with the evidence behind it; do not attach arbitrary percentages to user decisions.

Use synthetic examples. Keep real customer payloads, credentials, and private logs out of prompts, shared artifacts, issues, and PRs.

## 4. Build the detailed working brief

Use [templates.md](templates.md) as an adaptable structure. Fill the sections that affect this task; omit irrelevant sections instead of padding them. Small fixes can stay inline. Substantial or cross-repo work should have a durable brief in an appropriate repo-local documentation location, or a supplied destination. Do not add planning files to the implementation commit unless requested or required by the repo. Preserve manually edited artifacts when revising them.

The brief must let another developer continue without reconstructing the conversation. Include:

- Concrete current -> desired examples, affected users, domain rules, and failure behavior.
- Evidence from the full code/data path, including the source of truth and shared consumers.
- Settled answers and rationale, explicit assumptions, open questions and their impact.
- Frontend/backend/shared scope with ownership, dependencies, and exclusions.
- File-level implementation steps, contract/persistence changes, and meaningful alternatives.
- Observable acceptance criteria, verification cases, and actual risks or rollout order.

Show the brief to the user while continuing independent work. Verify unresolved scope through focused questions; do not require a ceremonial approval after the user has already settled the behavior and authorized implementation. New consequential ambiguity returns to the interview before dependent edits.

When the request is to identify or draft issues, produce one independently deliverable issue per responsibility using the issue template. Link dependencies and overlapping existing issues. Explain when a new issue is unnecessary. Do not publish Linear issues merely because an issue draft exists.

## 5. Implement and verify the agreed work

Implement only the agreed scope using the repository's normal workflow. Preserve unrelated work. Sequence changes by dependency and make each outcome verifiable. Recheck the contract when another repo or saved representation is affected.

Map acceptance criteria to evidence: focused automated checks, relevant manual interactions, and cross-repo integration checks where available. Use real persistence/reload checks when saved behavior changes and inspect the rendered UI when visual behavior changes. Tests should prove behavior rather than mirror implementation. Keep synthetic fixtures isolated from live records and the user's drafts.

Fix task-related failures. Separate baseline failures, unavailable integration environments, pending CI, and checks not run. If verification reveals a different cause or expands scope, update the brief and ask about the consequential choice. Never weaken acceptance criteria to match the implementation.

## 6. Scan the final change

Discover and read `security-scan` (bundled at [../security-scan/SKILL.md](../security-scan/SKILL.md) in this collection). Before PR delivery, scan the complete intended change against the confirmed base, including scoped pending files; scanning staged files alone must not omit earlier branch commits. For several repos, scan each PR's scope and trace relevant caller/callee boundaries across them. Docs-only changes get the skill's short triage result.

The scanner is read-only: it reports confirmed findings and fixes. Hand findings back to the implementation step. Fix task-introduced CRITICAL/HIGH findings before delivery; a disputed or out-of-scope fix requires a focused decision with the impact explained. Record lesser findings and their disposition. Keep unrelated findings separate. Do not run a full-service or dependency audit unless requested or required by repository instructions.

After fixes, rerun affected verification and rescan the changed security paths. Record the reviewed revision/diff and gaps; changes after the scan require review of the affected delta. If the skill is unavailable or a blocking finding remains unresolved, stop delivery and preserve a local PR draft. Do not report an unavailable or incomplete scan as clean.

## 7. Deliver through the existing skills

Discover and read `pr-automation` (bundled at [../pr-automation/SKILL.md](../pr-automation/SKILL.md) in this collection) and the installed `humanizer` or `humanizer:humanizer`. These are delivery dependencies, not instructions to install new tools. If either is missing, continue independent work and preserve a concrete local draft; stop the dependent delivery step and identify the missing skill. Do not silently substitute another workflow or claim the named skill ran.

Pass `pr-automation` the repository, scoped files, agreed behavior, issue links, intended base when known, actual verification and security-scan results, and requested metadata. Let it resolve the existing PR, commit/push, and create/update once. It owns the PR template and delivery mechanics; do not duplicate those rules here.

For useful flow diagrams, follow `pr-automation`'s diagram workflow: Excalidraw first, mer-inkdrop as the backup -> editable source -> exported and visually checked image -> verified PR attachment or approved hosted URL. Pass through the user's `diagram: auto`, `always`, or `off` preference and any explicit renderer constraint. Use the designated backup when Excalidraw generation/export is unavailable or fails; identify the actual renderer and preserve the matching source.

Use Humanizer in embedded mode on the working brief's prose and final PR title/body. Return only the finished wording. Preserve technical details, evidence, links, uncertainty, and validation caveats. Follow the user's direct, casual voice; use `->` for flows. Humanizer may shorten wording, but must preserve the detailed requirements and reasoning.

For changes in several repos, use a scoped PR per repo and link dependencies. Do not claim one PR contains another repo's uncommitted work. Keep the final PR body about the complete final diff, with a short problem/outcome explanation, useful behavior bullets, critical review notes when needed, and honest validation. Link the detailed brief only if it is accessible to the reviewer.

## Completion

For delivery, return verified PR URL(s), a short statement of resulting behavior, and material validation limits. Success requires scoped code published and the intended PR fetched and checked through `pr-automation`; a local draft is not a published PR. Do not merge or deploy.

For a narrower request, return the detailed brief or scoped issue drafts and name any decision still needed. When blocked, preserve completed work, name the actual blocker, and leave the precise next step. Avoid ending with a generic offer to continue.
