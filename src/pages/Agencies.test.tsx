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
  it("renders the complete grouped public directory", () => {
    const markup = renderAgencies();

    expect(markup).toContain(translate("en", "agencies.title"));
    expect(markup).toContain(translate("en", "agencies.group.immigrationStatus"));
    expect(markup).toContain("U.S. Citizenship and Immigration Services");
    expect(markup).toContain("California Department of Motor Vehicles");
    expect(markup).toContain('href="/agencies/ca-dmv"');
    expect(markup).toContain('href="https://www.dmv.ca.gov/portal/"');
  });

  it("exposes boundaries, scam guidance, and citation-derived guide links", () => {
    const markup = renderAgencies("ca-dmv");

    expect(markup).toContain(translate("en", "agencies.doesNotDo"));
    expect(markup).toContain("It does not issue Social Security numbers");
    expect(markup).toContain(translate("en", "agencies.scamNote"));
    expect(markup).toContain(translate("en", "agencies.relatedGuides"));
    expect(markup).toContain('href="/guides/california-driver-license-application"');
    expect(markup).toContain('data-selected="true"');
  });
});
