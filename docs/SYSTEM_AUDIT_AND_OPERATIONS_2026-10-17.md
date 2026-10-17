# NONG PROM — system architecture, admin operations, and release checklist

Status date: 17 October 2026  
Production: <https://rordor37.vercel.app>  
Audience: project owner, trainer, administrator, and future developer.

## 1. What the system does

NONG PROM is a mobile-first training companion for basic emergency response. The core path is:

```text
Learn the concepts
  -> assess and order the response
  -> practice a 1669 call
  -> practice CPR rhythm
  -> review the result
  -> optionally save XP/leaderboard progress and submit feedback
```

AED is an optional advanced mission. The application is a learning aid and rhythm simulator; it does not measure compression depth, hand position, chest recoil, ventilation quality, or practical competency.

## 2. Runtime architecture

```text
Browser (React client)
  |-- public lessons and simulations
  |-- local progress/outbox (no bearer token)
  |
  +--> Next.js Route Handlers on Vercel
         |-- input validation and same-origin checks
         |-- HttpOnly player-session cookie
         |-- admin authorization boundary
         |
         +--> Supabase REST RPC with publishable key
                |-- public security-invoker wrappers
                |-- private SECURITY DEFINER implementations
                |-- RLS-enabled tables with direct grants revoked
                +-- PostgreSQL constraints, rate checks, and cascades
```

The browser never receives the raw Supabase session token. The publishable key is intentionally public; it grants no direct table access. The admin secret is server-only and must never use a `NEXT_PUBLIC_` prefix.

## 3. Important directories

| Path | Responsibility |
|---|---|
| `src/app/` | Next.js pages, global styles, and API Route Handlers |
| `src/components/` | shared UI, profile, survey, and admin dashboard |
| `src/features/` | lesson and mission experiences |
| `src/data/` | lesson/scenario content and official references |
| `src/lib/` | scoring, progress, API clients, session and admin boundaries |
| `src/lib/__tests__/` | automated regression/security contract tests |
| `supabase/migrations/` | versioned database schema and RPC contracts |
| `docs/` | product, UX, medical-content, deployment, and operations records |

## 4. Data model and flow

### Player account

`game_players` stores normalized phone, display name, bcrypt PIN hash, school, and training year. A successful login creates a random session token. Only its SHA-256 hash is stored in `game_sessions`; the raw token is held in an API-scoped HttpOnly cookie for up to seven days.

### Training result

The browser creates a measured attempt, ties it to the currently signed-in player, and sends it to `/api/player/attempt`. The API validates the schema and account identity. Supabase enforces scenario allowlists, score/timing ranges, replay protection, a 20-second submission interval, and a daily attempt limit.

### Feedback

Feedback requires a live player session. One player can update their own response. The public website never exposes raw feedback; it is available only to the authorized administrator.

### Admin

The administrator signs in through the normal phone/PIN flow. Every admin request must pass both checks:

1. a live player-session cookie whose player matches the singleton `admin_config` record;
2. `NONG_PROM_ADMIN_SECRET`, available only in the Vercel server environment and matched by SHA-256 hash in Supabase.

The dashboard can search users, inspect full player detail, view attempts/sessions/feedback, and permanently delete a non-admin account. Deletion requires typing the exact display name, cascades linked data, cannot target the admin, and writes an audit entry without retaining deleted-user PII.

## 5. Administrator operating guide

1. Open the public site and select the profile icon.
2. Choose **มีโปรไฟล์แล้ว** and sign in with the designated administrator phone/PIN.
3. Select **เปิดหลังบ้าน**, or open `/admin` in the same browser.
4. Use the left menu:
   - **ผู้ใช้งาน** — profile, school, year, best score, and recent activity.
   - **ผลการฝึก** — attempt count, best score, and CPR rhythm.
   - **แบบประเมิน** — open an individual record to read ratings/comments.
   - **การเข้าสู่ระบบ** — session count and recent access.
5. Open **ดูข้อมูล** for complete history.
6. Permanent deletion is the last section of a non-admin profile. Confirm the exact displayed name. This cannot be undone.

Do not place administrator credentials in source code, screenshots, classroom documents, or shared chat rooms. If the PIN is suspected to be exposed, replace the admin profile/PIN and rotate `NONG_PROM_ADMIN_SECRET` together.

## 6. Security controls

| Layer | Control |
|---|---|
| Browser | React escaping; no raw HTML/eval sinks; no bearer token in web storage |
| Cookie | HttpOnly, Secure in production, SameSite Strict, `/api/player` path, 7-day maximum |
| Mutation API | exact same-origin check, JSON-only, bounded/validated fields |
| Private API | `private, no-store` responses and generic failure messages |
| Database | RLS enabled, direct grants revoked, fixed empty `search_path`, constrained RPC surface |
| Login | bcrypt PIN hash, five-failure lock, 15-minute cooldown, maximum active sessions |
| Attempts | identity binding, replay ID, rate/daily limits, score/time constraints |
| Admin | player session + separate server secret + singleton admin identity |
| Destructive action | UUID validation, exact-name confirmation, self-delete block, audit record |
| Web platform | CSP, HSTS, frame denial, MIME sniff prevention, restrictive permissions policy |

Detailed findings and accepted risks are in `security_best_practices_report.md`.

## 7. Required environment variables

| Name | Visibility | Environments | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public config | Production; add Preview when preview data access is required | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public config | Production; add Preview when preview data access is required | restricted Data API key |
| `NONG_PROM_ADMIN_SECRET` | secret, server-only | Production and Preview | second factor used by admin RPCs |

Never store the admin secret in `.env`, screenshots, documentation, or any `NEXT_PUBLIC_*` variable. `.env.example` contains names only.

## 8. Local development and verification

```bash
npm install
npm run dev
npm test -- --run
npm run lint
npm run build
npm audit --omit=dev
```

For local player/admin API testing, use `.env.local`. Do not commit it.

The release gate is green only when:

- all Vitest files pass;
- ESLint reports no errors;
- the production build succeeds and lists `/admin` plus all `/api/player/**` handlers;
- `npm audit --omit=dev` reports zero production vulnerabilities;
- no secret scan match is present in tracked files;
- an unauthenticated `/api/player/admin/overview` request returns `401`;
- an authenticated administrator can load overview and player detail;
- a normal player receives no admin entry and cannot read admin data;
- mobile CPR can be completed without accidental scrolling on a real device.

## 9. Deployment procedure

1. Run the full release gate locally.
2. Review `git diff` and confirm no credentials or unrelated files are staged.
3. Commit and push `main`; Vercel creates a Production deployment.
4. Wait for Vercel status **Ready** and confirm the `rordor37.vercel.app` alias points to it.
5. Run the production smoke checks:
   - `/` returns `200`;
   - `/admin` returns `200` but no private data without a valid session;
   - admin overview without login returns `401` and `private, no-store`;
   - login, session restore, leaderboard, feedback, and admin overview work;
   - security headers remain present.
6. Keep the previous Vercel deployment available for immediate rollback.

Database changes must be added as generated Supabase migrations, reviewed, applied, then checked with Supabase security and performance advisors.

## 10. Data retention and privacy operations

Current behavior retains player profiles, attempts, and feedback until an administrator deletes the user. Before a broad rollout, approve:

- how long inactive profiles and results should remain;
- whether trainers need an export before deletion;
- who may request deletion and how identity is checked;
- how audit records are retained;
- who has Supabase and Vercel dashboard access.

Recommended starting policy: delete inactive pilot accounts 90 days after the pilot ends unless a trainer records a documented learning/research need.

## 11. Incident and recovery playbook

### Suspected admin credential exposure

1. Do not delete the current admin account.
2. Rotate the server secret in Vercel and its hash in `admin_config` as one coordinated change.
3. Replace/reset the administrator PIN and invalidate existing player sessions.
4. inspect `admin_audit_log`, deployment history, and Supabase logs.
5. redeploy, verify admin access, then record the incident.

### Bad deployment

1. Use Vercel to promote the last known-good production deployment.
2. Confirm `/`, `/api/player/session`, and unauthenticated admin denial.
3. Fix forward in Git; avoid editing production source outside version control.

### Database mistake

1. Stop destructive admin activity.
2. Record the time and affected player IDs without copying unnecessary PII.
3. Use Supabase backup/restore capability appropriate to the active plan.
4. Apply a corrective migration; do not manually drift the schema without recording it.

## 12. Known limits before a full launch

1. Add durable IP/global throttling for registration and login.
2. Approve and automate a data-retention policy.
3. Define administrator recovery and secret-rotation ownership.
4. Run a real-device acceptance pass on iPhone, Android, and iPad.
5. Run a staged mixed load test that includes login, leaderboard reads, result writes, and admin reads—not only static page requests.
6. Keep XP and leaderboard explicitly non-authoritative.

## 13. Current readiness decision

The system is suitable for a controlled pilot with supervised users. It is not yet the right system of record for formal competency assessment. A full-unit rollout should be approved only after the six items above are either completed or explicitly accepted by the project owner.
