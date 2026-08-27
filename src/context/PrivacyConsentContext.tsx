import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  ConsentSelection,
  OptionalConsentChoices,
  PrivacyConsentRecord,
  createConsentRecord,
  loadConsentRecord,
  removeDisallowedPreferenceStorage,
  saveConsentRecord,
} from "../lib/privacyConsent";

interface PrivacyConsentContextValue {
  consent: PrivacyConsentRecord | null;
  hasDecided: boolean;
  isPreferencesAllowed: boolean;
  isAnalyticsAllowed: boolean;
  isMarketingAllowed: boolean;
  isPreferencesDialogOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (choices: OptionalConsentChoices) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextValue | null>(null);

export function PrivacyConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<PrivacyConsentRecord | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return loadConsentRecord(window.localStorage);
  });
  const [isPreferencesDialogOpen, setPreferencesDialogOpen] = useState(false);

  const applySelection = (selection: ConsentSelection) => {
    const nextConsent = createConsentRecord(selection);
    setConsent(nextConsent);

    if (typeof window !== "undefined") {
      saveConsentRecord(window.localStorage, nextConsent);
      removeDisallowedPreferenceStorage(window.localStorage, nextConsent.preferences);
    }

    setPreferencesDialogOpen(false);
  };

  const value = useMemo<PrivacyConsentContextValue>(
    () => ({
      consent,
      hasDecided: consent !== null,
      isPreferencesAllowed: consent?.preferences ?? false,
      isAnalyticsAllowed: consent?.analytics ?? false,
      isMarketingAllowed: consent?.marketing ?? false,
      isPreferencesDialogOpen,
      acceptAll: () => applySelection("accept-all"),
      rejectNonEssential: () => applySelection("reject-non-essential"),
      savePreferences: applySelection,
      openPreferences: () => setPreferencesDialogOpen(true),
      closePreferences: () => setPreferencesDialogOpen(false),
    }),
    [consent, isPreferencesDialogOpen],
  );

  return <PrivacyConsentContext.Provider value={value}>{children}</PrivacyConsentContext.Provider>;
}

export function usePrivacyConsent() {
  const context = useContext(PrivacyConsentContext);
  if (!context) {
    throw new Error("usePrivacyConsent must be used within PrivacyConsentProvider");
  }

  return context;
}
