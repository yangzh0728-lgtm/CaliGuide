import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Search,
  ShieldCheck,
  Siren,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getAppRoutePath } from "../lib/appRoutes";
import { getLocalizedBlogArticle } from "../lib/blogLocalization";
import {
  INSTITUTIONS,
  INSTITUTION_GROUPS,
  getInstitutionsByGroup,
  getRelatedGuideIds,
  searchInstitutions,
  type InstitutionGroupId,
  type LocalizedInstitution,
} from "../lib/institutions";

type DirectoryGroupId = "all" | InstitutionGroupId;

interface AgencyDirectoryShellProps {
  initialGroupId?: DirectoryGroupId;
  initialExpandedInstitutionId?: string;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}

const GROUP_ICONS = {
  "immigration-status": BadgeCheck,
  "identity-transportation": Building2,
  "money-tax": Landmark,
  work: BriefcaseBusiness,
  health: HeartPulse,
  "housing-consumer": House,
  education: GraduationCap,
  "emergency-local": Siren,
} as const;

export default function AgencyDirectoryShell({
  initialGroupId = "all",
  initialExpandedInstitutionId,
  onOpenInstitution,
  onOpenBlog,
}: AgencyDirectoryShellProps) {
  const { language, t } = useLanguage();
  const [activeGroupId, setActiveGroupId] = useState<DirectoryGroupId>(initialGroupId);
  const [expandedInstitutionId, setExpandedInstitutionId] = useState<string | null>(
    initialExpandedInstitutionId ?? null,
  );
  const [query, setQuery] = useState("");
  const groupedInstitutions = useMemo(() => getInstitutionsByGroup(language), [language]);
  const matchingIds = useMemo(
    () => new Set(searchInstitutions(query, language).map(({ id }) => id)),
    [language, query],
  );
  const selectedGroup = groupedInstitutions.find(({ id }) => id === activeGroupId);
  const visibleInstitutions = useMemo(() => {
    const candidates =
      activeGroupId === "all"
        ? groupedInstitutions.flatMap(({ institutions }) => institutions)
        : (selectedGroup?.institutions ?? []);
    return candidates.filter(({ id }) => matchingIds.has(id));
  }, [activeGroupId, groupedInstitutions, matchingIds, selectedGroup]);

  const selectGroup = (groupId: DirectoryGroupId) => {
    setActiveGroupId(groupId);
    setExpandedInstitutionId(null);
  };

  const groupNavigation = (mobile: boolean) => (
    <nav
      aria-label={t("agencies.findByNeed")}
      data-desktop-agency-navigation={mobile ? undefined : "true"}
      data-mobile-agency-navigation={mobile ? "true" : undefined}
      className={mobile ? "flex gap-2 overflow-x-auto pb-2 md:hidden" : "space-y-1"}
    >
      <GroupButton
        id="all"
        label={t("agencies.allAgencies")}
        count={INSTITUTIONS.length}
        active={activeGroupId === "all"}
        mobile={mobile}
        icon={Building2}
        onSelect={selectGroup}
      />
      {INSTITUTION_GROUPS.map((group) => (
        <GroupButton
          key={group.id}
          id={group.id}
          label={t(group.labelKey)}
          count={groupedInstitutions.find(({ id }) => id === group.id)?.institutions.length ?? 0}
          active={activeGroupId === group.id}
          mobile={mobile}
          icon={GROUP_ICONS[group.id]}
          onSelect={selectGroup}
        />
      ))}
    </nav>
  );

  return (
    <div className="md:grid md:grid-cols-[230px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden self-start rounded-lg border border-outline-variant bg-white p-3 shadow-sm md:sticky md:top-20 md:block">
        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-on-surface-variant">
          {t("agencies.findByNeed")}
        </p>
        {groupNavigation(false)}
      </aside>

      <section className="min-w-0 rounded-lg border border-outline-variant bg-white p-4 shadow-sm sm:p-5">
        {groupNavigation(true)}
        <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">
              {activeGroupId === "all" ? t("agencies.allAgencies") : t(selectedGroup?.labelKey ?? "")}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {visibleInstitutions.length} {t("agencies.organizationCount")}
            </p>
          </div>
          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">{t("agencies.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("agencies.searchPlaceholder")}
              className="h-11 w-full rounded-lg border border-outline-variant bg-white pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={t("agencies.clearSearch")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>

        <div data-agency-safety-notice="true" className="mt-5 rounded-lg border border-secondary/50 bg-secondary-container/45 px-4 py-3 text-sm leading-6 text-on-surface">
          <span className="font-bold">{t("agencies.safetyTitle")}</span>{" "}{t("agencies.safetyBody")}
        </div>

        {visibleInstitutions.length ? (
          <div className="mt-5 space-y-3">
            {visibleInstitutions.map((institution) => (
              <AgencyRow
                key={institution.id}
                institution={institution}
                language={language}
                expanded={expandedInstitutionId === institution.id}
                onToggle={() => setExpandedInstitutionId((current) => current === institution.id ? null : institution.id)}
                onOpenInstitution={onOpenInstitution}
                onOpenBlog={onOpenBlog}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-bold text-on-surface">{t("agencies.noResults")}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{t("agencies.noResultsHelp")}</p>
            <div className="mt-4 flex justify-center gap-2">
              {query ? <button type="button" onClick={() => setQuery("")} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-primary">{t("agencies.clearSearch")}</button> : null}
              {activeGroupId !== "all" ? <button type="button" onClick={() => selectGroup("all")} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">{t("agencies.showAll")}</button> : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function GroupButton({ id, label, count, active, mobile, icon: Icon, onSelect }: {
  key?: string;
  id: DirectoryGroupId;
  label: string;
  count: number;
  active: boolean;
  mobile: boolean;
  icon: typeof Building2;
  onSelect: (id: DirectoryGroupId) => void;
}) {
  return (
    <button
      type="button"
      data-agency-group={id}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(id)}
      className={`flex items-center gap-3 text-left font-bold transition-colors ${mobile ? "shrink-0 rounded-full border px-3 py-2 text-xs" : "w-full rounded-lg px-3 py-3 text-sm"} ${active ? "border-primary bg-primary text-white" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/15 text-white" : "bg-surface-container-high text-on-surface-variant"}`}>{count}</span>
    </button>
  );
}

function AgencyRow({ institution, language, expanded, onToggle, onOpenInstitution, onOpenBlog }: {
  key?: string;
  institution: LocalizedInstitution;
  language: Parameters<typeof getLocalizedBlogArticle>[1];
  expanded: boolean;
  onToggle: () => void;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}) {
  const { t } = useLanguage();
  const relatedGuides = getRelatedGuideIds(institution.id).map((guideId) => getLocalizedBlogArticle(guideId, language)).filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));
  const visibleGuides = relatedGuides.slice(0, 2);
  const remainingGuideCount = Math.max(0, relatedGuides.length - visibleGuides.length);
  const panelId = `agency-orientation-${institution.id}`;

  return (
    <article data-agency-row={institution.id} className="overflow-hidden rounded-lg border border-outline-variant bg-white">
      <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={onToggle} className="grid w-full grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left hover:bg-surface-container-low sm:grid-cols-[52px_minmax(0,1fr)_auto_auto]">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-low text-[11px] font-black text-primary sm:h-12 sm:w-12">{institution.acronym}</span>
        <span className="min-w-0">
          <span className="block font-bold leading-snug text-on-surface">{institution.officialName}</span>
          <span className="mt-1 block line-clamp-2 text-xs leading-5 text-on-surface-variant">{institution.purpose}</span>
        </span>
        <span className="hidden rounded-full bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant sm:block">{t(`agencies.jurisdiction.${institution.jurisdiction}`)}</span>
        {expanded ? <ChevronDown size={18} className="text-primary" aria-hidden="true" /> : <ChevronRight size={18} className="text-on-surface-variant" aria-hidden="true" />}
      </button>

      {expanded ? (
        <div id={panelId} className="border-t border-outline-variant bg-surface-container-low/40 px-4 py-4 sm:pl-[80px]">
          <div className="border-l-4 border-error pl-3 text-sm leading-6 text-on-surface-variant"><span className="font-bold text-error">{t("agencies.doesNotDo")}:</span>{" "}{institution.doesNotDo}</div>
          {institution.confusionPairs.length ? <div className="mt-3 space-y-2">{institution.confusionPairs.map((pair) => (
            <a key={`${institution.id}-${pair.targetInstitutionId}`} href={`/agencies/${pair.targetInstitutionId}`} onClick={(event) => { event.preventDefault(); onOpenInstitution(pair.targetInstitutionId); }} className="flex items-center justify-between gap-3 rounded-lg bg-primary/5 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10">
              <span>{pair.content[language].trigger}</span><ChevronRight size={16} aria-hidden="true" />
            </a>
          ))}</div> : null}
          {institution.scamNote ? <div className="mt-3 flex gap-2 rounded-lg border border-secondary/40 bg-secondary-container/35 px-3 py-2 text-sm leading-5 text-on-surface-variant"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" /><p className="line-clamp-2">{institution.scamNote}</p></div> : null}
          {visibleGuides.length ? (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-on-surface-variant"><BookOpen size={15} aria-hidden="true" />{t("agencies.relatedGuides")}</p>
              <div data-visible-related-guides={visibleGuides.length} data-remaining-related-guides={remainingGuideCount} className="mt-2 flex flex-wrap gap-2">
                {visibleGuides.map((guide) => <a key={guide.id} href={getAppRoutePath({ page: "blog", articleId: guide.id })} onClick={(event) => { event.preventDefault(); onOpenBlog(guide.id); }} className="rounded-full border border-outline-variant bg-white px-3 py-1.5 text-xs font-bold text-primary hover:border-primary">{guide.title}</a>)}
                {remainingGuideCount ? <span className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface-variant">+{remainingGuideCount}</span> : null}
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={institution.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-800 hover:bg-green-100">{institution.officialDomain}<ExternalLink size={14} aria-hidden="true" /></a>
            <a href={`/agencies/${institution.id}`} onClick={(event) => { event.preventDefault(); onOpenInstitution(institution.id); }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90">{t("agencies.fullDetails")}<ChevronRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      ) : null}
    </article>
  );
}
