import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { PROFILE_PROMPT_COPY } from "../i18n/profilePromptCopy";
import ProfileDetailPrompt from "./ProfileDetailPrompt";

function render(kind: "name" | "arrival") {
  return renderToStaticMarkup(<PrivacyConsentProvider><LanguageProvider>
    <ProfileDetailPrompt kind={kind} onSave={async () => {}} onContinue={() => {}} onDismiss={() => {}} />
  </LanguageProvider></PrivacyConsentProvider>);
}

describe("ProfileDetailPrompt", () => {
  test("asks for one field with a reason and skip option", () => {
    const name = render("name");
    expect(name).toContain("appears publicly");
    expect(name).toContain("Skip for now");
    expect(name).toContain('aria-label="Close"');
    expect(name).toContain('autoComplete="nickname"');
    expect(name).not.toContain("<select");
    const arrival = render("arrival");
    expect(arrival).toContain("not your immigration status");
    expect(arrival).toContain('value=""');
    expect(arrival).not.toContain("<input");
  });
  test("provides every prompt string in all five languages", () => {
    for (const [language, copy] of Object.entries(PROFILE_PROMPT_COPY)) {
      expect(Object.keys(copy).sort()).toEqual(Object.keys(PROFILE_PROMPT_COPY.en).sort());
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim()).not.toBe("");
        if (language !== "en") expect(value).not.toBe(PROFILE_PROMPT_COPY.en[key as keyof typeof copy]);
      }
    }
  });
});
