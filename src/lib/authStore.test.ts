import { describe, expect, test } from "bun:test";
import {
  changePassword,
  createAuthState,
  registerUser,
  removeSavedGuide,
  removeSavedPost,
  saveGuide,
  savePost,
  signInUser,
  updateProfile,
} from "./authStore";

describe("authStore", () => {
  test("registers a user and signs in with the same credentials", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
      dateOfBirth: "1993-04-12",
      sex: "female",
    });

    expect(registered.currentUser?.name).toBe("Maya Chen");
    expect(registered.currentUser?.email).toBe("maya@example.com");
    expect(registered.currentUser?.dateOfBirth).toBe("1993-04-12");
    expect(registered.currentUser?.sex).toBe("female");

    const signedIn = signInUser(
      { ...registered, currentUser: null },
      { email: "maya@example.com", password: "secure123" },
    );

    expect(signedIn.currentUser?.email).toBe("maya@example.com");
  });

  test("assigns a generated cartoon avatar instead of a real photo", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(registered.currentUser?.avatarUrl).toStartWith("data:image/svg+xml");
    expect(registered.currentUser?.avatarUrl).not.toContain("images.unsplash.com");
  });

  test("defaults optional registration demographics for older local auth flows", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(registered.currentUser?.dateOfBirth).toBeNull();
    expect(registered.currentUser?.sex).toBe("prefer_not_to_say");
  });

  test("rejects future dates of birth", () => {
    expect(() =>
      registerUser(createAuthState(), {
        name: "Maya Chen",
        email: "maya@example.com",
        password: "secure123",
        dateOfBirth: "2999-01-01",
        sex: "female",
      }),
    ).toThrow("Enter a valid date of birth");
  });

  test("incorrect login password reports an error without signing in", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(() =>
      signInUser(
        { ...registered, currentUser: null },
        { email: "maya@example.com", password: "wrong-password" },
      ),
    ).toThrow("Email or password is incorrect");
  });

  test("updates the signed-in user's name and avatar", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    const updated = updateProfile(state, {
      name: "Maya C.",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(updated.currentUser?.name).toBe("Maya C.");
    expect(updated.currentUser?.avatarUrl).toBe("https://example.com/avatar.png");
  });

  test("changes password only when the current password matches", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(() =>
      changePassword(state, {
        currentPassword: "wrong",
        newPassword: "newsecure123",
      }),
    ).toThrow("Current password is incorrect");

    const updated = changePassword(state, {
      currentPassword: "secure123",
      newPassword: "newsecure123",
    });

    const signedIn = signInUser(
      { ...updated, currentUser: null },
      { email: "maya@example.com", password: "newsecure123" },
    );

    expect(signedIn.currentUser?.email).toBe("maya@example.com");
  });

  test("saves and removes guides for the signed-in user", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(state.currentUser?.savedGuideIds).toEqual([]);

    const saved = saveGuide(state, "guide-1");
    const savedAgain = saveGuide(saved, "guide-1");

    expect(savedAgain.currentUser?.savedGuideIds).toEqual(["guide-1"]);

    const signedIn = signInUser(
      { ...savedAgain, currentUser: null },
      { email: "maya@example.com", password: "secure123" },
    );

    expect(signedIn.currentUser?.savedGuideIds).toEqual(["guide-1"]);

    const removed = removeSavedGuide(signedIn, "guide-1");

    expect(removed.currentUser?.savedGuideIds).toEqual([]);
  });

  test("saves and removes forum posts for the signed-in user", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(state.currentUser?.savedPostIds).toEqual([]);

    const saved = savePost(state, "post-1");
    const savedAgain = savePost(saved, "post-1");

    expect(savedAgain.currentUser?.savedPostIds).toEqual(["post-1"]);

    const signedIn = signInUser(
      { ...savedAgain, currentUser: null },
      { email: "maya@example.com", password: "secure123" },
    );

    expect(signedIn.currentUser?.savedPostIds).toEqual(["post-1"]);

    const removed = removeSavedPost(signedIn, "post-1");

    expect(removed.currentUser?.savedPostIds).toEqual([]);
  });
});
