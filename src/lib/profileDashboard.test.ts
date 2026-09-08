import { describe, expect, it } from "bun:test";
import {
  formatProfileCount,
  formatProfileMonthYear,
  getArrivalGuideId,
} from "./profileDashboard";

describe("profile dashboard", () => {
  it("selects a useful guide for each arrival stage", () => {
    expect(getArrivalGuideId("planning")).toBe("guide-legal-30-day-documents");
    expect(getArrivalGuideId("arrived")).toBe("forum-first-30-days");
    expect(getArrivalGuideId("long_term_resident")).toBe("guide-moving-address-checklist");
  });

  it("formats saved and post counts from localized templates", () => {
    expect(formatProfileCount("{count} saved items", 3)).toBe("3 saved items");
    expect(formatProfileCount("已保存 {count} 项", 3)).toBe("已保存 3 项");
  });

  it("formats an English stored month in the active interface language", () => {
    expect(formatProfileMonthYear("July 2026", "en")).toBe("July 2026");
    expect(formatProfileMonthYear("July 2026", "zh-CN")).toBe("2026年7月");
    expect(formatProfileMonthYear("July 2026", "es")).toBe("julio de 2026");
  });
});
