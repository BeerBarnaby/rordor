# Single-admin dashboard design

## Intent

Add a small private back office to NONG PROM so one designated administrator can inspect the complete user journey and permanently remove an individual user when necessary. The administrator signs in through the existing phone-and-PIN player flow; there is no separate admin registration, role-management UI, or multi-admin system.

## Approved experience

- One responsive `/admin` dashboard matching the approved mockup.
- Summary cards show total users, recent logins, completed missions, and submitted surveys.
- Search finds a user by display name, phone, or school.
- The user list shows identity, school/year, best score, and latest activity.
- A user detail view shows the full phone number, profile fields, login/session history, legacy and measured-v2 attempts, XP/level, and the latest satisfaction survey.
- Navigation can filter the same dashboard by users, attempts, feedback, and login activity; it does not create separate products or deeply nested pages.
- Permanent deletion is available only from the user detail view. The administrator must type the user's exact display name before confirming. There is no bulk delete.
- Deletion removes the player and all rows linked by `ON DELETE CASCADE`: sessions, legacy attempts, measured-v2 attempts, and player feedback. It cannot be undone.
- The administrator cannot delete their own account.
- An audit row records the administrator, deleted internal player UUID, action, and timestamp without retaining the deleted user's name, phone, school, survey, or scores.

## Authorization and security

- The designated administrator first creates or uses a normal player profile, then signs in through the existing profile modal.
- The administrator is identified by a single normalized phone number configured outside browser code.
- Admin routes live under `/api/player/admin/**` so the existing HttpOnly player-session cookie remains scoped to `/api/player` and is not broadened to the whole site.
- Every admin API call validates: same-origin request rules where applicable, a live player session, the configured administrator phone, and a high-entropy server secret whose hash is stored in Supabase.
- The plaintext admin secret exists only in Vercel server environment variables. It is never exposed through a `NEXT_PUBLIC_*` variable or returned to the client.
- Privileged SQL remains in `nong_prom_private` as `SECURITY DEFINER` functions with `search_path = ''`; public wrappers are `SECURITY INVOKER` and expose only typed JSON responses.
- Responses use `Cache-Control: private, no-store`. Error messages do not reveal whether a phone is the administrator.
- List results are paginated to 25 users and capped server-side. Search is normalized and length-limited.

## Data model

- `nong_prom_private.admin_config`: singleton administrator player ID/normalized phone, server-secret hash, timestamps.
- `nong_prom_private.admin_audit_log`: append-only audit record for permanent deletions; no deleted-user PII.
- Existing tables remain the source of truth: `public.game_players`, `public.game_sessions`, `public.game_attempts`, `nong_prom_private.game_attempts_v2`, and `nong_prom_private.app_feedback`.

## API and UI boundaries

- `GET /api/player/admin/overview`: authenticated summary and paginated/searchable users.
- `GET /api/player/admin/players/[id]`: complete detail for one player.
- `DELETE /api/player/admin/players/[id]`: permanent deletion with exact display-name confirmation.
- `/admin`: client dashboard that renders only data returned by the protected server routes.
- Existing player login response and public player UI remain unchanged for ordinary users. A signed-in administrator receives a discreet “เปิดหลังบ้าน” entry after an authorization probe succeeds.

## Non-goals

- Multiple administrators, invitations, permission levels, and role editing.
- Editing player data, scores, attempts, or feedback.
- Bulk delete, spreadsheet export, or analytics charts.
- Restoring deleted users.
- Treating phone ownership as verified; the current app still uses a self-created PIN without SMS verification.

## Deployment requirement

Before production activation, set one normalized Thai mobile number as the administrator, generate a random server secret, write only its hash to the private database configuration, and store the plaintext secret in Vercel's server-only environment. The configured phone must already belong to a normal player profile before admin access can succeed.
