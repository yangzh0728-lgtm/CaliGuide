import { Building2, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ResponsiveImage from '../components/ResponsiveImage';
import { getRecommendedBlogArticles } from '../lib/blogLocalization';

interface RecommendedGuidesProps {
  onOpenBlog: (articleId: string) => void;
  onOpenAgencies: () => void;
}

export default function RecommendedGuides({ onOpenBlog, onOpenAgencies }: RecommendedGuidesProps) {
  const { language, t } = useLanguage();
  const recommendedGuides = getRecommendedBlogArticles(language);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-20">
      <header className="mb-7 border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface">{t('home.recommended')}</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          {t('recommended.subtitle')}
        </p>
        <button
          type="button"
          onClick={onOpenAgencies}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5"
        >
          <Building2 size={17} aria-hidden="true" />
          {t('agencies.openDirectory')}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedGuides.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => onOpenBlog(guide.id)}
            className="grid min-h-[132px] grid-cols-[112px_1fr] overflow-hidden rounded-lg border border-outline-variant bg-white text-left shadow-sm transition-shadow hover:border-primary hover:shadow-md"
          >
            <ResponsiveImage
              src={guide.image}
              alt={guide.title}
              sizes="(min-width: 768px) 320px, 128px"
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="flex flex-col gap-1 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{guide.category}</span>
              <h2 className="text-base font-bold leading-snug text-on-surface">{guide.title}</h2>
              <div className="mt-auto flex items-center gap-1.5 text-on-surface-variant">
                <Clock size={14} />
                <span className="text-xs">{guide.readTime}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
