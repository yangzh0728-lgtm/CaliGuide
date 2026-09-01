import { useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  BusFront,
  CarFront,
  Clock,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Scale,
  Search,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import ReferenceLibraryTabs from "../components/ReferenceLibraryTabs";
import ResponsiveImage from "../components/ResponsiveImage";
import { useLanguage } from "../context/LanguageContext";
import {
  getGuideDirectoryArticles,
  getGuideDirectoryCount,
  GUIDE_DIRECTORY_GROUPS,
  type GuideDirectoryFilterId,
} from "../lib/guideDirectory";

interface RecommendedGuidesProps {
  onOpenBlog: (articleId: string) => void;
  onOpenAgencies: () => void;
}

const GROUP_ICONS: Record<Exclude<GuideDirectoryFilterId, "all">, LucideIcon> = {
  dmv: CarFront,
  banking: Landmark,
  housing: House,
  health: HeartPulse,
  legal: Scale,
  jobs: BriefcaseBusiness,
  transportation: BusFront,
  safety: ShieldCheck,
  education: GraduationCap,
  community: Users,
};

export default function RecommendedGuides({ onOpenBlog, onOpenAgencies }: RecommendedGuidesProps) {
  const { language, t } = useLanguage();
  const [activeGroupId, setActiveGroupId] = useState<GuideDirectoryFilterId>("all");
  const [query, setQuery] = useState("");
  const guides = useMemo(
    () => getGuideDirectoryArticles(language, activeGroupId, query),
    [activeGroupId, language, query],
  );
  const activeGroup = GUIDE_DIRECTORY_GROUPS.find(({ id }) => id === activeGroupId);

  const groupNavigation = (mobile: boolean) => (
    <nav
      aria-label={t("recommended.findByTopic")}
      data-desktop-guide-navigation={mobile ? undefined : "true"}
      data-mobile-guide-navigation={mobile ? "true" : undefined}
      className={mobile ? "flex gap-2 overflow-x-auto pb-2 md:hidden" : "space-y-1"}
    >
      <GuideGroupButton
        id="all"
        label={t("recommended.allGuides")}
        count={getGuideDirectoryCount("all")}
        active={activeGroupId === "all"}
        mobile={mobile}
        icon={BookOpen}
        onSelect={setActiveGroupId}
      />
      {GUIDE_DIRECTORY_GROUPS.map((group) => (
        <GuideGroupButton
          key={group.id}
          id={group.id}
          label={t(group.labelKey)}
          count={getGuideDirectoryCount(group.id)}
          active={activeGroupId === group.id}
          mobile={mobile}
          icon={GROUP_ICONS[group.id]}
          onSelect={setActiveGroupId}
        />
      ))}
    </nav>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:px-8">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-bold leading-tight text-on-surface">{t("recommended.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
          {t("recommended.subtitle")}
        </p>
        <div className="mt-5">
          <ReferenceLibraryTabs active="guides" onOpenGuides={() => {}} onOpenAgencies={onOpenAgencies} />
        </div>
      </header>

      <div className="md:grid md:grid-cols-[230px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-lg border border-outline-variant bg-white p-3 shadow-sm md:sticky md:top-20 md:block">
          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-on-surface-variant">
            {t("recommended.findByTopic")}
          </p>
          {groupNavigation(false)}
        </aside>

        <section className="min-w-0">
          {groupNavigation(true)}
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                {activeGroupId === "all" ? t("recommended.allGuides") : t(activeGroup?.labelKey ?? "")}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {guides.length} {t(guides.length === 1 ? "recommended.guideSingular" : "recommended.guidePlural")}
              </p>
            </div>
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">{t("recommended.searchPlaceholder")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("recommended.searchPlaceholder")}
                className="h-11 w-full rounded-lg border border-outline-variant bg-white pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label={t("recommended.clearSearch")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </div>

          {guides.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {guides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  data-guide-card={guide.id}
                  onClick={() => onOpenBlog(guide.id)}
                  className="group flex min-h-[290px] flex-col overflow-hidden rounded-lg border border-outline-variant bg-white text-left shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <ResponsiveImage
                    src={guide.image}
                    alt=""
                    sizes="(min-width: 1280px) 300px, (min-width: 768px) 380px, 100vw"
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-bold uppercase text-secondary">{guide.category}</span>
                    <span className="mt-2 text-base font-bold leading-snug text-on-surface group-hover:text-primary">{guide.title}</span>
                    <span className="mt-2 line-clamp-2 text-sm leading-5 text-on-surface-variant">{guide.excerpt}</span>
                    <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-on-surface-variant">
                      <Clock size={14} aria-hidden="true" />
                      {guide.readTime}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-bold text-on-surface">{t("recommended.noResults")}</p>
              <p className="mt-2 text-sm text-on-surface-variant">{t("recommended.noResultsHelp")}</p>
              <div className="mt-4 flex justify-center gap-2">
                {query ? (
                  <button type="button" onClick={() => setQuery("")} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-primary">{t("recommended.clearSearch")}</button>
                ) : null}
                {activeGroupId !== "all" ? (
                  <button type="button" onClick={() => setActiveGroupId("all")} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">{t("recommended.showAll")}</button>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function GuideGroupButton({ id, label, count, active, mobile, icon: Icon, onSelect }: {
  key?: string;
  id: GuideDirectoryFilterId;
  label: string;
  count: number;
  active: boolean;
  mobile: boolean;
  icon: LucideIcon;
  onSelect: (id: GuideDirectoryFilterId) => void;
}) {
  return (
    <button
      type="button"
      data-guide-group={id}
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
