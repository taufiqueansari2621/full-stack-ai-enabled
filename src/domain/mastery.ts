import type { ForgeState } from "../useForgeStore";

export type MasteryState =
  | "Not started"
  | "Learning"
  | "Practicing"
  | "Applied"
  | "Review due"
  | "Strong";

export type MasteryEvidence = {
  lessons: number;
  practiceAttempts: number;
  correctPractice: number;
  projects: number;
  interviews: number;
  reviews: number;
  artifacts: number;
  labs: number;
  overdueReviews: number;
};

export function masteryEvidence(
  state: ForgeState,
  now = new Date(),
): MasteryEvidence {
  return {
    lessons: state.completedLessons.length,
    practiceAttempts: state.practiceAttempts.length,
    correctPractice: state.practiceAttempts.filter((item) => item.correct)
      .length,
    projects: Object.values(state.projectTasks).reduce(
      (sum, items) => sum + items.length,
      0,
    ),
    interviews: state.interviewResults.length,
    reviews: state.reviewSchedule.filter((item) => item.streak > 0).length,
    artifacts: state.masteryArtifacts.length,
    labs: state.labArtifacts.length,
    overdueReviews: state.reviewSchedule.filter(
      (item) => new Date(item.nextReviewAt).getTime() <= now.getTime(),
    ).length,
  };
}

export function masteryState(evidence: MasteryEvidence): MasteryState {
  if (evidence.overdueReviews > 0) return "Review due";
  if (
    evidence.artifacts >= 5 &&
    evidence.correctPractice >= 5 &&
    evidence.projects >= 3 &&
    evidence.interviews >= 2 &&
    evidence.reviews >= 2
  )
    return "Strong";
  if (evidence.projects > 0 || evidence.labs > 0 || evidence.artifacts >= 3)
    return "Applied";
  if (evidence.practiceAttempts > 0 || evidence.artifacts > 0)
    return "Practicing";
  if (evidence.lessons > 0) return "Learning";
  return "Not started";
}

export function evidenceProgress(evidence: MasteryEvidence) {
  const signals = [
    evidence.lessons > 0,
    evidence.practiceAttempts > 0,
    evidence.correctPractice >= 3,
    evidence.artifacts >= 3,
    evidence.projects > 0,
    evidence.labs > 0,
    evidence.interviews > 0,
    evidence.reviews > 0,
  ];
  return Math.round((signals.filter(Boolean).length / signals.length) * 100);
}
