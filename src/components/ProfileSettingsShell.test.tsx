import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import ProfileSettingsShell, { PROFILE_SETTINGS_SECTIONS } from "./ProfileSettingsShell";

function render(activeSection: (typeof PROFILE_SETTINGS_SECTIONS)[number] | null) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <ProfileSettingsShell
          activeSection={activeSection}
          onBackToProfile={() => undefined}
          onSelectSection={() => undefined}
        >
          <p>Selected settings content</p>
        </ProfileSettingsShell>
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("ProfileSettingsShell", () => {
  it("offers the six settings sections in a stable order", () => {
    expect(PROFILE_SETTINGS_SECTIONS).toEqual([
      "account",
      "security",
      "language",
      "privacy",
      "data",
      "danger",
    ]);

    const markup = render("account");
    for (const section of PROFILE_SETTINGS_SECTIONS) {
      expect(markup).toContain(`data-settings-section="${section}"`);
    }
  });

  it("renders the selected panel with an accessible title", () => {
    const markup = render("privacy");

    expect(markup).toContain('aria-labelledby="settings-panel-title"');
    expect(markup).toContain('id="settings-panel-title"');
    expect(markup).toContain("Selected settings content");
  });

  it("shows the mobile section menu instead of panel content before a section is selected", () => {
    const markup = render(null);

    expect(markup).toContain('data-mobile-settings-menu="true"');
    expect(markup).toContain('data-mobile-settings-panel="false"');
  });

  it("keeps the danger section visually distinct", () => {
    const markup = render("danger");

    expect(markup).toContain('data-danger-section="true"');
    expect(markup).toContain("text-error");
  });
});
