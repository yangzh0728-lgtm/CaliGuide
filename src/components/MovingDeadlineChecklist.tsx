import { RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useMovingChecklistProgress } from "../hooks/useMovingChecklistProgress";
import { getMovingChecklistCopy } from "../lib/movingChecklist";
import ChecklistSyncStatus from "./ChecklistSyncStatus";

export default function MovingDeadlineChecklist() {
  const { language } = useLanguage();
  const copy = getMovingChecklistCopy(language);
  const { completed, isLoading, reset, toggle, error, isSaving, retry } = useMovingChecklistProgress();

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant" aria-label={copy.ariaLabel}>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-on-surface">{copy.heading}</h3>
          <p className="text-xs text-on-surface-variant">{completed.length}/{copy.tasks.length} {copy.progress}</p>
        </div>
        {completed.length ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <RotateCcw size={14} aria-hidden="true" />
            {copy.reset}
          </button>
        ) : null}
      </div>

      <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,.9fr)_minmax(0,1.25fr)] gap-3 border-t border-outline-variant bg-white px-4 py-2 text-xs font-bold uppercase text-on-surface-variant md:grid">
        <span>{copy.columns.task}</span><span>{copy.columns.deadline}</span><span>{copy.columns.consequence}</span>
      </div>

      <ChecklistSyncStatus error={error} isSaving={isSaving} retry={retry} />
      <ul className="divide-y divide-outline-variant bg-white">
        {copy.tasks.map((task) => {
          const isDone = completed.includes(task.id);
          return (
            <li key={task.id} className={`grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,.9fr)_minmax(0,1.25fr)] md:gap-3 ${isDone ? "bg-primary/5" : ""}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={isDone} disabled={isLoading} onChange={() => toggle(task.id)} className="mt-1 h-4 w-4 shrink-0 accent-primary disabled:cursor-wait disabled:opacity-60" />
                <span>
                  <span className={`block text-sm font-bold ${isDone ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{task.label}</span>
                  <span className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${task.jurisdiction === "federal" ? "bg-blue-50 text-blue-800" : task.jurisdiction === "california" ? "bg-amber-50 text-amber-800" : "bg-surface-container-high text-on-surface-variant"}`}>{copy.jurisdictions[task.jurisdiction]}</span>
                </span>
              </label>
              <p className="pl-7 text-sm font-semibold text-on-surface md:pl-0"><span className="mr-1 text-xs uppercase text-on-surface-variant md:hidden">{copy.columns.deadline}:</span>{task.deadline}</p>
              <p className="pl-7 text-sm leading-6 text-on-surface-variant md:pl-0"><span className="mr-1 text-xs font-bold uppercase md:hidden">{copy.columns.consequence}:</span>{task.consequence}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
