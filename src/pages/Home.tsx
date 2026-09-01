import { useMemo, useState } from 'react';
import {
  Search,
  Car,
  Landmark,
  HomeIcon,
  HeartPulse,
  Clock,
  ChevronRight,
  Building2,
  Scale,
  BriefcaseBusiness,
  Bus,
  ShieldAlert,
  GraduationCap,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ResponsiveImage from '../components/ResponsiveImage';
import { getVisibleRecommendedGuides } from '../lib/homeRecommendations';
import { getLocalizedBlogArticle, getRecommendedBlogArticles, searchLocalizedBlogArticles } from '../lib/blogLocalization';
import { searchInstitutions } from '../lib/institutions';
import { getHomeTopics, type HomeTopicId } from '../lib/homeTopics';

interface HomeProps {
  onOpenBlog: (articleId: string) => void;
  onOpenRecommended: () => void;
  onOpenInstitution: (institutionId: string) => void;
  onOpenAgencies: () => void;
}

const TOPIC_ICONS: Record<HomeTopicId, LucideIcon> = {
  housing: HomeIcon,
  dmv: Car,
  legal: Scale,
  jobs: BriefcaseBusiness,
  health: HeartPulse,
  transportation: Bus,
  safety: ShieldAlert,
  education: GraduationCap,
  banking: Landmark,
};

export default function Home({ onOpenBlog, onOpenRecommended, onOpenInstitution, onOpenAgencies }: HomeProps) {
  const { language, t } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const topics = getHomeTopics();

  const recommendedGuides = getVisibleRecommendedGuides(getRecommendedBlogArticles(language), false);
  const searchResults = useMemo(
    () => searchLocalizedBlogArticles(language, searchText).slice(0, 6),
    [language, searchText],
  );
  const institutionSearchResults = useMemo(
    () => searchText.trim() ? searchInstitutions(searchText, language).slice(0, 3) : [],
    [language, searchText],
  );
  const showSearchResults = searchText.trim().length > 0;

  const trendingQuestions = [
    {
      id: 'trending-ssn',
      text: getLocalizedBlogArticle('trending-ssn', language)?.title ?? t('home.trending1.text'),
    },
    {
      id: 'trending-banking',
      text: getLocalizedBlogArticle('trending-banking', language)?.title ?? t('home.trending2.text'),
    }
  ];

  return (
    <div className="mx-auto max-w-6xl pb-24 pt-20">
      {/* Search Section */}
      <section className="mx-auto mb-7 max-w-3xl px-4">
        <div className="relative">
          <input 
            type="text" 
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (searchResults[0]) {
                  onOpenBlog(searchResults[0].id);
                } else if (institutionSearchResults[0]) {
                  onOpenInstitution(institutionSearchResults[0].id);
                }
              }
            }}
            placeholder={t('home.search')}
            className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        </div>
        {showSearchResults && (
          <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
            {searchResults.length > 0 || institutionSearchResults.length > 0 ? (
              <>
              {searchResults.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => onOpenBlog(article.id)}
                  className="flex w-full items-start gap-3 border-b border-outline-variant px-4 py-3 text-left last:border-b-0 hover:bg-surface-container-low"
                >
                  <ResponsiveImage
                    src={article.image}
                    alt={article.title}
                    sizes="48px"
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
                      {article.category}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold leading-snug text-on-surface">
                      {article.title}
                    </span>
                    <span className="mt-1 block line-clamp-1 text-xs text-on-surface-variant">
                      {article.excerpt}
                    </span>
                  </span>
                </button>
              ))}
              {institutionSearchResults.map((institution) => (
                <button
                  key={institution.id}
                  type="button"
                  onClick={() => onOpenInstitution(institution.id)}
                  className="flex w-full items-start gap-3 border-b border-outline-variant px-4 py-3 text-left last:border-b-0 hover:bg-surface-container-low"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 size={21} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase text-primary">
                      {t('agencies.searchResultType')}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold leading-snug text-on-surface">
                      {institution.name}
                    </span>
                    <span className="mt-1 block text-xs text-on-surface-variant">
                      {institution.officialDomain}
                    </span>
                  </span>
                </button>
              ))}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-on-surface-variant">{t('home.noSearchResults')}</div>
            )}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="mb-9 px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-on-surface">{t('home.browseByTopic')}</h2>
          <button type="button" onClick={onOpenRecommended} className="text-sm font-semibold text-primary">
            {t('home.seeAll')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.id];
            return (
            <button
              key={topic.id}
              type="button"
              data-home-topic={topic.id}
              aria-label={t(topic.labelKey)}
              onClick={() => onOpenBlog(topic.leadArticleId)}
              className="group flex min-h-[104px] items-center gap-3 rounded-lg border border-outline-variant bg-white p-3 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-on-surface">{t(topic.labelKey)}</span>
                <span className="mt-1 block text-xs text-on-surface-variant">
                  {topic.count} {t(topic.count === 1 ? 'home.guideSingular' : 'home.guidePlural')}
                </span>
              </span>
            </button>
          )})}
        </div>
      </section>

      <section className="mb-9 px-4">
        <div
          data-home-agencies="true"
          className="grid gap-5 rounded-lg border border-primary/25 bg-primary/5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-on-surface">{t('home.findAgency')}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-on-surface-variant">{t('home.findAgencyCopy')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenAgencies}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
          >
            {t('home.openAgencyDirectory')}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="mb-9">
        <div className="px-4 flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-on-surface">{t('home.recommended')}</h2>
          <button
            type="button"
            onClick={onOpenRecommended}
            className="text-sm font-semibold text-primary"
          >
            {t('home.seeAll')}
          </button>
        </div>
        <div
          data-recommended-layout="responsive"
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3"
        >
          {recommendedGuides.map((guide) => (
            <button
              key={guide.id} 
              onClick={() => onOpenBlog(guide.id)}
              className="w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-lg border border-outline-variant bg-white text-left shadow-sm transition-shadow hover:shadow-md md:w-auto md:max-w-none"
            >
              <ResponsiveImage
                src={guide.image}
                alt={guide.title}
                sizes="280px"
                loading="lazy"
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{guide.category}</span>
                <h3 className="font-bold text-on-surface leading-snug line-clamp-2">{guide.title}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant">
                  <Clock size={14} />
                  <span className="text-xs">{guide.readTime}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Questions */}
      <section className="mb-8 px-4">
        <h2 className="mb-4 text-xl font-bold text-on-surface">{t('home.practicalQuestions')}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {trendingQuestions.map((q) => (
            <button 
              key={q.id}
              onClick={() => onOpenBlog(q.id)}
              className="flex min-h-[108px] cursor-pointer items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4 text-left transition-all hover:border-primary"
            >
              <div className="flex flex-col gap-2 pr-4">
                <h4 className="font-semibold text-on-surface leading-tight">{q.text}</h4>
                <span className="text-xs font-bold text-primary">{t('home.readGuide')}</span>
              </div>
              <ChevronRight size={20} className="shrink-0 text-on-surface-variant" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
