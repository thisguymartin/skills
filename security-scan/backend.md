# Server surface: HTTP, RPC, GraphQL, events, infra

Applies to services with Lambda/serverless configs, HTTP routers, tRPC/gRPC/REST procedures, GraphQL schemas or resolvers, queue/event consumers, or policy files for an authorization engine (OPA Rego, Oso Polar, Cedar, Casbin). Read alongside the always-on categories in `SKILL.md`.

Typical layering: handlers/resolvers (entry) -> service (domain logic) -> repository (data access) -> adapters (external systems) -> infra config. Find the real layering of this codebase first; the bugs cluster at the seams.

## A. Authorization: A01, A07

Locate where authorization actually lives before judging any line. Common homes: policy engine adapter (`authorize`, `hasPermission`, `can`, `isAllowed`, `list`/`filter` of permitted ids), role helpers (`isAdmin`, `isStaff`, `isOwner`), router middleware (`withAuth`, `protectedProcedure`, `requireRole`), gateway plugins, DI-bound identity context, or ORM row-level scopes. Check all before concluding a check is missing. If policy lives in files, a permission change with no policy-file diff is itself a finding.

1. **No authorization anywhere in the chain.** Trace entry -> service -> repository. Flag only when no link authorizes.
2. **Authorized on the wrong thing.** Subtler and more common. `authorize(user, "read", org)` before returning a *child record* of that org is not the same check. Verify the resource passed to the check is the resource actually returned.
3. **Permitted-id list fetched then ignored.** A `list()`/`filter()` of allowed ids that is computed, then the unfiltered query supplies the rows, or the list only feeds a count.
4. **Authentication mistaken for authorization.** A valid session proves who, not whether. Flag any handler where user of tenant A reaches tenant B's data by changing an id. Classic IDOR.
5. **Identity not propagated.** Child DI containers, background jobs, retries, fan-out workers, and batch handlers that rebuild context. Verify identity and `isAuthenticated` carry over; a child defaulting to unauthenticated-but-permissive is a silent bypass.
6. **Machine and service identities.** Service-to-service calls verify a signed machine token or mTLS identity. Hardcoded machine token is CRITICAL. A machine identity granted user-level wildcard access is HIGH.
7. **Shared-secret comparison.** `===` / `==` leaks length and content through timing. Require `crypto.timingSafeEqual` / `subtle.ConstantTimeCompare` / `hmac.compare_digest`.
8. **Silent denial.** Returning `[]` or `null` on an authz failure instead of throwing hides "no data" vs "not allowed" and makes the gap invisible in tests and logs.
9. **Mass assignment.** Request body spread straight into an update: `update(id, { ...req.body })`. Attacker sets `role`, `orgId`, `isAdmin`, `price`.

Grep: `authorize|hasPermission|can\(|isAllowed|requireRole|protectedProcedure|withAuth` · `isAdmin|isStaff|isOwner` · `verifyMachineToken|verifyServiceToken` · `\.\.\.req\.body|\.\.\.input\)` on writes

## B. Input validation: A03, A08

1. **Procedures without schemas.** Every RPC/REST handler that reads arguments validates with a runtime schema (Zod, Valibot, JSON Schema, Pydantic, go-playground/validator). Flag `z.any()`, `z.unknown()`, `interface{}` passthrough, missing `.input()`.
2. **Event and queue consumers without schema validation.** `JSON.parse(record.body)` followed by direct use. Any upstream that can publish to the bus makes the body attacker-influenced.
3. **Raw query construction.** ORMs make injection unlikely, so risk concentrates in escapes: `sql.raw`, `.raw(`, `$queryRawUnsafe`, `fmt.Sprintf` into SQL, string-built filter/condition expressions, direct SDK calls bypassing the ORM, NoSQL operator injection (`{$gt: ""}` from a JSON body), LDAP/XPath/shell interpolation.
4. **GraphQL inputs.** Schema enforces shape, not semantics. Mutations still need length, format, range checks. Also: query depth/complexity limits, introspection off in prod, batching limits, alias abuse.
5. **SSRF and path traversal.** Any URL, host, file path, or redirect target built from request data. Adapters calling partner APIs with a caller-supplied host; `fetch(input.url)`; `path.join(base, input.name)` without normalization and prefix check.
6. **Deserialization.** `pickle`, `yaml.load` without SafeLoader, Java `ObjectInputStream`, `unserialize`, `eval` of config.
7. **File uploads.** Content-type trusted from client, no size limit, original filename used in storage path, SVG/HTML served from the same origin.

Grep: `JSON\.parse` · `z\.any\(\)|z\.unknown\(\)` · `sql\.raw|\.raw\(|queryRawUnsafe|Sprintf\(.*(SELECT|INSERT|UPDATE|DELETE)` · `fetch\(.*(input|req|params|body)` · `yaml\.load\(|pickle\.loads`

## C. GraphQL federation and gateways

1. **`@requires` across a trust boundary.** A subgraph that `@requires` a field it is not authorized to read gets it anyway; the gateway resolves it. Verify the extending subgraph may read every required field.
2. **`@key` fields leaking internals.** Entity keys appear in every reference resolver and client-visible error. Surrogate db ids and sequential integers in a `@key` are an enumeration surface.
3. **Reference resolvers without authorization.** `__resolveReference` is an entry point with no route or mutation attached. Easy to miss, easy to hit.
4. **Gateway loopback with a forwarded user token.** A subgraph calling back through the gateway re-enters at a different trust level and failures are easy to swallow. Flag the pattern; verify errors surface.
5. **Header forwarding.** Gateway forwards `Authorization`, `Cookie`, or internal headers (`x-user-id`, `x-tenant`) to subgraphs. Verify a client cannot set those internal headers directly.

## D. Events, queues, and jobs: A04

Anything on a shared bus or topic is visible to every subscriber. Treat the payload as broadcast.

1. PII in event detail. Ids are fine; emails, addresses, phone numbers, payment data are not unless the consumer needs them and the schema documents it.
2. Events published before the authorization check that gates the underlying write.
3. Detail-type or routing-key naming that drifts from the convention; a misnamed event is picked up by a rule never meant to see it.
4. Consumers that trust `source` or `producer` fields in the body instead of the bus's own metadata.
5. Idempotency: replayed or duplicate messages causing double charges, double sends, or re-granting access.
6. Dead-letter queues holding PII with no retention policy.

## E. Infrastructure and config: A05

Review IaC (SST, CDK, Terraform, Serverless, Pulumi, Helm, Docker Compose):

1. **Over-broad IAM.** Granting `service:*` or `Resource: "*"` when one action on one path is needed. Role assumable by the whole account.
2. **Public endpoints** (function URLs, ingress, load balancers) without an authorizer, signature check, or allowlist.
3. **Network.** Databases reachable from the internet; functions reaching a private datastore without VPC config; security groups open to `0.0.0.0/0` on non-HTTP ports.
4. **Hardcoded ARNs, account ids, or parameter paths** that should be stage-aware. A prod-shaped constant in a dev stack crosses an account boundary.
5. **Secrets as plain env vars** in the stack instead of a secrets manager reference.
6. **Missing secrets config** (`doppler.yaml`, `.sops.yaml`, Vault annotations) in a service that consumes secrets.
7. **Storage.** Public buckets, missing encryption at rest, no object versioning on audit data, missing bucket policy on cross-account access.
8. **Logging.** Debug logging on in prod, request bodies logged, log groups with no retention.
9. **Containers.** Running as root, `latest` tags, secrets baked into image layers, `--privileged`.

## F. External integrations

- **Inbound webhooks and callbacks.** Signature (`stripe.webhooks.constructEvent`, HMAC with constant-time compare), shared secret, or IP allowlist. Verify it is enforced, not logged. Verify replay protection (timestamp window, event id dedupe). Test-mode events must not mutate live data.
- **Outbound calls.** Timeouts set, TLS verified, no caller-controlled host, no credentials in URL.
- **Search indices** (Algolia, Typesense, Meilisearch, Elasticsearch, OpenSearch). Records pushed to an index escape the app's authorization layer. Every record carries the tenant scope the query filters on; the client-side key cannot remove that filter. Complete index plus client-controlled filter equals cross-tenant read.
- **Identity providers** (Auth0, Cognito, Clerk, Okta, Firebase). Custom claims reflect state at mint time; an authz decision made from a claim rather than current server state can be replayed with a stale token. Verify the server re-reads the authoritative value. Management API calls on the canonical tenant domain. `aud` and `iss` checked. Token lifetime proportional to sensitivity.
- **Payments.** Amount and currency come from the server, never the client. Idempotency keys on charges. Refund paths authorized separately from charge paths.
- **PII services** (users, contacts, addresses, health, finance). Masking in logs, access scoped by identity, no plaintext PII in a secondary index or cache key, deletion path exists.
- **LLM and AI integrations.** User-supplied text reaching a prompt that has tool access (prompt injection into actions). Retrieved documents treated as instructions. Model output executed, rendered as HTML, or used as a query without validation. Customer data sent to a third-party model without a data-processing agreement.
