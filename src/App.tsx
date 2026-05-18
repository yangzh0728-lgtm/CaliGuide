/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import TopAppBar from './components/TopAppBar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Forum from './pages/Forum';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const pageTitles: Record<Page, string> = {
    home: 'CaliGuide',
    guide: 'CaliGuide',
    forum: 'CaliGuide',
    chatbot: 'CaliGuide',
    profile: 'CaliGuide',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'guide': return <Guide />;
      case 'forum': return <Forum />;
      case 'chatbot': return <Chatbot />;
      case 'profile': return <Profile />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopAppBar 
        title={pageTitles[currentPage]} 
        showBack={currentPage === 'guide'}
        onBack={() => setCurrentPage('home')}
      />
      
      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}
