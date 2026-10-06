# Browser surface: Next.js, Remix, Nuxt, SPAs

Applies to targets with `next.config.*`, `middleware.ts`, `app/api/**/route.ts`, `pages/api/**`, loaders/actions, or React/Vue/Svelte components. Read alongside the always-on categories in `SKILL.md`.

Frameworks mix routing models (Next.js Pages vs App Router, Remix loaders vs actions). Check which one a file belongs to before assuming its auth conventions.

**Prioritize by attack surface** on a full scan:

1. API routes and route handlers: public, unauthenticated by default
2. Middleware: the auth enforcement boundary
3. Server actions / form actions: public HTTP endpoints regardless of where imported
4. Framework config: headers, CORS, image hosts, redirects
5. Components handling auth, tokens, PII, or rich text
6. Everything else

## A. XSS and injection: A03

1. **Raw HTML sinks.** `dangerouslySetInnerHTML`, `v-html`, `{@html}`, `[innerHTML]`, `.innerHTML =`, `insertAdjacentHTML`, `document.write`. Flag every occurrence. Sanitized through DOMPurify or equivalent with a strict config is acceptable; anything else with user-reachable input is CRITICAL. Markdown renderers with `html: true` count.
2. **Interpolation that bypasses template escaping.** Frameworks escape children, not attributes. String-built `href`, `src`, `style`, `srcdoc`, and event handler values are unescaped sinks.
3. **`javascript:` and `data:` URLs.** `href={variable}` where the variable can carry a scheme. Validate against an allowlist of `http`, `https`, `mailto`, `tel`.
4. **`eval` / `new Function` / `setTimeout(string)`** in app code. Build config out of scope.
5. **Route data flowing into sinks.** `searchParams`, `useSearchParams`, `router.query`, `params`, `location.hash` used in a redirect target, iframe `src`, image `src`, `fetch()` URL, or `postMessage` target without validation. Open redirect is the common outcome.
6. **`postMessage`.** Listeners without an `origin` check; senders with `"*"` target.
7. **CSS injection.** User values in `style` strings or CSS-in-JS templates.

Grep: `dangerouslySetInnerHTML|v-html|@html|innerHTML` · `eval\(|new Function\(` · `href=\{|src=\{|srcdoc` · `javascript:` · `searchParams|useSearchParams|router\.query|location\.hash` · `addEventListener\(["']message`

## B. Auth and access control: A01, A07

1. **Unprotected API routes.** Every exported `GET`/`POST`/`PUT`/`DELETE`/`PATCH` handler verifies the session, or provably inherits enforcement from middleware. Read the matcher before flagging.
2. **Middleware gaps.** Read the matcher config. An exclusion like `/api/(.*)` removes enforcement from the entire API surface. Review every bypass predicate (`isPublicRoute`, `isWebhookRoute`, `isHealthCheck`) and verify each exempted path should be public. Prefix matching (`startsWith("/public")`) lets `/publicsecret` through.
3. **Middleware that does not deny.** Returning `next()` on an unauthenticated request is a no-op. The path must end in a redirect or 401/403.
4. **Server actions without their own auth.** A `"use server"` function (or Remix `action`) is a public endpoint. It cannot rely on the only caller being a gated page. Every action that mutates or returns sensitive data verifies the session itself, and server actions in Next.js are callable by id even when the component is not rendered.
5. **Authentication without authorization.** A valid session is not permission for a specific tenant, record, or order. Flag where a request id selects the resource and nothing checks the caller's relationship to it.
6. **Token handling.** Tokens in `localStorage` / `sessionStorage` (should be httpOnly, Secure, SameSite cookies), in URL params, in logs or error messages. Manual JWT verification that sidesteps the identity SDK. Missing `aud`/`iss`/`exp` checks.
7. **Stale claims.** An ID-token claim reflects state at mint time. Gating on a claim rather than current server state keeps the old answer for the token lifetime. Verify a refresh or re-check path exists and a 403 from the backend is recoverable.
8. **CSRF.** Cookie-authenticated mutations with no SameSite protection, origin check, or CSRF token. Custom-header-only defenses with permissive CORS.
9. **Client-side-only guards.** Hiding a button or redirecting in `useEffect` is UX, not security. The server call behind it must enforce.

Grep: `export.*(async )?function (GET|POST|PUT|DELETE|PATCH)` · `"use server"` · `getSession|auth\(\)|getServerSession` in route files · `localStorage.*token|sessionStorage.*token` · `isPublicRoute|isWebhookRoute|matcher`

## C. Data exposure: A02, A04

1. **Public build-time env prefix on anything secret.** `NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`, `EXPO_PUBLIC_`, `NUXT_PUBLIC_` inline the value into the client bundle. A secret, write-capable token, or private API key under that prefix is CRITICAL and not fixed by rotating it later. Cross-check every name against what the secrets manager actually holds.
2. **Server data over-serialized to the client.** Props from a server component or loader to a client component are embedded in the HTML. Flag whole user objects, whole API responses, session objects, or ORM rows where a narrow shape would do. The browser gets every field whether rendered or not.
3. **Over-broad API selections.** Selecting full `User`/`Organization` when the component renders two fields widens the blast radius of any XSS on the page.
4. **`generateMetadata` / `<head>` leaking data** into meta tags, readable before hydration and scraped.
5. **Secrets and PII in client-visible logs.** `console.*`, crash reporter captures and contexts, error boundaries rendering raw error bodies, source maps with secrets in prod.
6. **Committed `.env*`.** Including `.env.local` and `.env.production`.
7. **Source maps and debug endpoints** shipped to prod.

## D. Caching: A01

The class of bug invisible in the diff and severe in prod: caching an authenticated response somewhere shared.

1. **Static rendering of auth-gated pages.** `export const dynamic = "force-static"`, `getStaticProps`, prerender flags on per-user content.
2. **ISR / `revalidate` on user-specific content.** One user's render served to the next.
3. **Fetch-level caching of authorized responses.** `fetch()` with default or `force-cache` inside a per-user path; `unstable_cache` / `cache()` keyed without identity.
4. **Edge or CDN cache in front of personalized responses.** Must vary on identity (`Vary: Cookie`/`Authorization`, `Cache-Control: private`) or not cache. A route that quietly becomes cacheable, for example when a call moves from an authenticated transport to an unauthenticated one, is a cross-user leak with no local symptom.
5. **Service worker caches** storing authenticated API responses.
6. **Back/forward cache** exposing a logged-out user's last page.

## E. Config and dependencies: A05, A06

Review framework config:

1. Image/remote patterns with a wildcard hostname: the app becomes an open image proxy.
2. Missing security headers: `Content-Security-Policy`, `X-Frame-Options` or `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`.
3. `Access-Control-Allow-Origin: *` on anything credentialed; reflected origin without allowlist.
4. `redirects()` / `rewrites()` with user-controlled destination.
5. Unsafe experimental flags; `reactStrictMode` off hides nothing security-wise but check `poweredByHeader`.
6. Third-party scripts loaded without SRI or from a wildcard CSP source; tag managers that can inject arbitrary JS.

Prototype pollution: `Object.assign({}, userInput)`, deep merge of external data, spreading query params into state.

## F. Route handler hygiene

- `request.json()` / `request.formData()` without try/catch: malformed input throws and surfaces a stack trace.
- Runtime validation with a schema library. TypeScript types are erased; a typed body is not a validated body.
- Error responses carrying stack traces, internal ids, SQL, or upstream error bodies to the client.
- Rate limiting on auth, password reset, OTP, and anything that sends email/SMS.
- File download routes building the path from input.
- Streaming responses that start before the auth check resolves.
