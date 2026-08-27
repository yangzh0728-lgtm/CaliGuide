import { describe, expect, it } from "bun:test";
import { isLanguageCode, translate } from "./translations";

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

  it("translates guide reference labels", () => {
    expect(translate("en", "blog.references")).toBe("References");
    expect(translate("zh-CN", "blog.references")).toBe("参考资料");
    expect(translate("zh-TW", "blog.officialSource")).toBe("官方來源");
    expect(translate("yue", "blog.reviewedOn")).toBe("資料覆核日期");
    expect(translate("es", "blog.backToSection")).toBe("Volver a la sección");
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

  it("recognizes supported language codes", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("zh-CN")).toBe(true);
    expect(isLanguageCode("zh-TW")).toBe(true);
    expect(isLanguageCode("es")).toBe(true);
    expect(isLanguageCode("yue")).toBe(true);
    expect(isLanguageCode("fr")).toBe(false);
  });
});
