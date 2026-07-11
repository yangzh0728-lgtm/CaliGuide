import { describe, expect, it } from "bun:test";
import { MAX_FORUM_POST_IMAGES, mergeForumPostImageSelection } from "./forumImageSelection";

describe("forumImageSelection", () => {
  it("adds selected images and caps the composer at eight files", () => {
    const existing = [
      new File(["one"], "one.png", { type: "image/png" }),
      new File(["two"], "two.png", { type: "image/png" }),
    ];
    const selected = Array.from({ length: 10 }, (_, index) =>
      new File([String(index)], `selected-${index}.jpg`, { type: "image/jpeg" }),
    );

    const merged = mergeForumPostImageSelection(existing, selected);

    expect(merged).toHaveLength(MAX_FORUM_POST_IMAGES);
    expect(merged.slice(0, 2).map((file) => file.name)).toEqual(["one.png", "two.png"]);
    expect(merged.at(-1)?.name).toBe("selected-5.jpg");
  });

  it("keeps the current images when the picker returns no files", () => {
    const existing = [new File(["one"], "one.png", { type: "image/png" })];

    expect(mergeForumPostImageSelection(existing, null)).toBe(existing);
  });
});
