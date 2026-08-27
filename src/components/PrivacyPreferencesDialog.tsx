import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";
import { OptionalConsentChoices } from "../lib/privacyConsent";

export default function PrivacyPreferencesDialog() {
  const { t } = useLanguage();
  const {
    closePreferences,
    consent,
    isPreferencesDialogOpen,
    savePreferences,
  } = usePrivacyConsent();
  const [choices, setChoices] = useState<OptionalConsentChoices>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!isPreferencesDialogOpen) {
      return;
    }

    setChoices({
      preferences: consent?.preferences ?? false,
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
    });
  }, [consent, isPreferencesDialogOpen]);

  if (!isPreferencesDialogOpen) {
    return null;
  }

  const categories = [
    { key: "necessary", checked: true, disabled: true },
    { key: "preferences", checked: choices.preferences, disabled: false },
    { key: "analytics", checked: choices.analytics, disabled: false },
    { key: "marketing", checked: choices.marketing, disabled: false },
  ] as const;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-dialog-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="privacy-dialog-title" className="text-2xl font-bold text-on-surface">
              {t("privacy.dialogTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t("privacy.dialogCopy")}</p>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            aria-label={t("privacy.cancel")}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
          {categories.map((category) => (
            <label key={category.key} className="flex cursor-pointer items-start justify-between gap-4 py-4">
              <span>
                <span className="block text-sm font-bold text-on-surface">{t(`privacy.${category.key}`)}</span>
                <span className="mt-1 block text-sm leading-5 text-on-surface-variant">
                  {t(`privacy.${category.key}Copy`)}
                </span>
              </span>
              <input
                type="checkbox"
                checked={category.checked}
                disabled={category.disabled}
                onChange={(event) => {
                  if (category.key === "necessary") {
                    return;
                  }
                  setChoices((current) => ({ ...current, [category.key]: event.target.checked }));
                }}
                className="mt-1 h-5 w-5 shrink-0 accent-primary"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={closePreferences}
            className="flex-1 rounded-xl border border-outline-variant px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low"
          >
            {t("privacy.cancel")}
          </button>
          <button
            type="button"
            onClick={() => savePreferences(choices)}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            {t("privacy.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
