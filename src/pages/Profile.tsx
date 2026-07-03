import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  ChevronRight,
  FileCheck,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Save,
  Settings,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { readAvatarFile } from "../lib/avatarUpload";
import { BlogArticle } from "../lib/blogContent";
import {
  ForumDiscussion,
  getForumReplyCount,
  getUnusefulCount,
  getUsefulCount,
  isUnusefulByUser,
  isUsefulByUser,
} from "../lib/forumContent";

interface ProfileProps {
  articles: BlogArticle[];
  forumDiscussions: ForumDiscussion[];
  onOpenBlog: (articleId: string) => void;
  onOpenForumDetail: (discussionId: string) => void;
  onToggleForumUseful: (discussionId: string) => void;
  onToggleForumUnuseful: (discussionId: string) => void;
  currentUserId: string;
}

type ProfileView = "profile" | "settings" | "saved" | "posts" | "checklist";

export default function Profile({
  articles,
  forumDiscussions,
  onOpenBlog,
  onOpenForumDetail,
  onToggleForumUseful,
  onToggleForumUnuseful,
  currentUserId,
}: ProfileProps) {
  const { currentUser, logout, updateAccount, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState<ProfileView>("profile");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const savedArticles = useMemo(
    () => articles.filter((article) => currentUser?.savedGuideIds.includes(article.id)),
    [articles, currentUser?.savedGuideIds],
  );
  const userForumPosts = useMemo(
    () => forumDiscussions.filter((discussion) => discussion.author === currentUser?.name),
    [forumDiscussions, currentUser?.name],
  );

  useEffect(() => {
    setName(currentUser?.name ?? "");
    setAvatarUrl(currentUser?.avatarUrl ?? "");
  }, [currentUser]);

  const menuItems = [
    {
      id: "checklist",
      title: t("profile.checklist"),
      desc: t("profile.checklistDesc"),
      icon: FileCheck,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      id: "saved",
      title: t("profile.saved"),
      desc: `${savedArticles.length} saved ${savedArticles.length === 1 ? "guide" : "guides"}`,
      icon: Bookmark,
      color: "bg-primary-container text-on-primary-container",
      filled: true,
    },
    {
      id: "posts",
      title: t("profile.posts"),
      desc: `${userForumPosts.length} forum ${userForumPosts.length === 1 ? "post" : "posts"}`,
      icon: MessageSquare,
      color: "bg-surface-container-high text-on-surface-variant",
    },
    {
      id: "settings",
      title: t("profile.settings"),
      desc: t("profile.settingsDesc"),
      icon: Settings,
      color: "bg-surface-container-highest text-on-surface-variant",
    },
  ];

  if (!currentUser) {
    return null;
  }

  const openSettings = () => {
    setName(currentUser.name);
    setAvatarUrl(currentUser.avatarUrl);
    setCurrentPassword("");
    setNewPassword("");
    setProfileMessage("");
    setPasswordMessage("");
    setView("settings");
  };

  const openProfilePanel = (panel: ProfileView) => {
    if (panel === "settings") {
      openSettings();
      return;
    }

    setView(panel);
  };

  const closeProfilePanel = () => {
    setView("profile");
  };

  const closeSettings = () => {
    setName(currentUser.name);
    setAvatarUrl(currentUser.avatarUrl);
    setCurrentPassword("");
    setNewPassword("");
    setProfileMessage("");
    setPasswordMessage("");
    setView("profile");
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    try {
      updateAccount({ name, avatarUrl });
      setProfileMessage(t("settings.profileUpdated"));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to update profile");
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setProfileMessage("");

    try {
      const uploadedAvatarUrl = await readAvatarFile(file);
      setAvatarUrl(uploadedAvatarUrl);
      setProfileMessage(t("settings.avatarReady"));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to upload profile picture");
    } finally {
      event.target.value = "";
    }
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");

    try {
      updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage(t("settings.passwordChanged"));
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Unable to change password");
    }
  };

  if (view === "settings") {
    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <section className="mb-6 pt-2">
          <button
            onClick={closeSettings}
            className="mb-5 inline-flex items-center gap-2 text-primary font-bold rounded-xl py-2 pr-3 hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft size={20} />
            {t("nav.profile")}
          </button>
          <h2 className="text-3xl font-bold text-on-surface">{t("settings.heading")}</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            {t("settings.subtitle")}
          </p>
        </section>

        <form onSubmit={handleProfileSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm mb-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-container text-white p-2.5 rounded-xl">
              <UserRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">{t("settings.account")}</h3>
              <p className="text-xs text-on-surface-variant">{t("settings.accountDesc")}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
            <img
              alt={currentUser.name}
              className="w-16 h-16 rounded-full border-2 border-white object-cover bg-surface-container-high shadow-sm"
              src={avatarUrl}
            />
            <label className="inline-flex items-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container cursor-pointer hover:opacity-90 transition-opacity">
              <Camera size={18} />
              {t("settings.upload")}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="sr-only"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.name")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          {profileMessage && (
            <p className="text-sm font-semibold text-primary">{profileMessage}</p>
          )}

          <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
            <Save size={18} />
            {t("settings.saveAccount")}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-highest text-on-surface-variant p-2.5 rounded-xl">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">{t("settings.security")}</h3>
              <p className="text-xs text-on-surface-variant">{t("settings.securityDesc")}</p>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("settings.currentPassword")}</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("settings.newPassword")}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          {passwordMessage && (
            <p className="text-sm font-semibold text-primary">{passwordMessage}</p>
          )}

          <button className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-3 rounded-xl font-bold hover:bg-surface-container-low transition-colors">
            <LockKeyhole size={18} />
            {t("settings.changePassword")}
          </button>
        </form>
      </div>
    );
  }

  if (view === "saved") {
    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <ProfilePanelHeader title={t("profile.saved")} onBack={closeProfilePanel} />

        {savedArticles.length > 0 ? (
          <div className="space-y-3">
            {savedArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onOpenBlog(article.id)}
                className="w-full overflow-hidden rounded-2xl border border-outline-variant bg-white text-left shadow-sm transition-colors hover:bg-surface-container-low"
              >
                <img src={article.image} alt={article.title} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold text-on-surface-variant">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold leading-tight text-on-surface">{article.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">{article.excerpt}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyProfileState
            title="No saved guides yet"
            body="Open a guide and tap Save guide to keep it here."
          />
        )}
      </div>
    );
  }

  if (view === "posts") {
    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <ProfilePanelHeader title={t("profile.posts")} onBack={closeProfilePanel} />

        {userForumPosts.length > 0 ? (
          <div className="space-y-3">
            {userForumPosts.map((post) => (
              <article
                key={post.id}
                className="w-full rounded-2xl border border-outline-variant bg-white p-4 text-left shadow-sm transition-colors hover:bg-surface-container-low"
              >
                <button type="button" onClick={() => onOpenForumDetail(post.id)} className="w-full text-left">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-surface-container-high px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                      {post.category}
                    </span>
                    <span className="text-xs text-on-surface-variant">{post.time}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight text-on-surface">{post.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">{post.excerpt}</p>
                  <p className="mt-3 text-xs font-bold text-primary">
                    {getForumReplyCount(post)} {t("forum.replies")} · {post.views} {t("forum.views")}
                  </p>
                </button>
                <div className="mt-3 inline-flex items-center gap-2">
                  <VoteButton
                    label="Mark useful"
                    isActive={isUsefulByUser(post, currentUserId)}
                    count={getUsefulCount(post)}
                    onClick={() => onToggleForumUseful(post.id)}
                    icon="up"
                  />
                  <VoteButton
                    label="Mark unuseful"
                    isActive={isUnusefulByUser(post, currentUserId)}
                    count={getUnusefulCount(post)}
                    onClick={() => onToggleForumUnuseful(post.id)}
                    icon="down"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyProfileState
            title="No forum posts yet"
            body="Create a post from the Forum page and it will appear here."
          />
        )}
      </div>
    );
  }

  if (view === "checklist") {
    const checklistItems = [
      "Passport or government ID",
      "Proof of California address",
      "Bank account setup notes",
      "Health insurance documents",
      "School or work records",
    ];

    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <ProfilePanelHeader title={t("profile.checklist")} onBack={closeProfilePanel} />
        <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm leading-6 text-on-surface-variant">
            Keep these starter documents close while you prepare guides, appointments, and forum questions.
          </p>
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-on-surface">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
      <section className="flex flex-col items-center mb-8 pt-4">
        <div className="mb-4">
          <img
            alt={currentUser.name}
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-surface-container-high"
            src={currentUser.avatarUrl}
          />
        </div>
        <h2 className="text-2xl font-bold text-on-surface">{currentUser.name}</h2>
        <p className="text-sm font-medium text-on-surface-variant mt-1">{currentUser.email}</p>
        <p className="text-xs font-medium text-on-surface-variant mt-1">
          {t("profile.memberSince")} {currentUser.memberSince}
        </p>
      </section>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => openProfilePanel(item.id as ProfileView)}
            className="w-full bg-white border border-outline-variant rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group text-left"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <item.icon size={22} fill={item.filled ? "currentColor" : "none"} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline group-hover:translate-x-1 transition-transform" />
          </button>
        ))}

        <div className="mt-8 pt-8 border-t border-outline-variant">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 p-4 text-error font-bold rounded-2xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            {t("profile.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <section className="mb-6 pt-2">
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-xl py-2 pr-3 font-bold text-primary transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft size={20} />
        Profile
      </button>
      <h2 className="text-3xl font-bold text-on-surface">{title}</h2>
    </section>
  );
}

function EmptyProfileState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-sm">
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
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
  icon: "up" | "down";
}) {
  const Icon = icon === "up" ? ThumbsUp : ThumbsDown;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : "bg-surface-container-high text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container"
      }`}
    >
      <Icon size={15} fill={isActive ? "currentColor" : "none"} />
      <span>{count}</span>
    </button>
  );
}
