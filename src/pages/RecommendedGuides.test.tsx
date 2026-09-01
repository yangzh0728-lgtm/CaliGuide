import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import RecommendedGuides from "./RecommendedGuides";

function renderGuides() {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <RecommendedGuides onOpenBlog={() => {}} onOpenAgencies={() => {}} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("RecommendedGuides", () => {
  it("renders the complete guide library", () => {
    const markup = renderGuides();
    const guideCards = markup.match(/data-guide-card=/g) ?? [];

    expect(markup).toContain(">Guides<");
    expect(guideCards).toHaveLength(19);
    expect(markup).toContain('data-guide-card="forum-first-30-days"');
    expect(markup).toContain('data-guide-card="category-dmv"');
    expect(markup).toContain('data-guide-card="trending-ssn"');
  });

  it("renders settings-style topic navigation and the agencies peer tab", () => {
    const markup = renderGuides();

    expect(markup).toContain('data-desktop-guide-navigation="true"');
    expect(markup).toContain('data-mobile-guide-navigation="true"');
    expect(markup).toMatch(/data-guide-group="all"[^>]*aria-current="page"/);
    expect(markup).toMatch(/data-reference-tab="guides"[^>]*aria-current="page"/);
    expect(markup).toContain('data-reference-tab="agencies"');
  });
});
