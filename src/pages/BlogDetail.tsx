import { Bookmark, CalendarDays, Clock, ExternalLink, Tag } from 'lucide-react';
import { BlogArticle } from '../lib/blogContent';

interface BlogDetailProps {
  article: BlogArticle;
  isSaved: boolean;
  onToggleSave: (articleId: string) => void;
}

export default function BlogDetail({ article, isSaved, onToggleSave }: BlogDetailProps) {
  return (
    <article className="pt-20 pb-24 max-w-2xl mx-auto">
      <header className="px-4 pb-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
            {article.category}
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-bold leading-tight text-on-surface">{article.title}</h1>
          <button
            type="button"
            onClick={() => onToggleSave(article.id)}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              isSaved
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'border border-primary text-primary hover:bg-surface-container-low'
            }`}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save guide'}
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{article.excerpt}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} />
            {article.createdAt}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} />
            {article.readTime}
          </span>
        </div>
      </header>

      <img
        src={article.image}
        alt={article.title}
        className="h-64 w-full object-cover md:rounded-2xl"
      />

      <section className="px-4 pt-6 text-base leading-7 text-on-surface">
        {article.body.map((paragraph, index) => (
          <p key={index} className="mb-5">
            {paragraph}
          </p>
        ))}
      </section>

      {article.officialLinks?.length ? (
        <section className="mx-4 mt-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <h2 className="mb-3 text-lg font-bold text-on-surface">Official websites / links</h2>
          <div className="flex flex-col gap-3">
            {article.officialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-white p-3 text-left transition-colors hover:bg-surface-container-high"
              >
                <span className="flex items-start justify-between gap-3 text-sm font-bold text-primary">
                  {link.title}
                  <ExternalLink className="mt-0.5 shrink-0" size={16} />
                </span>
                <span className="mt-1 block text-sm leading-6 text-on-surface-variant">
                  用途：{link.purpose}
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
