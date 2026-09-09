import { describe, expect, it } from "bun:test";
import { formatChatMessage } from "./chatMessageFormat";

describe("formatChatMessage", () => {
  it("returns no blocks for empty content", () => {
    expect(formatChatMessage("")).toEqual([]);
    expect(formatChatMessage("   \n  ")).toEqual([]);
  });

  it("keeps plain text as a single paragraph", () => {
    expect(formatChatMessage("You need two proofs of address.")).toEqual([
      { type: "paragraph", inlines: [{ type: "text", text: "You need two proofs of address." }] },
    ]);
  });

  it("splits bold markers into separate inline runs", () => {
    expect(formatChatMessage("Bring your **passport** today.")).toEqual([
      {
        type: "paragraph",
        inlines: [
          { type: "text", text: "Bring your " },
          { type: "bold", text: "passport" },
          { type: "text", text: " today." },
        ],
      },
    ]);
  });

  it("treats triple asterisks as bold", () => {
    expect(formatChatMessage("***REAL ID***")).toEqual([
      { type: "paragraph", inlines: [{ type: "bold", text: "REAL ID" }] },
    ]);
  });

  it("leaves an unmatched asterisk run as literal text", () => {
    expect(formatChatMessage("2 ** 3 is not bold")).toEqual([
      { type: "paragraph", inlines: [{ type: "text", text: "2 ** 3 is not bold" }] },
    ]);
  });

  it("groups dash bullets into one unordered list", () => {
    const blocks = formatChatMessage("- **H-1B** - work visa\n- **J-1** - exchange visitor");

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: false,
      items: [
        [
          { type: "bold", text: "H-1B" },
          { type: "text", text: " - work visa" },
        ],
        [
          { type: "bold", text: "J-1" },
          { type: "text", text: " - exchange visitor" },
        ],
      ],
    });
  });

  it("recognizes asterisk bullets", () => {
    const blocks = formatChatMessage("* first\n* second");

    expect(blocks[0]).toMatchObject({ type: "list", ordered: false });
    expect((blocks[0] as { items: unknown[] }).items).toHaveLength(2);
  });

  it("recognizes numbered lists as ordered", () => {
    const blocks = formatChatMessage("1. Book the appointment\n2. Bring both documents");

    expect(blocks[0]).toEqual({
      type: "list",
      ordered: true,
      items: [
        [{ type: "text", text: "Book the appointment" }],
        [{ type: "text", text: "Bring both documents" }],
      ],
    });
  });

  it("separates a paragraph from a following list", () => {
    const blocks = formatChatMessage("Common options:\n- H-1B\n- J-1\n\nCheck the official site.");

    expect(blocks.map((block) => block.type)).toEqual(["paragraph", "list", "paragraph"]);
  });

  it("joins wrapped lines into one paragraph", () => {
    expect(formatChatMessage("This sentence\nwraps across lines.")).toEqual([
      { type: "paragraph", inlines: [{ type: "text", text: "This sentence wraps across lines." }] },
    ]);
  });

  it("strips heading markers but keeps the text", () => {
    expect(formatChatMessage("## Visa options")).toEqual([
      { type: "paragraph", inlines: [{ type: "bold", text: "Visa options" }] },
    ]);
  });

  it("ignores blank lines between blocks", () => {
    const blocks = formatChatMessage("First.\n\n\nSecond.");
    expect(blocks).toHaveLength(2);
  });
});
