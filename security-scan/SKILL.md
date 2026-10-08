---
name: security-scan
description: "Security review of a diff, PR, file, directory, or whole service in any codebase. Use when asked to security review, audit for vulnerabilities, check if something is safe to ship, or look for auth gaps, injection, XSS, data exposure, or secret leaks. Also apply before shipping changes to authentication, authorization, secrets, PII, webhooks, public routes, server actions, caching, search indices, or event payloads. Read-only: reports confirmed findings with fixes, never applies them."
license: MIT
---

# Security scan

Find what an attacker could do with this code, prove it by tracing the code, and write it up short enough that the person fixing it reads every word. Read-only: this skill reports; it never edits, commits, or opens issues.

## Inputs

Take a target and optional flags:

- **Target**: PR number (`123`, `#123`), commit range (`abc..def`), file, directory, or app/package name. Empty target means staged changes, else current branch vs the default branch.
- `--report`: also write the review to `security-scan-YYYY-MM-DD.md` in a gitignored or scratch location, and say where. Never drop it at the repo root where it gets committed by accident.
- `--audit`: also run the package manager's audit (`npm audit --json`, `pnpm audit --json`, `go vet` + `govulncheck`, `pip-audit`, `cargo audit`) and include dependency CVEs.

Use `gh pr view N` / `gh pr diff N` or `git diff`, `git log`, `git show`, plus Read/Grep/Glob. No network beyond `gh` and the audit tool. Do not install tools as a side effect; name the missing one.

## Detect the surface

Decide which reference applies from the files in the target, not the repo name. Monorepos contain both.

```bash
# server/API surface
ls sst.config.ts serverless.yml stacks/ cmd/ internal/ 2>/dev/null; find . -path '*/node_modules' -prune -o \( -name '*.polar' -o -name '*.resolvers.*' -o -name 'router.ts' -o -name 'main.go' \) -print -quit
# web/browser surface
ls next.config.* middleware.ts remix.config.* nuxt.config.* 2>/dev/null; find . -path '*/node_modules' -prune -o -name 'route.ts' -print -quit
```

- Server hits: read [backend.md](backend.md) (handlers, resolvers, RPC, events, infra, integrations).
- Browser hits: read [frontend.md](frontend.md) (XSS, routes, server actions, client exposure, caching, config).
- Both: read both. Changes that cross the boundary (new route calling new resolver field) are where the real bugs live.

Load only what applies.

## Confirming a finding

This decides whether the review is signal or noise.

**A grep hit is a candidate, never a finding.** Every reported finding is confirmed by reading surrounding code and tracing at least one corroborating signal:

- Missing auth: read the whole chain from entry point to data access. Enforcement may live in middleware, a wrapper, a DI-bound context, a gateway, or the caller. Absence on the grepped line proves nothing.
- Data exposure: trace source to sink. "Looks like PII" is not a finding. "This object reaches a client component and contains `ssn`" is.
- Injection: establish the input is attacker-controlled. Internal constants interpolated into a query are not injection.
- Broken authz: name the resource the check runs against and the resource actually returned. If they differ, that is the finding.

Cannot trace the signal? Dig until you can or cut it. Six confirmed findings beat thirty candidates.

Three exceptions where one signal is enough because the pattern is unsafe in any context: a hardcoded credential, unsanitized HTML injection from a non-constant value, and a secret-shaped value under a public build-time prefix (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`, `EXPO_PUBLIC_`).

## Review modes

### Diff-based (PR, range, staged)

1. Fetch diff plus PR description and linked issues.
2. **Triage first.** Check every changed file, including docs and test fixtures, for credentials, private payloads, and unsafe executable snippets. A fixture label does not make a real credential safe. For docs/tests/non-security config only, give a short PASS and stop only after those checks; skip unrelated application categories.
3. Group changed files by surface; load matching reference(s).
4. Review changed lines. Pre-existing issues are out of scope unless CRITICAL and adjacent to the change.
5. Cross-reference callers: a changed signature on a service method, resolver, or middleware means verifying every caller still enforces what it used to.

### Full audit (directory, app, service)

1. **Map it**: package manifest, infra config, DI/bootstrap, router registration.
2. **Inventory entry points**: HTTP handlers, RPC procedures, GraphQL resolvers including reference resolvers, server actions, queue/event consumers, cron, webhooks, CLI commands exposed to users.
3. **Trace the auth chain** for each entry point: who authenticates, who authorizes, against which resource.
4. **Run the categories** from the reference file(s).
5. **Check the boundary**: event/queue schemas, secrets config present, no committed `.env`, IAM/role scope, network exposure.

Glob to inventory, targeted Grep in parallel, Read only confirmed hits. Never read every file.

## Always-on categories

Apply to every surface. Surface-specific checks live in the references.

**Secrets.** Hardcoded credentials (`sk_`, `pk_live`, `AKIA`, `ghp_`, `xox[bp]-`, `Bearer `, `-----BEGIN`, `password\s*[:=]\s*['"]`). Secrets reaching logs, error messages, crash reporter contexts, or analytics. Committed `.env*`. Signing keys from constants. Reading from env with a non-null assertion is fine when a secrets manager injects it; a real value in a test fixture is not.

**Dependencies.** Deprecated or unsafe packages (`aws-sdk` v2, `vm2`, `node-serialize`, `safe-eval`, `request`, `eval(`). Prototype pollution via `Object.assign({}, userInput)`, deep merge of external data, spreading unvalidated input. Lockfile drift. With `--audit`, group CVEs by severity with fix versions.

**Crypto and randomness.** `Math.random()` for tokens, IDs, nonces, or anything security-bearing: must be `crypto.randomUUID()` / `crypto.randomBytes` / `crypto/rand`. MD5/SHA1 for security. Secret comparison with `===` or `==` instead of constant-time compare. Homegrown JWT verification. Disabled TLS verification.

**PII.** PII in URL paths or query strings (lands in access logs, referrers, analytics). PII in broadcast event payloads. PII in a search index. Unmasked PII in logs; if the codebase has a masking helper, flag where it is skipped.

**Supply and build.** CI secrets exposed to fork PRs. Postinstall scripts from untrusted packages. Unpinned third-party actions or base images.

## Severity

- **CRITICAL**: exploitable now by someone outside the trust boundary. Unauthenticated cross-tenant read, RCE, credential disclosure, auth bypass. Blocks merge.
- **HIGH**: real gap behind an unusual precondition, or a present defense that is bypassable. Authenticated IDOR, webhook without signature check, SSRF to internal network.
- **MEDIUM**: hardening. Defense-in-depth missing, no exploitation path established.
- **LOW**: style and consistency with security relevance.

Map every finding to an OWASP Top 10 (2021) category A01 to A10.

## Output budget

Tracing stays deep; the write-up gets cut. Length is the main reason a CRITICAL gets skimmed.

- **Per finding ~120 words**, excluding the fix snippet. One sentence each for Issue, Confirmed by, Impact.
- **Summary two sentences**: what was reviewed, worst thing found.
- **One citation per claim.** A pattern repeated across files is one sentence and one example, never the full list.
- **Cut anything the reader would not act on.** How a vulnerability class works in general is not a finding.
- **Never cut** the corroborating signal, the impact, the fix, or a caveat. The budget governs prose, not evidence.

## Output

```
## Security Scan: [PR #N / path / staged changes]

### Summary
Two sentences: what was reviewed and which surface, then the worst finding.

### Findings
Grouped by severity, highest first. Omit empty severities.

#### CRITICAL — [OWASP code]
> `file:line` — **Issue**: what is wrong.
> **Confirmed by**: the signal you traced.
> **Impact**: what an attacker can do.
> **Fix**:
> ```ts
> // concrete code
> ```

### Dependency Audit
Only with --audit. Severity | Package | CVE | Fix Version

### Positive Security Patterns
One line, only for a control worth reinforcing or a trap the author avoided. Omit rather than pad.

### Verdict
**BLOCK** (any CRITICAL) / **PASS WITH NOTES** / **PASS**
```

Full audits add a **Service Profile** (entry point counts, datastores, auth mechanism, external integrations) before findings and a per-category severity count before the verdict.

## Rules and stopping condition

- Read-only. Never apply a fix, even an obvious one. Hand off with the snippet.
- Every finding has a concrete fix with code. "Add validation" is not a fix.
- Every finding names its corroborating signal or gets cut.
- No duplicate findings across sections; reference the first.
- Length is not thoroughness. A finding needing 400 words has not been traced far enough.
- Complements a general code review; this one does not cover quality, performance, or style.

Finish when every entry point in scope has a traced auth chain and every candidate is either confirmed with evidence or dropped. State what was not reviewed. Test instruction changes against synthetic fixtures, never a live production codebase you were not asked to review.
