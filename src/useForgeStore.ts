import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "forge-learning-state-v1";

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
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialState: ForgeState = {
  version: 1,
  xp: 2840,
  completedLessons: ["js-execution-context", "js-browser-runtime"],
  completedReviews: [],
  practiceAttempts: [],
  knowledge: [
    {
      id: "welcome-note",
      kind: "note",
      title: "Event loop mental model",
      body: "The call stack runs synchronous work. Microtasks drain before the next task.",
      topic: "JavaScript",
      createdAt: new Date().toISOString(),
    },
  ],
  projectTasks: {
    p05: [
      "p05-1",
      "p05-2",
      "p05-3",
      "p05-4",
      "p05-5",
      "p05-6",
      "p05-7",
      "p05-8",
    ],
  },
  interviewResults: [],
  activityDates: [todayKey()],
  weeklyGoalMinutes: 450,
  learnedMinutes: 324,
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function loadState(): ForgeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

export function useForgeStore() {
  const [state, setState] = useState<ForgeState>(loadState);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  const resetProgress = useCallback(
    () => setState({ ...initialState, activityDates: [todayKey()] }),
    [],
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
    return {
      correct,
      uniqueCorrect,
      interviewAverage,
      completedTasks,
      mastery,
      weeklyPercent,
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
    resetProgress,
  };
}

export type ForgeStore = ReturnType<typeof useForgeStore>;
