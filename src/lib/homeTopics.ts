import { getGuideDirectoryCount } from "./guideDirectory";

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
  labelKey: string;
}

export interface HomeTopic extends HomeTopicDefinition {
  count: number;
}

const HOME_TOPIC_DEFINITIONS: HomeTopicDefinition[] = [
  { id: "housing", labelKey: "home.housing" },
  { id: "dmv", labelKey: "home.dmv" },
  { id: "legal", labelKey: "home.legal" },
  { id: "jobs", labelKey: "home.jobs" },
  { id: "health", labelKey: "home.health" },
  { id: "transportation", labelKey: "home.transportation" },
  { id: "safety", labelKey: "home.safety" },
  { id: "education", labelKey: "home.education" },
  { id: "banking", labelKey: "home.banking" },
];

export function getHomeTopics(): HomeTopic[] {
  return HOME_TOPIC_DEFINITIONS.map((topic) => ({
    ...topic,
    count: getGuideDirectoryCount(topic.id),
  }));
}
