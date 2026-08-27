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
  });
});
