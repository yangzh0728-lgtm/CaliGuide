import { Info, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ChatSafetyNoticeProps {
  hasSelectedImages: boolean;
}

export default function ChatSafetyNotice({ hasSelectedImages }: ChatSafetyNoticeProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-2 space-y-2 text-[11px] leading-4 text-on-surface-variant">
      <div className="flex items-start gap-2 px-1" role="note">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          {t("chatbot.safetyNotice")}{" "}
          <a href="/disclaimer" className="font-bold text-primary hover:underline">
            {t("chatbot.disclaimerLink")}
          </a>
        </p>
      </div>

      {hasSelectedImages ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950" role="note">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            {t("chatbot.imagePrivacyNotice")}{" "}
            <a href="/privacy" className="font-bold underline underline-offset-2">
              {t("chatbot.privacyLink")}
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
