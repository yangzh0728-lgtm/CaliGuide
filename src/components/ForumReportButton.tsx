import { useState, type FormEvent } from "react";
import { CheckCircle2, Flag, LoaderCircle, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  reportForumContentViaApi,
  type ForumReportReason,
  type ForumReportInput,
} from "../lib/forumApi";
import { supabase } from "../lib/supabaseClient";
import { isSupabaseUuid } from "../lib/uuid";

const reasonOptions: ForumReportReason[] = [
  "spam",
  "harassment",
  "unsafe_advice",
  "misinformation",
  "inappropriate_image",
  "other",
];

export function ForumReportButton({
  targetType,
  targetId,
}: Pick<ForumReportInput, "targetType" | "targetId">) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ForumReportReason>("spam");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  if (!isSupabaseUuid(targetId)) {
    return null;
  }

  const closeDialog = () => {
    if (status === "submitting") {
      return;
    }
    setIsOpen(false);
    setStatus("idle");
    setDetails("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    try {
      await reportForumContentViaApi(supabase, { targetType, targetId, reason, details });
      setStatus("success");
    } catch (error) {
      console.warn("Forum report failed", error);
      setStatus("error");
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={t("forum.reportAria")}
        title={t("forum.report")}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      >
        <Flag size={14} />
        <span>{t("forum.report")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={closeDialog}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="forum-report-title"
            className="w-full max-w-md rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="forum-report-title" className="text-xl font-bold text-on-surface">
                  {t("forum.reportTitle")}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t("forum.reportCopy")}</p>
              </div>
              <button
                type="button"
                aria-label={t("forum.reportClose")}
                onClick={closeDialog}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              >
                <X size={18} />
              </button>
            </div>

            {status === "success" ? (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900" role="status">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                  <p className="text-sm font-semibold leading-6">{t("forum.reportSuccess")}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="mt-4 h-10 w-full rounded-xl bg-primary px-4 text-sm font-bold text-white"
                >
                  {t("forum.reportDone")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    {t("forum.reportReason")}
                  </span>
                  <select
                    value={reason}
                    disabled={status === "submitting"}
                    onChange={(event) => setReason(event.target.value as ForumReportReason)}
                    className="h-12 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {reasonOptions.map((option) => (
                      <option key={option} value={option}>
                        {t(`forum.reportReason.${option}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    {t("forum.reportDetails")}
                  </span>
                  <textarea
                    value={details}
                    maxLength={1000}
                    rows={4}
                    disabled={status === "submitting"}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder={t("forum.reportDetailsPlaceholder")}
                    className="w-full resize-none rounded-xl border border-outline-variant bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="mt-1 block text-right text-[11px] text-on-surface-variant">
                    {details.length}/1000
                  </span>
                </label>

                {status === "error" && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
                    {t("forum.reportError")}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    disabled={status === "submitting"}
                    onClick={closeDialog}
                    className="h-11 flex-1 rounded-xl border border-outline-variant bg-white px-4 text-sm font-bold text-on-surface-variant"
                  >
                    {t("forum.reportCancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === "submitting" && <LoaderCircle size={16} className="animate-spin" />}
                    {status === "submitting" ? t("forum.reportSubmitting") : t("forum.reportSubmit")}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
