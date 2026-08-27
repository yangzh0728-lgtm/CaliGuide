import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { translate } from "../i18n/translations";
import { ForumReportButton } from "./ForumReportButton";

function render(targetId: string) {
  return renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <ForumReportButton targetType="post" targetId={targetId} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
}

describe("ForumReportButton", () => {
  it("renders a compact localized report command for database content", () => {
    const markup = render("11111111-1111-4111-8111-111111111111");

    expect(markup).toContain(translate("en", "forum.report"));
    expect(markup).toContain('aria-label="Report forum content"');
  });

  it("does not offer reporting for local mock content", () => {
    expect(render("post-1")).toBe("");
  });
});
