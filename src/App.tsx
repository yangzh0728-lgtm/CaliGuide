/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import TopAppBar from './components/TopAppBar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import BlogDetail from './pages/BlogDetail';
import RecommendedGuides from './pages/RecommendedGuides';
import Forum from './pages/Forum';
import ForumDetail from './pages/ForumDetail';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { getLocalizedBlogArticle, getLocalizedBlogArticles } from './lib/blogLocalization';
import {
  addForumComment,
  FORUM_DISCUSSIONS,
  ForumDiscussion,
  isUnusefulByUser,
  isUsefulByUser,
  mergeForumDiscussions,
  removeForumComment,
  removeForumDiscussion,
  toggleCommentUnuseful,
  toggleCommentUseful,
  toggleDiscussionUnuseful,
  toggleDiscussionUseful,
} from './lib/forumContent';
import {
  fetchForumDiscussionsFromSupabase,
} from './lib/forumSupabase';
import {
  createForumCommentViaApi,
  createForumPostViaApi,
  deleteForumCommentViaApi,
  deleteForumPostViaApi,
  setForumVoteViaApi,
} from './lib/forumApi';
import { supabase } from './lib/supabaseClient';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedBlogId, setSelectedBlogId] = useState('category-dmv');
  const [selectedForumId, setSelectedForumId] = useState('post-1');
  const [forumDiscussions, setForumDiscussions] = useState<ForumDiscussion[]>(FORUM_DISCUSSIONS);
  const [forumSyncError, setForumSyncError] = useState('');
  const { currentUser, isGuideSaved, isLoading, isPasswordRecovery, removeSavedGuide, saveGuide } = useAuth();
  const { language, t } = useLanguage();
  const localizedBlogArticles = getLocalizedBlogArticles(language);
  const selectedBlog = getLocalizedBlogArticle(selectedBlogId, language) ?? getLocalizedBlogArticle('category-dmv', language);
  const selectedForumDiscussion =
    forumDiscussions.find((discussion) => discussion.id === selectedForumId) ?? forumDiscussions[0];

  const reloadForumDiscussions = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      const remoteDiscussions = await fetchForumDiscussionsFromSupabase(supabase);
      if (remoteDiscussions.length) {
        setForumDiscussions((currentDiscussions) => mergeForumDiscussions(currentDiscussions, remoteDiscussions));
      }
    } catch (error) {
      console.warn('Forum Supabase sync skipped:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    void reloadForumDiscussions();
  }, [reloadForumDiscussions]);

  const pageTitles: Record<Page, string> = {
    home: t('app.title'),
    guide: t('app.title'),
    blog: t('app.title'),
    recommended: t('home.recommended'),
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
    setForumSyncError('');
    setForumDiscussions((currentDiscussions) => [discussion, ...currentDiscussions]);
    setSelectedForumId(discussion.id);
    setCurrentPage('forumDetail');

    void createForumPostViaApi(supabase, {
      id: discussion.id,
      userId: currentUser.id,
      author: currentUser.name,
      avatar: getForumAvatar(currentUser.name),
      category: discussion.category,
      title: discussion.title,
      body: discussion.body[0] ?? discussion.excerpt,
      imageUrls: discussion.imageUrls ?? [],
    })
      .then((remoteDiscussion) => {
        setForumDiscussions((currentDiscussions) => [
          remoteDiscussion,
          ...currentDiscussions.filter((currentDiscussion) => currentDiscussion.id !== discussion.id),
        ]);
        setSelectedForumId(remoteDiscussion.id);
      })
      .catch((error) => {
        setForumSyncError(`Forum post saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
        console.warn('Unable to save forum post to Supabase:', error);
      });
  };

  const addForumDiscussionComment = (discussionId: string, body: string) => {
    setForumSyncError('');
    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId
          ? addForumComment(discussion, {
              author: currentUser?.name ?? 'CaliGuide Member',
              userId: currentUser?.id,
              body,
            })
        : discussion,
      ),
    );
    void createForumCommentViaApi(supabase, {
      postId: discussionId,
      userId: currentUser.id,
      author: currentUser.name,
      avatar: getForumAvatar(currentUser.name),
      body,
    })
      .then(reloadForumDiscussions)
      .catch((error) => {
        setForumSyncError(`Comment saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
        console.warn('Unable to save forum comment to Supabase:', error);
      });
  };

  const deleteForumDiscussion = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    if (discussion?.userId !== userId) {
      setForumSyncError('You can only delete forum posts that you created.');
      return;
    }

    setForumSyncError('');
    setForumDiscussions((currentDiscussions) => removeForumDiscussion(currentDiscussions, discussionId, userId));
    if (selectedForumId === discussionId) {
      setCurrentPage('forum');
    }

    void deleteForumPostViaApi(supabase, discussionId)
      .then(reloadForumDiscussions)
      .catch((error) => {
        setForumSyncError(`Post deleted locally, but Supabase sync failed: ${getErrorMessage(error)}`);
        console.warn('Unable to delete forum post from Supabase:', error);
      });
  };

  const deleteForumDiscussionComment = (discussionId: string, commentId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    const comment = discussion?.replies.find((reply) => reply.id === commentId);
    if (comment?.userId !== userId) {
      setForumSyncError('You can only delete comments that you created.');
      return;
    }

    setForumSyncError('');
    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? removeForumComment(discussion, commentId, userId) : discussion,
      ),
    );

    void deleteForumCommentViaApi(supabase, commentId)
      .then(reloadForumDiscussions)
      .catch((error) => {
        setForumSyncError(`Comment deleted locally, but Supabase sync failed: ${getErrorMessage(error)}`);
        console.warn('Unable to delete forum comment from Supabase:', error);
      });
  };

  const toggleForumDiscussionUseful = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    const nextVote = discussion && isUsefulByUser(discussion, userId) ? null : 'useful';

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleDiscussionUseful(discussion, userId) : discussion,
      ),
    );
    void setForumVoteViaApi(supabase, 'post', discussionId, userId, nextVote).catch((error) => {
      setForumSyncError(`Vote saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
      console.warn('Unable to save forum post vote to Supabase:', error);
    });
  };

  const toggleForumCommentUseful = (discussionId: string, commentId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    const comment = discussion?.replies.find((reply) => reply.id === commentId);
    const nextVote = comment && isUsefulByUser(comment, userId) ? null : 'useful';

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleCommentUseful(discussion, commentId, userId) : discussion,
      ),
    );
    void setForumVoteViaApi(supabase, 'comment', commentId, userId, nextVote).catch((error) => {
      setForumSyncError(`Vote saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
      console.warn('Unable to save forum comment vote to Supabase:', error);
    });
  };

  const toggleForumDiscussionUnuseful = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    const nextVote = discussion && isUnusefulByUser(discussion, userId) ? null : 'unuseful';

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleDiscussionUnuseful(discussion, userId) : discussion,
      ),
    );
    void setForumVoteViaApi(supabase, 'post', discussionId, userId, nextVote).catch((error) => {
      setForumSyncError(`Vote saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
      console.warn('Unable to save forum post vote to Supabase:', error);
    });
  };

  const toggleForumCommentUnuseful = (discussionId: string, commentId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    const comment = discussion?.replies.find((reply) => reply.id === commentId);
    const nextVote = comment && isUnusefulByUser(comment, userId) ? null : 'unuseful';

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? toggleCommentUnuseful(discussion, commentId, userId) : discussion,
      ),
    );
    void setForumVoteViaApi(supabase, 'comment', commentId, userId, nextVote).catch((error) => {
      setForumSyncError(`Vote saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
      console.warn('Unable to save forum comment vote to Supabase:', error);
    });
  };

  const toggleSavedGuide = (articleId: string) => {
    void (async () => {
      if (isGuideSaved(articleId)) {
        await removeSavedGuide(articleId);
      } else {
        await saveGuide(articleId);
      }
    })();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onOpenBlog={openBlog} onOpenRecommended={() => setCurrentPage('recommended')} />;
      case 'guide': return <Guide />;
      case 'blog': return selectedBlog ? (
        <BlogDetail
          article={selectedBlog}
          isSaved={isGuideSaved(selectedBlog.id)}
          onToggleSave={toggleSavedGuide}
        />
      ) : <Home onOpenBlog={openBlog} onOpenRecommended={() => setCurrentPage('recommended')} />;
      case 'recommended': return <RecommendedGuides onOpenBlog={openBlog} />;
      case 'forum': return (
        <Forum
          discussions={forumDiscussions}
          onOpenForumDetail={openForumDetail}
          onAddForumDiscussion={addForumDiscussion}
          onToggleUseful={toggleForumDiscussionUseful}
          onToggleUnuseful={toggleForumDiscussionUnuseful}
          onDeleteDiscussion={deleteForumDiscussion}
          onOpenBlog={openBlog}
          currentUserId={currentUser.id}
          syncError={forumSyncError}
          onClearSyncError={() => setForumSyncError('')}
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
          onDeleteDiscussion={deleteForumDiscussion}
          onDeleteComment={deleteForumDiscussionComment}
          currentUserId={currentUser.id}
          syncError={forumSyncError}
          onClearSyncError={() => setForumSyncError('')}
        />
      ) : (
        <Forum
          discussions={forumDiscussions}
          onOpenForumDetail={openForumDetail}
          onAddForumDiscussion={addForumDiscussion}
          onToggleUseful={toggleForumDiscussionUseful}
          onToggleUnuseful={toggleForumDiscussionUnuseful}
          onDeleteDiscussion={deleteForumDiscussion}
          onOpenBlog={openBlog}
          currentUserId={currentUser.id}
          syncError={forumSyncError}
          onClearSyncError={() => setForumSyncError('')}
        />
      );
      case 'chatbot': return <Chatbot />;
      case 'profile': return (
        <Profile
          articles={localizedBlogArticles}
          forumDiscussions={forumDiscussions}
          onOpenBlog={openBlog}
          onOpenForumDetail={openForumDetail}
          onToggleForumUseful={toggleForumDiscussionUseful}
          onToggleForumUnuseful={toggleForumDiscussionUnuseful}
          currentUserId={currentUser.id}
        />
      );
      default: return <Home onOpenBlog={openBlog} onOpenRecommended={() => setCurrentPage('recommended')} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm font-bold text-on-surface-variant">
        Loading CaliGuide...
      </div>
    );
  }

  if (!currentUser || isPasswordRecovery) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopAppBar 
        title={pageTitles[currentPage]} 
        showBack={currentPage === 'guide' || currentPage === 'blog' || currentPage === 'recommended' || currentPage === 'forumDetail'}
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

function getForumAvatar(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}
