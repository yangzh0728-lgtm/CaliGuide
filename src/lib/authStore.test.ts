import { describe, expect, test } from "bun:test";
import {
  changePassword,
  createAuthState,
  registerUser,
  signInUser,
  updateProfile,
} from "./authStore";

describe("authStore", () => {
  test("registers a user and signs in with the same credentials", () => {
    const registered = registerUser(createAuthState(), {
      name: "Maya Chen",
      email: "maya@example.com",
      password: "secure123",
    });

    expect(registered.currentUser?.name).toBe("Maya Chen");
    expect(registered.currentUser?.email).toBe("maya@example.com");

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
});
