import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import Home from "./Home";

function renderHome() {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <Home
          onOpenBlog={() => {}}
          onOpenRecommended={() => {}}
          onOpenInstitution={() => {}}
          onOpenAgencies={() => {}}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("Home", () => {
  it("previews the four priority topics and leaves the full library to See all", () => {
    const markup = renderHome();
    const topicIds = Array.from(markup.matchAll(/data-home-topic="([^"]+)"/g), (match) => match[1]);

    expect(topicIds).toEqual([
      "housing",
      "dmv",
      "legal",
      "jobs",
    ]);
    expect(markup).toContain("3 guides");
    expect(markup).toContain("2 guides");
    expect(markup).toContain("See all");
    expect(markup).not.toContain("Community Guide</span>");
    expect(markup).not.toContain("Forum Question</span>");
  });

  it("promotes the agency directory and removes fabricated activity", () => {
    const markup = renderHome();

    expect(markup).toContain('data-home-agencies="true"');
    expect(markup).toContain("Find the right agency");
    expect(markup).not.toContain("24 replies");
    expect(markup).not.toContain("11 replies");
    expect(markup).not.toContain("2h ago");
    expect(markup).not.toContain("5h ago");
  });

  it("uses snap cards on mobile and a complete grid on desktop", () => {
    const markup = renderHome();

    expect(markup).toContain('data-recommended-layout="responsive"');
    expect(markup).toContain("snap-x");
    expect(markup).toContain("md:grid");
  });
});
