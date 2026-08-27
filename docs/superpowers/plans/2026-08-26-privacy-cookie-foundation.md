# Privacy And Cookie Foundation Implementation Plan

**Goal:** Add public legal pages and versioned, multilingual consent controls while preventing optional browser storage before consent.

**Architecture:** A privacy-consent context owns a versioned local record and category controls. Language and chatbot local persistence consult that context. Public legal content is data-driven and rendered by one reusable page. App-level routing exposes legal pages on both sides of authentication.

**Tech Stack:** React 19, TypeScript, Bun test, Tailwind CSS, lucide-react.

---

### Task 1: Define And Test Consent Behavior

**Files:**
- Create: `src/lib/privacyConsent.test.ts`
- Create: `src/lib/privacyConsent.ts`

1. Test missing, malformed, and outdated records.
2. Test accept-all, reject-all, and custom records.
3. Test that revocation removes only optional CaliGuide keys.
4. Run the focused test and confirm it first fails, then passes.

### Task 2: Add Consent Context And Gate Preference Storage

**Files:**
- Create: `src/context/PrivacyConsentContext.tsx`
- Modify: `src/main.tsx`
- Modify: `src/context/LanguageContext.tsx`
- Modify: `src/pages/Chatbot.tsx`

1. Add the provider and context actions.
2. Keep Supabase/OAuth storage necessary.
3. Gate language and local chatbot persistence behind preferences consent.
4. Add focused tests for storage helpers.

### Task 3: Add Multilingual Legal Content And Pages

**Files:**
- Create: `src/lib/legalContent.test.ts`
- Create: `src/lib/legalContent.ts`
- Create: `src/pages/LegalPage.test.tsx`
- Create: `src/pages/LegalPage.tsx`
- Modify: `src/i18n/translations.ts`

1. Test every document in every supported language.
2. Add the four legal documents and provider/storage disclosures.
3. Render an accessible public legal page with language control and back navigation.

### Task 4: Add Consent UI And Public Navigation

**Files:**
- Create: `src/components/PrivacyConsentBanner.test.tsx`
- Create: `src/components/PrivacyConsentBanner.tsx`
- Create: `src/components/PrivacyPreferencesDialog.tsx`
- Create: `src/components/LegalFooter.tsx`
- Modify: `src/pages/AuthPage.tsx`
- Modify: `src/App.tsx`

1. Add equal-prominence Accept all, Reject non-essential, and Customize actions.
2. Add category toggles and permanent Privacy Choices access.
3. Make legal pages available before sign-in and in the authenticated footer.
4. Ensure all early App returns include the consent experience.

### Task 5: Correct Documentation And Verify

**Files:**
- Modify: `docs/DATA_INVENTORY.md`
- Modify: `docs/CALIGUIDE_HANDOFF.md`

1. Add browser-storage inventory and correct CCPA applicability wording.
2. Reconcile Git state, test count, and build details.
3. Run focused tests, full tests, typecheck, build, and `git diff --check`.
4. Start the dev server and visually verify authentication, banner, preferences, and legal pages at desktop and mobile sizes.
