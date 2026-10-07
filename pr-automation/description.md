# PR descriptions

Write for someone reviewing the diff without the chat history. Lead with the outcome and give them enough context to judge it.

## Default shape

Remove optional sections that add nothing. Required repository template fields take precedence. The body starts directly with the problem and new behavior; it does not need an Overview heading.

```markdown
<Concrete trigger/problem. New behavior and reason for this approach, in 1-2 sentences.>

## Changes

- <Meaningful behavior or contract change.>
- <Another change only if it helps review.>

## Review notes

- `<critical/path>`: <Specific invariant or risk to check.>

## Validation

<Relevant passing check and observed behavior. Pending/not-run check or actual limitation.>
```

Add `## Flow` only for a useful, visually checked image with one caption: Excalidraw by default or mer-inkdrop as the backup. Add a risk/rollout note only for a real migration, breaking change, operational risk, or required sequence. Put a related issue next to the behavior it explains. Use `Closes`/`Fixes` only when completing that issue is the intended merge effect.

Changes: usually two to four bullets, grouped by behavior. Review notes: zero to three changed paths, linked to the PR's head revision when useful. Each note explains what deserves attention; `Updated handler` or `Modified types` adds nothing. Do not include line counts, an exhaustive file table, or a commit-by-commit narrative.

## Synthetic examples

These examples show wording, not real test results. Replace their evidence with the target PR's actual results.

### Small fix

Title: `fix: keep a saved filter after refreshing the page`

```markdown
Refreshing the results page reset the selected filter. Read the saved filter before loading results so the first request uses the user's selection.

Validation: filter persistence test passes; checked refresh with a saved selection. CI is pending.
```

### Change with a critical boundary

Title: `fix: prevent duplicate jobs after a webhook retry`

```markdown
Webhook retries queued the same job more than once. Claim the event ID before enqueueing so repeat deliveries return the existing result.

## Changes

- Store the event claim and pending job in one transaction.
- Keep the existing success response for an already claimed event.

## Review notes

- `src/events/claim.ts`: the claim and pending job must commit together so a failed write cannot lose the job.
- `src/events/publish.ts`: retrying a pending job must preserve its event ID.

## Validation

Duplicate-delivery and transaction-failure tests pass. The deployed queue path has not been checked; CI is pending.
```

For a diagram of this example, trace only `Webhook -> event claim + pending job -> publisher -> queue`. Show duplicate delivery returning the existing result. Do not invent unrelated services.

## Humanizer pass

Use the available Humanizer skill in embedded mode. Preserve factual claims and their limits, and return only the final text. When it is absent, apply these local writing rules:

- State the trigger and observable behavior with concrete verbs.
- Cut phrases such as "This PR introduces", "enhances robustness", "seamlessly", and "comprehensive improvements".
- Remove restated headings, duplicated reasons, chat closers, and process narration.
- Use ordinary punctuation and sentence case. Avoid em dashes and decorative bold labels.
- Keep accurate risk, uncertainty, test failures, and pending checks. Never invent test counts or imply a deployment was checked.

Read the final body against the diff and actual verification evidence. Every claim should survive that comparison.
