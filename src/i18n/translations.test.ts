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

  it("recognizes supported language codes", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("zh-CN")).toBe(true);
    expect(isLanguageCode("zh-TW")).toBe(true);
    expect(isLanguageCode("es")).toBe(true);
    expect(isLanguageCode("yue")).toBe(false);
    expect(isLanguageCode("fr")).toBe(false);
  });
});
