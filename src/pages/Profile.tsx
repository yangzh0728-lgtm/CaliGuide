import { FormEvent, useEffect, useState } from "react";
import {
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

export default function Profile() {
  const { currentUser, logout, updateAccount, updatePassword } = useAuth();
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
      title: "Document Checklist",
      desc: "7 of 12 documents uploaded",
      icon: FileCheck,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      id: "saved",
      title: "Saved Guides",
      desc: "4 guides saved for offline reading",
      icon: Bookmark,
      color: "bg-primary-container text-on-primary-container",
      filled: true,
    },
    {
      id: "posts",
      title: "My Forum Posts",
      desc: "12 discussions started",
      icon: MessageSquare,
      color: "bg-surface-container-high text-on-surface-variant",
    },
    {
      id: "settings",
      title: "Settings",
      desc: "Privacy, notifications, and security",
      icon: Settings,
      color: "bg-surface-container-highest text-on-surface-variant",
    },
  ];

  if (!currentUser) {
    return null;
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    try {
      updateAccount({ name, avatarUrl });
      setProfileMessage("Profile updated");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to update profile");
    }
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");

    try {
      updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password changed");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Unable to change password");
    }
  };

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
      <section className="flex flex-col items-center mb-8 pt-4">
        <div className="relative mb-4">
          <img
            alt={currentUser.name}
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-surface-container-high"
            src={avatarUrl}
          />
          <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-2 border-white flex items-center justify-center shadow-md">
            <Camera size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-on-surface">{currentUser.name}</h2>
        <p className="text-sm font-medium text-on-surface-variant mt-1">{currentUser.email}</p>
        <p className="text-xs font-medium text-on-surface-variant mt-1">
          Member since {currentUser.memberSince}
        </p>
      </section>

      <form onSubmit={handleProfileSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm mb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-container text-white p-2.5 rounded-xl">
            <UserRound size={20} />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">Profile details</h3>
            <p className="text-xs text-on-surface-variant">Change your name and profile picture.</p>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Profile picture URL</span>
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        {profileMessage && (
          <p className="text-sm font-semibold text-primary">{profileMessage}</p>
        )}

        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          <Save size={18} />
          Save profile
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-highest text-on-surface-variant p-2.5 rounded-xl">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">Password</h3>
            <p className="text-xs text-on-surface-variant">Use at least 6 characters.</p>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-2 w-full border border-outline-variant rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">New password</span>
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
          Change password
        </button>
      </form>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-outline-variant rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group"
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
          </div>
        ))}

        <div className="mt-8 pt-8 border-t border-outline-variant">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 p-4 text-error font-bold rounded-2xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
