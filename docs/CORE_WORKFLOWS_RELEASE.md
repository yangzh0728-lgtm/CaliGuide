# Core workflows release

## Database rollout

Apply these scripts after the existing profile/community/moderation setup:

1. `supabase/harden-moderation-permissions.sql`
2. `supabase/content-reports.sql`
3. `supabase/moving-checklist-progress.sql`
4. `supabase/harden-internal-functions.sql`

These were applied to the connected CaliGuide Supabase project and checked
against live grants. The scripts preserve records. Do not rerun older setup
scripts afterward without reapplying the hardening script: PostgreSQL policies
are additive, and legacy public-read policies defeat newer restrictive ones.

Forum changes must use the existing authenticated Express routes. Browser
roles cannot write posts, comments, votes, or reports directly. Profiles and
checklist progress remain owner-scoped. Report queues are service-role-only.
Internal trigger functions have no browser execute grants; the timestamp
trigger has a fixed search path. Supabase's no-policy notices for private report
tables are intentional default-deny behavior, not missing public policies.
Keep the service-role key on the server, never in a `VITE_` environment variable.

Deploy both the Express server and the rebuilt frontend. Pushing source code
alone is not proof that the hosted application has been restarted or updated.
Keep the stricter database permissions in place if an application rollback is
needed; do not restore the old public-read policies.

## Guide corrections

Readers submit reports near each guide's references, with no account required.
The server validates article/section IDs and derives citation review dates.
Supplied invalid authentication is rejected rather than treated as anonymous.

Review reports in Supabase Table Editor, `public.content_reports`, filtered by
`status = open`. Use `reviewing`, `resolved`, or `dismissed` as appropriate.
Record staff context in `review_notes`, and set `reviewed_at` and `updated_at`
when changing review state. No public administration screen is included.

When correcting a guide, verify its official sources, update all affected
translations, and change the relevant citation review dates only after that
review. Merely resolving a report must not automatically advance source dates.
Assign a maintainer to inspect the queue regularly; this feature does not send
email notifications or promise a response time.

The reporting endpoint limits body size and requests per IP. Its limiter is
in-process: a multi-instance deployment needs shared rate-limit storage.
Configure `TRUST_PROXY_HOPS` only to match the actual trusted proxy chain.

## Account progress and registration

Email registration uses email and password; demographics are optional in
Settings. The profile dashboard uses arrival preferences for guide suggestions,
shows saved guides and recent conversations, and opens the selected conversation.

Signed-in checklist progress is loaded from the account. Saves are serialized,
failures offer retry, and reset remains empty after reload. Guest progress is
separate, optional browser storage and is never silently imported into accounts.

## Content format

Checklist items use the explicit delimiter ` | ` inside existing paragraph
strings. Commas and Chinese punctuation belong to the item and are never
interpreted as separators. Preserve paragraph counts/order when editing:
section citations and report section numbers depend on those indexes.

## Verification

- `bun test`
- `bun run typecheck`
- `bun run build`
- `VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci bun run test:e2e`

Browser tests cover desktop/mobile public navigation, anonymous report retry,
minimal signup, and signed-in checklist persistence/reset with mocked external
services. They do not create real user accounts or prove production OAuth works.

CI additionally uses disposable PostgreSQL 17 to reproduce legacy grants and
verify moderation/profile/checklist access boundaries. The fixture at
`supabase/tests/permissions-fixture.sql` is **CI-only**, never production data.
The assertion script rolls back its test changes. Failed browser runs upload
traces/screenshots for seven days. Docker was unavailable locally, so the
disposable PostgreSQL test must be confirmed by CI.

The security advisor still flags disabled leaked-password protection in Auth.
This account-level setting was not changed. Review it in Supabase Auth settings:
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
