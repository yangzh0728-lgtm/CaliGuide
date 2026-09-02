import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import RecommendedGuides from "./RecommendedGuides";

function renderGuides(activeGroupId: "all" | "housing" = "all") {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <RecommendedGuides
          activeGroupId={activeGroupId}
          onSelectGroup={() => {}}
          onOpenBlog={() => {}}
          onOpenAgencies={() => {}}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("RecommendedGuides", () => {
  it("renders the complete guide library", () => {
    const markup = renderGuides();
    const guideCards = markup.match(/data-guide-card=/g) ?? [];

    expect(markup).toContain(">Guides<");
    expect(guideCards).toHaveLength(20);
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

  it("renders every guide counted for the selected topic", () => {
    const markup = renderGuides("housing");
    const guideCards = markup.match(/data-guide-card=/g) ?? [];

    expect(guideCards).toHaveLength(4);
    expect(markup).toContain('data-guide-card="category-housing"');
    expect(markup).toContain('data-guide-card="guide-2"');
    expect(markup).toContain('data-guide-card="guide-rental-scams"');
    expect(markup).toContain('data-guide-card="guide-moving-address-checklist"');
    expect(markup).toMatch(/data-guide-group="housing"[^>]*aria-current="page"/);
  });
});
