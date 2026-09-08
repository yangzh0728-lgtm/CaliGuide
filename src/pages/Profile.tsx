import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Bookmark,
  BookOpen,
  Camera,
  CalendarDays,
  ChevronRight,
  Download,
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
  ShieldCheck,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import ProfileDetailPrompt from "../components/ProfileDetailPrompt";
import { PROFILE_PROMPT_COPY } from "../i18n/profilePromptCopy";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";
import ProfileSettingsShell, {
  type ProfileSettingsSection,
} from "../components/ProfileSettingsShell";
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
import { deleteAccountViaApi, requestAccountExportViaApi } from "../lib/accountDataApi";
import ChecklistSyncStatus from "../components/ChecklistSyncStatus";
import { getUserFacingError } from "../lib/userFacingErrors";
import { useMovingChecklistProgress } from "../hooks/useMovingChecklistProgress";
import { getMovingChecklistCopy } from "../lib/movingChecklist";
import {
  formatProfileCount,
  formatProfileMonthYear,
  getArrivalGuideId,
} from "../lib/profileDashboard";
import {
  fetchRecentProfileChats,
  type ProfileRecentChat,
} from "../lib/profileRecentChats";

interface ProfileProps {
  articles: BlogArticle[];
  forumDiscussions: ForumDiscussion[];
  onOpenBlog: (articleId: string) => void;
  onOpenGuides: () => void;
  onOpenForum: () => void;
  onOpenChatbot: (sessionId?: string) => void;
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
  onOpenGuides,
  onOpenForum,
  onOpenChatbot,
  onOpenForumDetail,
  onToggleForumUseful,
  onToggleForumUnuseful,
  currentUserId,
}: ProfileProps) {
  const { currentUser, logout, clearDeletedAccountSession, updateAccount, updatePassword, updateProfileDetail } = useAuth();
  const [arrivalPromptOpen, setArrivalPromptOpen] = useState(false);
  const { language, languages, setLanguage, t } = useLanguage();
  const { consent, openPreferences } = usePrivacyConsent();
  const movingChecklist = useMovingChecklistProgress();
  const [view, setView] = useState<ProfileView>("profile");
  const [settingsSection, setSettingsSection] = useState<ProfileSettingsSection | null>(null);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth ?? "");
  const [sex, setSex] = useState<SexOption>(currentUser?.sex ?? "prefer_not_to_say");
  const [nationalities, setNationalities] = useState(currentUser?.nationalities?.length ? currentUser.nationalities : [""]);
  const [currentLocation, setCurrentLocation] = useState(currentUser?.currentLocation ?? "");
  const [arrivalStatus, setArrivalStatus] = useState<ArrivalStatusOption>(currentUser?.arrivalStatus ?? "planning");
  const [arrivalStatusProvided, setArrivalStatusProvided] = useState(currentUser?.arrivalStatusProvided !== false);
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
  const [accountDataMessage, setAccountDataMessage] = useState("");
  const [isExportingAccount, setIsExportingAccount] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [recentChats, setRecentChats] = useState<ProfileRecentChat[]>([]);
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
  const arrivalGuide = useMemo(
    () => articles.find((article) => article.id === (currentUser?.arrivalStatusProvided === false ? "forum-first-30-days" : getArrivalGuideId(currentUser?.arrivalStatus ?? "planning"))),
    [articles, currentUser?.arrivalStatus, currentUser?.arrivalStatusProvided],
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
    setArrivalStatusProvided(currentUser?.arrivalStatusProvided !== false);
    setForumTranslationLanguage(currentUser?.forumTranslationLanguage ?? "en");
    setAvatarFailed(false);
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.id) {
      setRecentChats([]);
      return;
    }

    void fetchRecentProfileChats(supabase, currentUser.id)
      .then((chats) => {
        if (!cancelled) setRecentChats(chats);
      })
      .catch((error) => {
        console.warn("Unable to load recent profile chats", error);
        if (!cancelled) setRecentChats([]);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const menuItems = [
    {
      id: "checklist",
      title: t("profile.checklist"),
      desc: t("profile.checklistProgress")
        .replace("{completed}", String(movingChecklist.completed.length))
        .replace("{total}", String(getMovingChecklistCopy(language).tasks.length)),
      icon: FileCheck,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      id: "saved",
      title: t("profile.saved"),
      desc: formatProfileCount(t("profile.savedCount"), savedArticles.length + savedForumPosts.length),
      icon: Bookmark,
      color: "bg-primary-container text-on-primary-container",
      filled: true,
    },
    {
      id: "posts",
      title: t("profile.posts"),
      desc: formatProfileCount(t("profile.postCount"), userForumPosts.length),
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
    setArrivalStatusProvided(currentUser.arrivalStatusProvided !== false);
    setForumTranslationLanguage(currentUser.forumTranslationLanguage);
    setCurrentPassword("");
    setNewPassword("");
    setProfileMessage("");
    setPasswordMessage("");
    setSettingsSection(null);
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
    setArrivalStatusProvided(currentUser.arrivalStatusProvided !== false);
    setForumTranslationLanguage(currentUser.forumTranslationLanguage);
    setCurrentPassword("");
    setNewPassword("");
    setProfileMessage("");
    setPasswordMessage("");
    setSettingsSection(null);
    setView("profile");
  };

  const selectSettingsSection = (section: ProfileSettingsSection | null) => {
    setProfileMessage("");
    setPasswordMessage("");
    setAccountDataMessage("");
    setSettingsSection(section);
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
        arrivalStatusProvided,
        forumTranslationLanguage,
      });
      setProfileMessage(t("settings.profileUpdated"));
    } catch (error) {
      setProfileMessage(getUserFacingError(error, language));
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
      setAvatarFailed(false);
      setProfileMessage(t("settings.avatarReady"));
    } catch (error) {
      setProfileMessage(getUserFacingError(error, language));
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
      setPasswordMessage(getUserFacingError(error, language));
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
      setProfileMessage(getUserFacingError(error, language));
      setIsSignOutConfirmOpen(false);
    }
  };

  const handleAccountExport = async () => {
    setAccountDataMessage("");
    setIsExportingAccount(true);

    try {
      const accountData = await requestAccountExportViaApi(supabase);
      const blob = new Blob([JSON.stringify(accountData, null, 2)], {
        type: "application/json",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `caliguide-account-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setAccountDataMessage(t("settings.downloadDataReady"));
    } catch {
      setAccountDataMessage(t("settings.accountExportFailed"));
    } finally {
      setIsExportingAccount(false);
    }
  };

  const handleAccountDelete = async () => {
    if (deleteAccountConfirmation !== "DELETE") {
      return;
    }

    setAccountDataMessage("");
    setIsDeletingAccount(true);

    try {
      await deleteAccountViaApi(supabase, deleteAccountConfirmation);
      await clearDeletedAccountSession();
      setIsDeleteAccountOpen(false);
    } catch {
      setAccountDataMessage(t("settings.accountDeleteFailed"));
      setIsDeleteAccountOpen(false);
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountConfirmation("");
    }
  };

  if (view === "settings") {
    const selectedSettingsSection = settingsSection ?? "account";

    return (
      <>
        <ProfileSettingsShell
          activeSection={settingsSection}
          onBackToProfile={closeSettings}
          onSelectSection={selectSettingsSection}
        >
        {selectedSettingsSection === "account" && (
        <form onSubmit={handleProfileSubmit} className="space-y-5">

          <div className="flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-container font-bold text-primary shadow-sm">
              {!avatarFailed && avatarUrl ? (
                <img
                  alt={currentUser.name}
                  className={`h-full w-full ${avatarUrl.startsWith("data:image/svg") || avatarUrl.includes("ui-avatars.com") ? "object-contain p-1" : "object-cover"}`}
                  src={avatarUrl}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{currentUser.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
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
                value={arrivalStatusProvided ? arrivalStatus : ""}
                onChange={(event) => {
                  setArrivalStatusProvided(Boolean(event.target.value));
                  if (event.target.value) setArrivalStatus(event.target.value as ArrivalStatusOption);
                }}
                className="w-full bg-transparent py-3 text-sm outline-none"
              >
                {!arrivalStatusProvided && <option value="">{PROFILE_PROMPT_COPY[language].choose}</option>}
                <option value="planning">{t("auth.arrivalPlanning")}</option>
                <option value="arrived">{t("auth.arrivalArrived")}</option>
                <option value="long_term_resident">{t("auth.arrivalLongTermResident")}</option>
              </select>
            </div>
          </label>

          {profileMessage && (
            <p role="status" className="rounded-lg bg-primary-container px-4 py-3 text-sm font-semibold text-primary">
              {profileMessage}
            </p>
          )}

          <button
            disabled={isSavingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {isSavingProfile ? t("settings.saving") : t("settings.saveAccount")}
          </button>
        </form>
        )}

        {selectedSettingsSection === "security" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">

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
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 font-bold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />
            {isSavingPassword ? t("settings.saving") : t("settings.changePassword")}
          </button>
        </form>
        )}

        {selectedSettingsSection === "language" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <label className="block">
              <span className="text-xs font-bold uppercase text-on-surface-variant">
                {t("settings.interfaceLanguage")}
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-outline-variant px-3 focus-within:border-primary">
                <Languages size={18} className="text-on-surface-variant" />
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as typeof language)}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                >
                  {languages.map((option) => (
                    <option key={option.code} value={option.code}>{option.label}</option>
                  ))}
                </select>
              </div>
              <span className="mt-2 block text-xs leading-5 text-on-surface-variant">
                {t("settings.interfaceLanguageDesc")}
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase text-on-surface-variant">
                {t("settings.forumTranslationLanguage")}
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-outline-variant px-3 focus-within:border-primary">
                <Languages size={18} className="text-on-surface-variant" />
                <select
                  value={forumTranslationLanguage}
                  onChange={(event) => setForumTranslationLanguage(event.target.value as ForumTranslationLanguage)}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                >
                  {FORUM_TRANSLATION_LANGUAGES.map((option) => (
                    <option key={option.code} value={option.code}>{option.label}</option>
                  ))}
                </select>
              </div>
              <span className="mt-2 block text-xs leading-5 text-on-surface-variant">
                {t("settings.forumTranslationLanguageDesc")}
              </span>
            </label>

            {profileMessage && (
              <p role="status" className="rounded-lg bg-primary-container px-4 py-3 text-sm font-semibold text-primary">
                {profileMessage}
              </p>
            )}
            <button
              disabled={isSavingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Save size={18} />
              {isSavingProfile ? t("settings.saving") : t("settings.saveLanguage")}
            </button>
          </form>
        )}

        {selectedSettingsSection === "privacy" && (
          <div className="space-y-5">
            <div className="rounded-lg bg-surface-container-low p-4">
              <h3 className="font-bold text-on-surface">{t("privacy.dialogTitle")}</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                {t("settings.privacySummary")}
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-bold text-on-surface">{t("privacy.preferences")}</dt>
                  <dd className="text-on-surface-variant">{consent?.preferences ? t("settings.allowed") : t("settings.notAllowed")}</dd>
                </div>
                <div>
                  <dt className="font-bold text-on-surface">{t("privacy.analytics")}</dt>
                  <dd className="text-on-surface-variant">{consent?.analytics ? t("settings.allowed") : t("settings.notAllowed")}</dd>
                </div>
                <div>
                  <dt className="font-bold text-on-surface">{t("privacy.marketing")}</dt>
                  <dd className="text-on-surface-variant">{consent?.marketing ? t("settings.allowed") : t("settings.notAllowed")}</dd>
                </div>
              </dl>
            </div>
            <button
              type="button"
              onClick={openPreferences}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-3 font-bold text-primary hover:bg-surface-container-low"
            >
              <ShieldCheck size={18} />
              {t("settings.managePrivacy")}
            </button>
          </div>
        )}

        {selectedSettingsSection === "data" && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-on-surface-variant">{t("settings.downloadDataCopy")}</p>
            <button
              type="button"
              disabled={isExportingAccount}
              onClick={handleAccountExport}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={18} />
              {isExportingAccount ? t("settings.downloadingData") : t("settings.downloadData")}
            </button>
            {accountDataMessage && (
              <p role="status" className="rounded-lg bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant">
                {accountDataMessage}
              </p>
            )}
          </div>
        )}

        {selectedSettingsSection === "danger" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-error/20 bg-error/5 p-4">
              <h3 className="font-bold text-error">{t("settings.deleteAccount")}</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{t("settings.deleteAccountBody")}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteAccountConfirmation("");
                setIsDeleteAccountOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-error/30 bg-error/5 px-5 py-3 text-sm font-bold text-error transition-colors hover:bg-error/10"
            >
              <Trash2 size={18} />
              {t("settings.deleteAccount")}
            </button>
            {accountDataMessage && (
              <p role="status" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-semibold text-error">
                {accountDataMessage}
              </p>
            )}
          </div>
        )}
        </ProfileSettingsShell>

        {isDeleteAccountOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className="w-full max-w-sm rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-error/10 p-3 text-error">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 id="delete-account-title" className="text-xl font-bold text-on-surface">
                    {t("settings.deleteAccountTitle")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    {t("settings.deleteAccountBody")}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase text-on-surface-variant">
                  {t("settings.deleteAccountLabel")}
                </span>
                <input
                  autoFocus
                  value={deleteAccountConfirmation}
                  onChange={(event) => setDeleteAccountConfirmation(event.target.value)}
                  placeholder={t("settings.deleteAccountPlaceholder")}
                  className="mt-2 w-full rounded-xl border border-outline-variant px-3 py-3 text-sm outline-none focus:border-error"
                />
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteAccountOpen(false)}
                  className="rounded-xl border border-outline-variant px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
                >
                  {t("settings.deleteAccountCancel")}
                </button>
                <button
                  type="button"
                  disabled={deleteAccountConfirmation !== "DELETE" || isDeletingAccount}
                  onClick={handleAccountDelete}
                  className="rounded-xl bg-error px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingAccount ? t("settings.deletingAccount") : t("settings.deleteAccountConfirm")}
                </button>
              </div>
            </section>
          </div>
        )}
      </>
    );
  }

  if (view === "saved") {
    return (
      <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
        <ProfilePanelHeader title={t("profile.saved")} backLabel={t("profile.backToProfile")} onBack={closeProfilePanel} />

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
                actionLabel={t("profile.browseGuides")}
                onAction={onOpenGuides}
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
                actionLabel={t("profile.askFirstQuestion")}
                onAction={onOpenForum}
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
        <ProfilePanelHeader title={t("profile.posts")} backLabel={t("profile.backToProfile")} onBack={closeProfilePanel} />

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
            title={t("profile.noForumPosts")}
            body={t("profile.noForumPostsDesc")}
            actionLabel={t("profile.askFirstQuestion")}
            onAction={onOpenForum}
          />
        )}
      </div>
    );
  }

  if (view === "checklist") {
    const checklistCopy = getMovingChecklistCopy(language);

    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-20">
        <ProfilePanelHeader title={t("profile.checklist")} backLabel={t("profile.backToProfile")} onBack={closeProfilePanel} />
        <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm leading-6 text-on-surface-variant">
            {t("profile.checklistIntro")}
          </p>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${(movingChecklist.completed.length / checklistCopy.tasks.length) * 100}%` }}
            />
          </div>
          <div className="space-y-3">
            <ChecklistSyncStatus {...movingChecklist} />
            {checklistCopy.tasks.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-container-low p-3">
                <input
                  type="checkbox"
                  checked={movingChecklist.completed.includes(item.id)}
                  disabled={movingChecklist.isLoading}
                  onChange={() => movingChecklist.toggle(item.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary disabled:cursor-wait disabled:opacity-60"
                />
                <span>
                  <span className="block text-sm font-bold text-on-surface">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{item.deadline}</span>
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpenBlog("guide-moving-address-checklist")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            <BookOpen size={17} />
            {t("profile.openGuide")}
          </button>
        </div>
      </div>
    );
  }

  const promptCopy = PROFILE_PROMPT_COPY[language];
  const arrivalCopy = currentUser.arrivalStatusProvided === false
    ? { title: promptCopy.genericTitle, body: promptCopy.genericBody }
    : currentUser.arrivalStatus === "planning"
    ? {
        title: t("profile.arrival.planningTitle"),
        body: t("profile.arrival.planningBody"),
      }
    : currentUser.arrivalStatus === "arrived"
      ? {
          title: t("profile.arrival.arrivedTitle"),
          body: t("profile.arrival.arrivedBody"),
        }
      : {
          title: t("profile.arrival.longTermTitle"),
          body: t("profile.arrival.longTermBody"),
        };
  const checklistCopy = getMovingChecklistCopy(language);
  const checklistProgress = t("profile.checklistProgress")
    .replace("{completed}", String(movingChecklist.completed.length))
    .replace("{total}", String(checklistCopy.tasks.length));
  const memberSince = formatProfileMonthYear(currentUser.memberSince, language);
  const initials = currentUser.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CG";
  const useContainedAvatar = currentUser.avatarUrl.startsWith("data:image/svg") || currentUser.avatarUrl.includes("ui-avatars.com");

  return (
    <>
      {arrivalPromptOpen && <ProfileDetailPrompt kind="arrival"
        initialValue={currentUser.arrivalStatusProvided === false ? "" : currentUser.arrivalStatus}
        onSave={updateProfileDetail} onContinue={() => setArrivalPromptOpen(false)} onDismiss={() => setArrivalPromptOpen(false)} />}
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-20">
        <section className="mb-7 flex items-center gap-4 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-container text-lg font-bold text-primary shadow-sm">
            {!avatarFailed && currentUser.avatarUrl ? (
              <img
                alt={currentUser.name}
                className={`h-full w-full ${useContainedAvatar ? "object-contain p-1" : "object-cover"}`}
                src={currentUser.avatarUrl}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span aria-label={currentUser.name}>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-on-surface">{currentUser.name}</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              {t("profile.memberSince")} {memberSince}
            </p>
          </div>
        </section>

        <section className="mb-7">
          <h2 className="mb-3 text-xl font-bold text-on-surface">{t("profile.dashboardTitle")}</h2>
          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-primary text-white shadow-sm">
            <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase text-white/75">{t("auth.arrivalStatus")}</p>
                <h3 className="mt-2 text-xl font-bold">{arrivalCopy.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">{arrivalCopy.body}</p>
                <button type="button" onClick={() => setArrivalPromptOpen(true)}
                  className="mt-3 text-sm font-medium text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  {promptCopy.personalize}
                </button>
              </div>
              {arrivalGuide ? (
                <button
                  type="button"
                  onClick={() => onOpenBlog(arrivalGuide.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container hover:opacity-90"
                >
                  <BookOpen size={18} />
                  {t("profile.openGuide")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mb-7 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => openProfilePanel("checklist")}
            className="rounded-2xl border border-outline-variant bg-white p-5 text-left shadow-sm transition-colors hover:bg-surface-container-low"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-xl bg-secondary-container p-3 text-on-secondary-container"><FileCheck size={22} /></div>
              <ChevronRight size={20} className="text-outline" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-on-surface">{t("profile.checklist")}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{checklistProgress}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${(movingChecklist.completed.length / checklistCopy.tasks.length) * 100}%` }}
              />
            </div>
          </button>

          <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-xl bg-primary-container p-3 text-primary"><Bot size={22} /></div>
              <button type="button" onClick={() => onOpenChatbot()} className="text-sm font-bold text-primary hover:underline">
                {t("profile.openChatbot")}
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold text-on-surface">{t("profile.recentChats")}</h3>
            {recentChats.length ? (
              <div className="mt-3 space-y-2">
                {recentChats.map((chat) => (
                  <button key={chat.id} type="button" onClick={() => onOpenChatbot(chat.id)} className="block w-full truncate rounded-lg bg-surface-container-low px-3 py-2 text-left text-sm font-semibold text-on-surface hover:bg-surface-container-high">
                    {chat.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t("profile.noRecentChats")}</p>
            )}
          </section>
        </div>

        <section className="mb-7 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-on-surface">{t("profile.savedPreview")}</h3>
            <button type="button" onClick={() => openProfilePanel("saved")} className="text-sm font-bold text-primary hover:underline">{t("profile.viewSaved")}</button>
          </div>
          {savedArticles.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {savedArticles.slice(0, 2).map((article) => (
                <button key={article.id} type="button" onClick={() => onOpenBlog(article.id)} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3 text-left hover:bg-surface-container-high">
                  <img src={article.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  <span className="line-clamp-2 text-sm font-bold text-on-surface">{article.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={onOpenGuides} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-primary hover:bg-surface-container-high">
              <BookOpen size={17} />
              {t("profile.browseGuides")}
            </button>
          )}
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

function ProfilePanelHeader({ title, backLabel, onBack }: { title: string; backLabel: string; onBack: () => void }) {
  return (
    <section className="mb-6 pt-2">
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-xl py-2 pr-3 font-bold text-primary transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft size={20} />
        {backLabel}
      </button>
      <h2 className="text-3xl font-bold text-on-surface">{title}</h2>
    </section>
  );
}

function EmptyProfileState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-sm">
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{body}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90">
          {actionLabel}
        </button>
      ) : null}
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
