import { ReactNode } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Database,
  Languages,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const PROFILE_SETTINGS_SECTIONS = [
  "account",
  "security",
  "language",
  "privacy",
  "data",
  "danger",
] as const;

export type ProfileSettingsSection = (typeof PROFILE_SETTINGS_SECTIONS)[number];

const SECTION_ICONS = {
  account: UserRound,
  security: LockKeyhole,
  language: Languages,
  privacy: ShieldCheck,
  data: Database,
  danger: TriangleAlert,
} as const;

interface ProfileSettingsShellProps {
  activeSection: ProfileSettingsSection | null;
  children: ReactNode;
  onBackToProfile: () => void;
  onSelectSection: (section: ProfileSettingsSection | null) => void;
}

export default function ProfileSettingsShell({
  activeSection,
  children,
  onBackToProfile,
  onSelectSection,
}: ProfileSettingsShellProps) {
  const { t } = useLanguage();
  const selectedSection = activeSection ?? "account";
  const SelectedIcon = SECTION_ICONS[selectedSection];

  const sectionButton = (section: ProfileSettingsSection, mobile = false) => {
    const Icon = SECTION_ICONS[section];
    const isActive = selectedSection === section;
    const isDanger = section === "danger";

    return (
      <button
        key={`${mobile ? "mobile" : "desktop"}-${section}`}
        type="button"
        data-settings-section={section}
        data-danger-section={isDanger ? "true" : undefined}
        aria-current={isActive ? "page" : undefined}
        onClick={() => onSelectSection(section)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition-colors ${
          isDanger
            ? "text-error hover:bg-error/10"
            : isActive && !mobile
              ? "bg-primary-container text-primary"
              : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
        }`}
      >
        <Icon size={19} aria-hidden="true" />
        <span className="min-w-0 flex-1">{t(`settings.section.${section}`)}</span>
        {mobile && <ChevronRight size={18} aria-hidden="true" />}
      </button>
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <header className="mb-6 pt-2">
        <button
          type="button"
          onClick={onBackToProfile}
          className="mb-4 inline-flex items-center gap-2 rounded-lg py-2 pr-3 font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          {t("nav.profile")}
        </button>
        <h1 className="text-3xl font-bold text-on-surface">{t("settings.heading")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
          {t("settings.subtitle")}
        </p>
      </header>

      <nav
        aria-label={t("settings.heading")}
        data-mobile-settings-menu={activeSection === null ? "true" : "false"}
        className={`${activeSection === null ? "block" : "hidden"} rounded-lg border border-outline-variant bg-white p-2 shadow-sm md:hidden`}
      >
        {PROFILE_SETTINGS_SECTIONS.map((section) => sectionButton(section, true))}
      </nav>

      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-lg border border-outline-variant bg-white p-3 shadow-sm md:block">
          <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-on-surface-variant">
            {t("settings.heading")}
          </p>
          <nav aria-label={t("settings.heading")} className="space-y-1">
            {PROFILE_SETTINGS_SECTIONS.slice(0, 5).map((section) => sectionButton(section))}
            <div className="my-2 border-t border-outline-variant" />
            {sectionButton("danger")}
          </nav>
        </aside>

        <section
          aria-labelledby="settings-panel-title"
          data-mobile-settings-panel={activeSection === null ? "false" : "true"}
          className={`${activeSection === null ? "hidden" : "block"} min-w-0 rounded-lg border border-outline-variant bg-white p-5 shadow-sm md:block md:p-7`}
        >
          <button
            type="button"
            onClick={() => onSelectSection(null)}
            className="mb-5 inline-flex items-center gap-2 rounded-lg py-2 pr-3 text-sm font-bold text-primary hover:bg-surface-container-low md:hidden"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {t("settings.allSections")}
          </button>

          <div className="mb-6 flex items-start gap-3 border-b border-outline-variant pb-5">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                selectedSection === "danger"
                  ? "bg-error/10 text-error"
                  : "bg-surface-container-low text-primary"
              }`}
            >
              <SelectedIcon size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="settings-panel-title"
                className={`text-2xl font-bold ${selectedSection === "danger" ? "text-error" : "text-on-surface"}`}
              >
                {t(`settings.section.${selectedSection}`)}
              </h2>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                {t(`settings.section.${selectedSection}Desc`)}
              </p>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
