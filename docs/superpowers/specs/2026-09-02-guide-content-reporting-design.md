# Guide Content Reporting Design

## Purpose

CaliGuide readers need a direct way to report outdated, incorrect, broken, mistranslated, or confusing guide content. Reports will be collected in Supabase for manual review through the Supabase Table Editor. CaliGuide will not include an admin review page in this version.

## User Experience

Every guide displays a compact **Report incorrect information** command after its References section. Activating it opens a localized modal containing:

- A required reason: outdated information, factually incorrect, broken official link, translation error, or confusing/unclear.
- A guide-section selector that defaults to the whole guide.
- An optional text field labeled **What happened when you tried this?**, limited to 1,500 characters.
- Cancel and submit commands.

The application supplies the article ID and current interface language. It also records the selected section and a snapshot of the guide's latest citation review date. Readers never type those fields manually.

Signed-out and signed-in readers can submit reports. Successful submission replaces the form with a short confirmation. Errors use localized, non-provider-specific messages and leave the form content intact for retrying.

## Data Model

Create `public.content_reports` with:

| Column | Purpose |
| --- | --- |
| `id` | UUID primary key |
| `article_id` | Stable CaliGuide article ID |
| `section_index` | Nullable zero-based guide section index; null means the whole guide |
| `language` | One of `en`, `zh-CN`, `zh-TW`, `yue`, or `es` |
| `article_reviewed_at` | Latest citation review date when the report was submitted |
| `reason` | Constrained report reason |
| `details` | Optional reader explanation, maximum 1,500 characters |
| `reporter_user_id` | Nullable Supabase user ID when the reader is signed in |
| `status` | `open`, `reviewing`, `resolved`, or `dismissed` |
| `review_notes` | Private maintainer notes entered in Supabase |
| `reviewed_at` | Manual review timestamp |
| `created_at`, `updated_at` | Queue timestamps |

The table enables row-level security but grants no access to `anon` or `authenticated`. The server's service-role client is the only application path that can insert reports. Maintainers review and update rows directly in the Supabase dashboard.

The application does not store reporter IP addresses. Existing in-memory API rate limiting uses the request address to reduce anonymous abuse without adding it to the report record.

## Server Flow

Add `POST /api/guides/reports` with a strict rate limit. Authentication is optional:

1. Parse a bearer token when supplied and record the verified user ID.
2. Accept an anonymous submission when no token is supplied.
3. Validate article ID against the live guide library.
4. Validate language, reason, details length, and section bounds.
5. Derive the citation review-date snapshot on the server rather than trusting client input.
6. Insert through the Supabase service-role client.
7. Return a generic success or failure response without exposing database details.

The existing `src/lib/guideFeedback.ts` is incomplete and currently requires authentication. Replace that behavior with optional authentication and the expanded structured payload rather than creating a second reporting client.

## Review Workflow

Maintainers use Supabase Table Editor filters on `status`, `reason`, `language`, and `article_id`. Opening a guide uses its stable public URL and `section_index` to locate the affected content.

Resolving a report records the review result in Supabase. It does not automatically change citation `lastReviewedAt` values. Citation dates are updated in `guideCitations.ts` only after the relevant official sources are actually rechecked.

## Localization

All visible labels, reason names, validation messages, success text, and error text are provided in all five supported interface languages. Article titles and section headings come from the already-localized guide being viewed.

## Security And Privacy

- Anonymous reporting must not require or request an email address.
- Supabase table access remains private to the service role and dashboard maintainers.
- The server ignores client-supplied review dates and rejects unknown guide or section identifiers.
- Logs must not include report details.
- Rate-limit responses use the existing friendly API error convention.
- Account export and deletion include reports associated with a signed-in reporter. Anonymous reports cannot be associated with an account.

## Testing

Automated coverage will verify:

- Input validation and server-derived metadata.
- Anonymous and authenticated submission behavior.
- API rate limiting and sanitized failures.
- SQL constraints, grants, and RLS posture.
- Account export and deletion inventory.
- Localized strings in every supported language.
- Report modal rendering, section selection, success, and failure states.
- Placement after guide references.

## Out Of Scope

- An in-application admin dashboard.
- Email notifications.
- General product feedback or helpfulness voting.
- Automatic changes to guide content or citation review dates.
- Collecting reporter contact information.

## Definition Of Done

- Every guide offers the localized reporting command.
- Signed-out and signed-in reports reach `content_reports` through the server.
- Reports contain validated guide, section, language, reason, and review-date context.
- Direct browser access to the table is denied.
- Maintainers can review the queue in Supabase.
- Tests, typecheck, build, and whitespace checks pass.
