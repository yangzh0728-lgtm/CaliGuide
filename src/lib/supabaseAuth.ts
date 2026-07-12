import { ArrivalStatusOption, AuthUser, createRandomAvatar, SexOption } from "./authStore";
import { formatNationalities, normalizeNationalities } from "./nationalities";
import { type ForumTranslationLanguage, normalizeForumTranslationLanguage } from "./forumTranslation";

export interface SupabaseUserLike {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}

export interface ProfileRow {
  id: string;
  name: string;
  avatar_url: string | null;
  member_since: string | null;
  date_of_birth: string | null;
  sex: SexOption | null;
  nationalities?: string[] | null;
  country_nationality: string | null;
  current_location: string | null;
  arrival_status: ArrivalStatusOption | null;
  forum_translation_language?: ForumTranslationLanguage | null;
}

export interface SignUpResultLike {
  session?: unknown | null;
}

export function mapSupabaseUser(input: {
  user: SupabaseUserLike;
  profile: ProfileRow | null;
  savedGuideIds: string[];
  savedPostIds: string[];
}): AuthUser {
  const metadataName = typeof input.user.user_metadata?.name === "string" ? input.user.user_metadata.name : "";
  const metadataAvatar =
    typeof input.user.user_metadata?.avatar_url === "string" ? input.user.user_metadata.avatar_url : "";
  const name = input.profile?.name || metadataName || input.user.email?.split("@")[0] || "CaliGuide Member";
  const avatarUrl = input.profile?.avatar_url || metadataAvatar || createRandomAvatar(name);
  const memberSinceDate = input.profile?.member_since || input.user.created_at || new Date().toISOString();
  const metadataDateOfBirth =
    typeof input.user.user_metadata?.date_of_birth === "string" ? input.user.user_metadata.date_of_birth : null;
  const metadataSex = normalizeSex(input.user.user_metadata?.sex);
  const metadataCountryNationality =
    typeof input.user.user_metadata?.country_nationality === "string"
      ? input.user.user_metadata.country_nationality
      : "";
  const metadataNationalities = normalizeNationalities(
    input.user.user_metadata?.nationalities,
    metadataCountryNationality,
  );
  const metadataCurrentLocation =
    typeof input.user.user_metadata?.current_location === "string" ? input.user.user_metadata.current_location : "";
  const metadataArrivalStatus = normalizeArrivalStatus(input.user.user_metadata?.arrival_status);
  const metadataForumTranslationLanguage = normalizeForumTranslationLanguage(
    input.user.user_metadata?.forum_translation_language,
  );

  const profileNationalities = normalizeNationalities(input.profile?.nationalities, input.profile?.country_nationality);
  const nationalities = profileNationalities.length ? profileNationalities : metadataNationalities;

  return {
    id: input.user.id,
    name,
    email: input.user.email ?? "",
    avatarUrl,
    memberSince: formatMemberSince(memberSinceDate),
    dateOfBirth: input.profile?.date_of_birth ?? metadataDateOfBirth,
    sex: normalizeSex(input.profile?.sex ?? metadataSex),
    nationalities,
    countryNationality: formatNationalities(nationalities),
    currentLocation: input.profile?.current_location ?? metadataCurrentLocation,
    arrivalStatus: normalizeArrivalStatus(input.profile?.arrival_status ?? metadataArrivalStatus),
    forumTranslationLanguage: normalizeForumTranslationLanguage(
      input.profile?.forum_translation_language ?? metadataForumTranslationLanguage,
    ),
    savedGuideIds: input.savedGuideIds,
    savedPostIds: input.savedPostIds,
  };
}

export function formatSupabaseAuthError(error: { message?: string } | null | undefined) {
  const message = error?.message?.trim() || "Something went wrong";
  const normalized = message.toLowerCase();

  if (normalized.includes("database error saving new user")) {
    return "Account setup is not ready. Run the latest Supabase profile SQL, then try again.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "An account with this email already exists";
  }
  if (normalized.includes("password")) {
    return message;
  }

  return message;
}

export function buildPasswordResetRedirectUrl(currentUrl: string) {
  const url = new URL(currentUrl);
  return `${url.origin}/?password-recovery=1`;
}

export function buildOAuthRedirectUrl(currentUrl: string) {
  const url = new URL(currentUrl);
  return url.origin;
}

export function hasCompleteCaliGuideProfile(user: AuthUser) {
  return Boolean(
    user.name.trim() &&
      user.email.trim() &&
      user.dateOfBirth &&
      user.nationalities.length &&
      user.currentLocation.trim() &&
      (user.arrivalStatus === "planning" ||
        user.arrivalStatus === "arrived" ||
        user.arrivalStatus === "long_term_resident"),
  );
}

export function requiresEmailConfirmationAfterSignUp(data: SignUpResultLike) {
  return !data.session;
}

function formatMemberSince(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function normalizeSex(value: unknown): SexOption {
  return value === "male" || value === "female" || value === "prefer_not_to_say" ? value : "prefer_not_to_say";
}

function normalizeArrivalStatus(value: unknown): ArrivalStatusOption {
  return value === "planning" || value === "arrived" || value === "long_term_resident" ? value : "planning";
}
