import { FormEvent, useEffect, useRef, useState } from "react";
import { Flag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { WORKFLOW_COPY } from "../i18n/workflowCopy";
import { GUIDE_ISSUE_REASONS, reportGuideIssueViaApi, type GuideIssueReason } from "../lib/guideFeedback";
import { formatBlogBodyBlock } from "../lib/blogBodyFormat";
import { getUserFacingError } from "../lib/userFacingErrors";
import type { BlogArticle } from "../lib/blogContent";
import { supabase } from "../lib/supabaseClient";

export default function GuideReportButton({ article }: { article: BlogArticle }) {
  const { language } = useLanguage();
  const copy = WORKFLOW_COPY[language];
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<GuideIssueReason>("outdated");
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError("");
    try {
      await reportGuideIssueViaApi(supabase, { articleId: article.id, language, reason,
        sectionIndex: section === "" ? null : Number(section), details });
      setSuccess(true);
    } catch (error) { setError(getUserFacingError(error, language)); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <div className="px-4 pt-5">
    <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      onClick={() => { setSuccess(false); setError(""); setDetails(""); setOpen(true); }}>
      <Flag size={16} />{copy.report}
    </button>
    <dialog ref={dialog} aria-labelledby="guide-report-title" onClose={() => setOpen(false)}
      onCancel={(event) => { if (busy) event.preventDefault(); }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-lg border border-outline-variant bg-white p-5 text-on-surface backdrop:bg-black/40">
      <h2 id="guide-report-title" className="text-xl font-bold">{copy.report}</h2>
      <p className="mt-2 text-sm text-on-surface-variant">{article.title}</p>
      {success ? <div>
        <p role="status" className="my-5">{copy.success}</p>
        <button type="button" className="rounded-lg bg-primary px-4 py-2 font-semibold text-white" onClick={() => setOpen(false)}>{copy.close}</button>
      </div> : <form onSubmit={submit} className="mt-4 space-y-4">
        <label className="block text-sm font-medium">{copy.reason}
          <select value={reason} disabled={busy} onChange={(event) => setReason(event.target.value as GuideIssueReason)} className="mt-1 block w-full rounded-lg border border-outline-variant p-2">
            {GUIDE_ISSUE_REASONS.map((item) => <option key={item} value={item}>{copy[item]}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">{copy.section}
          <select value={section} disabled={busy} onChange={(event) => setSection(event.target.value)} className="mt-1 block w-full rounded-lg border border-outline-variant p-2">
            <option value="">{copy.wholeGuide}</option>
            {article.body.map((text, index) => <option key={index} value={index}>{index + 1}. {formatBlogBodyBlock(text).heading || `${copy.section} ${index + 1}`}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">{copy.details}
          <textarea value={details} maxLength={1500} rows={4} disabled={busy} onChange={(event) => setDetails(event.target.value)} className="mt-1 block w-full rounded-lg border border-outline-variant p-2" />
        </label>
        <p className="text-xs text-on-surface-variant">{copy.privacy}</p>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-lg border border-outline-variant px-4 py-2 font-semibold">{copy.cancel}</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? copy.sending : copy.submit}</button>
        </div>
      </form>}
    </dialog>
  </div>;
}
