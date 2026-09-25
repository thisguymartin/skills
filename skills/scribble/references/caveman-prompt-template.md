# Caveman Prompt Template

How to write sub-agent prompts when `scribble` delegates to `Agent` / `Explore` / `general-purpose` / `Plan` / specialized agents.

User-facing HTML artifact body copy stays in plain English (or caveman `lite` mode when the official caveman skill is installed globally). **Sub-agent prompts** issued internally are compressed in caveman full mode. Cuts roughly 60-75% of inter-agent tokens with no loss of technical content.

## Rules

- Drop articles: `a`, `an`, `the`.
- Drop filler: `just`, `really`, `basically`, `actually`, `simply`.
- Drop pleasantries: `please`, `could you`, `would you mind`, `thanks`.
- Drop hedging: `I think`, `maybe`, `perhaps`, `it seems`.
- Fragments OK. Imperatives only. No second-person framing.
- Preserve exactly: file paths, code blocks, error messages, identifiers, URLs, exact tool names.
- Pattern: `[thing] [action] [reason]. [next step].`

## Skeleton

```
[scope/area] explore. [what to locate]. [report shape].
[constraints]. [output cap].
```

Three optional add-ons when the agent needs them:

```
Files: <paths or globs>.
Tools: <required tools>.
Avoid: <out-of-scope items>.
```

## Before / After

### Before (plain English, 87 words)

> I'd like you to please explore the codebase and find all of the places where we currently handle rate limiting. I'm interested in understanding how the token bucket implementation works, including any middleware that uses it, the configuration shape, and where it's wired into the request pipeline. Please report back with file paths and line numbers, and try to keep your response under 300 words. Thanks!

### After (caveman full, 32 words)

> Rate-limiting code locate. Find token-bucket implementation, middleware using it, config shape, wiring into request pipeline. Report file:line table. Cap 300 words.

Same technical substance. Roughly 60% fewer tokens.

## Example — Explore Agent for `research` Type

```
Token-bucket rate limiter implementation map.
Find: bucket class/struct definition, refill logic, consumer call sites, config knobs, test coverage.
Files: src/rate_limit/**, middleware/**, config/**.
Report: file:line table grouped by role (impl / consumer / config / test).
Cap 250 words. No fixes, no suggestions.
```

## Example — Plan Agent for `plan` Type

```
Auth-middleware rewrite plan.
Scope: replace cookie-based session store with JWT, preserve revocation path, no breaking changes to existing clients during cut-over.
Constraints: must not store session tokens at rest, must work behind CDN, must roll back without data migration.
Report: implementation slices, risk table, rollback recipe.
Cap 400 words.
```

## Example — Specialized Reviewer Agent

```
Diff review for caveman-style output.
Branch: feat/html-superpower-skill.
Findings format: path:line: <severity emoji> <severity>: <problem>. <fix>.
Skip formatting nits unless meaning-changing. No praise.
```

## When NOT To Caveman-Compress

- The HTML artifact body the user reads. Plain English (or caveman `lite` if the caveman skill is installed globally per the existing scribble convention).
- User-facing prose anywhere — error messages shown to the user, status updates, questions back to the user.
- Code, file paths, URLs, identifiers, exact error strings. These stay exact.
- Security warnings and irreversible-action confirmations — clarity wins over compression.

## Auto-Clarity Exceptions

If the sub-agent prompt covers a security-sensitive or irreversible-action sequence (force push, dropping tables, deleting branches, sending external messages), write the relevant portion in plain English even inside a caveman prompt. Fragment-order ambiguity is unacceptable when an action cannot be undone.
