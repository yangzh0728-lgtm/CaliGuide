/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, ReactNode, Suspense, useCallback, useEffect, useState } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import TopAppBar from './components/TopAppBar';
import PageSkeleton from './components/PageSkeleton';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
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
import { LegalPageId } from './lib/legalContent';
import LegalFooter from './components/LegalFooter';
import PrivacyConsentBanner from './components/PrivacyConsentBanner';
import PrivacyPreferencesDialog from './components/PrivacyPreferencesDialog';
import { getLegalPageFromPath, getLegalPagePath } from './lib/legalRoutes';
import {
  AppRoute,
  getAppRouteFromPath,
  getAppRoutePath,
  getParentAppRoute,
  shouldRequireAuthentication,
} from './lib/appRoutes';
import { getPageMetadata } from './lib/pageMetadata';
import { reportClientError } from './lib/clientErrorReport';
import type { GuideDirectoryGroupId } from './lib/guideDirectory';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumDetail = lazy(() => import('./pages/ForumDetail'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const Profile = lazy(() => import('./pages/Profile'));
const RecommendedGuides = lazy(() => import('./pages/RecommendedGuides'));
const Agencies = lazy(() => import('./pages/Agencies'));
const AgencyDetail = lazy(() => import('./pages/AgencyDetail'));

type PendingForumDelete =
  | { type: 'post'; discussionId: string; title: string }
  | { type: 'comment'; discussionId: string; commentId: string };

export default function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>(() =>
    typeof window === 'undefined'
      ? { page: 'home' }
      : getAppRouteFromPath(window.location.pathname) ?? { page: 'home' },
  );
  const [authRequested, setAuthRequested] = useState(false);
  const [forumDiscussions, setForumDiscussions] = useState<ForumDiscussion[]>(FORUM_DISCUSSIONS);
  const [forumSyncError, setForumSyncError] = useState('');
  const [pendingForumDelete, setPendingForumDelete] = useState<PendingForumDelete | null>(null);
  const [legalPage, setLegalPage] = useState<LegalPageId | null>(() =>
    typeof window === 'undefined' ? null : getLegalPageFromPath(window.location.pathname),
  );
  const {
    currentUser,
    isGuideSaved,
    isLoading,
    isPasswordRecovery,
    isPostSaved,
    removeSavedGuide,
    removeSavedPost,
    saveGuide,
    savePost,
  } = useAuth();
  const { language, t } = useLanguage();
  const currentPage: Page = appRoute.page;
  const selectedBlogId = appRoute.page === 'blog' ? appRoute.articleId : 'category-dmv';
  const selectedForumId = appRoute.page === 'forumDetail' ? appRoute.discussionId : 'post-1';
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
      reportClientError('forum.load', error);
      console.warn('Forum Supabase sync skipped:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    void reloadForumDiscussions();
  }, [reloadForumDiscussions]);

  const navigate = useCallback((route: AppRoute, options?: { replace?: boolean }) => {
    const path = getAppRoutePath(route);
    if (window.location.pathname !== path) {
      const historyMethod = options?.replace ? 'replaceState' : 'pushState';
      window.history[historyMethod]({ caliguide: true }, '', path);
    }
    setLegalPage(null);
    setAppRoute(route);
    setAuthRequested(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextLegalPage = getLegalPageFromPath(window.location.pathname);
      setLegalPage(nextLegalPage);
      if (!nextLegalPage) {
        setAppRoute(getAppRouteFromPath(window.location.pathname) ?? { page: 'home' });
      }
      setAuthRequested(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setAuthRequested(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (legalPage) {
      return;
    }
    const metadata = getPageMetadata(appRoute);
    const canonicalUrl = `${window.location.origin}${metadata.canonicalPath}`;
    document.title = metadata.title;
    setHeadMeta('name', 'description', metadata.description);
    setHeadMeta('property', 'og:title', metadata.title);
    setHeadMeta('property', 'og:description', metadata.description);
    setHeadMeta('property', 'og:type', metadata.type);
    setHeadMeta('property', 'og:url', canonicalUrl);
    setHeadMeta('name', 'robots', metadata.noIndex ? 'noindex,nofollow' : 'index,follow');
    setCanonicalUrl(canonicalUrl);
  }, [appRoute, legalPage]);

  const openLegalPage = useCallback((pageId: LegalPageId) => {
    const path = getLegalPagePath(pageId);
    if (window.location.pathname !== path) {
      window.history.pushState({ caliguide: true }, '', path);
    }
    setLegalPage(pageId);
    setAuthRequested(false);
  }, []);

  const closeLegalPage = useCallback(() => {
    if (window.history.state?.caliguide) {
      window.history.back();
      return;
    }
    navigate({ page: 'home' }, { replace: true });
  }, [navigate]);

  const pageTitles: Record<Page, string> = {
    home: t('app.title'),
    guide: t('app.title'),
    blog: t('app.title'),
    recommended: t('recommended.title'),
    agencies: t('app.title'),
    forum: t('app.title'),
    forumDetail: t('app.title'),
    chatbot: t('app.title'),
    profile: t('app.title'),
  };

  const openBlog = (articleId: string) => {
    navigate({ page: 'blog', articleId });
  };

  const openRecommended = (groupId?: GuideDirectoryGroupId) => {
    navigate(groupId ? { page: 'recommended', groupId } : { page: 'recommended' });
  };

  const openInstitution = (institutionId: string) => {
    navigate({ page: 'agencies', institutionId });
  };

  const openForumDetail = (discussionId: string) => {
    navigate({ page: 'forumDetail', discussionId });
  };

  const addForumDiscussion = (discussion: ForumDiscussion) => {
    setForumSyncError('');
    setForumDiscussions((currentDiscussions) => [discussion, ...currentDiscussions]);
    navigate({ page: 'forumDetail', discussionId: discussion.id });

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
        navigate({ page: 'forumDetail', discussionId: remoteDiscussion.id }, { replace: true });
      })
      .catch((error) => {
        setForumSyncError(`Forum post saved locally, but Supabase sync failed: ${getErrorMessage(error)}`);
        reportClientError('forum.post.create', error);
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
        reportClientError('forum.comment.create', error);
        console.warn('Unable to save forum comment to Supabase:', error);
      });
  };

  const requestDeleteForumDiscussion = (discussionId: string) => {
    const userId = currentUser?.id;
    if (!userId) {
      return;
    }

    const discussion = forumDiscussions.find((currentDiscussion) => currentDiscussion.id === discussionId);
    if (discussion?.userId !== userId) {
      setForumSyncError('You can only delete forum posts that you created.');
      return;
    }

    setPendingForumDelete({
      type: 'post',
      discussionId,
      title: discussion.title,
    });
  };

  const deleteForumDiscussion = async (discussionId: string) => {
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
    try {
      await deleteForumPostViaApi(supabase, discussionId);
    } catch (error) {
      setForumSyncError(`Post delete failed: ${getErrorMessage(error)}`);
      reportClientError('forum.post.delete', error);
      console.warn('Unable to delete forum post from Supabase:', error);
      return;
    }

    setForumDiscussions((currentDiscussions) => removeForumDiscussion(currentDiscussions, discussionId, userId));
    if (selectedForumId === discussionId) {
      navigate({ page: 'forum' }, { replace: true });
    }

    void reloadForumDiscussions();
  };

  const requestDeleteForumDiscussionComment = (discussionId: string, commentId: string) => {
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

    setPendingForumDelete({
      type: 'comment',
      discussionId,
      commentId,
    });
  };

  const deleteForumDiscussionComment = async (discussionId: string, commentId: string) => {
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
    try {
      await deleteForumCommentViaApi(supabase, commentId);
    } catch (error) {
      setForumSyncError(`Comment delete failed: ${getErrorMessage(error)}`);
      reportClientError('forum.comment.delete', error);
      console.warn('Unable to delete forum comment from Supabase:', error);
      return;
    }

    setForumDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        discussion.id === discussionId ? removeForumComment(discussion, commentId, userId) : discussion,
      ),
    );

    void reloadForumDiscussions();
  };

  const confirmForumDelete = () => {
    if (!pendingForumDelete) {
      return;
    }

    if (pendingForumDelete.type === 'post') {
      void deleteForumDiscussion(pendingForumDelete.discussionId);
    } else {
      void deleteForumDiscussionComment(pendingForumDelete.discussionId, pendingForumDelete.commentId);
    }

    setPendingForumDelete(null);
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
      reportClientError('forum.post.vote', error);
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
      reportClientError('forum.comment.vote', error);
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
      reportClientError('forum.post.vote', error);
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
      reportClientError('forum.comment.vote', error);
      console.warn('Unable to save forum comment vote to Supabase:', error);
    });
  };

  const toggleSavedGuide = (articleId: string) => {
    if (!currentUser) {
      setAuthRequested(true);
      return;
    }

    void (async () => {
      if (isGuideSaved(articleId)) {
        await removeSavedGuide(articleId);
      } else {
        await saveGuide(articleId);
      }
    })();
  };

  const toggleSavedPost = (postId: string) => {
    setForumSyncError('');
    void (async () => {
      if (isPostSaved(postId)) {
        await removeSavedPost(postId);
      } else {
        await savePost(postId);
      }
    })().catch((error) => {
      setForumSyncError(`Post save failed: ${getErrorMessage(error)}`);
      reportClientError('forum.post.save', error);
      console.warn('Unable to save forum post:', error);
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onOpenBlog={openBlog} onOpenRecommended={openRecommended} onOpenInstitution={openInstitution} onOpenAgencies={() => navigate({ page: 'agencies' })} />;
      case 'guide': return <Home onOpenBlog={openBlog} onOpenRecommended={openRecommended} onOpenInstitution={openInstitution} onOpenAgencies={() => navigate({ page: 'agencies' })} />;
      case 'blog': return selectedBlog ? (
        <BlogDetail
          article={selectedBlog}
          isAuthenticated={Boolean(currentUser)}
          isSaved={isGuideSaved(selectedBlog.id)}
          onToggleSave={toggleSavedGuide}
        />
      ) : <Home onOpenBlog={openBlog} onOpenRecommended={openRecommended} onOpenInstitution={openInstitution} onOpenAgencies={() => navigate({ page: 'agencies' })} />;
      case 'recommended': return (
        <RecommendedGuides
          activeGroupId={appRoute.page === 'recommended' ? appRoute.groupId ?? 'all' : 'all'}
          onSelectGroup={(groupId) => openRecommended(groupId === 'all' ? undefined : groupId)}
          onOpenBlog={openBlog}
          onOpenAgencies={() => navigate({ page: 'agencies' })}
        />
      );
      case 'agencies': return appRoute.page === 'agencies' && appRoute.institutionId ? (
        <AgencyDetail
          institutionId={appRoute.institutionId}
          onBackToDirectory={() => navigate({ page: 'agencies' })}
          onOpenInstitution={openInstitution}
          onOpenBlog={openBlog}
        />
      ) : (
        <Agencies
          onOpenGuides={() => navigate({ page: 'recommended' })}
          onOpenInstitution={openInstitution}
          onOpenBlog={openBlog}
        />
      );
      case 'forum': return (
        <Forum
          discussions={forumDiscussions}
          onOpenForumDetail={openForumDetail}
          onAddForumDiscussion={addForumDiscussion}
          onToggleUseful={toggleForumDiscussionUseful}
          onToggleUnuseful={toggleForumDiscussionUnuseful}
          onDeleteDiscussion={requestDeleteForumDiscussion}
          onOpenBlog={openBlog}
          currentUserId={currentUser?.id ?? ''}
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
          onDeleteDiscussion={requestDeleteForumDiscussion}
          onDeleteComment={requestDeleteForumDiscussionComment}
          isSaved={isPostSaved(selectedForumDiscussion.id)}
          onToggleSave={toggleSavedPost}
          currentUserId={currentUser?.id ?? ''}
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
          onDeleteDiscussion={requestDeleteForumDiscussion}
          onOpenBlog={openBlog}
          currentUserId={currentUser?.id ?? ''}
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
          currentUserId={currentUser?.id ?? ''}
        />
      );
      default: return <Home onOpenBlog={openBlog} onOpenRecommended={openRecommended} onOpenInstitution={openInstitution} onOpenAgencies={() => navigate({ page: 'agencies' })} />;
    }
  };

  const handlePageChange = (page: Page) => {
    switch (page) {
      case 'forum':
        navigate({ page: 'forum' });
        break;
      case 'chatbot':
        navigate({ page: 'chatbot' });
        break;
      case 'profile':
        navigate({ page: 'profile' });
        break;
      case 'recommended':
        navigate({ page: 'recommended' });
        break;
      case 'agencies':
        navigate({ page: 'agencies' });
        break;
      case 'home':
      default:
        navigate({ page: 'home' });
    }
  };

  const handleBack = () => {
    if (window.history.state?.caliguide) {
      window.history.back();
      return;
    }
    navigate(getParentAppRoute(appRoute), { replace: true });
  };

  const renderWithPrivacyControls = (content: ReactNode) => (
    <>
      {content}
      <PrivacyConsentBanner onOpenCookieNotice={() => openLegalPage('cookies')} />
      <PrivacyPreferencesDialog />
    </>
  );

  if (legalPage) {
    return renderWithPrivacyControls(
      <Suspense fallback={<PageSkeleton fullScreen />}>
        <LegalPage pageId={legalPage} onBack={closeLegalPage} />
      </Suspense>,
    );
  }

  const authenticationRequired = shouldRequireAuthentication(appRoute, authRequested);

  if (isLoading && authenticationRequired && !isPasswordRecovery) {
    return renderWithPrivacyControls(
      <PageSkeleton fullScreen />,
    );
  }

  if (isPasswordRecovery || (!currentUser && authenticationRequired)) {
    return renderWithPrivacyControls(
      <Suspense fallback={<PageSkeleton fullScreen />}>
        <AuthPage
          onOpenLegalPage={openLegalPage}
          continueBrowsingHref={
            shouldRequireAuthentication(appRoute, false) ? '/' : getAppRoutePath(appRoute)
          }
          onContinueBrowsing={() => {
            setAuthRequested(false);
            if (shouldRequireAuthentication(appRoute, false)) {
              navigate({ page: 'home' }, { replace: true });
            }
          }}
        />
      </Suspense>,
    );
  }

  return renderWithPrivacyControls(
    <div className="min-h-screen bg-background pb-20">
      <TopAppBar 
        title={pageTitles[currentPage]} 
        showBack={currentPage === 'guide' || currentPage === 'blog' || currentPage === 'recommended' || currentPage === 'agencies' || currentPage === 'forumDetail'}
        showSignIn={!currentUser}
        onBack={handleBack}
        onSignIn={() => setAuthRequested(true)}
      />
      
      <main className={`mx-auto w-full ${currentPage === 'agencies' || currentPage === 'home' ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={getAppRoutePath(appRoute)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Suspense fallback={<PageSkeleton />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <LegalFooter
        onOpenLegalPage={openLegalPage}
        onOpenAgencies={() => navigate({ page: 'agencies' })}
      />

      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
      />
      <ConfirmDeleteDialog
        pendingDelete={pendingForumDelete}
        onCancel={() => setPendingForumDelete(null)}
        onConfirm={confirmForumDelete}
      />
    </div>
  );
}

function setHeadMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonicalUrl(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function ConfirmDeleteDialog({
  pendingDelete,
  onCancel,
  onConfirm,
}: {
  pendingDelete: PendingForumDelete | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!pendingDelete) {
    return null;
  }

  const isPost = pendingDelete.type === 'post';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="w-full max-w-sm rounded-2xl border border-outline-variant bg-white p-5 shadow-xl"
      >
        <h2 id="delete-confirm-title" className="text-xl font-bold text-on-surface">
          Delete {isPost ? 'this post' : 'this comment'}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          {isPost
            ? `This will remove "${pendingDelete.title}" and its comments from the forum.`
            : 'This will remove your comment from the forum.'}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
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
