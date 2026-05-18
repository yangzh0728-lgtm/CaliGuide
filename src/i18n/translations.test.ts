import { describe, expect, it } from "bun:test";
import { isLanguageCode, translate } from "./translations";

describe("translations", () => {
  it("translates known navigation labels", () => {
    expect(translate("es", "nav.home")).toBe("Inicio");
    expect(translate("zh-CN", "nav.profile")).toBe("个人资料");
    expect(translate("zh-TW", "settings.account")).toBe("帳戶資料");
    expect(translate("yue", "settings.upload")).toBe("上載相片");
  });

  it("recognizes supported language codes", () => {
    expect(isLanguageCode("yue")).toBe(true);
    expect(isLanguageCode("fr")).toBe(false);
  });
});
