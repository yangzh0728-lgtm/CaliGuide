import { FormEvent, useEffect, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  ForumDiscussion,
  getForumReplyCount,
  getUnusefulCount,
  getUsefulCount,
  isUnusefulByUser,
  isUsefulByUser,
} from "../lib/forumContent";

interface ForumDetailProps {
  discussion: ForumDiscussion;
  onAddComment: (discussionId: string, body: string) => void;
  onToggleDiscussionUseful: (discussionId: string) => void;
  onToggleDiscussionUnuseful: (discussionId: string) => void;
  onToggleCommentUseful: (discussionId: string, commentId: string) => void;
  onToggleCommentUnuseful: (discussionId: string, commentId: string) => void;
  onDeleteDiscussion: (discussionId: string) => void;
  onDeleteComment: (discussionId: string, commentId: string) => void;
  isSaved: boolean;
  onToggleSave: (discussionId: string) => void;
  currentUserId: string;
  syncError?: string;
  onClearSyncError?: () => void;
}

export default function ForumDetail({
  discussion,
  onAddComment,
  onToggleDiscussionUseful,
  onToggleDiscussionUnuseful,
  onToggleCommentUseful,
  onToggleCommentUnuseful,
  onDeleteDiscussion,
  onDeleteComment,
  isSaved,
  onToggleSave,
  currentUserId,
  syncError,
  onClearSyncError,
}: ForumDetailProps) {
  const { t } = useLanguage();
  const [commentBody, setCommentBody] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; index: number } | null>(null);
  const commentCount = getForumReplyCount(discussion);
  const canSubmitComment = commentBody.trim().length > 0;

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitComment) {
      return;
    }

    onAddComment(discussion.id, commentBody);
    setCommentBody("");
  };

  return (
    <article className="pt-20 pb-24 max-w-2xl mx-auto">
      {syncError && (
        <section className="px-4 pb-5">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="flex-1 leading-6">{syncError}</p>
            <button
              type="button"
              aria-label="Dismiss sync error"
              onClick={onClearSyncError}
              className="rounded-full p-1 text-red-700 transition-colors hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        </section>
      )}

      <header className="px-4 pb-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed font-bold text-on-primary-fixed">
            {discussion.avatar}
          </div>
          <div>
            <p className="font-bold text-on-surface">{discussion.author}</p>
            <p className="text-xs font-medium text-on-surface-variant">{discussion.time}</p>
          </div>
          {discussion.userId === currentUserId && (
            <button
              type="button"
              aria-label="Delete your forum post"
              onClick={() => onDeleteDiscussion(discussion.id)}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-700 transition-colors hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
            {discussion.category}
          </span>
          {discussion.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold leading-tight text-on-surface">{discussion.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{discussion.excerpt}</p>

        {!!discussion.imageUrls?.length && (
          <section className="mt-5 rounded-2xl border border-outline-variant bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <h2 className="inline-flex items-center gap-2 text-sm font-bold text-on-surface">
                <ImageIcon size={16} />
                Attached photos
              </h2>
              <span className="rounded-full bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
                {discussion.imageUrls.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {discussion.imageUrls.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  aria-label={`Preview forum upload ${index + 1}`}
                  onClick={() => setPreviewImage({ url: imageUrl, index })}
                  className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low text-left"
                >
                  <img
                    src={imageUrl}
                    alt={`Forum upload ${index + 1}`}
                    className="h-44 w-full object-cover transition-transform group-hover:scale-[1.02]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const fallback = event.currentTarget.nextElementSibling;
                      fallback?.classList.remove("hidden");
                    }}
                  />
                  <span className="hidden h-44 items-center justify-center px-4 text-center text-xs font-bold text-primary underline">
                    Image uploaded, but cannot display. Check Cloudflare public access.
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} />
            {discussion.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare size={15} />
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye size={15} />
            {discussion.views} views
          </span>
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <VoteControls
              usefulActive={isUsefulByUser(discussion, currentUserId)}
              unusefulActive={isUnusefulByUser(discussion, currentUserId)}
              usefulCount={getUsefulCount(discussion)}
              unusefulCount={getUnusefulCount(discussion)}
              onUseful={() => onToggleDiscussionUseful(discussion.id)}
              onUnuseful={() => onToggleDiscussionUnuseful(discussion.id)}
            />
            <button
              type="button"
              aria-pressed={isSaved}
              onClick={() => onToggleSave(discussion.id)}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-all ${
                isSaved
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container"
              }`}
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? t("forum.savedPost") : t("forum.savePost")}
            </button>
          </div>
        </div>
      </header>

      <section className="px-4 text-base leading-7 text-on-surface">
        {discussion.body.map((paragraph, index) => (
          <p key={index} className="mb-5">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mx-4 mt-8 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-on-surface">Comments ({commentCount})</h2>
        <form onSubmit={handleCommentSubmit} className="mb-5 rounded-2xl bg-surface-container-low p-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Add a comment
            </span>
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Share a helpful answer or follow-up..."
              rows={4}
              className="w-full resize-none rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm leading-6 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <button
            type="submit"
            disabled={!canSubmitComment}
            className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-outline-variant disabled:text-on-surface-variant"
          >
            <Send size={16} />
            Post comment
          </button>
        </form>
        <div className="space-y-4">
          {discussion.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 rounded-xl bg-surface-container-low p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold text-on-surface-variant">
                {reply.avatar}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-on-surface">{reply.author}</p>
                  <p className="text-xs text-on-surface-variant">{reply.time}</p>
                  {reply.userId === currentUserId && (
                    <button
                      type="button"
                      aria-label="Delete your comment"
                      onClick={() => onDeleteComment(discussion.id, reply.id)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">{reply.body}</p>
                <div className="mt-3">
                  <VoteControls
                    usefulActive={isUsefulByUser(reply, currentUserId)}
                    unusefulActive={isUnusefulByUser(reply, currentUserId)}
                    usefulCount={getUsefulCount(reply)}
                    unusefulCount={getUnusefulCount(reply)}
                    onUseful={() => onToggleCommentUseful(discussion.id, reply.id)}
                    onUnuseful={() => onToggleCommentUnuseful(discussion.id, reply.id)}
                    compact
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Forum upload ${previewImage.index + 1} preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-full w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              aria-label="Close image preview"
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-lg transition-colors hover:bg-white"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage.url}
              alt={`Forum upload ${previewImage.index + 1} enlarged preview`}
              className="mx-auto max-h-[82vh] w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </article>
  );
}

function VoteControls({
  usefulActive,
  unusefulActive,
  usefulCount,
  unusefulCount,
  onUseful,
  onUnuseful,
  compact = false,
}: {
  usefulActive: boolean;
  unusefulActive: boolean;
  usefulCount: number;
  unusefulCount: number;
  onUseful: () => void;
  onUnuseful: () => void;
  compact?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <VoteButton
        label="Mark useful"
        isActive={usefulActive}
        count={usefulCount}
        onClick={onUseful}
        icon="up"
        compact={compact}
      />
      <VoteButton
        label="Mark unuseful"
        isActive={unusefulActive}
        count={unusefulCount}
        onClick={onUnuseful}
        icon="down"
        compact={compact}
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
  compact,
}: {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
  icon: "up" | "down";
  compact: boolean;
}) {
  const Icon = icon === "up" ? ThumbsUp : ThumbsDown;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all ${
        compact ? "h-8 px-2 text-xs" : "h-9 px-2.5 text-xs"
      } ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container"
      }`}
    >
      <Icon size={compact ? 15 : 16} fill={isActive ? "currentColor" : "none"} />
      <span>{count}</span>
    </button>
  );
}
