import { BLOG_ARTICLES } from "./blogContent";

export type HomeTopicId =
  | "housing"
  | "dmv"
  | "legal"
  | "jobs"
  | "health"
  | "transportation"
  | "safety"
  | "education"
  | "banking";

interface HomeTopicDefinition {
  id: HomeTopicId;
  category: string;
  leadArticleId: string;
  labelKey: string;
}

export interface HomeTopic extends HomeTopicDefinition {
  count: number;
}

const HOME_TOPIC_DEFINITIONS: HomeTopicDefinition[] = [
  { id: "housing", category: "Housing", leadArticleId: "category-housing", labelKey: "home.housing" },
  { id: "dmv", category: "DMV", leadArticleId: "category-dmv", labelKey: "home.dmv" },
  { id: "legal", category: "Legal", leadArticleId: "guide-legal-30-day-documents", labelKey: "home.legal" },
  { id: "jobs", category: "Jobs", leadArticleId: "guide-newcomer-job-search", labelKey: "home.jobs" },
  { id: "health", category: "Health", leadArticleId: "category-health", labelKey: "home.health" },
  { id: "transportation", category: "Transportation", leadArticleId: "guide-california-transportation", labelKey: "home.transportation" },
  { id: "safety", category: "Safety", leadArticleId: "guide-earthquake-wildfire-preparedness", labelKey: "home.safety" },
  { id: "education", category: "Education", leadArticleId: "guide-school-esl-resources", labelKey: "home.education" },
  { id: "banking", category: "Banking", leadArticleId: "category-banking", labelKey: "home.banking" },
];

export function getHomeTopics(): HomeTopic[] {
  return HOME_TOPIC_DEFINITIONS.map((topic) => ({
    ...topic,
    count: BLOG_ARTICLES.filter((article) => article.category === topic.category).length,
  }));
}
