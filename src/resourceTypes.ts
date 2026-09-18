export type ResourceLevel =
  | "Start here"
  | "Foundation"
  | "Intermediate"
  | "Advanced"
  | "Professional";

export type ResourceKind =
  | "Official documentation"
  | "Guided course"
  | "Practice"
  | "Projects"
  | "Interview"
  | "Reference";

export type LearningResource = {
  id: string;
  technology: string;
  title: string;
  provider: string;
  url: string;
  kind: ResourceKind;
  level: ResourceLevel;
  description: string;
  official?: boolean;
  free?: boolean;
};
