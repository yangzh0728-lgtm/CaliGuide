import { BLOG_ARTICLES } from "./blogContent";
import {
  GUIDE_REFERENCE_LIBRARY,
  getGuideCitationSet,
  getLocalizedGuideReference,
} from "./guideCitations";
import {
  INSTITUTION_CATALOG,
  INSTITUTION_GROUPS,
  type Institution,
} from "./institutionCatalog";
import type { LanguageCode } from "../i18n/translations";

export { INSTITUTION_GROUPS } from "./institutionCatalog";
export type { Institution, InstitutionGroupId, InstitutionJurisdiction } from "./institutionCatalog";

export interface LocalizedInstitution extends Institution {
  purpose: string;
  doesNotDo: string;
  languageAccessNote: string;
  scamNote?: string;
}

export const INSTITUTIONS: readonly Institution[] = INSTITUTION_CATALOG;

const INSTITUTION_BY_ID = new Map(INSTITUTIONS.map((institution) => [institution.id, institution]));

export function getInstitution(institutionId: string) {
  return INSTITUTION_BY_ID.get(institutionId);
}

export function getLocalizedInstitution(
  institutionId: string,
  language: LanguageCode,
): LocalizedInstitution | undefined {
  const institution = getInstitution(institutionId);
  if (!institution) {
    return undefined;
  }
  const content = institution.content[language];
  return {
    ...institution,
    purpose: content.purpose,
    doesNotDo: content.doesNotDo,
    languageAccessNote: content.languageAccessNote,
    scamNote: content.scamWarning,
  };
}

export function getRelatedGuideIds(institutionId: string) {
  return BLOG_ARTICLES.filter((article) =>
    getGuideCitationSet(article.id)?.references.some(
      (referenceItem) => referenceItem.institutionId === institutionId,
    ),
  ).map((article) => article.id);
}

export function getInstitutionReferences(
  institutionId: string,
  language: LanguageCode = "en",
) {
  return Object.values(GUIDE_REFERENCE_LIBRARY).filter(
    (referenceItem) => referenceItem.institutionId === institutionId,
  ).map((referenceItem) => getLocalizedGuideReference(referenceItem, language));
}

export function searchInstitutions(query: string, language: LanguageCode = "en") {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return INSTITUTIONS.map((institution) => getLocalizedInstitution(institution.id, language)!);
  }

  return INSTITUTIONS.map((institution) => getLocalizedInstitution(institution.id, language)!).filter(
    (institution) =>
      [
        institution.name,
        institution.shortName,
        institution.officialDomain,
        ...institution.publisherNames,
        institution.purpose,
        institution.doesNotDo,
        institution.scamNote ?? "",
        ...institution.content[language].searchTerms,
        ...institution.confusionPairs.flatMap((pair) => [
          pair.content[language].trigger,
          pair.content[language].explanation,
        ]),
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export function getInstitutionsByGroup(language: LanguageCode = "en") {
  return INSTITUTION_GROUPS.map((group) => ({
    ...group,
    institutions: INSTITUTIONS.filter((institution) => institution.groupId === group.id)
      .sort((left, right) => left.priority - right.priority)
      .map((institution) => getLocalizedInstitution(institution.id, language)!),
  }));
}
