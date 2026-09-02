# CaliGuide Data Inventory

Updated: August 26, 2026, by tracing the code — not from the handoff summary.

Purpose: establish what CaliGuide actually collects, where it goes, and who else
receives it, so the privacy policy describes real behavior. A privacy policy
that does not match the code is worse than no policy.

Verification method: read `server.ts`, `src/lib/*.ts`, and `supabase/*.sql`
directly. Findings below cite the file and line where the behavior lives.

---

## 1. Personal data collected

### Account identity (Supabase Auth)

| Data | Source | Notes |
| --- | --- | --- |
| Email address | Registration | Supabase-managed |
| Password | Registration | Hashed by Supabase; app never stores it |
| Google account identity | OAuth sign-in | Optional sign-in path |

### Profile (`public.profiles`)

Columns confirmed in `supabase/account-profile-fields.sql`:

| Column | Sensitivity |
| --- | --- |
| `date_of_birth` | **High** — exact DOB |
| `sex` | **High in this product context** — demographic profile data |
| `nationalities` (jsonb) | **High in this product context** — nationality data |
| `country_nationality` | **High in this product context** — nationality data |
| `current_location` | **Medium** — city/state |
| `arrival_status` | **High in this product context** — immigration-adjacent profile data |
| `forum_translation_language` | Low |
| Name, avatar URL | Low/medium |

`arrival_status` combined with `nationalities` is effectively a statement about
a user's immigration situation. This is the most sensitive field pairing in the
product and deserves explicit treatment in the policy.

### Activity

- `saved_guides`, `saved_forum_posts` — reveals topics of personal interest
  (e.g. saving deportation-prep or legal-aid guides).
- `forum_posts`, `forum_comments`, `forum_votes` — user-authored public content.
- `chat_sessions`, `chat_messages` — **full chatbot conversation content**.
- `media_assets` — ownership, object key, URL, MIME type, size, moderation state.

### Uploaded files (Cloudflare R2)

Layout per handoff section 11: profile avatars, forum images, chat images under
`assets/users/{user_id}/...`.

Users are told to prepare passports, I-94s, immigration approval notices, and
bank documents (see the document-organization guide). Nothing prevents a user
from photographing those documents and uploading them to CaliBot or the forum.

### Browser and device storage

The application now separates necessary storage from optional preferences in
`src/lib/privacyConsent.ts` and `src/context/PrivacyConsentContext.tsx`.

| Key or storage | Category | Purpose |
| --- | --- | --- |
| Supabase Auth browser storage | Necessary | Session and refresh-token persistence (`src/lib/supabaseClient.ts`) |
| `caliguide-google-profile-draft` | Necessary | Temporary profile state for Google OAuth registration (`src/context/AuthContext.tsx`) |
| `caliguide-privacy-consent` | Necessary | Consent version, optional category choices, and update time |
| `caliguide-language` | Necessary / functional | Interface language required to preserve an accessible experience (`src/context/LanguageContext.tsx`) |
| `caliguide-chat-memory` | Preferences | Local chatbot cache (`src/pages/Chatbot.tsx`, `src/lib/chatMemory.ts`) |

Interface language is always available as necessary functional storage. Local
chat storage is not read or written until the user accepts preferences, and
revoking preferences removes that optional key. Supabase session
and OAuth registration state remain available because authentication and the
requested registration flow depend on them.

---

## 2. Third parties that receive user data

### 2.1 Baidu Qianfan — chat content and images

`server.ts:39` sets the AI base URL to:

```
https://qianfan.baidubce.com/v2
```

Qianfan is Baidu's cloud AI platform, operated from China. Every one of the
following is transmitted there:

- The user's chatbot message text (`server.ts` chat route).
- Prior conversation history sent as context.
- **Uploaded images**, routed to `CHAT_VISION_MODEL` (`server.ts:898`).

**Implication.** A user asking CaliBot about their immigration case, or
uploading a photo of an immigration document, has that content sent to a
Chinese cloud provider. For a product whose audience is immigrants — including
people who may have specific reasons to care where their data is processed —
this is a material disclosure, not a footnote. It is also a cross-border
transfer that a privacy policy must state plainly.

This is a product decision, not just a legal one. It is worth deciding
deliberately whether this is the right provider for this audience.

### 2.2 Microsoft Azure Translator — requested forum translations

When a signed-in user requests a forum translation, the server sends the
forum title, excerpt, and body paragraphs to Microsoft Azure Translator. The
Azure subscription key remains server-only, and translated results are cached
in Supabase using a hash of the source content.

### 2.3 Mem0 — long-term memory extraction

`src/lib/mem0Memory.ts:1`:

```
https://api.mem0.ai/v1
```

When `MEM0_API_KEY` is configured, user messages and assistant replies are sent
to Mem0 with a `user_id`, and Mem0 extracts durable facts about the user
(`server.ts:938`). Optional — the app works without it — but when enabled it
creates a second copy of conversation-derived personal facts outside Supabase.

### 2.4 Infrastructure processors

- **Supabase** — auth and database.
- **Cloudflare R2** — media storage.
- **Google** — OAuth sign-in.

### 2.5 Image hosts (incidental)

Guide hero images load from `images.unsplash.com` and
`lh3.googleusercontent.com` (`src/lib/blogContent.ts`). These hosts observe
visitor IP addresses and referring URLs. Minor, but it is third-party contact
and self-hosting the images would remove it.

### 2.5 Analytics

**None found.** No Google Analytics, Segment, PostHog, Mixpanel, Sentry, or
Plausible anywhere in `src/`, `server.ts`, or `index.html`. This is a genuine
privacy strength and worth stating in the policy.

---

## 3. Publicly reachable data

`media_assets` stores a `public_url` and R2 serves media from a public base URL.
Avatars and forum images are therefore reachable by anyone holding the URL, not
only signed-in users. Not indexed or listed, but not access-controlled either.

Forum posts and comments are readable by any signed-in user (handoff section 9).

---

## 4. Rights and controls

Searched for account deletion, data export, and retention logic. Results:

| Capability | Status |
| --- | --- |
| Delete account and associated data | **Implemented in Profile > Settings**; removes user-owned Supabase rows, the R2 user prefix, Mem0 memories, then the Auth identity |
| Export personal data | **Implemented in Profile > Settings** as a JSON export of account, Supabase, Mem0, and R2 metadata |
| Retention or purge schedule | **Not implemented** |
| View/delete chatbot memories held by Mem0 | **Partially implemented**; memories appear in the account export and are removed with account deletion, but there is no individual memory control yet |
| Withdraw consent for AI processing | **Not implemented** |
| Browser-storage consent and preference revocation | **Implemented** |

Many CaliGuide users are California residents or plan to become residents, but
that fact alone does not determine whether the CCPA/CPRA applies to the operator.
Applicability depends on the current statutory business thresholds and other
facts. When the law applies, California residents may have rights including
access, deletion, and correction. Independent of the threshold analysis, a
public product collecting exact date of birth, nationality, and
immigration-adjacent profile data should provide practical deletion and export
paths. CaliGuide now provides those paths in Settings; deployment verification
must confirm the service-role, R2, and Mem0 credentials are all present so the
cross-provider operation can complete.

The California Privacy Protection Agency currently describes covered
for-profit businesses as those doing business in California that meet at least
one listed threshold: $26.625 million in preceding-year gross annual revenue,
buying, selling, or sharing personal information of 100,000 California
residents or households, or deriving at least 50% of annual revenue from
selling or sharing California residents' personal information. Coverage can
also extend to certain related entities and voluntarily certified entities.
See the official [CPPA FAQ](https://cppa.ca.gov/faq.html). This inventory does
not determine CaliGuide's legal status under those rules.

---

## 5. Recommended follow-up, in priority order

1. **Decide on Baidu Qianfan.** The draft privacy policy now discloses it, but the
   product still needs a deliberate provider decision and a near-input warning
   before users send potentially sensitive text or images.
2. **Add a retention schedule**, especially for chat messages and uploaded
   images.
3. **Add Mem0 memory view/delete controls** so users can see and remove what the
   assistant remembers about them.
4. **Warn before image upload** that images are processed by a third-party AI
   provider, and discourage uploading identity documents.
5. **Consider self-hosting guide images** to remove incidental third-party
   contact.

The browser-control design treats authentication, interface language, and an
in-progress OAuth registration as necessary storage, while the local chat cache
remains off until accepted. That distinction follows the general principle that a
storage exception is narrow and tied to a service the user explicitly requests;
see the UK Information Commissioner's Office guidance on
[storage-access exceptions](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/).

---

## 6. What this document is not

This is an engineering inventory of observed behavior. It is not legal advice
and not a compliance determination. A qualified privacy attorney should review
both this inventory and any resulting policy before launch, particularly given
the immigration-status-adjacent data and the cross-border transfer in section 2.1.
