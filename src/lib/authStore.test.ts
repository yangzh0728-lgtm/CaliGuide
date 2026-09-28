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
  test("accepts an eight-letter mixed-case password without numbers or symbols", () => {
    expect(registerUser(createAuthState(), {
      name: "Reader", email: "reader@example.com", password: "Abcdefgh",
    }).currentUser).not.toBeNull();
  });

  test("allows existing users to sign in with a legacy password", () => {
    const state = registerUser(createAuthState(), { name: "Reader", email: "reader@example.com", password: "Abcdefgh" });
    state.users[0].password = "old123";
    expect(signInUser({ ...state, currentUser: null }, { email: "reader@example.com", password: "old123" }).currentUser).not.toBeNull();
    expect(() => changePassword(state, { currentPassword: "old123", newPassword: "abcdefgh" })).toThrow("uppercase and lowercase");
  });

  test.each(["Abcdefg", "abcdefgh", "ABCDEFGH", "12345678"])("rejects weak new password %s", (password) => {
    expect(() => registerUser(createAuthState(), {
      name: "Reader", email: "reader@example.com", password,
    })).toThrow("Password must be at least 8 characters and include uppercase and lowercase letters");
  });

  test("preserves spaces in passwords during registration and changes", () => {
    const password = " MixedCase ";
    const state = registerUser(createAuthState(), { name: "Reader", email: "reader@example.com", password });
    expect(signInUser({ ...state, currentUser: null }, { email: "reader@example.com", password }).currentUser).not.toBeNull();
    const newPassword = " NewMixedCase ";
    const updated = changePassword(state, { currentPassword: password, newPassword });
    expect(signInUser({ ...updated, currentUser: null }, { email: "reader@example.com", password: newPassword }).currentUser).not.toBeNull();
  });

  test("registers a user and signs in with the same credentials", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
      dateOfBirth: "1993-04-12",
      sex: "female",
      nationalities: ["China", "Canada"],
      currentLocation: "San Jose, CA",
      arrivalStatus: "arrived",
    });

    expect(registered.currentUser?.name).toBe("Maya Chen");
    expect(registered.currentUser?.email).toBe("maya@example.com");
    expect(registered.currentUser?.dateOfBirth).toBe("1993-04-12");
    expect(registered.currentUser?.sex).toBe("female");
    expect(registered.currentUser?.nationalities).toEqual(["China", "Canada"]);
    expect(registered.currentUser?.countryNationality).toBe("China, Canada");
    expect(registered.currentUser?.currentLocation).toBe("San Jose, CA");
    expect(registered.currentUser?.arrivalStatus).toBe("arrived");

    const signedIn = signInUser(
      { ...registered, currentUser: null },
      { email: "maya@example.com", password: "Secure123" },
    );

    expect(signedIn.currentUser?.email).toBe("maya@example.com");
  });

  test("assigns a generated initials avatar instead of a real photo", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
    });

    expect(registered.currentUser?.avatarUrl).toStartWith("data:image/svg+xml");
    expect(registered.currentUser?.avatarUrl).not.toContain("images.unsplash.com");
  });

  test("defaults optional registration demographics for older local auth flows", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
    });

    expect(registered.currentUser?.dateOfBirth).toBeNull();
    expect(registered.currentUser?.sex).toBe("prefer_not_to_say");
    expect(registered.currentUser?.nationalities).toEqual([]);
    expect(registered.currentUser?.countryNationality).toBe("");
    expect(registered.currentUser?.currentLocation).toBe("");
    expect(registered.currentUser?.arrivalStatus).toBe("planning");
  });

  test("rejects future dates of birth", () => {
    expect(() =>
      registerUser(createAuthState(), {
        name: "Maya Chen",
        email: "maya@example.com",
        password: "Secure123",
        dateOfBirth: "2999-01-01",
        sex: "female",
      }),
    ).toThrow("Enter a valid date of birth");
  });

  test("incorrect login password reports an error without signing in", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
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
      password: "Secure123",
    });

    const updated = updateProfile(state, {
      name: "Maya C.",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(updated.currentUser?.name).toBe("Maya C.");
    expect(updated.currentUser?.avatarUrl).toBe("https://example.com/avatar.png");
  });

  test("updates multiple nationalities from selected country values", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
      countryNationality: "China",
    });

    const updated = updateProfile(state, {
      name: "Maya Chen",
      avatarUrl: state.currentUser?.avatarUrl ?? "",
      nationalities: ["China", "Singapore", "China", ""],
    });

    expect(updated.currentUser?.nationalities).toEqual(["China", "Singapore"]);
    expect(updated.currentUser?.countryNationality).toBe("China, Singapore");
  });

  test("changes password only when the current password matches", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
    });

    expect(() =>
      changePassword(state, {
        currentPassword: "wrong",
        newPassword: "Newsecure123",
      }),
    ).toThrow("Current password is incorrect");

    const updated = changePassword(state, {
      currentPassword: "Secure123",
      newPassword: "Newsecure123",
    });

    const signedIn = signInUser(
      { ...updated, currentUser: null },
      { email: "maya@example.com", password: "Newsecure123" },
    );

    expect(signedIn.currentUser?.email).toBe("maya@example.com");
  });

  test("saves and removes guides for the signed-in user", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
    });

    expect(state.currentUser?.savedGuideIds).toEqual([]);

    const saved = saveGuide(state, "guide-1");
    const savedAgain = saveGuide(saved, "guide-1");

    expect(savedAgain.currentUser?.savedGuideIds).toEqual(["guide-1"]);

    const signedIn = signInUser(
      { ...savedAgain, currentUser: null },
      { email: "maya@example.com", password: "Secure123" },
    );

    expect(signedIn.currentUser?.savedGuideIds).toEqual(["guide-1"]);

    const removed = removeSavedGuide(signedIn, "guide-1");

    expect(removed.currentUser?.savedGuideIds).toEqual([]);
  });

  test("saves and removes forum posts for the signed-in user", () => {
    const state = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "Secure123",
    });

    expect(state.currentUser?.savedPostIds).toEqual([]);

    const saved = savePost(state, "post-1");
    const savedAgain = savePost(saved, "post-1");

    expect(savedAgain.currentUser?.savedPostIds).toEqual(["post-1"]);

    const signedIn = signInUser(
      { ...savedAgain, currentUser: null },
      { email: "maya@example.com", password: "Secure123" },
    );

    expect(signedIn.currentUser?.savedPostIds).toEqual(["post-1"]);

    const removed = removeSavedPost(signedIn, "post-1");

    expect(removed.currentUser?.savedPostIds).toEqual([]);
  });
});
