import { Languages, LoaderCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function ForumTranslateButton({
  isTranslated,
  isLoading,
  targetLabel,
  onClick,
}: {
  isTranslated: boolean;
  isLoading: boolean;
  targetLabel: string;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const Icon = isLoading ? LoaderCircle : isTranslated ? RotateCcw : Languages;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      title={isTranslated ? t("forum.showOriginal") : `${t("forum.translate")} (${targetLabel})`}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-wait disabled:opacity-60"
    >
      <Icon size={14} className={isLoading ? "animate-spin" : ""} />
      <span>{isLoading ? t("forum.translating") : isTranslated ? t("forum.showOriginal") : t("forum.translate")}</span>
      {!isTranslated && !isLoading && <span className="text-[10px] text-on-surface-variant">{targetLabel}</span>}
    </button>
  );
}
