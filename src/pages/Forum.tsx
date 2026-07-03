import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Briefcase,
  Car,
  Compass,
  Eye,
  GraduationCap,
  HeartPulse,
  HomeIcon,
  Landmark,
  MessageSquare,
  Plus,
  Scale,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  createForumDiscussion,
  filterForumDiscussions,
  ForumDiscussion,
  FORUM_TOPICS,
  getForumReplyCount,
  getUnusefulCount,
  getUsefulCount,
  isUnusefulByUser,
  isUsefulByUser,
} from '../lib/forumContent';

interface ForumProps {
  discussions: ForumDiscussion[];
  onOpenForumDetail: (discussionId: string) => void;
  onAddForumDiscussion: (discussion: ForumDiscussion) => void;
  onToggleUseful: (discussionId: string) => void;
  onToggleUnuseful: (discussionId: string) => void;
  onOpenBlog: (articleId: string) => void;
  currentUserId: string;
}

const topicIcons: Record<string, LucideIcon> = {
  'All Topics': Compass,
  Banking: Landmark,
  Housing: HomeIcon,
  Jobs: Briefcase,
  Health: HeartPulse,
  Transportation: Car,
  Education: GraduationCap,
  'Legal / Immigration': Scale,
};

export default function Forum({
  discussions,
  onOpenForumDetail,
  onAddForumDiscussion,
  onToggleUseful,
  onToggleUnuseful,
  onOpenBlog,
  currentUserId,
}: ForumProps) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [isCommunityVisible, setIsCommunityVisible] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Housing');
  const [newPostBody, setNewPostBody] = useState('');
  const categories = FORUM_TOPICS.map((topic) => ({
    ...topic,
    label: t(topic.translationKey),
    icon: topicIcons[topic.id] ?? Compass,
  }));

  const tags = [
    '#VisaProcessing',
    '#DriverLicense',
    '#RentalMarket',
    '#PublicTransit',
    '#SchoolEnrollment',
    '#GreenCard',
  ];
  const filteredDiscussions = useMemo(
    () => filterForumDiscussions(discussions, searchText, activeCategory),
    [discussions, searchText, activeCategory],
  );
  const featuredDiscussion = filteredDiscussions.find((discussion) => discussion.id === 'post-1');
  const remainingDiscussions = filteredDiscussions.filter((discussion) => discussion.id !== 'post-1');
  const postCategories = categories.filter((category) => category.id !== 'All Topics');
  const canSubmitPost = newPostTitle.trim().length > 0 && newPostBody.trim().length > 0;

  const handleCreatePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitPost) {
      return;
    }

    const discussion = createForumDiscussion({
      title: newPostTitle,
      category: newPostCategory,
      body: newPostBody,
      author: currentUser?.name ?? 'Preview User',
    });

    onAddForumDiscussion(discussion);
    setNewPostTitle('');
    setNewPostCategory('Housing');
    setNewPostBody('');
    setIsComposerOpen(false);
  };

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto">
      <section className="px-4 mb-8 pt-4">
        <h2 className="text-3xl font-bold text-primary mb-2">{t('forum.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('forum.subtitle')}</p>
      </section>

      <section className="px-4 mb-5">
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search forum discussions..."
            className="w-full h-13 rounded-xl border border-outline-variant bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
        </div>
      </section>

      {/* Category Scroll */}
      <section className="mb-8">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                ? 'bg-secondary-container text-on-secondary-container' 
                : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <div className="px-4 flex flex-col gap-6">
        {/* Featured Discussion */}
        {featuredDiscussion && (
        <article className="bg-white rounded-2xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">{featuredDiscussion.avatar}</div>
              <div>
                <p className="text-sm font-bold">{featuredDiscussion.author}</p>
                <p className="text-xs text-on-surface-variant">{featuredDiscussion.time}</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">{featuredDiscussion.category}</span>
          </div>
          <button type="button" onClick={() => onOpenForumDetail(featuredDiscussion.id)} className="text-left">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
              {featuredDiscussion.title}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
              {featuredDiscussion.excerpt}
            </p>
          </button>
          <div className="flex items-center justify-between border-t border-outline-variant pt-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <MessageSquare size={16} /> {getForumReplyCount(featuredDiscussion)} {t('forum.comments')}
              </div>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Eye size={16} /> {featuredDiscussion.views} {t('forum.views')}
              </div>
            </div>
            <span className="text-primary font-bold text-sm flex items-center gap-1 uppercase tracking-wider">
              {t('forum.join')} <ArrowRight size={16} />
            </span>
          </div>
          <div className="mt-4">
            <VoteControls
              usefulActive={isUsefulByUser(featuredDiscussion, currentUserId)}
              unusefulActive={isUnusefulByUser(featuredDiscussion, currentUserId)}
              usefulCount={getUsefulCount(featuredDiscussion)}
              unusefulCount={getUnusefulCount(featuredDiscussion)}
              onUseful={() => onToggleUseful(featuredDiscussion.id)}
              onUnuseful={() => onToggleUnuseful(featuredDiscussion.id)}
            />
          </div>
        </article>
        )}

        {/* Stats Card */}
        {isCommunityVisible && (
        <div className="relative bg-primary text-white rounded-2xl p-6 flex flex-col items-center text-center">
          <button
            type="button"
            aria-label="Close active community"
            onClick={() => setIsCommunityVisible(false)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={16} />
          </button>
          <Users size={40} className="mb-3" />
          <h4 className="text-xl font-bold">{t('forum.active')}</h4>
          <p className="text-xs opacity-90 mt-1">{t('forum.activeText')}</p>
          <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary-container h-full w-3/4"></div>
          </div>
          <p className="text-[10px] font-bold mt-2 uppercase tracking-tight">{t('forum.goal')}</p>
        </div>
        )}

        {/* Tags */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">{t('forum.tags')}</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Guide Promo */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5TmBHJ2NKrZyRi7PRqNosP8XV2dhHr0F-f4Ks27ru3oTTto1h4CIIxfovvlCTkpR9pfcSjb_RdLfAByZAe5xNKBrM5gFLQhDzIpYQ2Hx8vKcSBfci3ek23Wtuna6BPT4QyV3hxAG0YLabNhSOPC77UqFR51nyANRt-pl6SfxpF9XpmsWdqVPFvDUaiQFSO89MUYqtKWbLEjHW2LqicNBWp_VRjbatH3j3GVBYO9KinFZYJ-s6N5kybpMUkTttkrApwGsRXprUvRI" 
            alt="Community" 
            className="w-full h-32 object-cover"
          />
          <div className="p-5 text-center">
            <h4 className="font-bold text-on-surface">{t('forum.newToCalifornia')}</h4>
            <p className="text-xs text-on-surface-variant mt-1">{t('forum.first30')}</p>
            <button
              type="button"
              onClick={() => onOpenBlog('forum-first-30-days')}
              className="mt-4 w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold hover:bg-secondary-container/90 transition-colors"
            >
              {t('forum.readGuide')}
            </button>
          </div>
        </div>

        {/* Rest of the posts */}
        {remainingDiscussions.map((post) => (
          <article
            key={post.id}
            className="bg-white border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <button type="button" onClick={() => onOpenForumDetail(post.id)} className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">{post.category}</span>
                  <p className="text-xs text-on-surface-variant">{t('forum.postedBy')} <span className="font-bold">{post.author}</span> • {post.time}</p>
                </div>
                <h4 className="text-lg font-bold text-on-surface leading-tight">{post.title}</h4>
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-1">{post.excerpt}</p>
              </button>
              <div className="flex md:flex-col items-center justify-center gap-1 md:border-l border-outline-variant md:pl-5 min-w-[60px]">
                <span className="text-2xl font-bold text-primary">{getForumReplyCount(post)}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">{t('forum.replies')}</span>
              </div>
            </div>
            <VoteControls
              usefulActive={isUsefulByUser(post, currentUserId)}
              unusefulActive={isUnusefulByUser(post, currentUserId)}
              usefulCount={getUsefulCount(post)}
              unusefulCount={getUnusefulCount(post)}
              onUseful={() => onToggleUseful(post.id)}
              onUnuseful={() => onToggleUnuseful(post.id)}
            />
          </article>
        ))}
        {filteredDiscussions.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-sm">
            <h3 className="font-bold text-on-surface">No discussions found</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Try another keyword or category.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label="Create a forum post"
        onClick={() => setIsComposerOpen(true)}
        className="fixed bottom-28 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center sm:pb-0">
          <form
            onSubmit={handleCreatePost}
            className="w-full max-w-lg rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Start a discussion</h3>
                <p className="mt-1 text-xs text-on-surface-variant">Share a question with the CaliGuide community.</p>
              </div>
              <button
                type="button"
                aria-label="Close post composer"
                onClick={() => setIsComposerOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-primary">Title</span>
              <input
                value={newPostTitle}
                onChange={(event) => setNewPostTitle(event.target.value)}
                placeholder="What do you want to ask?"
                className="h-12 w-full rounded-xl border border-outline-variant bg-white px-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-primary">Topic</span>
              <select
                value={newPostCategory}
                onChange={(event) => setNewPostCategory(event.target.value)}
                className="h-12 w-full rounded-xl border border-outline-variant bg-white px-4 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {postCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-primary">Details</span>
              <textarea
                value={newPostBody}
                onChange={(event) => setNewPostBody(event.target.value)}
                placeholder="Add helpful context, what you tried, and what kind of advice you need."
                rows={5}
                className="w-full resize-none rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm leading-6 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmitPost}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-outline-variant disabled:text-on-surface-variant"
            >
              <Send size={17} />
              Post discussion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function VoteControls({
  usefulActive,
  unusefulActive,
  usefulCount,
  unusefulCount,
  onUseful,
  onUnuseful,
}: {
  usefulActive: boolean;
  unusefulActive: boolean;
  usefulCount: number;
  unusefulCount: number;
  onUseful: () => void;
  onUnuseful: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <VoteButton
        label="Mark useful"
        isActive={usefulActive}
        count={usefulCount}
        onClick={onUseful}
        icon="up"
      />
      <VoteButton
        label="Mark unuseful"
        isActive={unusefulActive}
        count={unusefulCount}
        onClick={onUnuseful}
        icon="down"
      />
    </div>
  );
}

function VoteButton({
  label,
  isActive,
  count,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
  icon: 'up' | 'down';
}) {
  const Icon = icon === 'up' ? ThumbsUp : ThumbsDown;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all ${
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
      }`}
    >
      <Icon size={16} fill={isActive ? 'currentColor' : 'none'} />
      <span>{count}</span>
    </button>
  );
}
