export type ResourceLevel =
  | "Start here"
  | "Foundation"
  | "Intermediate"
  | "Advanced"
  | "Professional";

export type ResourceKind =
  | "Official documentation"
  | "Video tutorial"
  | "Guided course"
  | "Practice"
  | "Projects"
  | "Interview"
  | "Reference";

export type ResourceQualityStatus = "Reviewed" | "Review due";

export type LearningResource = {
  id: string;
  technology: string;
  title: string;
  provider: string;
  url: string;
  kind: ResourceKind;
  level: ResourceLevel;
  description: string;
  topic: string;
  difficulty: ResourceLevel;
  duration: string;
  resourceType: ResourceKind;
  lastReviewedAt: string;
  qualityStatus: ResourceQualityStatus;
  youtubeVideoId?: string;
  official?: boolean;
  free?: boolean;
};

export type LearningResourceSource = Omit<
  LearningResource,
  | "topic"
  | "difficulty"
  | "duration"
  | "resourceType"
  | "lastReviewedAt"
  | "qualityStatus"
> &
  Partial<
    Pick<
      LearningResource,
      | "topic"
      | "difficulty"
      | "duration"
      | "resourceType"
      | "lastReviewedAt"
      | "qualityStatus"
    >
  >;

export const normalizeLearningResource = (
  item: LearningResourceSource,
): LearningResource => ({
  ...item,
  topic: item.topic ?? item.technology,
  difficulty: item.difficulty ?? item.level,
  duration: item.duration ?? "Self-paced",
  resourceType: item.resourceType ?? item.kind,
  lastReviewedAt: item.lastReviewedAt ?? "2026-09-25",
  qualityStatus: item.qualityStatus ?? "Reviewed",
});
