import { useLanguage } from "../context/LanguageContext";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";
import { LEGAL_PAGE_IDS, LegalPageId } from "../lib/legalContent";

interface LegalFooterProps {
  onOpenLegalPage: (pageId: LegalPageId) => void;
  onOpenAgencies?: () => void;
  compact?: boolean;
}

export default function LegalFooter({ onOpenLegalPage, onOpenAgencies, compact = false }: LegalFooterProps) {
  const { t } = useLanguage();
  const { openPreferences } = usePrivacyConsent();

  return (
    <footer className={`border-t border-outline-variant ${compact ? "mt-8" : "mt-12 bg-white"}`}>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 py-6 text-xs font-bold text-on-surface-variant">
        {onOpenAgencies ? (
          <button
            type="button"
            onClick={onOpenAgencies}
            className="hover:text-primary hover:underline"
          >
            {t("agencies.openDirectory")}
          </button>
        ) : null}
        {LEGAL_PAGE_IDS.map((pageId) => (
          <button
            key={pageId}
            type="button"
            onClick={() => onOpenLegalPage(pageId)}
            className="hover:text-primary hover:underline"
          >
            {t(`legal.${pageId}`)}
          </button>
        ))}
        <button type="button" onClick={openPreferences} className="hover:text-primary hover:underline">
          {t("legal.privacyChoices")}
        </button>
      </div>
    </footer>
  );
}
