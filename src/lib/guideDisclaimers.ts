/**
 * Guides that explain immigration paperwork, tenancy rules, medical coverage, or
 * money decisions need an explicit "this is not professional advice" notice.
 *
 * The mapping is deliberately explicit rather than derived from `category` so a
 * new guide never silently inherits (or loses) a disclaimer when its category
 * label changes.
 */

export type GuideDisclaimerKind = "legal" | "medical" | "financial";

/** Render order, so a guide with several kinds always lists them the same way. */
export const GUIDE_DISCLAIMER_KIND_ORDER: GuideDisclaimerKind[] = [
  "legal",
  "medical",
  "financial",
];

const GUIDE_DISCLAIMERS: Record<string, GuideDisclaimerKind[]> = {
  // DMV — license type and REAL ID eligibility depend on immigration status.
  "category-dmv": ["legal"],
  "guide-1": ["legal"],
  "guide-real-id-documents": ["legal"],

  // Housing — deposit caps, lease terms, and eviction rules are tenancy law.
  "category-housing": ["legal"],
  "guide-2": ["legal"],
  "guide-rental-scams": ["legal", "financial"],
  "guide-moving-address-checklist": ["legal", "financial"],

  // Health — coverage eligibility is both a medical and a cost decision.
  "category-health": ["medical", "financial"],
  "guide-first-doctor-visit": ["medical"],

  // Banking — account eligibility, ITIN use, and fees.
  "category-banking": ["financial"],
  "trending-banking": ["legal", "financial"],

  // Immigration document handling and work authorization.
  "guide-legal-30-day-documents": ["legal"],
  "guide-notario-fraud": ["legal", "financial"],
  "guide-newcomer-job-search": ["legal"],
  "guide-workers-rights-wage-theft": ["legal", "financial"],
  "trending-ssn": ["legal"],

  // Vehicles — registration deadlines plus mandatory insurance minimums.
  "guide-california-transportation": ["legal", "financial"],
};

function sortKinds(kinds: GuideDisclaimerKind[]): GuideDisclaimerKind[] {
  return [...kinds].sort(
    (left, right) =>
      GUIDE_DISCLAIMER_KIND_ORDER.indexOf(left) - GUIDE_DISCLAIMER_KIND_ORDER.indexOf(right),
  );
}

export function getGuideDisclaimerKinds(articleId: string): GuideDisclaimerKind[] {
  const kinds = GUIDE_DISCLAIMERS[articleId];

  if (!kinds?.length) {
    return [];
  }

  return sortKinds(Array.from(new Set(kinds)));
}

export function hasGuideDisclaimer(articleId: string): boolean {
  return getGuideDisclaimerKinds(articleId).length > 0;
}
