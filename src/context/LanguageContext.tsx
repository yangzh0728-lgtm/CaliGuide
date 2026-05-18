import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  TranslationKey,
  isLanguageCode,
  translate,
} from "../i18n/translations";

interface LanguageContextValue {
  language: LanguageCode;
  languages: typeof LANGUAGES;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(storedLanguage) ? storedLanguage : "en";
  });

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      languages: LANGUAGES,
      setLanguage,
      t: (key) => translate(language, key),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
