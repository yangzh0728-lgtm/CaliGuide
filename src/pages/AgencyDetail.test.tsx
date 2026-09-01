import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import AgencyDetail from "./AgencyDetail";

function renderDetail(institutionId: string) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <AgencyDetail
          institutionId={institutionId}
          onBackToDirectory={() => undefined}
          onOpenInstitution={() => undefined}
          onOpenBlog={() => undefined}
        />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("AgencyDetail", () => {
  it("renders a real public agency page with tasks and orientation guidance", () => {
    const markup = renderDetail("ca-dmv");

    expect(markup).toContain('data-agency-detail="ca-dmv"');
    expect(markup).toContain("California Department of Motor Vehicles");
    expect(markup).toContain("It does not issue Social Security numbers");
    expect(markup).toContain("Need a Social Security number or card?");
    expect(markup).toContain("Official actions");
    expect(markup).toContain("Language access");
    expect(markup).toContain('href="https://www.dmv.ca.gov/portal/"');
    expect(markup).toContain('href="/guides/california-driver-license-application"');
    expect(markup).toContain("September 1, 2026");
  });

  it("renders a localized not-found state for an invalid institution id", () => {
    const markup = renderDetail("not-a-real-agency");

    expect(markup).toContain("Agency not found");
    expect(markup).toContain("Back to agency directory");
  });
});
