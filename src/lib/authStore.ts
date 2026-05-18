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

const AVATAR_BACKGROUNDS = ["#ffb618", "#164686", "#8bd3dd", "#f582ae", "#b8e986"];
const AVATAR_SHIRTS = ["#002f65", "#7d5700", "#434750", "#ba1a1a", "#003160"];
const AVATAR_SKINS = ["#f7c59f", "#d99b72", "#8d5524", "#ffdbac", "#c68642"];

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
    avatarUrl: createRandomAvatar(name),
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

function createRandomAvatar(name: string) {
  const background = randomItem(AVATAR_BACKGROUNDS);
  const shirt = randomItem(AVATAR_SHIRTS);
  const skin = randomItem(AVATAR_SKINS);
  const initial = name.trim().charAt(0).toUpperCase() || "C";
  const smile = Math.random() > 0.5 ? "M78 90 Q100 108 122 90" : "M80 94 Q100 102 120 94";
  const hair = Math.random() > 0.5
    ? '<path d="M62 70 Q100 28 138 70 Q128 44 100 42 Q72 44 62 70Z" fill="#2f241d"/>'
    : '<path d="M58 76 Q64 38 100 36 Q136 38 142 76 Q121 54 100 56 Q79 54 58 76Z" fill="#2f241d"/>';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="100" fill="${background}"/>
      <circle cx="100" cy="82" r="42" fill="${skin}"/>
      ${hair}
      <circle cx="84" cy="82" r="5" fill="#141d23"/>
      <circle cx="116" cy="82" r="5" fill="#141d23"/>
      <path d="${smile}" fill="none" stroke="#141d23" stroke-width="5" stroke-linecap="round"/>
      <path d="M45 178 Q100 126 155 178" fill="${shirt}"/>
      <circle cx="100" cy="144" r="24" fill="#ffffff" opacity="0.95"/>
      <text x="100" y="154" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="${shirt}">${initial}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
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
