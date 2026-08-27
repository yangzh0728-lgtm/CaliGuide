import { LANGUAGE_STORAGE_KEY } from "../i18n/translations";
import { CHAT_MEMORY_STORAGE_KEY } from "./chatMemory";

export const CONSENT_STORAGE_KEY = "caliguide-privacy-consent";
export const CONSENT_VERSION = 1;

export interface OptionalConsentChoices {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface PrivacyConsentRecord extends OptionalConsentChoices {
  version: number;
  updatedAt: string;
}

export type ConsentSelection =
  | "accept-all"
  | "reject-non-essential"
  | OptionalConsentChoices;

const OPTIONAL_PREFERENCE_STORAGE_KEYS = [
  CHAT_MEMORY_STORAGE_KEY,
] as const;

function isNecessaryFunctionalStorageKey(key: string) {
  return key === LANGUAGE_STORAGE_KEY;
}

export function createConsentRecord(
  selection: ConsentSelection,
  updatedAt = new Date(),
): PrivacyConsentRecord {
  const choices =
    selection === "accept-all"
      ? { preferences: true, analytics: true, marketing: true }
      : selection === "reject-non-essential"
        ? { preferences: false, analytics: false, marketing: false }
        : selection;

  return {
    version: CONSENT_VERSION,
    updatedAt: updatedAt.toISOString(),
    ...choices,
  };
}

export function parseConsentRecord(rawRecord: string | null): PrivacyConsentRecord | null {
  if (!rawRecord) {
    return null;
  }

  try {
    const record = JSON.parse(rawRecord) as Partial<PrivacyConsentRecord>;
    if (
      record.version !== CONSENT_VERSION ||
      typeof record.updatedAt !== "string" ||
      Number.isNaN(Date.parse(record.updatedAt)) ||
      typeof record.preferences !== "boolean" ||
      typeof record.analytics !== "boolean" ||
      typeof record.marketing !== "boolean"
    ) {
      return null;
    }

    return record as PrivacyConsentRecord;
  } catch {
    return null;
  }
}

export function loadConsentRecord(storage: Storage): PrivacyConsentRecord | null {
  return parseConsentRecord(storage.getItem(CONSENT_STORAGE_KEY));
}

export function saveConsentRecord(storage: Storage, record: PrivacyConsentRecord) {
  storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

export function readPreferenceStorage(
  storage: Storage,
  key: string,
  preferencesAllowed: boolean,
) {
  return preferencesAllowed || isNecessaryFunctionalStorageKey(key)
    ? storage.getItem(key)
    : null;
}

export function writePreferenceStorage(
  storage: Storage,
  key: string,
  value: string,
  preferencesAllowed: boolean,
) {
  if (preferencesAllowed || isNecessaryFunctionalStorageKey(key)) {
    storage.setItem(key, value);
  }
}

export function removeDisallowedPreferenceStorage(storage: Storage, preferencesAllowed: boolean) {
  if (preferencesAllowed) {
    return;
  }

  OPTIONAL_PREFERENCE_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
}
