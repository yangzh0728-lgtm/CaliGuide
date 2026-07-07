import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, createRandomAvatar, SexOption } from "../lib/authStore";
import {
  buildPasswordResetRedirectUrl,
  formatSupabaseAuthError,
  mapSupabaseUser,
  ProfileRow,
  requiresEmailConfirmationAfterSignUp,
} from "../lib/supabaseAuth";
import { supabase } from "../lib/supabaseClient";
import { ensureUserMediaStructure } from "../lib/userMediaStructure";

interface AuthContextValue {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    sex: SexOption;
  }) => Promise<{ confirmationRequired: boolean }>;
  login: (input: { email: string; password: string }) => Promise<void>;
  requestPasswordReset: (input: { email: string }) => Promise<void>;
  resetRecoveredPassword: (input: { newPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateAccount: (input: { name: string; avatarUrl: string }) => Promise<void>;
  updatePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  saveGuide: (guideId: string) => Promise<void>;
  removeSavedGuide: (guideId: string) => Promise<void>;
  isGuideSaved: (guideId: string) => boolean;
  savePost: (postId: string) => Promise<void>;
  removeSavedPost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
        const avatarUrl = input.avatarUrl.trim();

        if (!name) {
          throw new Error("Name is required");
        }
        if (!avatarUrl) {
          throw new Error("Profile picture is required");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ name, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
          .eq("id", currentUser.id);

        if (profileError) {
          throw new Error(profileError.message);
        }

        const { data, error: userError } = await supabase.auth.updateUser({
          data: { name, avatar_url: avatarUrl },
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
  const authUser = await loadAuthUser(user);

  if (accessToken) {
    void ensureUserMediaStructure(accessToken).catch((error) => {
      console.warn("Unable to prepare user media folders:", error);
    });
  }

  return authUser;
}

async function loadAuthUser(user: Parameters<typeof mapSupabaseUser>[0]["user"]): Promise<AuthUser> {
  const [{ data: profile }, { data: savedGuides }, { data: savedPosts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,avatar_url,member_since,date_of_birth,sex")
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
