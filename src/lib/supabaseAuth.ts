import { AuthUser, createRandomAvatar } from "./authStore";

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
}

export interface ProfileInsertRow {
  id: string;
  name: string;
  avatar_url: string;
}

export function mapSupabaseUser(input: {
  user: SupabaseUserLike;
  profile: ProfileRow | null;
  savedGuideIds: string[];
}): AuthUser {
  const metadataName = typeof input.user.user_metadata?.name === "string" ? input.user.user_metadata.name : "";
  const metadataAvatar =
    typeof input.user.user_metadata?.avatar_url === "string" ? input.user.user_metadata.avatar_url : "";
  const name = input.profile?.name || metadataName || input.user.email?.split("@")[0] || "CaliGuide Member";
  const avatarUrl = input.profile?.avatar_url || metadataAvatar || createRandomAvatar(name);
  const memberSinceDate = input.profile?.member_since || input.user.created_at || new Date().toISOString();

  return {
    id: input.user.id,
    name,
    email: input.user.email ?? "",
    avatarUrl,
    memberSince: formatMemberSince(memberSinceDate),
    savedGuideIds: input.savedGuideIds,
  };
}

export function profileInsertFromRegistration(input: {
  id: string;
  name: string;
  avatarUrl: string;
}): ProfileInsertRow {
  return {
    id: input.id,
    name: input.name.trim(),
    avatar_url: input.avatarUrl,
  };
}

export function formatSupabaseAuthError(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "Something went wrong";
  const normalized = message.toLowerCase();

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

function formatMemberSince(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}
