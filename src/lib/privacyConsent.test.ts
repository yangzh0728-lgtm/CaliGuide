import { describe, expect, test } from "bun:test";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  createConsentRecord,
  parseConsentRecord,
  readPreferenceStorage,
  removeDisallowedPreferenceStorage,
  writePreferenceStorage,
} from "./privacyConsent";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("privacy consent", () => {
  test("treats missing, malformed, and stale records as undecided", () => {
    expect(parseConsentRecord(null)).toBeNull();
    expect(parseConsentRecord("not-json")).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({
          version: CONSENT_VERSION - 1,
          updatedAt: "2026-08-26T12:00:00.000Z",
          preferences: true,
          analytics: true,
          marketing: true,
        }),
      ),
    ).toBeNull();
  });

  test("creates explicit accept, reject, and custom records", () => {
    const accepted = createConsentRecord("accept-all", new Date("2026-08-26T12:00:00.000Z"));
    const rejected = createConsentRecord("reject-non-essential", new Date("2026-08-26T12:00:00.000Z"));
    const custom = createConsentRecord(
      { preferences: true, analytics: false, marketing: false },
      new Date("2026-08-26T12:00:00.000Z"),
    );

    expect(accepted).toEqual({
      version: CONSENT_VERSION,
      updatedAt: "2026-08-26T12:00:00.000Z",
      preferences: true,
      analytics: true,
      marketing: true,
    });
    expect(rejected.preferences).toBe(false);
    expect(rejected.analytics).toBe(false);
    expect(rejected.marketing).toBe(false);
    expect(custom.preferences).toBe(true);
    expect(custom.analytics).toBe(false);
  });

  test("parses only complete records with boolean category choices", () => {
    const record = createConsentRecord(
      { preferences: true, analytics: false, marketing: true },
      new Date("2026-08-26T12:00:00.000Z"),
    );

    expect(parseConsentRecord(JSON.stringify(record))).toEqual(record);
    expect(
      parseConsentRecord(
        JSON.stringify({ ...record, analytics: "yes" }),
      ),
    ).toBeNull();
  });

  test("revoking preferences preserves language but removes optional chat cache", () => {
    const storage = new MemoryStorage();
    storage.setItem("caliguide-language", "es");
    storage.setItem("caliguide-chat-memory", "cached-chat");
    storage.setItem("caliguide-google-profile-draft", "oauth-draft");
    storage.setItem("sb-project-auth-token", "session");
    storage.setItem(CONSENT_STORAGE_KEY, "consent-record");

    removeDisallowedPreferenceStorage(storage, false);

    expect(storage.getItem("caliguide-language")).toBe("es");
    expect(storage.getItem("caliguide-chat-memory")).toBeNull();
    expect(storage.getItem("caliguide-google-profile-draft")).toBe("oauth-draft");
    expect(storage.getItem("sb-project-auth-token")).toBe("session");
    expect(storage.getItem(CONSENT_STORAGE_KEY)).toBe("consent-record");
  });

  test("always stores functional language while gating optional preference storage", () => {
    const storage = new MemoryStorage();
    storage.setItem("caliguide-language", "es");
    storage.setItem("caliguide-chat-memory", "cached-chat");

    expect(readPreferenceStorage(storage, "caliguide-language", false)).toBe("es");
    writePreferenceStorage(storage, "caliguide-language", "zh-CN", false);
    expect(storage.getItem("caliguide-language")).toBe("zh-CN");

    expect(readPreferenceStorage(storage, "caliguide-chat-memory", false)).toBeNull();
    writePreferenceStorage(storage, "caliguide-chat-memory", "new-cache", false);
    expect(storage.getItem("caliguide-chat-memory")).toBe("cached-chat");
  });
});
