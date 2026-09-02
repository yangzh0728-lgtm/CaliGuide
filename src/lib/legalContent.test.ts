import { describe, expect, test } from "bun:test";
import { LanguageCode } from "../i18n/translations";
import { LEGAL_PAGE_IDS, getLegalDocument } from "./legalContent";

const languages: LanguageCode[] = ["en", "zh-CN", "yue", "zh-TW", "es"];

describe("legal content", () => {
  test("provides every legal document in every supported content language", () => {
    expect(LEGAL_PAGE_IDS).toEqual([
      "about",
      "editorial",
      "contact",
      "privacy",
      "terms",
      "cookies",
      "disclaimer",
    ]);

    for (const pageId of LEGAL_PAGE_IDS) {
      const englishDocument = getLegalDocument(pageId, "en");

      for (const language of languages) {
        const document = getLegalDocument(pageId, language);
        expect(document.title).toBeTruthy();
        expect(document.summary).toBeTruthy();
        expect(document.effectiveDate).toBe("2026-08-26");
        expect(document.sections.length).toBeGreaterThanOrEqual(3);
        expect(document.sections.every((section) => section.heading && section.paragraphs.length)).toBe(true);

        if (language !== "en") {
          expect(document.title).not.toBe(englishDocument.title);
          expect(document.summary).not.toBe(englishDocument.summary);
        }
      }
    }
  });

  test("explains ownership, editorial standards, and support channels", () => {
    const aboutText = JSON.stringify(getLegalDocument("about", "en"));
    const editorialText = JSON.stringify(getLegalDocument("editorial", "en"));
    const contactText = JSON.stringify(getLegalDocument("contact", "en"));

    expect(aboutText).toContain("independently developed");
    expect(aboutText).toContain("paid placement");
    expect(editorialText).toContain("official");
    expect(editorialText).toContain("section-level citations");
    expect(editorialText).toContain("No fixed review interval");
    expect(contactText).toContain("privacy@caliguide.org");
    expect(contactText).toContain("https://github.com/yangzh0728-lgtm/CaliGuide/issues");
  });

  test("discloses active service providers in the privacy policy", () => {
    const privacyText = JSON.stringify(getLegalDocument("privacy", "en"));

    expect(privacyText).toContain("Supabase");
    expect(privacyText).toContain("Cloudflare R2");
    expect(privacyText).toContain("Baidu Qianfan");
    expect(privacyText).toContain("Mem0");
    expect(privacyText).toContain("Google OAuth");
  });

  test("lists the known CaliGuide browser-storage keys", () => {
    const cookieText = JSON.stringify(getLegalDocument("cookies", "en"));

    expect(cookieText).toContain("caliguide-privacy-consent");
    expect(cookieText).toContain("caliguide-language");
    expect(cookieText).toContain("caliguide-chat-memory");
    expect(cookieText).toContain("caliguide-moving-checklist");
    expect(cookieText).toContain("caliguide-google-profile-draft");
    expect(cookieText).toContain("Supabase authentication");
    expect(cookieText).toContain("necessary functional storage");
    expect(cookieText).toContain("optional preference storage");
  });

  test("describes the self-service account export and deletion controls", () => {
    const privacyText = JSON.stringify(getLegalDocument("privacy", "en"));

    expect(privacyText).toContain("Settings");
    expect(privacyText).toContain("download a copy");
    expect(privacyText).toContain("permanently delete");
    expect(privacyText).not.toContain("not yet available");
  });

  test("uses localized body copy for Traditional Chinese and Cantonese", () => {
    const traditionalPrivacy = JSON.stringify(getLegalDocument("privacy", "zh-TW"));
    const cantonesePrivacy = JSON.stringify(getLegalDocument("privacy", "yue"));

    expect(traditionalPrivacy).toContain("我們收集的資訊");
    expect(traditionalPrivacy).not.toContain("我们收集的信息");
    expect(cantonesePrivacy).toContain("我哋收集嘅資料");
    expect(cantonesePrivacy).not.toContain("我们收集的信息");
  });
});
