import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
  menuClassName?: string;
}

export default function LanguageSwitcher({ className = "", menuClassName = "" }: LanguageSwitcherProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { language, languages, setLanguage, t } = useLanguage();
  const selectedLanguage = languages.find((item) => item.code === language);

  useEffect(() => {
    if (!isLanguageOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLanguageOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isLanguageOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={isLanguageOpen}
        onClick={() => setIsLanguageOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
      >
        <Languages size={21} aria-hidden="true" />
        <span className="sr-only">{t("language.label")}: </span>
        <span className="text-xs font-bold">{selectedLanguage?.shortLabel}</span>
      </button>
      {isLanguageOpen && (
        <div
          className={`absolute right-0 top-12 z-50 w-44 rounded-2xl border border-outline-variant bg-white p-2 shadow-xl ${menuClassName}`}
        >
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              lang={item.code}
              aria-current={item.code === language ? "true" : undefined}
              onClick={() => {
                setLanguage(item.code);
                setIsLanguageOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                item.code === language
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {item.label}
              {item.code === language && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
