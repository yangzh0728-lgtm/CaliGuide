import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import ReferenceLibraryTabs from "./ReferenceLibraryTabs";

function renderTabs(active: "guides" | "agencies") {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <ReferenceLibraryTabs active={active} onOpenGuides={() => {}} onOpenAgencies={() => {}} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("ReferenceLibraryTabs", () => {
  it("links the two public reference-library surfaces", () => {
    const markup = renderTabs("guides");

    expect(markup).toContain('data-reference-tab="guides"');
    expect(markup).toContain('data-reference-tab="agencies"');
    expect(markup).toMatch(/data-reference-tab="guides"[^>]*aria-current="page"/);
  });

  it("marks agencies as active on the agency directory", () => {
    expect(renderTabs("agencies")).toMatch(
      /data-reference-tab="agencies"[^>]*aria-current="page"/,
    );
  });
});
