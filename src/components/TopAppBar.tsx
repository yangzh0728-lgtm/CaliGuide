import { useState } from 'react';
import { Languages, Search, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function TopAppBar({ title, showBack, onBack }: TopAppBarProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { language, languages, setLanguage, t } = useLanguage();
  const selectedLanguage = languages.find((item) => item.code === language);

  return (
    <header className="flex justify-between items-center w-full px-4 h-16 z-50 fixed top-0 bg-white/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex items-center gap-2">
          {!showBack && <Languages className="text-primary" size={24} />}
          <h1 className="text-xl font-bold text-primary tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors">
          <Search size={22} />
        </button>
        <div className="relative">
          <button
            aria-label={t('language.label')}
            onClick={() => setIsLanguageOpen((value) => !value)}
            className="flex items-center gap-1.5 text-on-surface-variant hover:bg-surface-container-high px-2.5 py-2 rounded-full transition-colors"
          >
            <Languages size={21} />
            <span className="text-xs font-bold">{selectedLanguage?.shortLabel}</span>
          </button>
          {isLanguageOpen && (
            <div className="absolute right-0 top-12 w-44 rounded-2xl border border-outline-variant bg-white p-2 shadow-xl">
              {languages.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code);
                    setIsLanguageOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    item.code === language
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                  {item.code === language && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
