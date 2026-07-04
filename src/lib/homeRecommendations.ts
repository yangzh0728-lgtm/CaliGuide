const RECOMMENDED_PREVIEW_COUNT = 3;

export function getVisibleRecommendedGuides<T>(guides: T[], showAll: boolean) {
  return showAll ? guides : guides.slice(0, RECOMMENDED_PREVIEW_COUNT);
}
