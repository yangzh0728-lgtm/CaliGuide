import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ChatMessageContent from "./ChatMessageContent";

function render(content: string) {
  return renderToStaticMarkup(<ChatMessageContent content={content} />);
}

describe("ChatMessageContent", () => {
  it("renders plain text without markdown syntax", () => {
    const markup = render("Bring your **passport** today.");

    expect(markup).toContain("passport");
    expect(markup).toContain("<strong");
    expect(markup).not.toContain("**");
  });

  it("renders dash bullets as a list", () => {
    const markup = render("- **H-1B** - work visa\n- **J-1** - exchange visitor");

    expect(markup).toContain("<ul");
    expect(markup).toContain("<li");
    expect(markup).not.toContain("- **");
  });

  it("renders numbered lists as an ordered list", () => {
    const markup = render("1. Book the appointment\n2. Bring both documents");

    expect(markup).toContain("<ol");
    expect(markup).toContain("Book the appointment");
  });

  it("renders nothing for empty content", () => {
    expect(render("   ")).toBe("");
  });

  it("escapes HTML rather than injecting it", () => {
    const markup = render("<img src=x onerror=alert(1)>");

    expect(markup).not.toContain("<img");
    expect(markup).toContain("&lt;img");
  });

  it("keeps paragraphs and lists in source order", () => {
    const markup = render("Common options:\n- H-1B\n\nCheck the official site.");

    expect(markup.indexOf("Common options:")).toBeLessThan(markup.indexOf("<ul"));
    expect(markup.indexOf("<ul")).toBeLessThan(markup.indexOf("Check the official site."));
  });
});
