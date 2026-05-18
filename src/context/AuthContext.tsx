import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthState,
  AuthUser,
  changePassword,
  createAuthState,
  loadAuthState,
  registerUser,
  saveAuthState,
  signInUser,
  signOutUser,
  updateProfile,
} from "../lib/authStore";

interface AuthContextValue {
  currentUser: AuthUser | null;
  register: (input: { name: string; email: string; password: string }) => void;
  login: (input: { email: string; password: string }) => void;
  logout: () => void;
  updateAccount: (input: { name: string; avatarUrl: string }) => void;
  updatePassword: (input: { currentPassword: string; newPassword: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return createAuthState();
    }
    return loadAuthState(window.localStorage);
  });

  useEffect(() => {
    saveAuthState(window.localStorage, authState);
  }, [authState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser: authState.currentUser,
      register: (input) => setAuthState(registerUser(authState, input)),
      login: (input) => setAuthState(signInUser(authState, input)),
      logout: () => setAuthState(signOutUser(authState)),
      updateAccount: (input) => setAuthState(updateProfile(authState, input)),
      updatePassword: (input) => setAuthState(changePassword(authState, input)),
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
