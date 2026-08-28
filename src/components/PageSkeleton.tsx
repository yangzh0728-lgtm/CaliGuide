import { useLanguage } from "../context/LanguageContext";

export default function PageSkeleton({ fullScreen = false }: { fullScreen?: boolean }) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${fullScreen ? "min-h-screen" : "min-h-[60vh]"} bg-background px-4 pt-24`}
    >
      <span className="sr-only">{t("app.loading")}</span>
      <div className="mx-auto max-w-2xl animate-pulse space-y-5" aria-hidden="true">
        <div className="h-8 w-2/5 rounded bg-surface-container-high" />
        <div className="h-4 w-4/5 rounded bg-surface-container" />
        <div className="aspect-[16/8] w-full rounded-lg bg-surface-container-high" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-surface-container" />
          <div className="h-4 w-full rounded bg-surface-container" />
          <div className="h-4 w-3/4 rounded bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
