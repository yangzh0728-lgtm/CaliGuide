import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import ChatSafetyNotice from "./ChatSafetyNotice";

function render(hasSelectedImages: boolean) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <ChatSafetyNotice hasSelectedImages={hasSelectedImages} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("ChatSafetyNotice", () => {
  it("always shows the accuracy notice and disclaimer link", () => {
    const markup = render(false);

    expect(markup).toContain(translate("en", "chatbot.safetyNotice"));
    expect(markup).toContain('href="/disclaimer"');
    expect(markup).toContain(translate("en", "chatbot.disclaimerLink"));
    expect(markup).not.toContain(translate("en", "chatbot.imagePrivacyNotice"));
  });

  it("shows the external-provider privacy warning only when images are selected", () => {
    const markup = render(true);

    expect(markup).toContain(translate("en", "chatbot.imagePrivacyNotice"));
    expect(markup).toContain('href="/privacy"');
    expect(markup).toContain(translate("en", "chatbot.privacyLink"));
    expect(markup).toContain('role="note"');
  });
});
