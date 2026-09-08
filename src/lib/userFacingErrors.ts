import type { LanguageCode } from "../i18n/translations";
import { WORKFLOW_COPY } from "../i18n/workflowCopy";

export function getUserFacingError(error: unknown, language: LanguageCode, fallback?: string) {
  const copy = WORKFLOW_COPY[language];
  const message = error instanceof Error ? error.message : "";
  if (/rate.limit|too many/i.test(message)) return copy.rateLimited;
  if (/failed to fetch|network|fetch failed|load failed/i.test(message)) return copy.network;
  if (/invalid login|invalid credentials|incorrect password|current password/i.test(message)) return copy.credentials;
  if (/email not confirmed|confirm your email/i.test(message)) return copy.confirmEmail;
  if (/valid email/i.test(message)) return copy.email;
  if (/password.*(least|short|weak)/i.test(message)) return copy.password;
  if (/name is required/i.test(message)) return copy.name;
  if (/date of birth/i.test(message)) return copy.birthDate;
  if (/sign[ _]in[ _]required|jwt expired|session.*expired/i.test(message)) return copy.signIn;
  if (/image|file.*(size|large|type)|upload.*limit/i.test(message)) return copy.image;
  return fallback ?? copy.failed;
}
