import { expect, test } from "bun:test";
import { blankOptionalProfile, buildOptionalProfileUpdate, missingProfileFields, shouldOfferProfileReminder, reminderPreference } from "./optionalProfile";
import { mapSupabaseUser } from "./supabaseAuth";

const reader = (metadata: Record<string, unknown> = {}) => mapSupabaseUser({
  user: { id: "reader", user_metadata: metadata }, profile: null, savedGuideIds: [], savedPostIds: [],
});

test("blank optional fields never invent answers", () => {
  expect(buildOptionalProfileUpdate(blankOptionalProfile())).toEqual({ profile: {}, metadata: {} });
  expect(missingProfileFields(reader())).toHaveLength(6);
});

test("partial answers are trimmed and explicit non-disclosure counts as answered", () => {
  const patch = buildOptionalProfileUpdate({ ...blankOptionalProfile(), name: " River ", sex: "prefer_not_to_say", arrivalStatus: "planning" });
  expect(patch.profile).toEqual({ name: "River", sex: "prefer_not_to_say", arrival_status: "planning" });
  const user = reader(patch.metadata);
  expect(missingProfileFields(user)).toEqual(["dateOfBirth", "nationalities", "currentLocation"]);
});

test("optional fields validate only supplied values", () => {
  for (const dateOfBirth of ["2026-02-30", "2999-01-01", "invalid"])
    expect(() => buildOptionalProfileUpdate({ ...blankOptionalProfile(), dateOfBirth })).toThrow();
  expect(buildOptionalProfileUpdate({ ...blankOptionalProfile(), dateOfBirth: "1994-03-12", nationalities: ["Canada", "Canada"] }).profile)
    .toEqual({ date_of_birth: "1994-03-12", nationalities: ["Canada"], country_nationality: "Canada" });
});

test("reminders honor account-level snooze, permanent dismissal, and completeness", () => {
  const now = Date.parse("2026-09-08T12:00:00Z");
  expect(shouldOfferProfileReminder(reader(), now)).toBe(true);
  expect(shouldOfferProfileReminder(reader(reminderPreference("later", now)), now)).toBe(false);
  expect(shouldOfferProfileReminder(reader(reminderPreference("later", now)), now + 31 * 86400000)).toBe(true);
  expect(shouldOfferProfileReminder(reader(reminderPreference("never", now)), now + 365 * 86400000)).toBe(false);
  const complete = buildOptionalProfileUpdate({ name: "River", dateOfBirth: "1994-03-12", sex: "prefer_not_to_say", nationalities: ["Canada"], currentLocation: "Los Angeles, CA", arrivalStatus: "arrived" });
  expect(shouldOfferProfileReminder(reader(complete.metadata), now)).toBe(false);
});
