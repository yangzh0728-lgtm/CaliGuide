import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import PrivacyConsentBanner from "./PrivacyConsentBanner";

describe("PrivacyConsentBanner", () => {
  test("offers accept, reject, customize, and notice actions before consent", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <PrivacyConsentBanner onOpenCookieNotice={() => undefined} />
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain("Your privacy choices");
    expect(html).toContain("Accept all");
    expect(html).toContain("Reject non-essential");
    expect(html).toContain("Customize");
    expect(html).toContain("Read cookie notice");
    expect(html).toContain('role="region"');
  });
});
