import { describe, expect, it } from "bun:test";
import { formatBlogBodyBlock } from "./blogBodyFormat";

describe("blogBodyFormat", () => {
  it("splits Chinese label prefixes into a heading and content", () => {
    expect(formatBlogBodyBlock("适合人群：刚到美国还没有银行账户的人。")).toEqual({
      heading: "适合人群",
      content: "刚到美国还没有银行账户的人。",
      listItems: [],
      tone: "default",
    });
  });

  it("turns preparation checklist paragraphs into list items", () => {
    expect(formatBlogBodyBlock("准备清单：护照、SSN 或 ITIN、美国地址、电话号码。")).toEqual({
      heading: "准备清单",
      content: "",
      listItems: ["护照", "SSN 或 ITIN", "美国地址", "电话号码"],
      tone: "checklist",
    });
  });

  it("highlights official reminder paragraphs", () => {
    expect(formatBlogBodyBlock("官方提醒：提交申请前应查看官方页面。")).toMatchObject({
      heading: "官方提醒",
      tone: "notice",
    });
  });

  it("formats English and Spanish checklist and reminder headings", () => {
    expect(formatBlogBodyBlock("Preparation checklist: Passport, address proof, DMV appointment.")).toMatchObject({
      heading: "Preparation checklist",
      listItems: ["Passport", "address proof", "DMV appointment"],
      tone: "checklist",
    });

    expect(formatBlogBodyBlock("Official reminder: Confirm details with DMV.")).toMatchObject({
      heading: "Official reminder",
      tone: "notice",
    });

    expect(formatBlogBodyBlock("Recordatorio oficial: Confirma los requisitos actuales.")).toMatchObject({
      heading: "Recordatorio oficial",
      tone: "notice",
    });
  });

  it("highlights common mistake headings across supported languages", () => {
    expect(formatBlogBodyBlock("常见错误：只带复印件，没有原件。")).toMatchObject({
      heading: "常见错误",
      tone: "warning",
    });

    expect(formatBlogBodyBlock("Common mistakes: bringing copies without originals.")).toMatchObject({
      heading: "Common mistakes",
      tone: "warning",
    });

    expect(formatBlogBodyBlock("Errores comunes: llevar copias sin originales.")).toMatchObject({
      heading: "Errores comunes",
      tone: "warning",
    });
  });
});
