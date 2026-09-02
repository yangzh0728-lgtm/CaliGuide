import { Bookmark, CalendarDays, Clock, ExternalLink, Tag } from 'lucide-react';
import GuideDisclaimer from '../components/GuideDisclaimer';
import MovingDeadlineChecklist from '../components/MovingDeadlineChecklist';
import ResponsiveImage from '../components/ResponsiveImage';
import { useLanguage } from '../context/LanguageContext';
import { formatBlogBodyBlock, type BlogBodyTone } from '../lib/blogBodyFormat';
import type { BlogArticle } from '../lib/blogContent';
import {
  getGuideCitationSet,
  getSectionCitationNumbers,
  getSectionActions,
  type GuideCitationSet,
} from '../lib/guideCitations';

interface BlogDetailProps {
  article: BlogArticle;
  isAuthenticated?: boolean;
  isSaved: boolean;
  onToggleSave: (articleId: string) => void;
}

export default function BlogDetail({
  article,
  isAuthenticated = true,
  isSaved,
  onToggleSave,
}: BlogDetailProps) {
  const { language, t } = useLanguage();
  const bodyBlocks = article.body.map(formatBlogBodyBlock);
  const citationSet = getGuideCitationSet(article.id, language);

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
              isAuthenticated && isSaved
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'border border-primary text-primary hover:bg-surface-container-low'
            }`}
          >
            <Bookmark
              size={18}
              fill={isAuthenticated && isSaved ? 'currentColor' : 'none'}
            />
            {isAuthenticated
              ? isSaved
                ? t('blog.saved')
                : t('blog.saveGuide')
              : t('auth.signInToSave')}
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

      <ResponsiveImage
        src={article.image}
        alt={article.title}
        sizes="(min-width: 768px) 896px, 100vw"
        fetchPriority="high"
        className="h-64 w-full object-cover md:rounded-2xl"
      />

      <section className="px-4 pt-6">
        <GuideDisclaimer articleId={article.id} />

        <div className="flex flex-col gap-4">
          {bodyBlocks.map((block, index) => (
            <section
              key={index}
              id={`guide-section-${index + 1}`}
              className={`${getBodyBlockClassName(block.tone)} scroll-mt-24`}
            >
              {block.heading ? (
                <h2 className={getBodyHeadingClassName(block.tone)}>
                  {block.heading}
                </h2>
              ) : null}

              {block.content ? (
                <p className={getBodyContentClassName(block.tone)}>
                  {block.content}
                </p>
              ) : null}

              {article.id === 'guide-moving-address-checklist' && index === 1 ? (
                <MovingDeadlineChecklist />
              ) : null}

              {block.listItems.length ? (
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {block.listItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-medium leading-6 text-on-surface shadow-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              {citationSet ? (
                <>
                  <CitationMarkers citationSet={citationSet} sectionIndex={index} />
                  <GuideSectionActions citationSet={citationSet} sectionIndex={index} />
                </>
              ) : null}
            </section>
          ))}
        </div>
      </section>

      {citationSet ? <GuideReferences citationSet={citationSet} /> : null}
    </article>
  );
}

function GuideSectionActions({
  citationSet,
  sectionIndex,
}: {
  citationSet: GuideCitationSet;
  sectionIndex: number;
}) {
  const { t } = useLanguage();
  const actions = getSectionActions(citationSet, sectionIndex);

  if (!actions.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label={t('blog.officialActions')}>
      {actions.map((action) => (
        <a
          key={`${action.referenceId}-${action.kind}`}
          href={action.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span>{t(`blog.action.${action.kind}`)}: {action.title}</span>
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function CitationMarkers({
  citationSet,
  sectionIndex,
}: {
  citationSet: GuideCitationSet;
  sectionIndex: number;
}) {
  const citationNumbers = getSectionCitationNumbers(citationSet, sectionIndex);

  if (!citationNumbers.length) {
    return null;
  }

  return (
    <span className="mt-3 flex flex-wrap items-center gap-1" aria-label="Citations">
      {citationNumbers.map((citationNumber) => (
        <a
          key={citationNumber}
          href={`#reference-${citationNumber}`}
          className="text-xs font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
        >
          [{citationNumber}]
        </a>
      ))}
    </span>
  );
}

function GuideReferences({ citationSet }: { citationSet: GuideCitationSet }) {
  const { t } = useLanguage();

  return (
    <section
      id="guide-references"
      className="mx-4 mt-6 scroll-mt-24 border-t border-outline-variant pt-6"
    >
      <h2 className="text-xl font-bold text-on-surface">{t('blog.references')}</h2>
      <p className="mt-1 text-sm leading-6 text-on-surface-variant">
        {t('blog.referencesDescription')}
      </p>

      <ol className="mt-4 flex flex-col gap-4">
        {citationSet.references.map((referenceItem, index) => {
          const citationNumber = index + 1;
          const sectionNumbers = citationSet.sectionCitationIds
            .map((citationIds, sectionIndex) =>
              citationIds.includes(referenceItem.id) ? sectionIndex + 1 : null,
            )
            .filter((sectionNumber): sectionNumber is number => sectionNumber !== null);

          return (
            <li
              key={referenceItem.id}
              id={`reference-${citationNumber}`}
              className="scroll-mt-24 border-l-2 border-primary/30 pl-4"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm font-bold text-primary">[{citationNumber}]</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={referenceItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm font-bold leading-6 text-primary hover:underline"
                  >
                    <span>{referenceItem.title}</span>
                    <ExternalLink className="mt-1 shrink-0" size={14} />
                  </a>
                  <p className="mt-0.5 text-sm font-semibold text-on-surface">
                    <a
                      href={`/agencies/${referenceItem.institutionId}`}
                      className="text-primary hover:underline"
                    >
                      {referenceItem.publisher}
                    </a>
                    {' '}· {t('blog.officialSource')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    {referenceItem.purpose}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                    <span>{t('blog.reviewedOn')}: {referenceItem.lastReviewedAt}</span>
                    {sectionNumbers.map((sectionNumber) => (
                      <a
                        key={sectionNumber}
                        href={`#guide-section-${sectionNumber}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {t('blog.backToSection')} {sectionNumber}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function getBodyBlockClassName(tone: BlogBodyTone) {
  const base = "rounded-2xl border p-4";

  if (tone === "checklist") {
    return `${base} border-primary/20 bg-primary/5`;
  }

  if (tone === "notice") {
    return `${base} border-secondary/20 bg-secondary-container/40`;
  }

  if (tone === "warning") {
    return `${base} border-red-200 bg-red-50`;
  }

  return `${base} border-outline-variant bg-white`;
}

function getBodyHeadingClassName(tone: BlogBodyTone) {
  const base = "mb-2 text-lg font-bold leading-snug";

  if (tone === "checklist") {
    return `${base} text-primary`;
  }

  if (tone === "notice") {
    return `${base} text-secondary`;
  }

  if (tone === "warning") {
    return `${base} text-red-700`;
  }

  return `${base} text-on-surface`;
}

function getBodyContentClassName(tone: BlogBodyTone) {
  const base = "text-[15px] leading-7";

  if (tone === "warning") {
    return `${base} text-red-900`;
  }

  return `${base} text-on-surface-variant`;
}
