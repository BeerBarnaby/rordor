# Single-admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a secure, responsive dashboard for one phone-and-PIN administrator to inspect all player data and permanently delete individual users.

**Architecture:** Reuse the existing HttpOnly player session and keep admin APIs under `/api/player/admin/**`. Server routes add a server-only secret to calls into private Supabase functions, which independently verify the live player session, singleton administrator identity, and secret hash before returning data or deleting a player transactionally.

**Tech Stack:** Next.js 16.3.4 App Router/Route Handlers, React 19, TypeScript, Vitest, Supabase Postgres RPC, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-11-single-admin-dashboard-design.md`

## Global Constraints

- Exactly one administrator; no admin management UI.
- Administrator enters through the existing phone-and-PIN player login.
- Plaintext admin secret is server-only and must never use a `NEXT_PUBLIC_*` name.
- All admin responses are private/no-store; all mutations require trusted same-origin JSON.
- Permanent deletion requires the exact current display name, is not recoverable, and cannot target the administrator.
- No bulk delete, editing, export, or new runtime dependency.
- Preserve the existing guest experience and normal player APIs.

## Review Focus

- A valid ordinary player session must receive `403` and no private data from every admin endpoint.
- Missing/misconfigured admin environment values must fail closed with `503`, never fall back to public access.
- Search input containing `%`, `_`, control characters, or more than 80 characters must not widen or break the query.
- Deleting a player with legacy attempts, v2 attempts, sessions, and feedback must remove all linked rows atomically while keeping a PII-free audit record.
- A stale session, wrong confirmation name, repeat deletion, and administrator self-deletion must fail without partial changes.

---

### Task 1: Private admin data contract

**Files:**
- Create: `supabase/migrations/<generated>_single_admin_dashboard.sql`
- Test: SQL transaction checks executed against the linked Supabase project

**Interfaces:**
- Produces: `public.admin_overview(text,text,text,integer) -> jsonb`, `public.admin_player_detail(text,text,uuid) -> jsonb`, and `public.admin_delete_player(text,text,uuid,text) -> jsonb`.
- Produces: `nong_prom_private.admin_config` and `nong_prom_private.admin_audit_log`.

- [ ] **Step 1: Create the migration shell using the installed CLI**

Run `npx supabase --help`, `npx supabase migration --help`, then `npx supabase migration new single_admin_dashboard`; use the generated filename rather than inventing one.

- [ ] **Step 2: Write a failing SQL transaction test for authorization and cascade deletion**

The test creates an admin player, ordinary player, sessions, both attempt versions, and feedback; it asserts an ordinary session returns `forbidden`, the admin cannot delete itself, a wrong display name returns `confirmation_mismatch`, and a correct delete leaves zero linked rows plus one PII-free audit row.

- [ ] **Step 3: Run the SQL test before defining the functions**

Expected: FAIL because the three admin RPC functions do not exist.

- [ ] **Step 4: Implement the private tables and three private `SECURITY DEFINER` functions**

Use `set search_path = ''`, SHA-256 secret comparison, live session lookup, exact administrator player match, normalized/escaped search with `limit 25`, deterministic cursor/page ordering, and one transaction for the delete and audit insert. Revoke table/function access from `PUBLIC`, `anon`, and `authenticated` before granting only the public wrappers needed by the server RPC caller.

- [ ] **Step 5: Add public `SECURITY INVOKER` wrappers with the exact interfaces above**

Return typed JSON envelopes `{ ok, error?, ... }`; never return `pin_hash`, session token hashes, or admin-secret hashes.

- [ ] **Step 6: Run the SQL transaction test and Supabase advisors**

Expected: every assertion passes and no new security/performance advisory is introduced by this migration.

- [ ] **Step 7: Commit the database contract**

```powershell
git add supabase/migrations docs/superpowers
git commit -m "feat: add secure single-admin data contract"
```

### Task 2: Server-only admin authorization and API routes

**Files:**
- Modify: `src/lib/supabase/server.ts`
- Create: `src/lib/adminServer.ts`
- Create: `src/app/api/player/admin/overview/route.ts`
- Create: `src/app/api/player/admin/players/[id]/route.ts`
- Create: `src/lib/__tests__/adminRoutes.test.ts`

**Interfaces:**
- Consumes: the three RPC wrappers from Task 1 and `readPlayerToken()`, `rejectUntrustedMutation()`, `noStoreJson()`.
- Produces: `readAdminConfig(): { phone: string; secret: string }`, overview `GET`, detail `GET`, and player `DELETE` Route Handlers.

- [ ] **Step 1: Write failing route tests**

Assert no session is `401`; an unauthorized envelope is `403`; missing env is `503`; GET responses are `private, no-store`; malformed UUID/search/page is `400`; untrusted delete is `403`; wrong confirmation is `409`; and successful delete returns `{ ok: true }`.

- [ ] **Step 2: Run `npm test -- src/lib/__tests__/adminRoutes.test.ts`**

Expected: FAIL because admin route modules and helpers are missing.

- [ ] **Step 3: Extend the RPC name union and implement `readAdminConfig()`**

Read `NONG_PROM_ADMIN_PHONE` and `NONG_PROM_ADMIN_SECRET`, validate Thai normalized phone shape and a minimum 32-byte secret, and throw `admin_not_configured` without logging either value.

- [ ] **Step 4: Implement the overview and detail GET handlers**

Validate inputs before RPC calls, pass the HttpOnly player token plus server config, map RPC envelope errors to `401/403/404/503`, and use no-store responses.

- [ ] **Step 5: Implement the DELETE handler**

Require same-origin JSON through `rejectUntrustedMutation`, cap the body, validate UUID and exact non-empty confirmation name, and map `confirmation_mismatch`/`self_delete_forbidden`/`not_found` without exposing secrets.

- [ ] **Step 6: Run the focused test and full suite**

Run `npm test -- src/lib/__tests__/adminRoutes.test.ts` then `npm test -- --run`; expected: all tests pass.

- [ ] **Step 7: Commit the protected API layer**

```powershell
git add src/lib/adminServer.ts src/lib/supabase/server.ts src/app/api/player/admin src/lib/__tests__/adminRoutes.test.ts
git commit -m "feat: add protected admin APIs"
```

### Task 3: Responsive admin dashboard

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/AdminDashboard.tsx`
- Create: `src/components/admin/AdminPlayerDetail.tsx`
- Create: `src/lib/adminClient.ts`
- Modify: `src/app/globals.css`
- Test: `src/lib/__tests__/adminDashboard.test.tsx`

**Interfaces:**
- Consumes: Task 2 HTTP endpoints.
- Produces: `/admin` and client types `AdminOverview`, `AdminPlayerSummary`, `AdminPlayerDetail` in `src/lib/adminClient.ts`.

- [ ] **Step 1: Write failing component tests**

Assert unauthorized state links back to the normal profile login; authorized state renders four summary metrics and users; search is debounced and URL-encoded; opening a user shows profile/attempt/session/feedback sections; delete stays disabled until the exact display name is entered; successful deletion removes the row and refreshes summary data.

- [ ] **Step 2: Run `npm test -- src/lib/__tests__/adminDashboard.test.tsx`**

Expected: FAIL because the dashboard components do not exist.

- [ ] **Step 3: Implement `adminClient.ts` fetch contracts**

Provide `fetchAdminOverview(search,page)`, `fetchAdminPlayer(id)`, and `deleteAdminPlayer(id,displayName)`; use same-origin URLs, JSON for DELETE, and normalized user-facing errors.

- [ ] **Step 4: Implement the dashboard and player detail**

Match the approved layout: compact header/sidebar on desktop, compact filters/navigation on mobile, 25-row pagination, no charts, masked phone in list/full phone in detail, accessible table/card fallback, loading/empty/error states, and a two-step destructive confirmation.

- [ ] **Step 5: Add isolated responsive styles**

Use the existing visual tokens, red only for destructive/action state, desktop sidebar at `>= 900px`, single-column detail on narrow screens, minimum 44px touch targets, and no horizontal page overflow.

- [ ] **Step 6: Run component, full test, lint, and build checks**

Run `npm test -- src/lib/__tests__/adminDashboard.test.tsx`, `npm test -- --run`, `npm run lint`, and `npm run build`; expected: all pass and `/admin` plus the admin API routes appear in the build manifest.

- [ ] **Step 7: Commit the dashboard**

```powershell
git add src/app/admin src/components/admin src/lib/adminClient.ts src/app/globals.css src/lib/__tests__/adminDashboard.test.tsx
git commit -m "feat: add responsive admin dashboard"
```

### Task 4: Normal-login admin entry

**Files:**
- Modify: `src/components/PlayerModal.tsx`
- Create: `src/app/api/player/admin/access/route.ts`
- Test: `src/lib/__tests__/adminAccess.test.tsx`

**Interfaces:**
- Consumes: Task 2 admin authorization and existing player session cookie.
- Produces: `GET /api/player/admin/access -> { ok: true, isAdmin: boolean }` and a conditional “เปิดหลังบ้าน” link.

- [ ] **Step 1: Write failing access/UI tests**

Assert guests see no admin entry, ordinary players receive `isAdmin:false`, the configured admin receives `isAdmin:true`, and the link targets `/admin` without exposing the configured phone or secret.

- [ ] **Step 2: Run `npm test -- src/lib/__tests__/adminAccess.test.tsx`**

Expected: FAIL because the access probe and entry do not exist.

- [ ] **Step 3: Implement the access probe and conditional entry**

Reuse the server authorization check; return `isAdmin:false` for valid non-admin sessions and fail closed for missing configuration. Probe only after a player is authenticated.

- [ ] **Step 4: Run focused and full verification**

Run `npm test -- src/lib/__tests__/adminAccess.test.tsx`, `npm test -- --run`, `npm run lint`, and `npm run build`; expected: all pass.

- [ ] **Step 5: Commit the normal-login entry**

```powershell
git add src/components/PlayerModal.tsx src/app/api/player/admin/access src/lib/__tests__/adminAccess.test.tsx
git commit -m "feat: expose admin entry after normal login"
```

### Task 5: Production configuration, deletion rehearsal, and deployment

**Files:**
- Modify if needed: `.env.example`
- Modify: `docs/superpowers/plans/2026-10-11-single-admin-dashboard.md` (check off completed steps)

**Interfaces:**
- Consumes: all prior tasks and one user-provided normalized administrator phone tied to an existing profile.
- Produces: deployed production dashboard with final database access controls.

- [ ] **Step 1: Obtain the administrator phone without requesting or storing the PIN**

Confirm that this phone already has a normal NONG PROM profile. Never place the phone in source control.

- [ ] **Step 2: Generate and configure the server secret**

Generate at least 32 random bytes locally, store only its SHA-256 hash plus the admin player association in `nong_prom_private.admin_config`, and add the plaintext as `NONG_PROM_ADMIN_SECRET` plus phone as `NONG_PROM_ADMIN_PHONE` to Vercel Production/Preview server environments.

- [ ] **Step 3: Apply the migration and run a rollback-only deletion rehearsal**

Use temporary transaction data, verify every cascade and audit assertion, then roll back. Run Supabase advisors again and confirm no new warning from the admin objects.

- [ ] **Step 4: Perform final local verification**

Run `npm test -- --run`, `npm run lint`, and `npm run build`; expected: all green. Exercise normal user rejection, admin list/detail, wrong confirmation, self-delete rejection, and one transaction-rolled-back successful delete.

- [ ] **Step 5: Commit remaining configuration/documentation and push `main`**

```powershell
git add .env.example docs/superpowers/plans/2026-10-11-single-admin-dashboard.md
git commit -m "docs: document admin deployment configuration"
git push origin main
```

- [ ] **Step 6: Monitor Vercel until production is READY**

Confirm the deployment commit matches local `HEAD`, the production alias is `https://rordor37.vercel.app`, and build/runtime logs contain no new error.

- [ ] **Step 7: Verify production without deleting a real user**

Check the public site, normal player flow, non-admin denial, configured admin dashboard, search, detail, responsive mobile/desktop layout, feedback flow, and protected deletion confirmation UI. Leave an actual permanent deletion for an explicitly selected test profile.

- [ ] **Step 8: Revoke the legacy anonymous feedback RPC**

Execute the revoke already included in `20261011070007_improve_app_feedback.sql`, verify guest feedback calls fail, and verify logged-in feedback v2 still reads/updates successfully.
