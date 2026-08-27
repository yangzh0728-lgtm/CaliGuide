# CaliGuide Privacy And Cookie Foundation Design

## Goal

Give visitors clear, multilingual control over optional browser storage and make CaliGuide's privacy, cookie, terms, and content-disclaimer information available before and after sign-in.

## Consent Model

CaliGuide uses four categories:

- Necessary: authentication, security, password recovery, and temporary OAuth registration state. Always active.
- Preferences: interface language and the local chatbot cache. Disabled until accepted.
- Analytics: reserved for future product analytics. No analytics service is currently installed.
- Marketing: reserved for future marketing technology. No marketing service is currently installed.

The stored consent record includes a schema version and update timestamp. Missing, invalid, or outdated consent causes the banner to appear again. Rejecting preferences removes the language and local chat preference keys without removing Supabase authentication or OAuth registration state.

## Public Experience

Visitors can open four public documents from the authentication screen:

- Privacy Policy
- Terms of Use
- Cookie and Local Storage Notice
- Content Disclaimer

The same links appear in the signed-in application footer. A permanent Privacy Choices action reopens the preference dialog.

## Content And Language

The consent interface and legal documents support English, Simplified Chinese, Cantonese, Traditional Chinese, and Spanish. The documents disclose CaliGuide's current use of Supabase, Cloudflare R2, Baidu Qianfan, Mem0, Google OAuth, and browser storage. They also distinguish public forum content from account and chatbot data.

## Safety Boundaries

- Supabase session persistence is necessary and remains active when optional consent is rejected.
- The Google OAuth registration draft is necessary because it completes an account-creation request.
- Optional storage is not written before positive consent.
- Legal copy is a product disclosure draft and should receive qualified legal review before a production launch.
