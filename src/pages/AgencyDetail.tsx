import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleX,
  ExternalLink,
  Languages,
  Landmark,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getAppRoutePath } from "../lib/appRoutes";
import { getLocalizedBlogArticle } from "../lib/blogLocalization";
import {
  getInstitutionReferences,
  getLocalizedInstitution,
  getRelatedGuideIds,
} from "../lib/institutions";

interface AgencyDetailProps {
  institutionId: string;
  onBackToDirectory: () => void;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}

const DATE_LOCALES = {
  en: "en-US",
  "zh-CN": "zh-CN",
  yue: "zh-HK",
  "zh-TW": "zh-TW",
  es: "es-US",
} as const;

export default function AgencyDetail({
  institutionId,
  onBackToDirectory,
  onOpenInstitution,
  onOpenBlog,
}: AgencyDetailProps) {
  const { language, t } = useLanguage();
  const institution = getLocalizedInstitution(institutionId, language);

  if (!institution) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-24 text-center" data-agency-not-found="true">
        <h1 className="text-3xl font-bold text-on-surface">{t("agencies.notFoundTitle")}</h1>
        <p className="mt-3 text-on-surface-variant">{t("agencies.notFoundBody")}</p>
        <button type="button" onClick={onBackToDirectory} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-white">
          <ArrowLeft size={18} aria-hidden="true" />
          {t("agencies.backToDirectory")}
        </button>
      </main>
    );
  }

  const references = getInstitutionReferences(institution.id, language);
  const relatedGuides = getRelatedGuideIds(institution.id)
    .map((guideId) => getLocalizedBlogArticle(guideId, language))
    .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));
  const reviewedDate = new Intl.DateTimeFormat(DATE_LOCALES[language], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${institution.lastReviewedAt}T00:00:00Z`));

  return (
    <main data-agency-detail={institution.id} className="mx-auto max-w-5xl px-4 pb-28 pt-20 sm:px-6 lg:px-8">
      <button type="button" onClick={onBackToDirectory} className="mb-5 inline-flex items-center gap-2 rounded-lg py-2 pr-3 text-sm font-bold text-primary hover:bg-surface-container-low">
        <ArrowLeft size={18} aria-hidden="true" />
        {t("agencies.backToDirectory")}
      </button>

      <header className="rounded-lg border border-outline-variant bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-sm font-black text-primary">
              {institution.acronym}
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-primary">{t(`agencies.jurisdiction.${institution.jurisdiction}`)}</p>
              <h1 className="mt-1 text-3xl font-bold leading-tight text-on-surface">{institution.officialName}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">{institution.purpose}</p>
            </div>
          </div>
          <a href={institution.officialUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90">
            {institution.officialDomain}
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="mt-5 rounded-lg border border-error/30 bg-error/5 p-5" aria-labelledby="agency-boundary-title">
        <h2 id="agency-boundary-title" className="flex items-center gap-2 text-lg font-bold text-error">
          <CircleX size={20} aria-hidden="true" />
          {t("agencies.doesNotDo")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{institution.doesNotDo}</p>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {references.length ? (
          <DetailSection icon={Landmark} title={t("agencies.officialActions")}>
            <div className="space-y-2">
              {references.map((referenceItem) => (
                <a key={referenceItem.id} href={referenceItem.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-lg border border-outline-variant px-3 py-3 hover:border-primary">
                  <span>
                    <span className="block text-sm font-bold text-primary">{referenceItem.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{referenceItem.purpose}</span>
                  </span>
                  <ExternalLink size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                </a>
              ))}
            </div>
          </DetailSection>
        ) : null}

        <div className="space-y-5">
          {institution.confusionPairs.length ? (
            <DetailSection icon={Route} title={t("agencies.oftenConfusedWith")}>
              <div className="space-y-3">
                {institution.confusionPairs.map((pair) => (
                  <a key={pair.targetInstitutionId} href={`/agencies/${pair.targetInstitutionId}`} onClick={(event) => { event.preventDefault(); onOpenInstitution(pair.targetInstitutionId); }} className="block rounded-lg bg-primary/5 px-3 py-3 hover:bg-primary/10">
                    <span className="flex items-center justify-between gap-3 text-sm font-bold text-primary">{pair.content[language].trigger}<ChevronRight size={16} aria-hidden="true" /></span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{pair.content[language].explanation}</span>
                  </a>
                ))}
              </div>
            </DetailSection>
          ) : null}

          <DetailSection icon={Languages} title={t("agencies.languageAccess")}>
            <p className="text-sm leading-6 text-on-surface-variant">{institution.languageAccessNote}</p>
          </DetailSection>

          {institution.scamNote ? (
            <DetailSection icon={ShieldCheck} title={t("agencies.scamNote")}>
              <p className="text-sm leading-6 text-on-surface-variant">{institution.scamNote}</p>
            </DetailSection>
          ) : null}
        </div>
      </div>

      {relatedGuides.length ? (
        <section className="mt-5 rounded-lg border border-outline-variant bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface"><BookOpen size={20} className="text-primary" aria-hidden="true" />{t("agencies.relatedGuides")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((guide) => (
              <a key={guide.id} href={getAppRoutePath({ page: "blog", articleId: guide.id })} onClick={(event) => { event.preventDefault(); onOpenBlog(guide.id); }} className="rounded-lg border border-outline-variant px-4 py-3 text-sm font-bold text-primary hover:border-primary">{guide.title}</a>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-5 flex items-center gap-2 text-xs text-on-surface-variant"><CalendarDays size={15} aria-hidden="true" />{t("agencies.lastReviewed")}: {reviewedDate}</p>
    </main>
  );
}

function DetailSection({ icon: Icon, title, children }: { icon: typeof Landmark; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-outline-variant bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface"><Icon size={20} className="text-primary" aria-hidden="true" />{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
