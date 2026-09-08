# Handoff template

Keep this short. Persist substantive new information in the appropriate artifact and point to it.

```markdown
# Handoff: feature or investigation

## Objective
What the next session should accomplish.

## Current state
Shaping stage and readiness; exact spec/review revision; what was actually done.
Repository/workspace and branch/commit if available. Local/uncommitted artifacts
and how the next agent can access them. Do not imply an unpushed branch is shared.

## What was decided
Brief orientation plus references to the accepted decision record.

## What remains open
Questions, owners, impact, blockers; separate assumptions from accepted choices.

## Important constraints
The few invariants the next agent must see before proceeding.

## Artifacts to read
Ordered paths/URLs with one phrase explaining each. Reference the full spec;
do not paste it here. Identify any required file not yet transferable.

## Linear
Verified issue/parent/child IDs and URLs, or unpublished draft path.
Describe any publishing limitation or uncertain write result.

## Important code locations
Real paths/symbols and inspected revision. Navigation hints, not an edit plan.

## Verification expectations
Point to acceptance criteria and important real-application journeys.
Distinguish completed shaping review from outstanding implementation verification.

## Recommended next action
One executable next step and its prerequisites. If blocked, name the decision
or access needed rather than instructing the next agent to implement anyway.

## Suggested skills
Only skills useful for this continuation and available in that environment.
For implementation: native pstack:poteto-mode, with availability disclosed.
```

Redact secrets and unnecessary personal data. Avoid transient browser element IDs, temporary tool handles, or “as discussed above.” If an essential artifact cannot be accessed, the handoff is blocked for that destination until it is transferred or its contract is captured in an accessible location.
