import { describe, expect, it } from "bun:test";
import { getR2MockObjects } from "./r2MockStructure";

describe("r2MockStructure", () => {
  it("creates JSON placeholders for the planned R2 folder structure", () => {
    const objects = getR2MockObjects({
      userId: "user-demo-1",
      postId: "post-demo-1",
      guideId: "guide-dmv-checklist",
    });

    expect(objects.map((item) => item.key)).toEqual([
      "assets/users/user-demo-1/profile/mock-profile.json",
      "assets/users/user-demo-1/forum/post-demo-1/mock-forum-image.json",
      "assets/users/user-demo-1/chat/mock-chat-attachment.json",
      "assets/platform/guide/guide-dmv-checklist/mock-guide-image.json",
      "assets/platform/public/mock-logo.json",
    ]);

    expect(objects.every((item) => item.contentType === "application/json")).toBe(true);
    expect(objects[0].body).toContain('"folder": "profile"');
  });
});
