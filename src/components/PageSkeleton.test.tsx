import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import PageSkeleton from "./PageSkeleton";

describe("PageSkeleton", () => {
  it("announces loading while reserving the page layout", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <PageSkeleton fullScreen />
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain(translate("en", "app.loading"));
    expect(html).toContain("animate-pulse");
  });
});
