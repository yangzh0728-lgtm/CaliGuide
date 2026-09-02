import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import AgencyDirectoryShell from "./AgencyDirectoryShell";

function renderShell() {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <AgencyDirectoryShell
          initialGroupId="immigration-status"
          initialExpandedInstitutionId="uscis"
          onOpenInstitution={() => undefined}
          onOpenBlog={() => undefined}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("AgencyDirectoryShell", () => {
  it("uses settings-style task navigation on desktop and a compact mobile selector", () => {
    const markup = renderShell();

    expect(markup).toContain('data-desktop-agency-navigation="true"');
    expect(markup).toContain('data-mobile-agency-navigation="true"');
    expect(markup).toContain('data-agency-group="immigration-status"');
    expect(markup).toContain('aria-current="page"');
  });

  it("renders one universal safety notice and compact expandable rows", () => {
    const markup = renderShell();

    expect(markup.match(/data-agency-safety-notice="true"/g)).toHaveLength(1);
    expect(markup).toContain('data-agency-row="uscis"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("At a port of entry or looking for an I-94?");
    expect(markup).toContain('href="/agencies/uscis"');
    expect(markup).toContain('href="https://www.uscis.gov/"');
  });

  it("caps related guides in the row and exposes the remaining count", () => {
    const markup = renderShell();

    expect(markup).toContain('data-visible-related-guides="2"');
    expect(markup).toContain('data-remaining-related-guides="3"');
    expect(markup).toContain("+3");
  });
});
