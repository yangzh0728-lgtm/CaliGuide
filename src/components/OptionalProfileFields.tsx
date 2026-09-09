import { Plus, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { OPTIONAL_PROFILE_COPY } from "../i18n/optionalProfileCopy";
import { PROFILE_PROMPT_COPY } from "../i18n/profilePromptCopy";
import { COUNTRY_OPTIONS } from "../lib/nationalities";
import { OPTIONAL_PROFILE_FIELDS, type OptionalProfileField, type OptionalProfileValues } from "../lib/optionalProfile";

interface Props {
  value: OptionalProfileValues;
  onChange: (value: OptionalProfileValues) => void;
  fields?: OptionalProfileField[];
  disabled?: boolean;
}

export default function OptionalProfileFields({ value, onChange, fields = OPTIONAL_PROFILE_FIELDS, disabled = false }: Props) {
  const { t, language } = useLanguage();
  const copy = OPTIONAL_PROFILE_COPY[language];
  const prompt = PROFILE_PROMPT_COPY[language];
  const control = "mt-2 block min-w-0 w-full rounded-lg border border-outline-variant bg-white p-3 text-sm font-normal text-on-surface focus:outline-primary disabled:opacity-60";
  const set = <K extends OptionalProfileField>(key: K, next: OptionalProfileValues[K]) => onChange({ ...value, [key]: next });
  return <div className="space-y-4">
    {fields.includes("name") && <label className="block text-sm font-medium">{prompt.nameLabel}
      <input className={control} disabled={disabled} autoComplete="nickname" maxLength={80} value={value.name} onChange={(e) => set("name", e.target.value)} />
    </label>}
    {fields.includes("dateOfBirth") && <label className="block text-sm font-medium">{t("auth.dateOfBirth")}
      <input type="date" className={control} disabled={disabled} autoComplete="bday" max={new Date().toLocaleDateString("en-CA")} value={value.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
    </label>}
    {fields.includes("sex") && <label className="block text-sm font-medium">{t("auth.sex")}
      <select aria-label={t("auth.sex")} className={control} disabled={disabled} value={value.sex} onChange={(e) => set("sex", e.target.value as OptionalProfileValues["sex"])}>
        <option value="">{copy.choose}</option>
        <option value="male">{t("auth.sexMale")}</option><option value="female">{t("auth.sexFemale")}</option><option value="prefer_not_to_say">{t("auth.sexPreferNotToSay")}</option>
      </select>
    </label>}
    {fields.includes("nationalities") && <fieldset className="min-w-0" disabled={disabled}>
      <legend className="text-sm font-medium">{t("auth.countryNationality")}</legend>
      {(value.nationalities.length ? value.nationalities : [""]).map((nationality, index) => <div key={index} className="flex items-center gap-2">
        <label className="min-w-0 flex-1"><span className="sr-only">{t("auth.countryNationality")} {index + 1}</span>
          <select aria-label={`${t("auth.countryNationality")} ${index + 1}`} className={control} value={nationality} onChange={(e) => { const next = [...(value.nationalities.length ? value.nationalities : [""])]; next[index] = e.target.value; set("nationalities", next); }}>
            <option value="">{t("auth.countryNationalityPlaceholder")}</option>
            {COUNTRY_OPTIONS.map((country) => <option key={country} value={country} disabled={country !== nationality && value.nationalities.includes(country)}>{country}</option>)}
          </select>
        </label>
        {value.nationalities.length > 1 && <button type="button" title={t("auth.removeNationality")} aria-label={`${t("auth.removeNationality")} ${index + 1}`} onClick={() => set("nationalities", value.nationalities.filter((_, i) => i !== index))} className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-surface-container-low"><X size={18} /></button>}
      </div>)}
      <button type="button" onClick={() => set("nationalities", [...value.nationalities, ""])} disabled={!value.nationalities.length || value.nationalities.includes("")} className="mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-primary disabled:opacity-40"><Plus size={18} />{t("auth.addNationality")}</button>
    </fieldset>}
    {fields.includes("currentLocation") && <label className="block text-sm font-medium">{t("auth.currentLocation")}
      <input className={control} disabled={disabled} autoComplete="address-level2" maxLength={120} value={value.currentLocation} onChange={(e) => set("currentLocation", e.target.value)} />
    </label>}
    {fields.includes("arrivalStatus") && <label className="block text-sm font-medium">{prompt.arrivalLabel}
      <select aria-label={prompt.arrivalLabel} className={control} disabled={disabled} value={value.arrivalStatus} onChange={(e) => set("arrivalStatus", e.target.value as OptionalProfileValues["arrivalStatus"])}>
        <option value="">{copy.choose}</option><option value="planning">{t("auth.arrivalPlanning")}</option><option value="arrived">{t("auth.arrivalArrived")}</option><option value="long_term_resident">{t("auth.arrivalLongTermResident")}</option>
      </select>
      <span className="mt-1 block text-xs font-normal leading-5 text-on-surface-variant">{prompt.arrivalBody}</span>
    </label>}
  </div>;
}
