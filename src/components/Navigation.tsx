import { 
  Home as HomeIcon, 
  MessageSquare, 
  Bot, 
  UserCircle 
} from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'home', label: t('nav.home'), icon: HomeIcon },
    { id: 'forum', label: t('nav.forum'), icon: MessageSquare },
    { id: 'chatbot', label: t('nav.chatbot'), icon: Bot },
    { id: 'profile', label: t('nav.profile'), icon: UserCircle },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-outline-variant shadow-lg flex justify-around items-center px-2 py-3 pb-safe">
      {tabs.map((tab) => {
        const isActive = currentPage === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`relative flex flex-col items-center justify-center px-5 py-1 transition-all duration-200 ${
              isActive ? 'scale-100' : 'scale-90 opacity-70 hover:opacity-100'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-secondary-container rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={`relative z-10 flex flex-col items-center justify-center ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
              <Icon size={24} fill={isActive ? "currentColor" : "none"} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
