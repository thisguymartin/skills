---
name: handoff
description: Create a durable cold-start handoff when feature shaping pauses, moves to another session, or is ready for native Open Pstack. Use to preserve the objective, decisions, artifact references, blockers, and exact next action without duplicating the specification.
license: MIT
---

# Handoff

## Inputs

The next session's objective, current artifacts/issue references, decisions, review status, and unresolved work. Use the user's stated continuation target; a handoff can resume investigation or shaping as well as start implementation.

## Process

1. Read [handoff-template.md](references/handoff-template.md). Inspect durable artifacts and issue state; identify what is current, missing, local-only, or stale. Distinguish facts, decisions, assumptions, and open questions.
2. Persist essential decisions or findings that exist only in the conversation into the appropriate artifact. Then make the handoff a short reading map. Reference specs, flows, visuals, reviews, issues, and code rather than repeating their contents.
3. Record the exact workspace/repository, artifact revision or delivery mechanism, review readiness, constraints, unresolved questions, and next action. Verify local paths exist. For remote continuation, use accessible links or a portable bundle; local-only files require an explicit transfer step.
4. For implementation, load [pstack-handoff.md](references/pstack-handoff.md). Require a current passing review for a substantial feature. Name native `pstack:poteto-mode` as the destination and preserve its ownership of technical execution. If product questions remain, the next action is shaping, not implementation.
5. Perform a cold-start check: can an agent with no chat history locate the contract, understand readiness, identify unresolved decisions, and know exactly what to do next? Fix missing information before calling the handoff ready.

## Outputs and stopping conditions

Write `handoff.md` in the existing artifact directory or `.issuecraft/<id-or-slug>/`. Without a workspace, return saveable Markdown; if using a temporary file, clearly state its lifetime and transfer need. Include one concise starter prompt.

Stop after the handoff and its access/readiness status are clear. Creating the handoff does not start implementation, install Pstack, publish artifacts, or claim unavailable skills ran. Implementation-session recovery remains native Pstack's responsibility.

Adapted from Matt Pocock's `handoff`; durable project storage, Linear, and Pstack continuation added. See [LICENSE.txt](LICENSE.txt).
