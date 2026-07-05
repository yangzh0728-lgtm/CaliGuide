import { Search, ArrowLeft } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function TopAppBar({ title, showBack, onBack }: TopAppBarProps) {
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
          {!showBack ? (
            <img
              src="/brand/full-logo.png"
              alt="CaliGuide"
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <h1 className="text-xl font-bold text-primary tracking-tight">{title}</h1>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors">
          <Search size={22} />
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
