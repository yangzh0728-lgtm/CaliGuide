import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import Agencies from "./Agencies";

function renderAgencies(selectedInstitutionId?: string) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <Agencies
          selectedInstitutionId={selectedInstitutionId}
          onOpenInstitution={() => {}}
          onOpenBlog={() => {}}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("Agencies", () => {
  it("renders the task-organized public directory", () => {
    const markup = renderAgencies();

    expect(markup).toContain(translate("en", "agencies.title"));
    expect(markup).toContain(translate("en", "agencies.group.immigrationStatus"));
    expect(markup).toContain(translate("en", "agencies.group.identityTransportation"));
    expect(markup).toContain("U.S. Citizenship and Immigration Services");
    expect(markup).toContain('data-desktop-agency-navigation="true"');
    expect(markup).toContain('data-mobile-agency-navigation="true"');
  });

  it("keeps orientation content inside one expanded row", () => {
    const markup = renderAgencies("uscis");

    expect(markup).toContain(translate("en", "agencies.doesNotDo"));
    expect(markup).toContain("It does not issue visas at U.S. embassies abroad");
    expect(markup).toContain(translate("en", "agencies.relatedGuides"));
    expect(markup).toContain('aria-expanded="true"');
  });
});
