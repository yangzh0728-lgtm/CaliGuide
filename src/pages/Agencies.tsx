import { Building2 } from "lucide-react";
import AgencyDirectoryShell from "../components/AgencyDirectoryShell";
import { useLanguage } from "../context/LanguageContext";
import { getInstitution } from "../lib/institutions";

interface AgenciesProps {
  selectedInstitutionId?: string;
  onOpenInstitution: (institutionId: string) => void;
  onOpenBlog: (articleId: string) => void;
}

export default function Agencies({ selectedInstitutionId, onOpenInstitution, onOpenBlog }: AgenciesProps) {
  const { t } = useLanguage();
  const selectedInstitution = selectedInstitutionId ? getInstitution(selectedInstitutionId) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 lg:px-8">
      <header className="mb-6 pt-2">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold leading-tight text-on-surface">{t("agencies.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">{t("agencies.subtitle")}</p>
          </div>
        </div>
      </header>

      <AgencyDirectoryShell
        initialGroupId={selectedInstitution?.groupId ?? "all"}
        initialExpandedInstitutionId={selectedInstitutionId}
        onOpenInstitution={onOpenInstitution}
        onOpenBlog={onOpenBlog}
      />
    </main>
  );
}
