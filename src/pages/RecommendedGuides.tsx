import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getRecommendedBlogArticles } from '../lib/blogLocalization';

interface RecommendedGuidesProps {
  onOpenBlog: (articleId: string) => void;
}

export default function RecommendedGuides({ onOpenBlog }: RecommendedGuidesProps) {
  const { language, t } = useLanguage();
  const recommendedGuides = getRecommendedBlogArticles(language);

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
      <header className="mb-5">
        <h1 className="text-3xl font-bold text-on-surface">{t('home.recommended')}</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          {t('recommended.subtitle')}
        </p>
      </header>

      <div className="grid gap-4">
        {recommendedGuides.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => onOpenBlog(guide.id)}
            className="grid min-h-[124px] grid-cols-[112px_1fr] overflow-hidden rounded-2xl border border-outline-variant bg-white text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <img src={guide.image} alt={guide.title} className="h-full w-full object-cover" />
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
