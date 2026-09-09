import { expect, test } from "bun:test";
import { avatarInitials, createDefaultAvatar, resolveProfileAvatar } from "./defaultAvatar";

test("defaults stay stable and use readable initials across names", () => {
  expect(createDefaultAvatar("Yang")).toBe(createDefaultAvatar("Yang"));
  expect(avatarInitials("Elena Rodriguez")).toBe("ER");
  expect(avatarInitials("楊 明")).toBe("楊明");
  expect(avatarInitials("CaliGuide Member")).toBe("CG");
  expect(avatarInitials("")).toBe("CG");
  expect(decodeURIComponent(createDefaultAvatar("<script>"))).not.toContain("<script>");
});

test("only recognized preset images are replaced", () => {
  const data = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const legacy = data('<svg viewBox="0 0 200 200"><circle cx="100" cy="144" r="24"/><path d="M45 178 Q100 126 155 178"/></svg>');
  const databaseDefault = data('<svg viewBox="0 0 96 96"><path d="M24 80c4-18 16-28 24-28s20 10 24 28"/></svg>');
  expect(resolveProfileAvatar(legacy, "Yang")).toBe(createDefaultAvatar("Yang"));
  expect(resolveProfileAvatar(databaseDefault, "Yang")).toBe(createDefaultAvatar("Yang"));
  expect(resolveProfileAvatar(createDefaultAvatar("Old Name"), "New Name")).toBe(createDefaultAvatar("New Name"));
  for (const custom of ["https://example.com/photo.jpg", data('<svg><circle r="20"/></svg>'), "data:image/svg+xml,%invalid"])
    expect(resolveProfileAvatar(custom, "Yang")).toBe(custom);
});
