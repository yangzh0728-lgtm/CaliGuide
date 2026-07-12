import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ArrivalStatusOption, AuthUser, createRandomAvatar, SexOption } from "../lib/authStore";
import {
  buildOAuthRedirectUrl,
  buildPasswordResetRedirectUrl,
  formatSupabaseAuthError,
  hasCompleteCaliGuideProfile,
  mapSupabaseUser,
  ProfileRow,
  requiresEmailConfirmationAfterSignUp,
} from "../lib/supabaseAuth";
import { supabase } from "../lib/supabaseClient";
import { ensureUserMediaStructure } from "../lib/userMediaStructure";
import { formatNationalities, normalizeNationalities } from "../lib/nationalities";
import type { ForumTranslationLanguage } from "../lib/forumTranslation";

type RegistrationProfileInput = {
  name: string;
  dateOfBirth: string;
  sex: SexOption;
  nationalities: string[];
  currentLocation: string;
  arrivalStatus: ArrivalStatusOption;
};

interface AuthContextValue {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  register: (input: RegistrationProfileInput & {
    email: string;
    password: string;
  }) => Promise<{ confirmationRequired: boolean }>;
  login: (input: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: (input?: RegistrationProfileInput) => Promise<void>;
  requestPasswordReset: (input: { email: string }) => Promise<void>;
  resetRecoveredPassword: (input: { newPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateAccount: (input: {
    name: string;
    email: string;
    avatarUrl: string;
    dateOfBirth: string;
    sex: SexOption;
    nationalities: string[];
    currentLocation: string;
    arrivalStatus: ArrivalStatusOption;
    forumTranslationLanguage: ForumTranslationLanguage;
  }) => Promise<void>;
  updatePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  saveGuide: (guideId: string) => Promise<void>;
  removeSavedGuide: (guideId: string) => Promise<void>;
  isGuideSaved: (guideId: string) => boolean;
  savePost: (postId: string) => Promise<void>;
  removeSavedPost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GOOGLE_PROFILE_DRAFT_STORAGE_KEY = "caliguide-google-profile-draft";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (data.session?.user) {
        setCurrentUser(await loadAuthUserAndEnsureMediaStructure(data.session.user, data.session.access_token));
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }

      if (!session?.user) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      void loadAuthUserAndEnsureMediaStructure(session.user, session.access_token).then((user) => {
        if (isMounted) {
          setCurrentUser(user);
          setIsLoading(false);
        }
      });
    });

    void loadInitialSession();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isLoading,
      isPasswordRecovery,
      register: async (input) => {
        const name = input.name.trim();
        const email = input.email.trim().toLowerCase();
        const password = input.password.trim();
        const dateOfBirth = input.dateOfBirth.trim();
        const nationalities = normalizeNationalities(input.nationalities);
        const countryNationality = formatNationalities(nationalities);
        const currentLocation = input.currentLocation.trim();

        if (!name) {
          throw new Error("Name is required");
        }
        if (!email.includes("@")) {
          throw new Error("Enter a valid email");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (!dateOfBirth || Number.isNaN(new Date(`${dateOfBirth}T00:00:00.000Z`).getTime())) {
          throw new Error("Enter a valid date of birth");
        }
        if (new Date(`${dateOfBirth}T00:00:00.000Z`) > new Date()) {
          throw new Error("Enter a valid date of birth");
        }
        if (!nationalities.length) {
          throw new Error("Country / nationality is required");
        }
        if (!currentLocation) {
          throw new Error("Current state/city is required");
        }

        const avatarUrl = createRandomAvatar(name);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              avatar_url: avatarUrl,
              date_of_birth: dateOfBirth,
              sex: input.sex,
              nationalities,
              country_nationality: countryNationality,
              current_location: currentLocation,
              arrival_status: input.arrivalStatus,
            },
          },
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
        if (!data.user) {
          throw new Error("Unable to create account");
        }

        if (requiresEmailConfirmationAfterSignUp(data)) {
          setCurrentUser(null);
          return { confirmationRequired: true };
        }

        setCurrentUser(await loadAuthUserAndEnsureMediaStructure(data.user, data.session?.access_token));
        return { confirmationRequired: false };
      },
      login: async (input) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email.trim().toLowerCase(),
          password: input.password,
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
        if (!data.user) {
          throw new Error("Unable to sign in");
        }

        setCurrentUser(await loadAuthUserAndEnsureMediaStructure(data.user, data.session?.access_token));
      },
      loginWithGoogle: async (input) => {
        if (input) {
          const profileDraft = validateRegistrationProfileInput(input);
          saveGoogleProfileDraft(profileDraft);
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: buildOAuthRedirectUrl(window.location.href),
            queryParams: {
              prompt: "select_account",
            },
          },
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
      },
      requestPasswordReset: async (input) => {
        const email = input.email.trim().toLowerCase();

        if (!email.includes("@")) {
          throw new Error("Enter a valid email");
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: buildPasswordResetRedirectUrl(window.location.href),
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
      },
      resetRecoveredPassword: async (input) => {
        const newPassword = input.newPassword.trim();

        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }

        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }

        setIsPasswordRecovery(false);
        if (data.user) {
          setCurrentUser(await loadAuthUser(data.user));
        }
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
        setCurrentUser(null);
        setIsPasswordRecovery(false);
      },
      updateAccount: async (input) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const name = input.name.trim();
        const email = input.email.trim().toLowerCase();
        const avatarUrl = input.avatarUrl.trim();
        const dateOfBirth = input.dateOfBirth.trim();
        const nationalities = normalizeNationalities(input.nationalities);
        const countryNationality = formatNationalities(nationalities);
        const currentLocation = input.currentLocation.trim();

        if (!name) {
          throw new Error("Name is required");
        }
        if (!email.includes("@")) {
          throw new Error("Enter a valid email");
        }
        if (!avatarUrl) {
          throw new Error("Profile picture is required");
        }
        if (!dateOfBirth || Number.isNaN(new Date(`${dateOfBirth}T00:00:00.000Z`).getTime())) {
          throw new Error("Enter a valid date of birth");
        }
        if (new Date(`${dateOfBirth}T00:00:00.000Z`) > new Date()) {
          throw new Error("Enter a valid date of birth");
        }
        if (!nationalities.length) {
          throw new Error("Country / nationality is required");
        }
        if (!currentLocation) {
          throw new Error("Current state/city is required");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            name,
            avatar_url: avatarUrl,
            date_of_birth: dateOfBirth,
            sex: input.sex,
            nationalities,
            country_nationality: countryNationality,
            current_location: currentLocation,
            arrival_status: input.arrivalStatus,
            forum_translation_language: input.forumTranslationLanguage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.id);

        if (profileError) {
          throw new Error(profileError.message);
        }

        const { data, error: userError } = await supabase.auth.updateUser({
          ...(email !== currentUser.email ? { email } : {}),
          data: {
            name,
            avatar_url: avatarUrl,
            date_of_birth: dateOfBirth,
            sex: input.sex,
            nationalities,
            country_nationality: countryNationality,
            current_location: currentLocation,
            arrival_status: input.arrivalStatus,
            forum_translation_language: input.forumTranslationLanguage,
          },
        });

        if (userError) {
          throw new Error(formatSupabaseAuthError(userError));
        }

        setCurrentUser(await loadAuthUser(data.user));
      },
      updatePassword: async (input) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const newPassword = input.newPassword.trim();
        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }

        const { error: credentialError } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: input.currentPassword,
        });

        if (credentialError) {
          throw new Error("Current password is incorrect");
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
      },
      saveGuide: async (guideId) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const normalizedGuideId = guideId.trim();
        if (!normalizedGuideId) {
          throw new Error("Guide is required");
        }

        const { error } = await supabase
          .from("saved_guides")
          .upsert({ user_id: currentUser.id, guide_id: normalizedGuideId }, { onConflict: "user_id,guide_id" });

        if (error) {
          throw new Error(error.message);
        }

        setCurrentUser({
          ...currentUser,
          savedGuideIds: currentUser.savedGuideIds.includes(normalizedGuideId)
            ? currentUser.savedGuideIds
            : [...currentUser.savedGuideIds, normalizedGuideId],
        });
      },
      removeSavedGuide: async (guideId) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const { error } = await supabase
          .from("saved_guides")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("guide_id", guideId);

        if (error) {
          throw new Error(error.message);
        }

        setCurrentUser({
          ...currentUser,
          savedGuideIds: currentUser.savedGuideIds.filter((savedGuideId) => savedGuideId !== guideId),
        });
      },
      isGuideSaved: (guideId) => currentUser?.savedGuideIds.includes(guideId) ?? false,
      savePost: async (postId) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const normalizedPostId = postId.trim();
        if (!normalizedPostId) {
          throw new Error("Post is required");
        }

        const { error } = await supabase
          .from("saved_forum_posts")
          .upsert({ user_id: currentUser.id, post_id: normalizedPostId }, { onConflict: "user_id,post_id" });

        if (error) {
          throw new Error(formatSavedForumPostError(error.message));
        }

        setCurrentUser({
          ...currentUser,
          savedPostIds: currentUser.savedPostIds.includes(normalizedPostId)
            ? currentUser.savedPostIds
            : [...currentUser.savedPostIds, normalizedPostId],
        });
      },
      removeSavedPost: async (postId) => {
        if (!currentUser) {
          throw new Error("Sign in required");
        }

        const { error } = await supabase
          .from("saved_forum_posts")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("post_id", postId);

        if (error) {
          throw new Error(formatSavedForumPostError(error.message));
        }

        setCurrentUser({
          ...currentUser,
          savedPostIds: currentUser.savedPostIds.filter((savedPostId) => savedPostId !== postId),
        });
      },
      isPostSaved: (postId) => currentUser?.savedPostIds.includes(postId) ?? false,
    }),
    [currentUser, isLoading, isPasswordRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function loadAuthUserAndEnsureMediaStructure(
  user: Parameters<typeof mapSupabaseUser>[0]["user"],
  accessToken?: string,
): Promise<AuthUser> {
  let authUser = await loadAuthUser(user);
  const pendingGoogleProfile = readGoogleProfileDraft();

  if (pendingGoogleProfile && !hasCompleteCaliGuideProfile(authUser)) {
    try {
      await applyGoogleProfileDraft(user, pendingGoogleProfile);
      clearGoogleProfileDraft();
      authUser = await loadAuthUser(user);
    } catch (error) {
      console.warn("Unable to apply Google profile draft:", error);
    }
  } else if (pendingGoogleProfile) {
    clearGoogleProfileDraft();
  }

  if (accessToken) {
    void ensureUserMediaStructure(accessToken).catch((error) => {
      console.warn("Unable to prepare user media folders:", error);
    });
  }

  return authUser;
}

function validateRegistrationProfileInput(input: RegistrationProfileInput): RegistrationProfileInput {
  const name = input.name.trim();
  const dateOfBirth = input.dateOfBirth.trim();
  const nationalities = normalizeNationalities(input.nationalities);
  const currentLocation = input.currentLocation.trim();

  if (!name) {
    throw new Error("Name is required");
  }
  if (!dateOfBirth || Number.isNaN(new Date(`${dateOfBirth}T00:00:00.000Z`).getTime())) {
    throw new Error("Enter a valid date of birth");
  }
  if (new Date(`${dateOfBirth}T00:00:00.000Z`) > new Date()) {
    throw new Error("Enter a valid date of birth");
  }
  if (!nationalities.length) {
    throw new Error("Country / nationality is required");
  }
  if (!currentLocation) {
    throw new Error("Current state/city is required");
  }

  return {
    name,
    dateOfBirth,
    sex: input.sex,
    nationalities,
    currentLocation,
    arrivalStatus: input.arrivalStatus,
  };
}

function saveGoogleProfileDraft(input: RegistrationProfileInput) {
  window.localStorage.setItem(
    GOOGLE_PROFILE_DRAFT_STORAGE_KEY,
    JSON.stringify({ ...input, savedAt: new Date().toISOString() }),
  );
}

function readGoogleProfileDraft(): RegistrationProfileInput | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = window.localStorage.getItem(GOOGLE_PROFILE_DRAFT_STORAGE_KEY);
  if (!rawDraft) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawDraft) as Partial<RegistrationProfileInput> & { savedAt?: string };
    const savedAt = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
    const isFresh = savedAt > Date.now() - 30 * 60 * 1000;

    if (!isFresh) {
      clearGoogleProfileDraft();
      return null;
    }

    return validateRegistrationProfileInput({
      name: String(parsed.name ?? ""),
      dateOfBirth: String(parsed.dateOfBirth ?? ""),
      sex: parsed.sex === "male" || parsed.sex === "female" ? parsed.sex : "prefer_not_to_say",
      nationalities: Array.isArray(parsed.nationalities) ? parsed.nationalities.map(String) : [],
      currentLocation: String(parsed.currentLocation ?? ""),
      arrivalStatus:
        parsed.arrivalStatus === "arrived" || parsed.arrivalStatus === "long_term_resident"
          ? parsed.arrivalStatus
          : "planning",
    });
  } catch {
    clearGoogleProfileDraft();
    return null;
  }
}

function clearGoogleProfileDraft() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(GOOGLE_PROFILE_DRAFT_STORAGE_KEY);
  }
}

async function applyGoogleProfileDraft(
  user: Parameters<typeof mapSupabaseUser>[0]["user"],
  input: RegistrationProfileInput,
) {
  const nationalities = normalizeNationalities(input.nationalities);
  const countryNationality = formatNationalities(nationalities);
  const metadataAvatar =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : createRandomAvatar(input.name);

  const profileValues = {
    name: input.name,
    avatar_url: metadataAvatar,
    date_of_birth: input.dateOfBirth,
    sex: input.sex,
    nationalities,
    country_nationality: countryNationality,
    current_location: input.currentLocation,
    arrival_status: input.arrivalStatus,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedProfile, error: profileError } = await supabase
    .from("profiles")
    .update(profileValues)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!updatedProfile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      ...profileValues,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { error: userError } = await supabase.auth.updateUser({
    data: {
      name: input.name,
      avatar_url: metadataAvatar,
      date_of_birth: input.dateOfBirth,
      sex: input.sex,
      nationalities,
      country_nationality: countryNationality,
      current_location: input.currentLocation,
      arrival_status: input.arrivalStatus,
    },
  });

  if (userError) {
    throw new Error(formatSupabaseAuthError(userError));
  }
}

async function loadAuthUser(user: Parameters<typeof mapSupabaseUser>[0]["user"]): Promise<AuthUser> {
  const [{ data: profile }, { data: savedGuides }, { data: savedPosts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,avatar_url,member_since,date_of_birth,sex,nationalities,country_nationality,current_location,arrival_status,forum_translation_language")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>(),
    supabase.from("saved_guides").select("guide_id").eq("user_id", user.id),
    supabase.from("saved_forum_posts").select("post_id").eq("user_id", user.id),
  ]);

  return mapSupabaseUser({
    user,
    profile: profile ?? null,
    savedGuideIds: savedGuides?.map((savedGuide) => savedGuide.guide_id) ?? [],
    savedPostIds: savedPosts?.map((savedPost) => savedPost.post_id) ?? [],
  });
}

function formatSavedForumPostError(message: string) {
  if (
    message.includes("saved_forum_posts") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  ) {
    return "Saved posts table is not installed. Run supabase/saved-forum-posts.sql in Supabase SQL Editor.";
  }

  return message;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
