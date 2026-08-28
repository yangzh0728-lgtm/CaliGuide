import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import LegalPage from "./LegalPage";

describe("LegalPage", () => {
  test("renders the public privacy document with navigation and contact", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <LegalPage pageId="privacy" onBack={() => undefined} />
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Information we collect");
    expect(html).toContain("mailto:privacy@caliguide.org");
    expect(html).toContain("Back to CaliGuide");
    expect(html).toContain("Language");
    expect(html).toContain("Last updated");
  });

  test("renders actionable support links on the contact page", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <LegalPage pageId="contact" onBack={() => undefined} />
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain("Contact and Support");
    expect(html).toContain('href="mailto:privacy@caliguide.org"');
    expect(html).toContain('href="https://github.com/yangzh0728-lgtm/CaliGuide/issues"');
  });
});
