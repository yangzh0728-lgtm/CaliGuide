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
import BlogDetail from './pages/BlogDetail';
import Forum from './pages/Forum';
import ForumDetail from './pages/ForumDetail';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { BLOG_ARTICLES, getBlogArticle } from './lib/blogContent';
import {
  addForumComment,
  FORUM_DISCUSSIONS,
  ForumDiscussion,
  toggleCommentUnuseful,
  toggleCommentUseful,
  toggleDiscussionUnuseful,
  toggleDiscussionUseful,
} from './lib/forumContent';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedBlogId, setSelectedBlogId] = useState('category-dmv');
  const [selectedForumId, setSelectedForumId] = useState('post-1');
  const [forumDiscussions, setForumDiscussions] = useState<ForumDiscussion[]>(FORUM_DISCUSSIONS);
  const { currentUser, isGuideSaved, removeSavedGuide, saveGuide } = useAuth();
  const { t } = useLanguage();
  const selectedBlog = getBlogArticle(selectedBlogId) ?? getBlogArticle('category-dmv');
  const selectedForumDiscussion =
    forumDiscussions.find((discussion) => discussion.id === selectedForumId) ?? forumDiscussions[0];

  const pageTitles: Record<Page, string> = {
    home: t('app.title'),
    guide: t('app.title'),
    blog: t('app.title'),
    forum: t('app.title'),
    forumDetail: t('app.title'),
    chatbot: t('app.title'),
    profile: t('app.title'),
  };

  const openBlog = (articleId: string) => {
    setSelectedBlogId(articleId);
    setCurrentPage('blog');
  };

  const openForumDetail = (discussionId: string) => {
    setSelectedForumId(discussionId);
    setCurrentPage('forumDetail');
  };

  const addForumDiscussion = (discussion: ForumDiscussion) => {
    setForumDiscussions((currentDiscussions) => [discussion, ...currentDiscussions]);
    setSelectedForumId(discussion.id);
    setCurrentPage('forumDetail');
  };

  const addForumDiscussionComment = (discussionId: string, body: string) => {
    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId
          ? addForumComment(discussion, {
              author: currentUser?.name ?? 'CaliGuide Member',
              body,
            })
          : discussion,
      ),
    );
  };

  const toggleForumDiscussionUseful = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleDiscussionUseful(discussion, userId) : discussion,
      ),
    );
  };

  const toggleForumCommentUseful = (discussionId: string, commentId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleCommentUseful(discussion, commentId, userId) : discussion,
      ),
    );
  };

  const toggleForumDiscussionUnuseful = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleDiscussionUnuseful(discussion, userId) : discussion,
      ),
    );
  };

  const toggleForumCommentUnuseful = (discussionId: string, commentId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleCommentUnuseful(discussion, commentId, userId) : discussion,
      ),
    );
  };

  const toggleSavedGuide = (articleId: string) => {
    if (isGuideSaved(articleId)) {
      removeSavedGuide(articleId);
    } else {
      saveGuide(articleId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onOpenBlog={openBlog} />;
      case 'guide': return <Guide />;
      case 'blog': return selectedBlog ? (
        <BlogDetail
          article={selectedBlog}
          isSaved={isGuideSaved(selectedBlog.id)}
          onToggleSave={toggleSavedGuide}
        />
      ) : <Home onOpenBlog={openBlog} />;
      case 'forum': return (
        <Forum
          discussions={forumDiscussions}
          onOpenForumDetail={openForumDetail}
          onAddForumDiscussion={addForumDiscussion}
          onToggleUseful={toggleForumDiscussionUseful}
          onToggleUnuseful={toggleForumDiscussionUnuseful}
          onOpenBlog={openBlog}
          currentUserId={currentUser.id}
        />
      );
      case 'forumDetail': return selectedForumDiscussion ? (
        <ForumDetail
          discussion={selectedForumDiscussion}
          onAddComment={addForumDiscussionComment}
          onToggleDiscussionUseful={toggleForumDiscussionUseful}
          onToggleDiscussionUnuseful={toggleForumDiscussionUnuseful}
          onToggleCommentUseful={toggleForumCommentUseful}
          onToggleCommentUnuseful={toggleForumCommentUnuseful}
          currentUserId={currentUser.id}
        />
      ) : (
        <Forum
          discussions={forumDiscussions}
          onOpenForumDetail={openForumDetail}
          onAddForumDiscussion={addForumDiscussion}
          onToggleUseful={toggleForumDiscussionUseful}
          onToggleUnuseful={toggleForumDiscussionUnuseful}
          onOpenBlog={openBlog}
          currentUserId={currentUser.id}
        />
      );
      case 'chatbot': return <Chatbot />;
      case 'profile': return (
        <Profile
          articles={BLOG_ARTICLES}
          forumDiscussions={forumDiscussions}
          onOpenBlog={openBlog}
          onOpenForumDetail={openForumDetail}
          onToggleForumUseful={toggleForumDiscussionUseful}
          onToggleForumUnuseful={toggleForumDiscussionUnuseful}
          currentUserId={currentUser.id}
        />
      );
      default: return <Home onOpenBlog={openBlog} />;
    }
  };

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopAppBar 
        title={pageTitles[currentPage]} 
        showBack={currentPage === 'guide' || currentPage === 'blog' || currentPage === 'forumDetail'}
        onBack={() => setCurrentPage(currentPage === 'forumDetail' ? 'forum' : 'home')}
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
