import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CircleX,
  Landmark,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getAppRoutePath } from "../lib/appRoutes";
import { getLocalizedBlogArticle } from "../lib/blogLocalization";
import {
  getInstitutionsByGroup,
  getRelatedGuideIds,
  searchInstitutions,
  type Institution,
} from "../lib/institutions";

interface AgenciesProps {
  selectedInstitutionId?: string;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}

export default function Agencies({
  selectedInstitutionId,
  onOpenInstitution,
  onOpenBlog,
}: AgenciesProps) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const matchingIds = useMemo(
    () => new Set(searchInstitutions(query).map((institution) => institution.id)),
    [query],
  );
  const groupedInstitutions = useMemo(
    () =>
      getInstitutionsByGroup()
        .map((group) => ({
          ...group,
          institutions: group.institutions.filter((institution) => matchingIds.has(institution.id)),
        }))
        .filter((group) => group.institutions.length > 0),
    [matchingIds],
  );

  useEffect(() => {
    if (!selectedInstitutionId || typeof document === "undefined") {
      return;
    }
    document.getElementById(`agency-${selectedInstitutionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedInstitutionId]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-20">
      <header className="border-b border-outline-variant pb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 size={23} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight text-on-surface">{t("agencies.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              {t("agencies.subtitle")}
            </p>
          </div>
        </div>

        <label className="relative mt-5 block">
          <span className="sr-only">{t("agencies.searchPlaceholder")}</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={20}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("agencies.searchPlaceholder")}
            className="h-12 w-full rounded-lg border border-outline-variant bg-white pl-12 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
      </header>

      {groupedInstitutions.length ? (
        <div className="mt-7 space-y-10">
          {groupedInstitutions.map((group) => (
            <section key={group.id} aria-labelledby={`agency-group-${group.id}`}>
              <h2
                id={`agency-group-${group.id}`}
                className="mb-3 flex items-center gap-2 text-lg font-bold text-on-surface"
              >
                <Landmark size={19} className="text-primary" aria-hidden="true" />
                {t(group.labelKey)}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.institutions.map((institution) => (
                  <AgencyCard
                    key={institution.id}
                    institution={institution}
                    language={language}
                    isSelected={institution.id === selectedInstitutionId}
                    onOpenInstitution={onOpenInstitution}
                    onOpenBlog={onOpenBlog}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm font-semibold text-on-surface-variant">
          {t("agencies.noResults")}
        </p>
      )}
    </div>
  );
}

function AgencyCard({
  institution,
  language,
  isSelected,
  onOpenInstitution,
  onOpenBlog,
}: {
  key?: string;
  institution: Institution;
  language: Parameters<typeof getLocalizedBlogArticle>[1];
  isSelected: boolean;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}) {
  const { t } = useLanguage();
  const relatedGuides = getRelatedGuideIds(institution.id)
    .map((guideId) => getLocalizedBlogArticle(guideId, language))
    .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));

  return (
    <article
      id={`agency-${institution.id}`}
      data-selected={isSelected ? "true" : "false"}
      className={`scroll-mt-24 rounded-lg border bg-white p-4 shadow-sm transition-colors ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-outline-variant"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-primary">{institution.shortName}</p>
          <h3 className="mt-1 text-base font-bold leading-snug text-on-surface">{institution.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
          {t(`agencies.jurisdiction.${institution.jurisdiction}`)}
        </span>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-6">
        <div>
          <h4 className="font-bold text-on-surface">{t("agencies.whatItDoes")}</h4>
          <p className="mt-1 text-on-surface-variant">{institution.purpose}</p>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 font-bold text-on-surface">
            <CircleX size={16} className="text-red-600" aria-hidden="true" />
            {t("agencies.doesNotDo")}
          </h4>
          <p className="mt-1 text-on-surface-variant">{institution.doesNotDo}</p>
        </div>
        <div className="border-l-2 border-secondary pl-3">
          <h4 className="flex items-center gap-1.5 font-bold text-on-surface">
            <ShieldCheck size={16} className="text-secondary" aria-hidden="true" />
            {t("agencies.scamNote")}
          </h4>
          <p className="mt-1 text-on-surface-variant">{institution.scamNote}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={institution.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90"
        >
          {t("agencies.officialWebsite")}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        {!isSelected ? (
          <a
            href={`/agencies/${institution.id}`}
            onClick={(event) => {
              event.preventDefault();
              onOpenInstitution(institution.id);
            }}
            className="inline-flex items-center rounded-lg border border-outline-variant px-3 py-2 text-xs font-bold text-primary hover:border-primary"
          >
            {t("agencies.viewAgency")}
          </a>
        ) : null}
      </div>

      {relatedGuides.length ? (
        <div className="mt-5 border-t border-outline-variant pt-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-on-surface-variant">
            <BookOpen size={15} aria-hidden="true" />
            {t("agencies.relatedGuides")}
          </h4>
          <ul className="mt-2 space-y-2">
            {relatedGuides.map((guide) => (
              <li key={guide.id}>
                <a
                  href={getAppRoutePath({ page: "blog", articleId: guide.id })}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenBlog(guide.id);
                  }}
                  className="text-sm font-semibold leading-5 text-primary hover:underline"
                >
                  {guide.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
