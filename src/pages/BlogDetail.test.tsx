import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import { getBlogArticle } from "../lib/blogContent";
import BlogDetail from "./BlogDetail";

function renderArticle(articleId: string, isAuthenticated = true) {
  const article = getBlogArticle(articleId);
  if (!article) {
    throw new Error(`Missing fixture article: ${articleId}`);
  }

  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <BlogDetail
          article={article}
          isAuthenticated={isAuthenticated}
          isSaved={false}
          onToggleSave={() => {}}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("BlogDetail", () => {
  it("shows the disclaimer above the guide body on sensitive guides", () => {
    const markup = renderArticle("category-health");

    expect(markup).toContain(translate("en", "disclaimer.heading"));
    expect(markup).toContain(translate("en", "disclaimer.medical"));

    // The notice must appear before the first body section, not buried at the end.
    expect(markup.indexOf("guide-disclaimer-heading")).toBeLessThan(
      markup.indexOf('id="guide-section-1"'),
    );
  });

  it("omits the disclaimer on low-risk guides", () => {
    const markup = renderArticle("guide-school-esl-resources");

    expect(markup).not.toContain("guide-disclaimer-heading");
    expect(markup).toContain('id="guide-section-1"');
  });

  it("still renders citations alongside the disclaimer", () => {
    const markup = renderArticle("category-banking");

    expect(markup).toContain("guide-disclaimer-heading");
    expect(markup).toContain('id="guide-references"');
  });

  it("invites signed-out readers to sign in before saving", () => {
    const markup = renderArticle("category-dmv", false);

    expect(markup).toContain(translate("en", "auth.signInToSave"));
  });

  it("renders localized official actions inside the cited guide section", () => {
    const markup = renderArticle("guide-1");

    expect(markup).toContain(translate("en", "blog.action.apply"));
    expect(markup).toContain("Online Driver&#x27;s License or ID Application");
    expect(markup).toContain('href="https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/dl-id-online-app-edl-44/"');
    expect(markup).toContain('aria-label="Official actions"');
    expect(markup).toContain('id="guide-references"');
    expect(markup).toContain('href="/agencies/ca-dmv"');
  });
});
