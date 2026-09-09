import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";
import { OPTIONAL_PROFILE_COPY } from "../i18n/optionalProfileCopy";
import { PROFILE_PROMPT_COPY } from "../i18n/profilePromptCopy";
import { blankOptionalProfile, missingProfileFields } from "../lib/optionalProfile";
import { getUserFacingError } from "../lib/userFacingErrors";
import OptionalProfileFields from "./OptionalProfileFields";

export default function ProfileCompletionReminder() {
  const { currentUser, profileReminderUserId } = useAuth();
  const { hasDecided, isPreferencesDialogOpen } = usePrivacyConsent();
  if (!currentUser || currentUser.id !== profileReminderUserId || !hasDecided || isPreferencesDialogOpen) return null;
  return <ReminderDialog key={currentUser.id} />;
}

function ReminderDialog() {
  const { currentUser, saveOptionalProfile, dismissProfileReminder } = useAuth();
  const { language } = useLanguage();
  const copy = OPTIONAL_PROFILE_COPY[language];
  const prompt = PROFILE_PROMPT_COPY[language];
  const [fields] = useState(() => missingProfileFields(currentUser!));
  const [value, setValue] = useState(blankOptionalProfile);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    mounted.current = true;
    const node = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.showModal();
    return () => { mounted.current = false; node?.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);

  async function run(action: () => Promise<void>) {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError("");
    try { await action(); }
    catch (failure) { if (mounted.current) setError(getUserFacingError(failure, language)); }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  }
  const later = () => { void run(() => dismissProfileReminder("later")); };
  const hasAnswers = fields.some((field) => field === "nationalities" ? value.nationalities.some(Boolean) : Boolean(value[field].trim()));
  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={(event) => { event.preventDefault(); if (!submitting.current) later(); }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-lg border border-outline-variant bg-white p-5 text-on-surface shadow-xl backdrop:bg-black/40">
    <div className="flex items-start justify-between gap-3">
      <h2 tabIndex={-1} autoFocus id={`${id}-title`} className="text-xl font-semibold">{copy.title}</h2>
      <button type="button" disabled={busy} onClick={later} title={prompt.close} aria-label={prompt.close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-surface-container-low"><X size={20} /></button>
    </div>
    <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-on-surface-variant">{copy.reminder}</p>
    <form onSubmit={(event: FormEvent) => { event.preventDefault(); void run(() => saveOptionalProfile(value)); }} className="mt-5 space-y-5">
      <OptionalProfileFields value={value} onChange={setValue} fields={fields} disabled={busy} />
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="sticky -bottom-5 -mx-5 flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant bg-white px-5 py-4">
        <button type="button" disabled={busy} onClick={() => void run(() => dismissProfileReminder("never"))} className="mr-auto rounded-lg px-2 py-2 text-sm text-on-surface-variant hover:underline">{copy.never}</button>
        <button type="button" disabled={busy} onClick={later} className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container-low">{copy.later}</button>
        <button type="submit" disabled={busy || !hasAnswers} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? prompt.saving : copy.save}</button>
      </div>
    </form>
  </dialog>;
}
