import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import AuthPage from "./AuthPage";

describe("AuthPage", () => {
  it("lets a visitor return to public browsing", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <AuthProvider>
            <AuthPage
              onOpenLegalPage={() => {}}
              onContinueBrowsing={() => {}}
              continueBrowsingHref="/guides/california-real-id-documents"
            />
          </AuthProvider>
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain(translate("en", "auth.continueBrowsing"));
    expect(html).toContain('href="/guides/california-real-id-documents?continue=1"');
  });
});
