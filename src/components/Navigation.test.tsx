import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import Navigation from "./Navigation";

function renderNavigation(currentPage: "home" | "blog" | "agencies" | "chatbot" | "profile") {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <Navigation currentPage={currentPage} onPageChange={() => {}} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("Navigation", () => {
  it("places Guides beside Home as a primary destination", () => {
    const markup = renderNavigation("home");

    const tabs = Array.from(markup.matchAll(/data-navigation-tab="([^"]+)"/g), (match) => match[1]);

    expect(tabs).toEqual(["home", "recommended", "forum", "chatbot", "profile"]);
    expect(markup).toContain(">Guides<");
  });

  it("keeps Guides active while a guide or agency page is open", () => {
    const guideMarkup = renderNavigation("blog");
    const agencyMarkup = renderNavigation("agencies");

    expect(guideMarkup).toContain('data-navigation-tab="recommended" aria-current="page"');
    expect(agencyMarkup).toContain('data-navigation-tab="recommended" aria-current="page"');
  });

  it("keeps active Profile and Chatbot icons recognizable as outlines", () => {
    const profileMarkup = renderNavigation("profile");
    const chatbotMarkup = renderNavigation("chatbot");

    expect(profileMarkup).toContain('data-navigation-tab="profile" aria-current="page"');
    expect(chatbotMarkup).toContain('data-navigation-tab="chatbot" aria-current="page"');
    expect(profileMarkup).not.toContain('fill="currentColor"');
    expect(chatbotMarkup).not.toContain('fill="currentColor"');
  });
});
