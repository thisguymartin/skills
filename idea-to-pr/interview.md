# Progressive interview

Use these prompts to choose the next useful question. Adapt the wording to the user's input; do not send the whole list.

## Pick the question that changes the work

Start with the greatest uncertainty about the desired behavior. After reading enough context to ask concretely, move toward boundaries and acceptance. Technical questions belong with the user only when they encode a product choice or an unresolved operational constraint.

| Uncertainty | Useful question | What the answer settles |
|---|---|---|
| Problem | "Walk me through the last time this got in your way. What did you expect?" | Real trigger and user impact |
| Success | "After this change, what should someone be able to do that they can't do today?" | Observable outcome |
| Meaning | "When you say 'flip,' what should move, and what should keep its original meaning?" | Domain semantics |
| Scope | "What's the smallest useful version? Which part can wait?" | Deliverable boundary |
| Ownership | "Is this shared by everyone working on the same item, or personal to the viewer?" | Source of truth and persistence owner |
| Lifecycle | "Should this survive a reload, reopening later, or another person opening the saved item?" | Duration and saved-state behavior |
| Existing data | "What should happen when someone opens an older saved item?" | Compatibility behavior |
| Failure | "If saving fails, should the change remain visible for retry or return to the last saved state?" | Recovery and user feedback |
| Consumers | "Should print/export and the editor show the same result?" | Shared contract and rendering scope |
| Constraints | "Is there an environment or operational limit this must fit?" | Deployment/cost constraint when relevant |
| Priority | "If we can only ship one part first, which outcome matters most?" | Dependency and delivery order |
| Clear request | "I understand this as X, with Y unchanged. Is there a case that would make that scope wrong?" | Verifies a seemingly complete request |

Use explicit alternatives when they clarify consequences. For example, "Save it for everyone opening this plan, or keep it as a personal viewing preference?" is more useful than "Should we persist it?" Recommend a choice only when the evidence supports it.

## After an answer

Capture the choice and consequence briefly: "Shared saved state -> both clients need to agree on its meaning." If this is only a proposal, label it as one. An answer about desired behavior does not prove where the current system stores it.

Check the consequence against the code. If it conflicts with an existing requirement, identify the two sources and ask which behavior should win. Otherwise ask the next unresolved question, or move into the working brief. Avoid asking for information already present in the conversation or issue.

## CabinetShop-style example

Sample input:

> Look at JBT-626 and JBT-627 for CabinetShop across the frontend and Biggie. Figure out which frontend and backend issues we need and keep them scoped.

The issue bodies and code must establish the actual requirements. The questions below illustrate an interview; they are not claims about these issues or an approved implementation.

1. Read both issues and trace the existing rotate/flip actions, saved representation, and plan/elevation consumers.
2. Ask a semantic question supported by the findings, such as: "Does rotation change the saved room geometry, or only the orientation used to display it?"
3. Use the answer to inspect the affected path, then ask about the consequential boundary: "Should reopening, printing, and elevations all show the same orientation?"
4. If mirror semantics remain open, ask: "When mirrored, should identities and labels follow the physical walls, or be reassigned by their new positions?" Do not assume the software currently supports either behavior.
5. Resolve older-plan and repeated-operation behavior if the contract makes these relevant. Inspect for drift or conflicting transforms rather than promising a particular solution.
6. Produce an ownership table and scoped issue drafts, with exact code evidence and acceptance cases. If the code proves a backend issue is unnecessary, explain that and omit it.

Because this sample asks for issues, stop at issue drafts. If the user then requests implementation through PRs, reuse the answers and brief; do not restart the interview or publish unrelated tracker changes.

## Other inputs

A sentence such as "remember my filters" calls for questions about personal/shared ownership, which filters, and persistence duration. Inspect current storage before asking about its technology.

A paragraph describing an intermittently duplicated job calls for the exact trigger and intended duplicate behavior. Investigate retries and identity; ask about the business meaning of two similar submissions. Do not treat every retry as a duplicate.

A detailed Linear bug still gets a useful discovery question, such as whether the fix must cover another affected workflow. Keep the question relevant to evidence and proceed when its answer settles the boundary.
