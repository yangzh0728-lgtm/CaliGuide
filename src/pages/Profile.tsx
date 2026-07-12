import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  CalendarDays,
  ChevronRight,
  FileCheck,
  Flag,
  LockKeyhole,
  LogOut,
  Languages,
  Mail,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Save,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { uploadAvatarToR2 } from "../lib/avatarUpload";
import { BlogArticle } from "../lib/blogContent";
import { ArrivalStatusOption, SexOption } from "../lib/authStore";
import { COUNTRY_OPTIONS } from "../lib/nationalities";
import {
  FORUM_TRANSLATION_LANGUAGES,
  type ForumTranslationLanguage,
} from "../lib/forumTranslation";
import {
  ForumDiscussion,
  getForumReplyCount,
  getUnusefulCount,
  getUsefulCount,
  isUnusefulByUser,
  isUsefulByUser,
} from "../lib/forumContent";
import { supabase } from "../lib/supabaseClient";

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
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth ?? "");
  const [sex, setSex] = useState<SexOption>(currentUser?.sex ?? "prefer_not_to_say");
  const [nationalities, setNationalities] = useState(currentUser?.nationalities?.length ? currentUser.nationalities : [""]);
  const [currentLocation, setCurrentLocation] = useState(currentUser?.currentLocation ?? "");
  const [arrivalStatus, setArrivalStatus] = useState<ArrivalStatusOption>(currentUser?.arrivalStatus ?? "planning");
  const [forumTranslationLanguage, setForumTranslationLanguage] = useState<ForumTranslationLanguage>(
    currentUser?.forumTranslationLanguage ?? "en",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const savedArticles = useMemo(
    () => articles.filter((article) => currentUser?.savedGuideIds.includes(article.id)),
    [articles, currentUser?.savedGuideIds],
  );
  const savedForumPosts = useMemo(
    () => forumDiscussions.filter((discussion) => currentUser?.savedPostIds.includes(discussion.id)),
    [forumDiscussions, currentUser?.savedPostIds],
  );
  const userForumPosts = useMemo(
    () => forumDiscussions.filter((discussion) => discussion.userId === currentUser?.id),
    [forumDiscussions, currentUser?.id],
  );

  useEffect(() => {
    setName(currentUser?.name ?? "");
    setEmail(currentUser?.email ?? "");
    setAvatarUrl(currentUser?.avatarUrl ?? "");
    setDateOfBirth(currentUser?.dateOfBirth ?? "");
    setSex(currentUser?.sex ?? "prefer_not_to_say");
    setNationalities(currentUser?.nationalities?.length ? currentUser.nationalities : [""]);
    setCurrentLocation(currentUser?.currentLocation ?? "");
    setArrivalStatus(currentUser?.arrivalStatus ?? "planning");
    setForumTranslationLanguage(currentUser?.forumTranslationLanguage ?? "en");
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
      desc: `${savedArticles.length + savedForumPosts.length} saved ${savedArticles.length + savedForumPosts.length === 1 ? "item" : "items"}`,
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
    setEmail(currentUser.email);
    setAvatarUrl(currentUser.avatarUrl);
    setDateOfBirth(currentUser.dateOfBirth ?? "");
    setSex(currentUser.sex);
    setNationalities(currentUser.nationalities?.length ? currentUser.nationalities : [""]);
    setCurrentLocation(currentUser.currentLocation);
    setArrivalStatus(currentUser.arrivalStatus);
    setForumTranslationLanguage(currentUser.forumTranslationLanguage);
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
    setEmail(currentUser.email);
    setAvatarUrl(currentUser.avatarUrl);
    setDateOfBirth(currentUser.dateOfBirth ?? "");
    setSex(currentUser.sex);
    setNationalities(currentUser.nationalities?.length ? currentUser.nationalities : [""]);
    setCurrentLocation(currentUser.currentLocation);
    setArrivalStatus(currentUser.arrivalStatus);
    setForumTranslationLanguage(currentUser.forumTranslationLanguage);
    setCurrentPassword("");
    setNewPassword("");
    setProfileMessage("");
    setPasswordMessage("");
    setView("profile");
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      await updateAccount({
        name,
        email,
        avatarUrl,
        dateOfBirth,
        sex,
        nationalities,
        currentLocation,
        arrivalStatus,
        forumTranslationLanguage,
      });
      setProfileMessage(t("settings.profileUpdated"));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setProfileMessage("");

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) {
        throw new Error("Sign in required");
      }

      const uploadedAvatarUrl = await uploadAvatarToR2(file, data.session.access_token);
      setAvatarUrl(uploadedAvatarUrl);
      setProfileMessage(t("settings.avatarReady"));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to upload profile picture");
    } finally {
      event.target.value = "";
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    setIsSavingPassword(true);

    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage(t("settings.passwordChanged"));
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Unable to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const requestSignOut = () => {
    setProfileMessage("");
    setIsSignOutConfirmOpen(true);
  };

  const confirmSignOut = async () => {
    setProfileMessage("");

    try {
      await logout();
      setIsSignOutConfirmOpen(false);
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to sign out");
      setIsSignOutConfirmOpen(false);
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
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <UserRound size={18} className="text-on-surface-variant" />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.email")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <Mail size={18} className="text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.dateOfBirth")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <CalendarDays size={18} className="text-on-surface-variant" />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.sex")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <UsersRound size={18} className="text-on-surface-variant" />
              <select
                value={sex}
                onChange={(event) => setSex(event.target.value as SexOption)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              >
                <option value="male">{t("auth.sexMale")}</option>
                <option value="female">{t("auth.sexFemale")}</option>
                <option value="prefer_not_to_say">{t("auth.sexPreferNotToSay")}</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.countryNationality")}</span>
            <div className="mt-2 space-y-2">
              {nationalities.map((nationality, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary"
                >
                  <Flag size={18} className="text-on-surface-variant" />
                  <select
                    value={nationality}
                    onChange={(event) =>
                      setNationalities((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                      )
                    }
                    required={index === 0}
                    className="w-full bg-transparent py-3 text-sm outline-none"
                  >
                    <option value="">{t("auth.countryNationalityPlaceholder")}</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {nationalities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setNationalities((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                      aria-label={t("auth.removeNationality")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNationalities((current) => [...current, ""])}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm font-bold text-primary hover:bg-surface-container-high"
              >
                <Plus size={16} />
                {t("auth.addNationality")}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.currentLocation")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <MapPin size={18} className="text-on-surface-variant" />
              <input
                value={currentLocation}
                onChange={(event) => setCurrentLocation(event.target.value)}
                placeholder={t("auth.currentLocationPlaceholder")}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.arrivalStatus")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <Plane size={18} className="text-on-surface-variant" />
              <select
                value={arrivalStatus}
                onChange={(event) => setArrivalStatus(event.target.value as ArrivalStatusOption)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              >
                <option value="planning">{t("auth.arrivalPlanning")}</option>
                <option value="arrived">{t("auth.arrivalArrived")}</option>
                <option value="long_term_resident">{t("auth.arrivalLongTermResident")}</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              {t("settings.forumTranslationLanguage")}
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-outline-variant px-3 focus-within:border-primary">
              <Languages size={18} className="text-on-surface-variant" />
              <select
                value={forumTranslationLanguage}
                onChange={(event) => setForumTranslationLanguage(event.target.value as ForumTranslationLanguage)}
                className="w-full bg-transparent py-3 text-sm outline-none"
              >
                {FORUM_TRANSLATION_LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="mt-2 block text-xs leading-5 text-on-surface-variant">
              {t("settings.forumTranslationLanguageDesc")}
            </span>
          </label>

          {profileMessage && (
            <p className="text-sm font-semibold text-primary">{profileMessage}</p>
          )}

          <button
            disabled={isSavingProfile}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {isSavingProfile ? "Saving..." : t("settings.saveAccount")}
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

          <button
            disabled={isSavingPassword}
            className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-3 rounded-xl font-bold hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />
            {isSavingPassword ? "Saving..." : t("settings.changePassword")}
          </button>
        </form>
      </div>
    );
  }

  if (view === "saved") {
    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <ProfilePanelHeader title={t("profile.saved")} onBack={closeProfilePanel} />

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-lg font-bold text-on-surface">{t("profile.savedGuides")}</h3>
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
                title={t("profile.noSavedGuides")}
                body={t("profile.noSavedGuidesDesc")}
              />
            )}
          </section>

          <section>
            <h3 className="mb-3 text-lg font-bold text-on-surface">{t("profile.savedPosts")}</h3>
            {savedForumPosts.length > 0 ? (
              <div className="space-y-3">
                {savedForumPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onOpenForumDetail={onOpenForumDetail}
                    onToggleForumUseful={onToggleForumUseful}
                    onToggleForumUnuseful={onToggleForumUnuseful}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <EmptyProfileState
                title={t("profile.noSavedPosts")}
                body={t("profile.noSavedPostsDesc")}
              />
            )}
          </section>
        </div>
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
              <ForumPostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onOpenForumDetail={onOpenForumDetail}
                onToggleForumUseful={onToggleForumUseful}
                onToggleForumUnuseful={onToggleForumUnuseful}
                t={t}
              />
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
    <>
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
              onClick={requestSignOut}
              className="w-full flex items-center justify-center gap-3 p-4 text-error font-bold rounded-2xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors"
            >
              <LogOut size={20} />
              {t("profile.signOut")}
            </button>
            {profileMessage && (
              <p className="mt-3 rounded-xl bg-error/10 px-4 py-3 text-sm font-bold text-error">{profileMessage}</p>
            )}
          </div>
        </div>
      </div>

      {isSignOutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-confirm-title"
            className="w-full max-w-sm rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-error/10 p-3 text-error">
                <LogOut size={22} />
              </div>
              <div>
                <h3 id="sign-out-confirm-title" className="text-xl font-bold text-on-surface">
                  {t("profile.signOutConfirmTitle")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {t("profile.signOutConfirmBody")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSignOutConfirmOpen(false)}
                className="rounded-xl border border-outline-variant px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                {t("profile.cancelSignOut")}
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="rounded-xl bg-error px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                {t("profile.confirmSignOut")}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
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

function ForumPostCard({
  post,
  currentUserId,
  onOpenForumDetail,
  onToggleForumUseful,
  onToggleForumUnuseful,
  t,
}: {
  post: ForumDiscussion;
  currentUserId: string;
  onOpenForumDetail: (discussionId: string) => void;
  onToggleForumUseful: (discussionId: string) => void;
  onToggleForumUnuseful: (discussionId: string) => void;
  t: (key: string) => string;
  key?: string;
}) {
  return (
    <article className="w-full rounded-2xl border border-outline-variant bg-white p-4 text-left shadow-sm transition-colors hover:bg-surface-container-low">
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
