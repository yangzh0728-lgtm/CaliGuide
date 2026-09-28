import { expect, test } from "bun:test";
import { PASSWORD_PATTERN, validateNewPassword } from "./passwordPolicy";

test("counts supplementary Unicode characters consistently with the browser pattern", () => {
  const short = "Abcdef\u{1F600}";
  const valid = "Abcdefg\u{1F600}";
  const pattern = new RegExp(`^(?:${PASSWORD_PATTERN})$`, "u");
  expect(pattern.test(short)).toBe(false);
  expect(() => validateNewPassword(short)).toThrow("at least 8 characters");
  expect(pattern.test(valid)).toBe(true);
  expect(() => validateNewPassword(valid)).not.toThrow();
});
