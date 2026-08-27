import { ArrowLeft, Mail } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { getLegalDocument, LegalPageId } from "../lib/legalContent";

interface LegalPageProps {
  pageId: LegalPageId;
  onBack: () => void;
}

export default function LegalPage({ pageId, onBack }: LegalPageProps) {
  const { language, t } = useLanguage();
  const document = getLegalDocument(pageId, language);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-w-0 items-center gap-2 rounded-full px-2 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-high"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            <span className="truncate">{t("legal.back")}</span>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-primary">CaliGuide</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{document.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">{document.summary}</p>
          <p className="mt-4 text-sm font-semibold text-on-surface-variant">
            {t("legal.effectiveDate")}: {document.effectiveDate}
          </p>
        </div>

        <div className="mt-12">
          {document.sections.map((section) => (
            <section key={section.heading} className="border-t border-outline-variant py-8 first:border-t-0 first:pt-0">
              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-10">
                <h2 className="text-xl font-bold leading-7">{section.heading}</h2>
                <div className="space-y-4 text-base leading-7 text-on-surface-variant">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items && (
                    <ul className="space-y-3 pl-5">
                      {section.items.map((item) => (
                        <li key={item} className="list-disc pl-1">{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-outline-variant pt-8">
          <a
            href="mailto:privacy@caliguide.org"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <Mail size={18} aria-hidden="true" />
            {t("legal.contact")}: privacy@caliguide.org
          </a>
        </div>
      </main>
    </div>
  );
}
