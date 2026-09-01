import { BookOpen, Building2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ReferenceLibraryTabsProps {
  active: "guides" | "agencies";
  onOpenGuides: () => void;
  onOpenAgencies: () => void;
}

export default function ReferenceLibraryTabs({
  active,
  onOpenGuides,
  onOpenAgencies,
}: ReferenceLibraryTabsProps) {
  const { t } = useLanguage();

  return (
    <div
      className="inline-grid grid-cols-2 rounded-lg border border-outline-variant bg-white p-1 shadow-sm"
      aria-label={t("recommended.libraryNavigation")}
    >
      <LibraryTab
        id="guides"
        label={t("nav.guides")}
        active={active === "guides"}
        icon={BookOpen}
        onSelect={onOpenGuides}
      />
      <LibraryTab
        id="agencies"
        label={t("recommended.agenciesTab")}
        active={active === "agencies"}
        icon={Building2}
        onSelect={onOpenAgencies}
      />
    </div>
  );
}

function LibraryTab({
  id,
  label,
  active,
  icon: Icon,
  onSelect,
}: {
  id: "guides" | "agencies";
  label: string;
  active: boolean;
  icon: typeof BookOpen;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-reference-tab={id}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
      }`}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
