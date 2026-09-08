import type { AuthUser, ArrivalStatusOption, SexOption } from "./authStore";
import { normalizeNationalities, formatNationalities } from "./nationalities";
import { needsDisplayName } from "./progressiveProfile";

export type OptionalProfileValues = {
  name: string; dateOfBirth: string; sex: SexOption | ""; nationalities: string[];
  currentLocation: string; arrivalStatus: ArrivalStatusOption | "";
};
export type OptionalProfileField = keyof OptionalProfileValues;
export const OPTIONAL_PROFILE_FIELDS: OptionalProfileField[] = ["name", "dateOfBirth", "sex", "nationalities", "currentLocation", "arrivalStatus"];
export const blankOptionalProfile = (): OptionalProfileValues => ({ name: "", dateOfBirth: "", sex: "", nationalities: [], currentLocation: "", arrivalStatus: "" });

export function buildOptionalProfileUpdate(input: OptionalProfileValues) {
  const profile: Record<string, unknown> = {};
  const metadata: Record<string, unknown> = {};
  const name = input.name.trim();
  if (name.length > 80) throw new Error("Name is required");
  if (name) profile.name = name;
  const date = input.dateOfBirth.trim();
  if (date) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || parsed > new Date())
      throw new Error("Enter a valid date of birth");
    profile.date_of_birth = date;
  }
  if (input.sex) {
    if (!["male", "female", "prefer_not_to_say"].includes(input.sex)) throw new Error("Invalid profile value");
    profile.sex = input.sex;
    metadata.sex_provided = true;
  }
  const nationalities = normalizeNationalities(input.nationalities);
  if (nationalities.length) {
    profile.nationalities = nationalities;
    profile.country_nationality = formatNationalities(nationalities);
  }
  const location = input.currentLocation.trim();
  if (location.length > 120) throw new Error("Invalid profile value");
  if (location) profile.current_location = location;
  if (input.arrivalStatus) {
    if (!["planning", "arrived", "long_term_resident"].includes(input.arrivalStatus)) throw new Error("Choose an arrival stage");
    profile.arrival_status = input.arrivalStatus;
    metadata.arrival_status_provided = true;
  }
  return { profile, metadata: { ...profile, ...metadata } };
}

export function missingProfileFields(user: AuthUser): OptionalProfileField[] {
  return OPTIONAL_PROFILE_FIELDS.filter((field) => {
    switch (field) {
      case "name": return needsDisplayName(user.name);
      case "dateOfBirth": return !user.dateOfBirth;
      case "sex": return !user.sexProvided;
      case "nationalities": return !user.nationalities.length;
      case "currentLocation": return !user.currentLocation.trim();
      case "arrivalStatus": return !user.arrivalStatusProvided;
    }
  });
}

export function shouldOfferProfileReminder(user: AuthUser, now = Date.now()) {
  return !user.profileReminderDismissed && (user.profileReminderAfter ?? 0) <= now && missingProfileFields(user).length > 0;
}

export function reminderPreference(choice: "later" | "never", now = Date.now()) {
  return choice === "never" ? { profile_reminder_dismissed: true }
    : { profile_reminder_after: now + 30 * 24 * 60 * 60 * 1000 };
}
