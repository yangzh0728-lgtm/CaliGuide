import { Languages, LoaderCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  FORUM_TRANSLATION_LANGUAGES,
  getForumTranslationLanguage,
  type ForumTranslationLanguage,
} from "../lib/forumTranslation";

export function ForumTranslateButton({
  isTranslated,
  isLoading,
  targetLanguage,
  onTargetLanguageChange,
  onClick,
}: {
  isTranslated: boolean;
  isLoading: boolean;
  targetLanguage: ForumTranslationLanguage;
  onTargetLanguageChange: (language: ForumTranslationLanguage) => void;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const Icon = isLoading ? LoaderCircle : isTranslated ? RotateCcw : Languages;
  const targetLabel = getForumTranslationLanguage(targetLanguage).shortLabel;

  return (
    <div className="inline-flex h-8 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-white">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        title={isTranslated ? t("forum.showOriginal") : `${t("forum.translate")} (${targetLabel})`}
        className="inline-flex h-full items-center gap-1.5 px-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-wait disabled:opacity-60"
      >
        <Icon size={14} className={isLoading ? "animate-spin" : ""} />
        <span>{isLoading ? t("forum.translating") : isTranslated ? t("forum.showOriginal") : t("forum.translate")}</span>
      </button>
      <select
        aria-label={t("settings.forumTranslationLanguage")}
        value={targetLanguage}
        disabled={isLoading}
        onChange={(event) => onTargetLanguageChange(event.target.value as ForumTranslationLanguage)}
        className="h-full min-w-12 border-l border-outline-variant bg-surface-container-low px-1 text-[10px] font-bold text-on-surface outline-none disabled:cursor-wait disabled:opacity-60"
      >
        {FORUM_TRANSLATION_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.shortLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
