export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = "(?=.*[a-z])(?=.*[A-Z]).{8,}";

export function validateNewPassword(password: string): void {
  if (Array.from(password).length < PASSWORD_MIN_LENGTH || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    throw new Error("Password must be at least 8 characters and include uppercase and lowercase letters");
  }
}
