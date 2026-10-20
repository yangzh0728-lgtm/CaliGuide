import { 
  Home as HomeIcon, 
  BookOpen,
  MessageSquare, 
  Bot, 
  UserCircle 
} from 'lucide-react';
import { Page } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'home', label: t('nav.home'), icon: HomeIcon },
    { id: 'recommended', label: t('nav.guides'), icon: BookOpen },
    { id: 'forum', label: t('nav.forum'), icon: MessageSquare },
    { id: 'chatbot', label: t('nav.chatbot'), icon: Bot },
    { id: 'profile', label: t('nav.profile'), icon: UserCircle },
  ] as const;
  const activeTabId = currentPage === 'blog' || currentPage === 'guide' || currentPage === 'agencies'
    ? 'recommended'
    : currentPage;
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

  return (
    <nav aria-label={t('a11y.mainNavigation')} className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-outline-variant shadow-lg px-2 py-3 pb-safe">
      <div className="relative flex w-full items-center">
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 z-0 w-1/5 rounded-full bg-secondary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            data-navigation-tab={tab.id}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(tab.id)}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-1 sm:px-5 transition-all duration-200 ${
              isActive ? 'scale-100' : 'scale-90'
            }`}
          >
            <div className={`relative z-10 flex flex-col items-center justify-center ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
              <Icon size={24} aria-hidden="true" />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </div>
          </button>
        );
      })}
      </div>
    </nav>
  );
}
