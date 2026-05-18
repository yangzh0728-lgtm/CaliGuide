import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { readAvatarFile } from "../lib/avatarUpload";

export default function Profile() {
  const { currentUser, logout, updateAccount, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState<"profile" | "settings">("profile");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

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
      desc: t("profile.savedDesc"),
      icon: Bookmark,
      color: "bg-primary-container text-on-primary-container",
      filled: true,
    },
    {
      id: "posts",
      title: t("profile.posts"),
      desc: t("profile.postsDesc"),
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
            onClick={item.id === "settings" ? openSettings : undefined}
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
