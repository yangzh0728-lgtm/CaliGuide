import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getGuideDisclaimerKinds } from '../lib/guideDisclaimers';

interface GuideDisclaimerProps {
  articleId: string;
}

export default function GuideDisclaimer({ articleId }: GuideDisclaimerProps) {
  const { t } = useLanguage();
  const kinds = getGuideDisclaimerKinds(articleId);

  if (!kinds.length) {
    return null;
  }

  return (
    <aside
      role="note"
      aria-labelledby="guide-disclaimer-heading"
      className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="guide-disclaimer-heading" className="text-sm font-bold text-amber-900">
            {t('disclaimer.heading')}
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {kinds.map((kind) => (
              <p key={kind} className="text-sm leading-6 text-amber-900">
                {t(`disclaimer.${kind}`)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
