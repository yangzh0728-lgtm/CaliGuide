import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import TopAppBar from "./TopAppBar";

describe("TopAppBar", () => {
  it("offers sign in while a visitor browses public content", () => {
    const html = renderToStaticMarkup(
      <PrivacyConsentProvider>
        <LanguageProvider>
          <TopAppBar title="CaliGuide" showSignIn onSignIn={() => {}} />
        </LanguageProvider>
      </PrivacyConsentProvider>,
    );

    expect(html).toContain(translate("en", "auth.signIn"));
  });
});
