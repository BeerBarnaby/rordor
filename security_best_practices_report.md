# Security review — น้องพร้อม

Reviewed: 17 October 2026
Scope: production Next.js app, player APIs, single-admin dashboard, Supabase functions/tables, Vercel configuration, dependencies, and browser-facing controls.

## Executive summary

The production design has a sound boundary for a small training application: browser code never receives the raw database session token, mutations require same-origin JSON, private responses are not cached, direct table access is revoked, and admin operations require both a live player session and a separate server-only secret.

One critical dependency issue was found and fixed during this review: Next.js `16.3.4` was affected by published advisories including an `ImageResponse` remote-code-execution issue. The project is now pinned to Next.js `16.4.2`; `sharp` and `source-map-js` were also updated through the lockfile. `npm audit --omit=dev` now reports zero production vulnerabilities.

The application is ready for a controlled pilot. A broad public or official assessment rollout should wait for global/IP rate limiting, a retention policy, a recovery procedure for the single administrator, and a real-device/mobile acceptance pass.

## Closed findings

### SEC-001 — Critical — Vulnerable production framework dependency

- **Location:** `package.json`, `package-lock.json`
- **Evidence:** the pre-fix audit reported Next.js advisories including `GHSA-vcvr-r3jv-pc5j`; the installed version was `16.3.4`.
- **Impact:** a vulnerable framework release can expose the production server even when application code is correct.
- **Fix:** upgraded `next` and `eslint-config-next` to `16.4.2`; refreshed transitive production dependencies.
- **Verification:** `npm audit --omit=dev` reports 0 production vulnerabilities.

### SEC-002 — High — Browser-readable session token

- **Location:** `src/lib/playerServer.ts:39`
- **Evidence:** sessions are stored in an `HttpOnly`, production-`Secure`, `SameSite=Strict` cookie scoped to `/api/player`.
- **Impact:** JavaScript running in the page cannot read and copy the bearer token.
- **Fix status:** closed in the existing server-session architecture.

### SEC-003 — High — Admin authorization and destructive actions

- **Location:** `src/lib/adminServer.ts:13`, `src/app/api/player/admin/players/[id]/route.ts:14`, `supabase/migrations/20261017022541_single_admin_dashboard.sql:27`
- **Evidence:** every admin RPC requires a live player session plus a 43+ character server secret. Delete validates same-origin JSON, a UUID, and the exact display name. The database blocks admin self-deletion and writes a PII-free audit record.
- **Impact:** knowing an administrator phone/PIN alone is insufficient to call database admin functions outside the deployed server.
- **Fix status:** closed and verified against the live database.

### SEC-004 — Medium — CSRF, caching, and security headers

- **Location:** `src/lib/playerServer.ts:17`, `next.config.ts:4`
- **Evidence:** mutation routes compare `Origin` exactly with the request origin and require JSON; private responses use `private, no-store`; production returns CSP, HSTS, frame denial, MIME sniffing protection, referrer policy, permissions policy, and no `X-Powered-By` header.
- **Fix status:** closed. Runtime verification returned `401` for unauthenticated admin data and `Cache-Control: private, no-store`.

### SEC-005 — Medium — Direct table exposure

- **Location:** Supabase migrations under `supabase/migrations/`
- **Evidence:** player, session, attempt, feedback, and admin tables have RLS enabled and direct grants revoked from `PUBLIC`, `anon`, and `authenticated`. Browser access is limited to allowlisted RPCs.
- **Fix status:** closed for the NONG PROM data model.

## Residual findings

### SEC-101 — Medium — No durable IP/global request limiter

- **Location:** `src/app/api/player/auth/route.ts`, Vercel/Supabase edge configuration
- **Evidence:** the database locks one account for 15 minutes after five failed PIN attempts, but there is no durable IP-level limit covering account creation and distributed phone/PIN guessing.
- **Impact:** an attacker can create junk accounts or rotate target phone numbers/IPs.
- **Recommendation:** add Vercel Firewall rate rules for `/api/player/auth` and a database/edge quota keyed by trusted client IP before a large public launch.
- **Current mitigation:** per-account lockout, bcrypt PIN hashes, bounded inputs, short session lifetime.

### SEC-102 — Medium — Phone ownership is not verified and PIN recovery is unavailable

- **Location:** `src/components/PlayerModal.tsx`
- **Evidence:** registration intentionally uses phone + 4–8 digit PIN without SMS/OTP.
- **Impact:** a person can register someone else's number first; forgotten PINs require manual account deletion/recreation.
- **Recommendation:** keep this limitation visible. Add instructor-assisted recovery or OTP only if identity becomes important.

### SEC-103 — Medium — Practice scores are client-originated

- **Location:** `src/lib/missionAttempt.ts`, `src/app/api/player/attempt/route.ts`
- **Evidence:** the server validates identity, ranges, timing, frequency, and replay IDs, but the browser calculates skill scores.
- **Impact:** a determined user may submit plausible fabricated practice results.
- **Recommendation:** do not use XP/leaderboard results for grades, certification, awards, or formal evaluation. Move scoring to a server-issued attempt protocol if that requirement changes.

### SEC-104 — Low — CSP allows inline script/style

- **Location:** `next.config.ts:6`
- **Evidence:** production `script-src` and `style-src` retain `'unsafe-inline'` for the current static Next.js delivery model.
- **Impact:** CSP provides less protection if an HTML injection sink is introduced later.
- **Recommendation:** evaluate Next.js nonce CSP or experimental SRI in a dedicated release. Do not change this without browser regression testing.
- **Current mitigation:** no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, dynamic code execution, or user-controlled script URL was found in `src`.

### SEC-105 — Low — Development-tool advisory remains

- **Location:** `eslint-config-next` dependency chain
- **Evidence:** full `npm audit` reports a `braces` stack-exhaustion advisory through lint-only tooling; no patched `braces` release is currently available from npm. `npm audit --omit=dev` is clean.
- **Impact:** this does not ship in the production runtime. It matters only when maintainers run lint against attacker-controlled glob patterns.
- **Recommendation:** keep tooling current and remove the exception when the upstream chain publishes a patch.

### SEC-106 — Low — No documented retention schedule

- **Location:** operational policy, not code
- **Evidence:** profiles, attempts, sessions, and feedback remain until manually deleted; expired sessions are pruned during authentication but there is no scheduled retention job.
- **Impact:** personal data can remain longer than necessary.
- **Recommendation:** approve a retention period and add a scheduled cleanup/export process before collecting a large cohort.

## Supabase advisor results

The NONG PROM tables intentionally show `RLS enabled, no policy`: direct access is denied and privileged work occurs through narrowly scoped functions. This is a defense-in-depth design, not an open table.

Supabase also reports warnings for legacy `public` SECURITY DEFINER functions and for unrelated equipment-borrowing objects (`students`, `staff_users`, `borrow_requests`, `equipment`, `sync_borrow_request_dates`) that share this Supabase project. Do not alter those unrelated objects from this repository. The NONG PROM v2 and admin public endpoints are security-invoker wrappers with fixed empty `search_path`; privileged implementations live in `nong_prom_private`.

## Verification record

- Secret scan: no database password, service-role key, admin secret, PIN, or connection string is tracked.
- Injection scan: no raw HTML sink, dynamic code execution, arbitrary filesystem access, child process, open redirect, permissive CORS, or server-side user-controlled fetch in `src`.
- Production dependency audit: 0 vulnerabilities.
- Live response: homepage `200`; unauthenticated admin overview `401`; sensitive responses `private, no-store`.
- Live headers: CSP, HSTS, `DENY` framing, and `nosniff` present; framework signature absent.
- Vercel: `NONG_PROM_ADMIN_SECRET` is stored as a hidden Secret for Production and Preview.
- Supabase: admin session + server-secret check, self-delete denial, exact-name confirmation, cascade deletion, and audit logging were verified.

The complete architecture and operating checklist are in `docs/SYSTEM_AUDIT_AND_OPERATIONS_2026-10-17.md`.
