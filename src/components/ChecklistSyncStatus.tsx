import { useLanguage } from "../context/LanguageContext";
import { WORKFLOW_COPY } from "../i18n/workflowCopy";

export default function ChecklistSyncStatus({ error, isSaving, retry }: {
  error: "load" | "save" | null; isSaving: boolean; retry: () => void;
}) {
  const { language } = useLanguage();
  const copy = WORKFLOW_COPY[language];
  if (error) return <div role="alert" className="my-3 flex flex-wrap items-center gap-2 text-sm text-error">
    <span>{error === "load" ? copy.loadFailed : copy.syncFailed}</span>
    <button type="button" onClick={retry} className="font-semibold underline">{copy.retry}</button>
  </div>;
  return isSaving ? <p role="status" className="my-2 text-xs text-on-surface-variant">{copy.saving}</p> : null;
}
