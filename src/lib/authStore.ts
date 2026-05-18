export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  memberSince: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

export interface AuthState {
  users: StoredUser[];
  currentUser: AuthUser | null;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200";

export const AUTH_STORAGE_KEY = "caliguide-auth-state";

export function createAuthState(): AuthState {
  return {
    users: [],
    currentUser: null,
  };
}

export function registerUser(
  state: AuthState,
  input: { name: string; email: string; password: string },
): AuthState {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!name) {
    throw new Error("Name is required");
  }
  if (!email.includes("@")) {
    throw new Error("Enter a valid email");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (state.users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    avatarUrl: DEFAULT_AVATAR,
    memberSince: new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };

  return {
    users: [...state.users, user],
    currentUser: publicUser(user),
  };
}

export function signInUser(
  state: AuthState,
  input: { email: string; password: string },
): AuthState {
  const email = normalizeEmail(input.email);
  const user = state.users.find(
    (storedUser) => storedUser.email === email && storedUser.password === input.password,
  );

  if (!user) {
    throw new Error("Email or password is incorrect");
  }

  return {
    ...state,
    currentUser: publicUser(user),
  };
}

export function signOutUser(state: AuthState): AuthState {
  return {
    ...state,
    currentUser: null,
  };
}

export function updateProfile(
  state: AuthState,
  input: { name: string; avatarUrl: string },
): AuthState {
  const currentUser = requireCurrentUser(state);
  const name = input.name.trim();
  const avatarUrl = input.avatarUrl.trim();

  if (!name) {
    throw new Error("Name is required");
  }
  if (!avatarUrl) {
    throw new Error("Profile picture is required");
  }

  const users = state.users.map((user) =>
    user.id === currentUser.id ? { ...user, name, avatarUrl } : user,
  );
  const updatedUser = users.find((user) => user.id === currentUser.id);

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return {
    users,
    currentUser: publicUser(updatedUser),
  };
}

export function changePassword(
  state: AuthState,
  input: { currentPassword: string; newPassword: string },
): AuthState {
  const currentUser = requireCurrentUser(state);
  const newPassword = input.newPassword.trim();
  const storedUser = state.users.find((user) => user.id === currentUser.id);

  if (!storedUser) {
    throw new Error("User not found");
  }
  if (storedUser.password !== input.currentPassword) {
    throw new Error("Current password is incorrect");
  }
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  return {
    ...state,
    users: state.users.map((user) =>
      user.id === currentUser.id ? { ...user, password: newPassword } : user,
    ),
  };
}

export function loadAuthState(storage: Storage): AuthState {
  const rawState = storage.getItem(AUTH_STORAGE_KEY);
  if (!rawState) {
    return createAuthState();
  }

  try {
    const parsed = JSON.parse(rawState) as AuthState;
    if (!Array.isArray(parsed.users)) {
      return createAuthState();
    }
    return parsed;
  } catch {
    return createAuthState();
  }
}

export function saveAuthState(storage: Storage, state: AuthState) {
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireCurrentUser(state: AuthState) {
  if (!state.currentUser) {
    throw new Error("You must be signed in");
  }
  return state.currentUser;
}

function publicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    memberSince: user.memberSince,
  };
}
