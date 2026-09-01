import { BLOG_ARTICLES } from "./blogContent";
import { getGuideCitationSet } from "./guideCitations";
import {
  INSTITUTION_CATALOG,
  INSTITUTION_GROUPS,
  type Institution,
} from "./institutionCatalog";

export { INSTITUTION_GROUPS } from "./institutionCatalog";
export type { Institution, InstitutionGroupId, InstitutionJurisdiction } from "./institutionCatalog";

export const INSTITUTIONS: readonly Institution[] = INSTITUTION_CATALOG;

const INSTITUTION_BY_ID = new Map(INSTITUTIONS.map((institution) => [institution.id, institution]));

export function getInstitution(institutionId: string) {
  return INSTITUTION_BY_ID.get(institutionId);
}

export function getRelatedGuideIds(institutionId: string) {
  return BLOG_ARTICLES.filter((article) =>
    getGuideCitationSet(article.id)?.references.some(
      (referenceItem) => referenceItem.institutionId === institutionId,
    ),
  ).map((article) => article.id);
}

export function searchInstitutions(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [...INSTITUTIONS];
  }

  return INSTITUTIONS.filter((institution) =>
    [
      institution.name,
      institution.shortName,
      institution.officialDomain,
      institution.purpose,
      institution.doesNotDo,
      institution.scamNote,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export function getInstitutionsByGroup() {
  return INSTITUTION_GROUPS.map((group) => ({
    ...group,
    institutions: INSTITUTIONS.filter((institution) => institution.groupId === group.id),
  }));
}
