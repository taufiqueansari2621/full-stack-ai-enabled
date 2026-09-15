import { useCallback, useEffect, useMemo, useState } from "react";

const LEGACY_STORAGE_KEY = "forge-learning-state-v1";
const storageKey = (learnerId: string) =>
  `forge-learning-state-v1:${learnerId}`;

export type PracticeAttempt = {
  challengeId: string;
  correct: boolean;
  answer: string;
  attemptedAt: string;
};

export type KnowledgeEntry = {
  id: string;
  kind: "note" | "mistake";
  title: string;
  body: string;
  topic: string;
  createdAt: string;
};

export type InterviewResult = {
  id: string;
  question: string;
  answer: string;
  score: number;
  feedback: string[];
  createdAt: string;
};

export type ForgeState = {
  version: 1;
  xp: number;
  completedLessons: string[];
  completedReviews: string[];
  practiceAttempts: PracticeAttempt[];
  knowledge: KnowledgeEntry[];
  projectTasks: Record<string, string[]>;
  interviewResults: InterviewResult[];
  activityDates: string[];
  weeklyGoalMinutes: number;
  learnedMinutes: number;
  currentPosition: {
    page: string;
    course: string;
    module: string;
    lesson: string;
    section: string;
    updatedAt: string;
  };
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createInitialState = (): ForgeState => ({
  version: 1,
  xp: 0,
  completedLessons: [],
  completedReviews: [],
  practiceAttempts: [],
  knowledge: [],
  projectTasks: {},
  interviewResults: [],
  activityDates: [],
  weeklyGoalMinutes: 450,
  learnedMinutes: 0,
  currentPosition: {
    page: "learn",
    course: "Foundations",
    module: "Computer & Web Basics",
    lesson: "How computers execute instructions",
    section: "Day 1 · Start here",
    updatedAt: new Date().toISOString(),
  },
});

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function loadState(learnerId: string): ForgeState {
  const initialState = createInitialState();
  try {
    const raw = localStorage.getItem(storageKey(learnerId));
    if (!raw) return initialState;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return initialState;
    const candidate = value as Partial<ForgeState>;
    if (candidate.version !== 1) return initialState;
    return {
      ...initialState,
      ...candidate,
      xp:
        typeof candidate.xp === "number"
          ? Math.max(0, candidate.xp)
          : initialState.xp,
      completedLessons: isStringArray(candidate.completedLessons)
        ? candidate.completedLessons
        : initialState.completedLessons,
      completedReviews: isStringArray(candidate.completedReviews)
        ? candidate.completedReviews
        : [],
      practiceAttempts: Array.isArray(candidate.practiceAttempts)
        ? candidate.practiceAttempts
        : [],
      knowledge: Array.isArray(candidate.knowledge)
        ? candidate.knowledge
        : initialState.knowledge,
      projectTasks:
        candidate.projectTasks && typeof candidate.projectTasks === "object"
          ? candidate.projectTasks
          : initialState.projectTasks,
      interviewResults: Array.isArray(candidate.interviewResults)
        ? candidate.interviewResults
        : [],
      activityDates: isStringArray(candidate.activityDates)
        ? candidate.activityDates
        : [todayKey()],
    };
  } catch {
    return initialState;
  }
}

export function useForgeStore(learnerId: string) {
  const [state, setState] = useState<ForgeState>(() => loadState(learnerId));
  useEffect(() => {
    localStorage.setItem(storageKey(learnerId), JSON.stringify(state));
  }, [learnerId, state]);

  const touchActivity = useCallback(
    (current: ForgeState) => ({
      ...current,
      activityDates: current.activityDates.includes(todayKey())
        ? current.activityDates
        : [...current.activityDates, todayKey()],
    }),
    [],
  );

  const completeLesson = useCallback(
    (lessonId: string) =>
      setState((current) => {
        if (current.completedLessons.includes(lessonId)) return current;
        return touchActivity({
          ...current,
          completedLessons: [...current.completedLessons, lessonId],
          xp: current.xp + 120,
          learnedMinutes: current.learnedMinutes + 20,
        });
      }),
    [touchActivity],
  );

  const completeReview = useCallback(
    (reviewId: string) =>
      setState((current) => {
        if (current.completedReviews.includes(reviewId)) return current;
        return touchActivity({
          ...current,
          completedReviews: [...current.completedReviews, reviewId],
          xp: current.xp + 25,
          learnedMinutes: current.learnedMinutes + 6,
        });
      }),
    [touchActivity],
  );

  const undoReview = useCallback(
    (reviewId: string) =>
      setState((current) => ({
        ...current,
        completedReviews: current.completedReviews.filter(
          (id) => id !== reviewId,
        ),
      })),
    [],
  );

  const saveAttempt = useCallback(
    (attempt: Omit<PracticeAttempt, "attemptedAt">) =>
      setState((current) => {
        const firstCorrect =
          attempt.correct &&
          !current.practiceAttempts.some(
            (item) => item.challengeId === attempt.challengeId && item.correct,
          );
        return touchActivity({
          ...current,
          xp: current.xp + (firstCorrect ? 60 : 0),
          learnedMinutes: current.learnedMinutes + 5,
          practiceAttempts: [
            ...current.practiceAttempts,
            { ...attempt, attemptedAt: new Date().toISOString() },
          ].slice(-100),
        });
      }),
    [touchActivity],
  );

  const addKnowledge = useCallback(
    (entry: Omit<KnowledgeEntry, "id" | "createdAt">) =>
      setState((current) =>
        touchActivity({
          ...current,
          knowledge: [
            { ...entry, id: newId(), createdAt: new Date().toISOString() },
            ...current.knowledge,
          ],
        }),
      ),
    [touchActivity],
  );

  const deleteKnowledge = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        knowledge: current.knowledge.filter((entry) => entry.id !== id),
      })),
    [],
  );

  const toggleProjectTask = useCallback(
    (projectId: string, taskId: string) =>
      setState((current) => {
        const tasks = current.projectTasks[projectId] ?? [];
        const complete = tasks.includes(taskId);
        return touchActivity({
          ...current,
          xp: current.xp + (complete ? 0 : 20),
          projectTasks: {
            ...current.projectTasks,
            [projectId]: complete
              ? tasks.filter((id) => id !== taskId)
              : [...tasks, taskId],
          },
        });
      }),
    [touchActivity],
  );

  const saveInterview = useCallback(
    (result: Omit<InterviewResult, "id" | "createdAt">) =>
      setState((current) =>
        touchActivity({
          ...current,
          xp: current.xp + Math.round(result.score / 4),
          learnedMinutes: current.learnedMinutes + 5,
          interviewResults: [
            ...current.interviewResults,
            { ...result, id: newId(), createdAt: new Date().toISOString() },
          ].slice(-50),
        }),
      ),
    [touchActivity],
  );

  const resetProgress = useCallback(() => setState(createInitialState()), []);

  const setLearningPosition = useCallback(
    (position: Partial<ForgeState["currentPosition"]>) =>
      setState((current) =>
        touchActivity({
          ...current,
          currentPosition: {
            ...current.currentPosition,
            ...position,
            updatedAt: new Date().toISOString(),
          },
        }),
      ),
    [touchActivity],
  );

  const metrics = useMemo(() => {
    const correct = state.practiceAttempts.filter(
      (item) => item.correct,
    ).length;
    const uniqueCorrect = new Set(
      state.practiceAttempts
        .filter((item) => item.correct)
        .map((item) => item.challengeId),
    ).size;
    const interviewAverage = state.interviewResults.length
      ? Math.round(
          state.interviewResults.reduce((sum, item) => sum + item.score, 0) /
            state.interviewResults.length,
        )
      : 0;
    const completedTasks = Object.values(state.projectTasks).reduce(
      (sum, tasks) => sum + tasks.length,
      0,
    );
    const mastery = Math.min(
      100,
      Math.round(
        (state.completedLessons.length * 5 +
          uniqueCorrect * 7 +
          state.completedReviews.length * 3 +
          completedTasks +
          interviewAverage * 0.25) /
          1.7,
      ),
    );
    const weeklyPercent = Math.min(
      100,
      Math.round((state.learnedMinutes / state.weeklyGoalMinutes) * 100),
    );
    const streak = (() => {
      const dates = new Set(state.activityDates);
      let count = 0;
      const cursor = new Date();
      while (dates.has(cursor.toISOString().slice(0, 10))) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    })();
    return {
      correct,
      uniqueCorrect,
      interviewAverage,
      completedTasks,
      mastery,
      weeklyPercent,
      streak,
    };
  }, [state]);

  return {
    state,
    metrics,
    completeLesson,
    completeReview,
    undoReview,
    saveAttempt,
    addKnowledge,
    deleteKnowledge,
    toggleProjectTask,
    saveInterview,
    setLearningPosition,
    resetProgress,
  };
}

export { LEGACY_STORAGE_KEY };

export type ForgeStore = ReturnType<typeof useForgeStore>;
