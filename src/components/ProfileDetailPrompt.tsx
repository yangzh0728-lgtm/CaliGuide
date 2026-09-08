import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { PROFILE_PROMPT_COPY } from "../i18n/profilePromptCopy";
import { getUserFacingError } from "../lib/userFacingErrors";
import type { ProfileDetailInput } from "../lib/progressiveProfile";

interface Props {
  kind: ProfileDetailInput["kind"];
  initialValue?: string;
  onSave: (input: ProfileDetailInput) => Promise<void>;
  onContinue: () => void;
  onDismiss: () => void;
}

export default function ProfileDetailPrompt({ kind, initialValue = "", onSave, onContinue, onDismiss }: Props) {
  const { language, t } = useLanguage();
  const copy = PROFILE_PROMPT_COPY[language];
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isName = kind === "name";

  useEffect(() => {
    mounted.current = true;
    const node = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.showModal();
    return () => {
      mounted.current = false;
      node?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || !value.trim()) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await onSave({ kind, value });
      if (mounted.current) onContinue();
    } catch (failure) {
      if (mounted.current) setError(getUserFacingError(failure, language));
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={(event) => { event.preventDefault(); if (!submitting.current) onDismiss(); }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-auto rounded-lg border border-outline-variant bg-white p-5 text-on-surface shadow-xl backdrop:bg-black/40">
    <div className="flex items-start justify-between gap-3">
      <h2 id={`${id}-title`} className="text-xl font-semibold">{isName ? copy.nameTitle : copy.arrivalTitle}</h2>
      <button type="button" onClick={onDismiss} disabled={busy} aria-label={copy.close} title={copy.close}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"><X size={20} /></button>
    </div>
    <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-on-surface-variant">{isName ? copy.nameBody : copy.arrivalBody}</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label className="block text-sm font-medium">
        {isName ? copy.nameLabel : copy.arrivalLabel}
        {isName ? <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} maxLength={80} required disabled={busy} autoComplete="nickname"
          className="mt-2 block w-full rounded-lg border border-outline-variant p-3 font-normal focus:outline-primary" />
          : <select autoFocus value={value} onChange={(event) => setValue(event.target.value)} required disabled={busy}
            className="mt-2 block w-full rounded-lg border border-outline-variant p-3 font-normal focus:outline-primary">
            <option value="">{copy.choose}</option>
            <option value="planning">{t("auth.arrivalPlanning")}</option>
            <option value="arrived">{t("auth.arrivalArrived")}</option>
            <option value="long_term_resident">{t("auth.arrivalLongTermResident")}</option>
          </select>}
      </label>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={busy} onClick={onContinue} className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary">{copy.skip}</button>
        <button type="submit" disabled={busy || !value.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50">{busy ? copy.saving : copy.save}</button>
      </div>
    </form>
  </dialog>;
}
