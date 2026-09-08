import type { LanguageCode } from "../i18n/translations";
import type { ArrivalStatusOption } from "./authStore";

const localeByLanguage: Record<LanguageCode, string> = {
  en: "en-US",
  "zh-CN": "zh-CN",
  yue: "zh-HK",
  "zh-TW": "zh-TW",
  es: "es-ES",
};

const guideByArrivalStatus: Record<ArrivalStatusOption, string> = {
  planning: "guide-legal-30-day-documents",
  arrived: "forum-first-30-days",
  long_term_resident: "guide-moving-address-checklist",
};

export function getArrivalGuideId(arrivalStatus: ArrivalStatusOption) {
  return guideByArrivalStatus[arrivalStatus];
}

export function formatProfileCount(template: string, count: number) {
  return template.replace("{count}", String(count));
}

export function formatProfileMonthYear(value: string, language: LanguageCode) {
  const parsed = new Date(`${value} 1, 00:00:00 UTC`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}
