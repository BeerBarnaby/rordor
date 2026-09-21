# Security and Capacity Review — น้องพร้อม

Reviewed: 2026-09-21  
Scope: Next.js application, player/session API, Supabase RPC functions and grants, dependency advisories, production-plan limits, and a bounded read-load test.

## Executive summary

The application is appropriate for a low-risk training game after the hardening in this change set. The highest-risk issue was a bearer session token stored in browser `localStorage`. The browser no longer receives or stores that token: Next.js Route Handlers now keep it in an `HttpOnly`, `Secure` production cookie with `SameSite=Strict`, a seven-day maximum lifetime, and an API-only path.

The live Supabase project was also hardened. Sessions expire after seven days, old sessions are pruned, each player is limited to five active sessions, score submissions have schema/allowlist/rate checks, and implicit PostgreSQL `PUBLIC` execute privileges were removed. The migration completed successfully and the resulting defaults, constraint, and function ACLs were queried back from the live database.

No known dependency vulnerabilities were reported by `npm audit` at review time. Lint, 9 automated tests, the production build, API security checks, and a bounded concurrency test all passed.

The leaderboard must remain a motivational practice feature, not an official assessment record. Its score is calculated in the browser, so a determined user can still fabricate a plausible score even though spam and obviously invalid submissions are rejected.

## Fixed findings

### SEC-001 — High — Browser-readable bearer session

**Risk:** A session token persisted in `localStorage` could be read by injected JavaScript or a malicious browser extension and reused for up to 30 days.

**Fix:** Player requests now use same-origin Next.js endpoints. The raw token is removed from every browser response and stored only in an `HttpOnly` cookie. Legacy local/session storage values are deleted on load. Cookie controls are in `src/lib/playerServer.ts`; client calls are in `src/lib/player.ts`.

**Verification:** The unauthenticated session endpoint returns `401`; API responses do not expose `session_token`; the cookie is `HttpOnly`, `Secure` in production, `SameSite=Strict`, scoped to `/api/player`, and expires within seven days.

### SEC-002 — Medium — Missing browser security policy

**Risk:** The site did not set a Content Security Policy or common anti-clickjacking/content-sniffing/privacy headers.

**Fix:** `next.config.ts` now disables the framework signature and sets CSP, HSTS in production, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a restrictive Permissions Policy, Referrer Policy, and Cross-Origin Opener Policy.

**Verification:** A production server response returned all expected headers and no `X-Powered-By` header.

### SEC-003 — Medium — Cross-site mutation and oversized request surface

**Risk:** Cookie-authenticated mutation endpoints need explicit CSRF protection and bounded inputs.

**Fix:** Authentication, logout, and score submission verify exact same-origin requests. JSON bodies are capped at 2 KiB and every field is length/type/range checked before reaching Supabase. Responses use `private, no-store`.

**Verification:** A cross-origin authentication request returns `403`; invalid same-origin input returns `400`.

### SEC-004 — Medium — Unbounded/replayed score submissions

**Risk:** A valid player could flood the leaderboard or submit impossible data.

**Fix:** The database now enforces known scenario IDs, the generated attempt-ID format, a minimum 20-second completion time, one accepted new result per 20 seconds, no more than 100 accepted results per player per day, score ranges, and idempotent duplicate delivery.

**Verification:** The live database reports the minimum-duration constraint and updated RPC definition. The UI labels the leaderboard as motivational practice, not an official assessment.

### SEC-005 — Medium — Session accumulation

**Risk:** Thirty-day sessions could accumulate without a per-player cap.

**Fix:** New sessions expire after seven days; expired sessions are cleaned during authentication; login keeps at most five active sessions per player.

**Verification:** The live database default is `(now() + '7 days'::interval)`.

### SEC-006 — Low — Implicit PostgreSQL function execution

**Risk:** PostgreSQL grants function execution to `PUBLIC` by default.

**Fix:** The migration explicitly revokes `PUBLIC` execution and grants only the Supabase roles required by the application. Base tables remain RLS-enabled with direct access revoked.

**Verification:** Live ACLs list `postgres`, `anon`, `authenticated`, and Supabase `service_role`; no implicit `PUBLIC` entry remains.

### SEC-007 — Low — Unused browser SDK surface

**Risk:** The full Supabase browser SDK was no longer required after moving RPC calls server-side.

**Fix:** Removed `@supabase/supabase-js` and its transitive browser/auth/realtime/storage packages. The server uses a small, allowlisted REST RPC wrapper with an HTTPS-only base URL and a 10-second timeout.

**Verification:** `npm audit` reports 0 known vulnerabilities across all severities.

## Accepted residual risks

### RISK-001 — Medium — Leaderboard is not authoritative

The server validates shape, limits, timing, identity, and frequency, but the browser still calculates the underlying skill scores. A determined user can call the public Supabase RPC with fabricated but plausible values if they possess their own session token. This is acceptable only because the leaderboard is explicitly presented as a motivational practice feature. Before using it for grades, certification, awards, or official ranking, move event validation and score calculation to a trusted server and issue server-side attempt challenges.

### RISK-002 — Medium — Phone ownership is intentionally not verified

The requested design has no SMS/OTP and no email. A person can register another person's phone number first, and there is no PIN recovery. The UI now states this limitation. Add OTP or an instructor-issued recovery process if account ownership later matters.

### RISK-003 — Medium — Short PIN and account lockout trade-off

A four-digit PIN has only 10,000 combinations. Bcrypt hashing and five-failure/15-minute lockout reduce online guessing, but someone who knows a phone number can intentionally trigger the lock. Add durable IP/device throttling or a Vercel WAF rate rule before a large public launch.

### RISK-004 — Low — Static CSP allows inline script/style

The CSP retains `'unsafe-inline'` because the application is statically rendered and Next.js emits inline bootstrap/style content. A per-request nonce would require dynamic rendering and remove the CDN/static-capacity advantage. The current code has no `dangerouslySetInnerHTML`, `eval`, dynamic script URLs, or raw DOM HTML sinks, which lowers the practical risk.

### RISK-005 — Low — Phone number is visible to project administrators

Phone numbers are normalized and access-controlled with RLS/table grants, but not field-encrypted. They are never returned by public RPCs or shown on the leaderboard. Limit Supabase dashboard access and define a deletion/retention policy before collecting real users at scale.

## Capacity result

### Observed test

The production Next.js build was run locally while calling the live Supabase leaderboard RPC through the new server API. This measures the application/RPC path but not Vercel network/runtime overhead.

| Concurrent requests | Requests | Success | Throughput | p50 | p95 |
|---:|---:|---:|---:|---:|---:|
| 1 | 100 | 100% | 12.6 req/s | 62 ms | 113 ms |
| 5 | 100 | 100% | 67.5 req/s | 58 ms | 155 ms |
| 10 | 100 | 100% | 145.7 req/s | 58 ms | 125 ms |
| 20 | 100 | 100% | 251.2 req/s | 62 ms | 202 ms |
| 50 | 100 | 100% | 247.1 req/s | 114 ms | 377 ms |
| 100 | 200 | 100% | 131.4 req/s | 699 ms | 1,192 ms |

### Practical answer

- **Verified read burst:** at least **100 simultaneous leaderboard/API requests** with zero errors in this bounded test.
- **Recommended event size on the current free tiers:** **100 trainees starting together**, or roughly **200–300 concurrently active trainees** when actions are naturally spread over the five-minute simulation.
- **Conservative synchronized login/register burst:** keep to **20–30 at once** until a staging write test is run. PIN verification uses bcrypt and is more CPU-heavy than leaderboard reads.
- **Not a hard maximum:** static pages can serve much more traffic from Vercel's CDN; Supabase database work, synchronized authentication, monthly quotas, network latency, and abuse patterns determine the real limit.

The current project is on Vercel Hobby and Supabase Free/Nano. Official Supabase documentation lists Nano at 60 direct database connections and 200 pooler client connections, but a web user is not equivalent to one database connection because the app uses the REST API and pooling. Supabase Free currently includes unlimited API requests subject to resource/fair-use constraints, 500 MB database size, and 5 GB egress. Vercel Hobby currently includes up to 1,000,000 Edge Requests and 1,000,000 Function Invocations per usage period; these quotas are more likely to become a monthly ceiling than a simultaneous-user ceiling for this app.

For a guaranteed event above 300 active trainees or a public launch, use Vercel Pro plus a paid Supabase compute tier and run a staging load test matching the exact ratio of page loads, logins, leaderboard reads, and result writes.

## Verification record

- `npm audit`: 0 known vulnerabilities.
- ESLint: passed.
- Vitest: 2 files, 9 tests passed.
- Next.js production build: passed; homepage remains statically generated; four player API routes are dynamic.
- HTTP checks: homepage `200`, empty session `401`, leaderboard `200`, cross-origin mutation `403`, invalid auth `400`.
- Secret scan: no service-role key, database password, private key, or connection string tracked in the repository.
- Injection scan: no `dangerouslySetInnerHTML`, `eval`, `new Function`, raw `innerHTML`, `document.write`, or child-process execution in `src`.
- External links using a new tab include `rel="noopener noreferrer"`.
- Live Supabase migration: completed successfully and queried back.

## Official limit references

- Supabase connection management: https://supabase.com/docs/guides/database/connection-management
- Supabase connection limits: https://supabase.com/docs/guides/troubleshooting/how-to-change-max-database-connections-_BQ8P5
- Supabase billing/quotas: https://supabase.com/docs/guides/platform/billing-on-supabase
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Vercel limits: https://vercel.com/docs/limits

