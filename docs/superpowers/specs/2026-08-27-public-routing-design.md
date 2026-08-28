# Public Routing and Guide Access Design

## Scope

This is the first milestone in CaliGuide's public-product hardening work. It gives every guide a stable, human-readable URL, restores browser history behavior, and lets signed-out visitors read public guide content. Saving guides, forum participation, chatbot use, and profile access continue to require authentication.

Later milestones cover bundle splitting, CI, error reporting, security headers, offline support, responsive images, and browser-level tests. They are deliberately separate so routing can ship and be verified independently.

## Route Contract

| Route | Access | Content |
| --- | --- | --- |
| `/` | Public | Home |
| `/guides` | Public | Complete guide library |
| `/guides/:slug` | Public | One guide |
| `/forum` | Authenticated | Forum index |
| `/forum/:discussionId` | Authenticated | Forum detail |
| `/chatbot` | Authenticated | CaliGuide chatbot |
| `/profile` | Authenticated | Profile and settings |
| Existing trust/legal routes | Public | About, editorial, contact, policies |

Guide slugs are explicit and stable. They are not derived from translated titles, so changing copy or interface language cannot break a shared link. Unknown guide slugs render the public guide library rather than silently selecting the DMV guide.

## Navigation and Authentication

One typed route module owns path parsing and path generation. `App` initializes from `window.location`, writes navigation through `history.pushState`, and restores state from `popstate`. UI back buttons call browser history when possible and fall back to the appropriate parent route.

Signed-out users can render the home page, guide library, and guide detail. Attempting to save a guide or open a private route displays `AuthPage` while preserving the requested route. After authentication, the same route renders automatically. Public pages provide a clear sign-in action, but sign-in is not required to read.

## Share and Search Metadata

The client updates the document title, description, canonical URL, and Open Graph metadata whenever the route changes. The Express production fallback injects the same metadata into the initial HTML for guide URLs, so search and sharing crawlers do not depend entirely on client-side JavaScript. The server also exposes `robots.txt` and `sitemap.xml` containing all public guide and trust-page URLs.

## Boundaries

- This milestone does not expose forum content publicly.
- It does not migrate the application to a framework router or SSR framework.
- It does not alter guide content, images, Supabase tables, or authentication providers.
- It does not fabricate publication or review dates.

## Testing

- Pure route tests cover every path, guide slug, unknown route, and public/private classification.
- Metadata tests cover canonical URLs, guide titles, descriptions, sitemap entries, and HTML escaping.
- Existing component and data tests remain green.
- Typecheck and production build must pass.
- Browser verification covers direct guide load, signed-out reading, save-to-sign-in gating, and back/forward navigation.
