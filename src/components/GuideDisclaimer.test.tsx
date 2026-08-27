import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import GuideDisclaimer from "./GuideDisclaimer";

function render(articleId: string) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <GuideDisclaimer articleId={articleId} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("GuideDisclaimer", () => {
  it("renders nothing for guides that need no disclaimer", () => {
    expect(render("guide-school-esl-resources")).toBe("");
    expect(render("does-not-exist")).toBe("");
  });

  it("renders the legal disclaimer on immigration guides", () => {
    const markup = render("guide-legal-30-day-documents");

    expect(markup).toContain(translate("en", "disclaimer.heading"));
    expect(markup).toContain(translate("en", "disclaimer.legal"));
    expect(markup).not.toContain(translate("en", "disclaimer.medical"));
  });

  it("renders medical and financial disclaimers together on the health guide", () => {
    const markup = render("category-health");

    expect(markup).toContain(translate("en", "disclaimer.medical"));
    expect(markup).toContain(translate("en", "disclaimer.financial"));
  });

  it("exposes the notice to assistive technology", () => {
    const markup = render("category-banking");

    expect(markup).toContain('role="note"');
    expect(markup).toContain('aria-labelledby="guide-disclaimer-heading"');
    expect(markup).toContain('id="guide-disclaimer-heading"');
  });
});
