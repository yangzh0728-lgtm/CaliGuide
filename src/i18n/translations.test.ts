import { describe, expect, it } from "bun:test";
import { LANGUAGES, isLanguageCode, translate } from "./translations";

describe("translations", () => {
  it("translates known navigation labels", () => {
    expect(translate("es", "nav.home")).toBe("Inicio");
    expect(translate("zh-CN", "nav.profile")).toBe("个人资料");
    expect(translate("zh-TW", "settings.account")).toBe("帳戶資料");
    expect(translate("yue", "settings.upload")).toBe("上載相片");
    expect(translate("es", "home.noSearchResults")).toBe("No se encontraron guías");
  });

  it("translates sign-out confirmation copy", () => {
    expect(translate("en", "profile.signOutConfirmTitle")).toBe("Sign out?");
    expect(translate("zh-CN", "profile.confirmSignOut")).toBe("确认退出");
    expect(translate("zh-TW", "profile.cancelSignOut")).toBe("取消");
    expect(translate("es", "profile.signOutConfirmBody")).toBe("Tendrás que iniciar sesión de nuevo para acceder a guías, publicaciones y configuración guardadas.");
  });

  it("translates public browsing and sign-in gates", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const keys = ["auth.signIn", "auth.signInToSave", "auth.continueBrowsing"];

    for (const language of languages) {
      for (const key of keys) {
        expect(translate(language, key)).toBeTruthy();
        expect(translate(language, key)).not.toBe(key);
      }
    }
  });

  it("describes the document checklist without fabricated upload progress", () => {
    const expected = {
      en: "Review and organize your important documents",
      "zh-CN": "查看并整理您的重要文件",
      yue: "查看同整理你嘅重要文件",
      "zh-TW": "查看並整理您的重要文件",
      es: "Revisa y organiza tus documentos importantes",
    } as const;

    for (const [language, copy] of Object.entries(expected)) {
      const value = translate(language as keyof typeof expected, "profile.checklistDesc");
      expect(value).toBe(copy);
      expect(value).not.toMatch(/\d/);
    }
  });

  it("translates the application loading state", () => {
    for (const language of ["en", "zh-CN", "yue", "zh-TW", "es"] as const) {
      expect(translate(language, "app.loading")).toBeTruthy();
      expect(translate(language, "app.loading")).not.toBe("app.loading");
    }
  });

  it("translates guide reference labels", () => {
    expect(translate("en", "blog.references")).toBe("References");
    expect(translate("zh-CN", "blog.references")).toBe("参考资料");
    expect(translate("zh-TW", "blog.officialSource")).toBe("官方來源");
    expect(translate("yue", "blog.reviewedOn")).toBe("資料覆核日期");
    expect(translate("es", "blog.backToSection")).toBe("Volver a la sección");
  });

  it("translates the agency directory interface in every supported language", () => {
    for (const language of LANGUAGES.map(({ code }) => code)) {
      expect(translate(language, "agencies.title")).not.toBe("agencies.title");
      expect(translate(language, "agencies.doesNotDo")).not.toBe("agencies.doesNotDo");
      expect(translate(language, "agencies.group.emergencyLocal")).not.toBe(
        "agencies.group.emergencyLocal",
      );
    }
  });

  it("translates the complete guide directory interface in every supported language", () => {
    const keys = [
      "recommended.title",
      "recommended.libraryNavigation",
      "recommended.agenciesTab",
      "recommended.findByTopic",
      "recommended.allGuides",
      "recommended.searchPlaceholder",
      "recommended.noResults",
      "recommended.group.dmv",
      "recommended.group.community",
    ];

    for (const language of LANGUAGES.map(({ code }) => code)) {
      for (const key of keys) {
        expect(translate(language, key)).not.toBe(key);
      }
    }
  });

  it("translates trust-page navigation and update labels", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const keys = ["legal.about", "legal.editorial", "legal.contact", "legal.lastUpdated", "legal.privacyContact"];

    for (const language of languages) {
      for (const key of keys) {
        expect(translate(language, key)).not.toBe(key);
      }
    }
  });

  it("translates guide disclaimer copy in every supported language", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const keys = [
      "disclaimer.heading",
      "disclaimer.legal",
      "disclaimer.medical",
      "disclaimer.financial",
    ];

    for (const language of languages) {
      for (const key of keys) {
        const value = translate(language, key);
        expect(value).toBeTruthy();
        expect(value).not.toBe(key);
        // Non-English tables must not silently fall back to the English string.
        if (language !== "en") {
          expect(value).not.toBe(translate("en", key));
        }
      }
    }
  });

  it("keeps emergency guidance in the medical disclaimer", () => {
    expect(translate("en", "disclaimer.medical")).toContain("911");
    expect(translate("zh-CN", "disclaimer.medical")).toContain("911");
    expect(translate("es", "disclaimer.medical")).toContain("911");
  });

  it("keeps Cantonese and Traditional Chinese disclaimer copy in the correct tables", () => {
    expect(translate("yue", "disclaimer.heading")).toContain("呢份指南只係");
    expect(translate("zh-TW", "disclaimer.heading")).toContain("本指南僅為");
  });

  it("classifies interface language as necessary and local chat cache as optional", () => {
    expect(translate("en", "privacy.necessaryCopy")).toContain("interface language");
    expect(translate("en", "privacy.preferencesCopy")).toContain("chatbot cache");
    expect(translate("en", "privacy.preferencesCopy")).not.toContain("language");
  });

  it("translates the forum reporting flow in every supported language", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const keys = [
      "forum.report",
      "forum.reportTitle",
      "forum.reportReason.misinformation",
      "forum.reportSubmit",
      "forum.reportSuccess",
      "forum.reportError",
    ];

    for (const language of languages) {
      for (const key of keys) {
        const value = translate(language, key);
        expect(value).toBeTruthy();
        expect(value).not.toBe(key);
      }
    }
  });

  it("translates account export and deletion controls in every supported language", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const keys = [
      "settings.dataPrivacy",
      "settings.downloadData",
      "settings.deleteAccount",
      "settings.deleteAccountTitle",
      "settings.deleteAccountConfirm",
      "settings.accountExportFailed",
      "settings.accountDeleteFailed",
    ];

    for (const language of languages) {
      for (const key of keys) {
        const value = translate(language, key);
        expect(value).toBeTruthy();
        expect(value).not.toBe(key);
      }
    }
  });

  it("translates every section in the settings navigation", () => {
    const languages = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;
    const sections = ["account", "security", "language", "privacy", "data", "danger"];

    for (const language of languages) {
      for (const section of sections) {
        expect(translate(language, `settings.section.${section}`)).not.toBe(
          `settings.section.${section}`,
        );
        expect(translate(language, `settings.section.${section}Desc`)).not.toBe(
          `settings.section.${section}Desc`,
        );
      }
    }
  });

  it("recognizes supported language codes", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("zh-CN")).toBe(true);
    expect(isLanguageCode("zh-TW")).toBe(true);
    expect(isLanguageCode("es")).toBe(true);
    expect(isLanguageCode("yue")).toBe(true);
    expect(isLanguageCode("fr")).toBe(false);
  });
});
