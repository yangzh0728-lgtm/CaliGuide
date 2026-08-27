import { ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";

interface PrivacyConsentBannerProps {
  onOpenCookieNotice: () => void;
}

export default function PrivacyConsentBanner({ onOpenCookieNotice }: PrivacyConsentBannerProps) {
  const { t } = useLanguage();
  const { acceptAll, hasDecided, openPreferences, rejectNonEssential } = usePrivacyConsent();

  if (hasDecided) {
    return null;
  }

  return (
    <section
      role="region"
      aria-labelledby="privacy-banner-title"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-4xl rounded-2xl border border-outline-variant bg-white p-4 shadow-2xl sm:inset-x-6 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary">
          <ShieldCheck size={21} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="privacy-banner-title" className="text-base font-bold text-on-surface">
            {t("privacy.bannerTitle")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t("privacy.bannerCopy")}</p>
          <button
            type="button"
            onClick={onOpenCookieNotice}
            className="mt-2 text-sm font-bold text-primary hover:underline"
          >
            {t("privacy.readNotice")}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={rejectNonEssential}
          className="rounded-xl border border-primary bg-white px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          {t("privacy.rejectOptional")}
        </button>
        <button
          type="button"
          onClick={openPreferences}
          className="rounded-xl border border-primary bg-white px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          {t("privacy.customize")}
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {t("privacy.acceptAll")}
        </button>
      </div>
    </section>
  );
}
