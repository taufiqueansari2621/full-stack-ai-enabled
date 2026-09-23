import type { ForgeState } from "../useForgeStore";

export type ForgeBadge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export type ForgeLevel = {
  number: number;
  name: string;
  floor: number;
  ceiling: number | null;
  progress: number;
  remaining: number;
};

const LEVELS = [
  [0, "Apprentice"],
  [500, "Builder"],
  [1_200, "Practitioner"],
  [2_200, "Engineer"],
  [3_600, "Specialist"],
  [5_500, "Senior Engineer"],
  [8_000, "Principal Builder"],
] as const;

const uniqueBy = <T>(items: T[], key: (item: T) => string) =>
  new Map(items.map((item) => [key(item), item]));

export function evidenceXp(state: ForgeState) {
  const uniqueCorrect = new Set(
    state.practiceAttempts
      .filter((attempt) => attempt.correct)
      .map((attempt) => attempt.challengeId),
  ).size;
  const projectSteps = new Set(
    Object.entries(state.projectTasks).flatMap(([projectId, tasks]) =>
      tasks.map((taskId) => `${projectId}:${taskId}`),
    ),
  ).size;
  const successfulReviews = new Set(
    state.reviewSchedule
      .filter((review) => review.streak > 0)
      .map((review) => review.sourceId),
  ).size;
  const quizXp = [
    ...uniqueBy(state.quizResults, (quiz) => quiz.quizId).values(),
  ]
    .map((quiz) => (quiz.score >= 80 ? 150 : 25))
    .reduce((sum, value) => sum + value, 0);
  const interviewXp = [
    ...uniqueBy(
      state.interviewResults,
      (result) => result.questionId ?? result.question,
    ).values(),
  ]
    .map((result) => Math.round(result.score / 4))
    .reduce((sum, value) => sum + value, 0);

  return (
    state.completedLessons.length * 120 +
    uniqueCorrect * 60 +
    projectSteps * 20 +
    state.masteryArtifacts.length * 20 +
    state.labArtifacts.length * 40 +
    state.topicPracticeArtifacts.length * 15 +
    state.exampleLabRecords.length * 10 +
    successfulReviews * 15 +
    quizXp +
    interviewXp +
    state.certificates.length * 300
  );
}

export function levelForXp(xp: number): ForgeLevel {
  let index = 0;
  for (let candidate = 0; candidate < LEVELS.length; candidate += 1) {
    if (xp >= LEVELS[candidate][0]) index = candidate;
  }
  const [floor, name] = LEVELS[index];
  const ceiling = LEVELS[index + 1]?.[0] ?? null;
  return {
    number: index + 1,
    name,
    floor,
    ceiling,
    progress: ceiling
      ? Math.min(100, Math.round(((xp - floor) / (ceiling - floor)) * 100))
      : 100,
    remaining: ceiling ? Math.max(0, ceiling - xp) : 0,
  };
}

export function badgesForState(state: ForgeState): ForgeBadge[] {
  const attempts = new Map<string, { failed: boolean; solved: boolean }>();
  for (const attempt of state.practiceAttempts) {
    const current = attempts.get(attempt.challengeId) ?? {
      failed: false,
      solved: false,
    };
    if (attempt.correct) current.solved = true;
    else current.failed = true;
    attempts.set(attempt.challengeId, current);
  }
  const corrected = [...attempts.values()].some(
    (attempt) => attempt.failed && attempt.solved,
  );
  const projectSteps = Object.values(state.projectTasks).reduce(
    (sum, tasks) => sum + tasks.length,
    0,
  );
  return [
    {
      id: "first-solve",
      title: "First Solve",
      description: "Solve a practice challenge correctly.",
      unlocked: [...attempts.values()].some((attempt) => attempt.solved),
    },
    {
      id: "debugger",
      title: "Debugger",
      description: "Correct a challenge after an unsuccessful attempt.",
      unlocked: corrected,
    },
    {
      id: "builder",
      title: "Project Builder",
      description: "Complete five project steps.",
      unlocked: projectSteps >= 5,
    },
    {
      id: "recall",
      title: "Recall Ready",
      description: "Build a three-success recall streak.",
      unlocked: state.reviewSchedule.some((review) => review.streak >= 3),
    },
    {
      id: "lab",
      title: "Lab Investigator",
      description: "Save measured evidence from an engineering lab.",
      unlocked: state.labArtifacts.length > 0,
    },
    {
      id: "interview",
      title: "Interview Ready",
      description: "Score at least 70 on three interview responses.",
      unlocked:
        state.interviewResults.filter((result) => result.score >= 70).length >=
        3,
    },
  ];
}

export function nextMilestone(state: ForgeState, badges: ForgeBadge[]) {
  const locked = badges.find((badge) => !badge.unlocked);
  if (locked) return locked.description;
  if (!state.certificates.length)
    return "Complete the required evidence for your first verified certificate.";
  return "Keep strengthening weak skills with projects, reviews, and interviews.";
}

export function buildGamification(state: ForgeState) {
  const xp = evidenceXp(state);
  const badges = badgesForState(state);
  return {
    xp,
    level: levelForXp(xp),
    badges,
    unlockedBadges: badges.filter((badge) => badge.unlocked).length,
    nextMilestone: nextMilestone(state, badges),
  };
}
