import { Search, Car, Landmark, HomeIcon, HeartPulse, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getVisibleRecommendedGuides } from '../lib/homeRecommendations';
import { getLocalizedBlogArticle, getRecommendedBlogArticles } from '../lib/blogLocalization';

interface HomeProps {
  onOpenBlog: (articleId: string) => void;
  onOpenRecommended: () => void;
}

export default function Home({ onOpenBlog, onOpenRecommended }: HomeProps) {
  const { language, t } = useLanguage();
  const categories = [
    { id: 'category-dmv', icon: Car, label: t('home.dmv'), color: 'bg-blue-100 text-blue-700' },
    { id: 'category-banking', icon: Landmark, label: t('home.banking'), color: 'bg-amber-100 text-amber-700' },
    { id: 'category-housing', icon: HomeIcon, label: t('home.housing'), color: 'bg-green-100 text-green-700' },
    { id: 'category-health', icon: HeartPulse, label: t('home.health'), color: 'bg-red-100 text-red-700' },
  ];

  const recommendedGuides = getVisibleRecommendedGuides(getRecommendedBlogArticles(language), false);

  const trendingQuestions = [
    {
      id: 'trending-ssn',
      text: getLocalizedBlogArticle('trending-ssn', language)?.title ?? t('home.trending1.text'),
      replies: 24,
      time: t('home.trending1.time')
    },
    {
      id: 'trending-banking',
      text: getLocalizedBlogArticle('trending-banking', language)?.title ?? t('home.trending2.text'),
      replies: 11,
      time: t('home.trending2.time')
    }
  ];

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto">
      {/* Search Section */}
      <section className="px-4 mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder={t('home.search')}
            className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => onOpenBlog(cat.id)} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-medium text-on-surface-variant">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="mb-8">
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
        <div className="flex overflow-x-auto gap-4 px-4 pb-2 no-scrollbar">
          {recommendedGuides.map((guide) => (
            <button
              key={guide.id} 
              onClick={() => onOpenBlog(guide.id)}
              className="min-w-[280px] bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow text-left"
            >
              <img
                src={guide.image}
                alt={guide.title}
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
      <section className="px-4 mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-4">{t('home.trending')}</h2>
        <div className="flex flex-col gap-3">
          {trendingQuestions.map((q) => (
            <button 
              key={q.id}
              onClick={() => onOpenBlog(q.id)}
              className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all cursor-pointer flex justify-between items-start text-left"
            >
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-on-surface leading-tight">{q.text}</h4>
                <div className="flex gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} /> {q.replies} {t('home.replies')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {q.time}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-on-surface-variant mt-1" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
