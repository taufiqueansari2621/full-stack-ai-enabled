import { useCallback, useEffect, useMemo, useState } from "react";
import {
  evidenceProgress,
  masteryEvidence,
  masteryState,
} from "./domain/mastery";

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
  updatedAt?: string;
  tags?: string[];
  topicLink?: string;
  projectLink?: string;
  favorite?: boolean;
};

export type InterviewResult = {
  id: string;
  questionId?: string;
  question: string;
  topic?: string;
  phase?: string;
  difficulty?: string;
  format?: string;
  answer: string;
  score: number;
  feedback: string[];
  strengths?: string[];
  createdAt: string;
};

export type QuizResult = {
  id: string;
  quizId: string;
  score: number;
  correct: number;
  total: number;
  weakTopics: string[];
  completedAt: string;
};

export type CertificateRecord = {
  id: string;
  certificateId: string;
  credentialId: string;
  issuedAt: string;
  score: number;
};

export type MasteryArtifact = {
  id: string;
  lessonId: string;
  level: "foundation" | "guided" | "applied" | "debug" | "professional";
  response: string;
  updatedAt: string;
};

export type TopicPracticeArtifact = {
  id: string;
  lessonId: string;
  difficulty: "easy" | "medium" | "hard";
  response: string;
  updatedAt: string;
};

export type ExampleLabRecord = {
  id: string;
  lessonId: string;
  caseId: string;
  prediction: string;
  reflection: string;
  updatedAt: string;
};

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ReviewRecord = {
  id: string;
  topic: string;
  kind: "flashcard" | "coding" | "concept" | "debugging" | "interview";
  sourceId: string;
  nextReviewAt: string;
  intervalDays: number;
  streak: number;
  lastRating: ReviewRating | null;
  updatedAt: string;
};

export type LabArtifact = {
  id: string;
  lab: "dsa" | "system-design" | "sql" | "rag";
  exerciseId: string;
  evidence: string;
  updatedAt: string;
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
  quizResults: QuizResult[];
  certificates: CertificateRecord[];
  masteryArtifacts: MasteryArtifact[];
  topicPracticeArtifacts: TopicPracticeArtifact[];
  exampleLabRecords: ExampleLabRecord[];
  reviewSchedule: ReviewRecord[];
  labArtifacts: LabArtifact[];
  frontendFrameworkPath: "react" | "angular" | "both" | null;
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

function queueReview(
  records: ReviewRecord[],
  item: Pick<ReviewRecord, "topic" | "kind" | "sourceId">,
) {
  const now = new Date().toISOString();
  const existing = records.find((record) => record.sourceId === item.sourceId);
  const next: ReviewRecord = existing
    ? { ...existing, ...item, nextReviewAt: now, updatedAt: now }
    : {
        ...item,
        id: newId(),
        nextReviewAt: now,
        intervalDays: 0,
        streak: 0,
        lastRating: null,
        updatedAt: now,
      };
  return [
    ...records.filter((record) => record.sourceId !== item.sourceId),
    next,
  ].slice(-500);
}

const createInitialState = (): ForgeState => ({
  version: 1,
  xp: 0,
  completedLessons: [],
  completedReviews: [],
  practiceAttempts: [],
  knowledge: [],
  projectTasks: {},
  interviewResults: [],
  quizResults: [],
  certificates: [],
  masteryArtifacts: [],
  topicPracticeArtifacts: [],
  exampleLabRecords: [],
  reviewSchedule: [],
  labArtifacts: [],
  frontendFrameworkPath: null,
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
      quizResults: Array.isArray(candidate.quizResults)
        ? candidate.quizResults
        : [],
      certificates: Array.isArray(candidate.certificates)
        ? candidate.certificates
        : [],
      masteryArtifacts: Array.isArray(candidate.masteryArtifacts)
        ? candidate.masteryArtifacts
        : [],
      topicPracticeArtifacts: Array.isArray(candidate.topicPracticeArtifacts)
        ? candidate.topicPracticeArtifacts
        : [],
      exampleLabRecords: Array.isArray(candidate.exampleLabRecords)
        ? candidate.exampleLabRecords
        : [],
      reviewSchedule: Array.isArray(candidate.reviewSchedule)
        ? candidate.reviewSchedule
        : [],
      labArtifacts: Array.isArray(candidate.labArtifacts)
        ? candidate.labArtifacts
        : [],
      frontendFrameworkPath:
        candidate.frontendFrameworkPath === "react" ||
        candidate.frontendFrameworkPath === "angular" ||
        candidate.frontendFrameworkPath === "both"
          ? candidate.frontendFrameworkPath
          : null,
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
        const reviewSchedule = attempt.correct
          ? current.reviewSchedule
          : queueReview(current.reviewSchedule, {
              topic: attempt.challengeId,
              kind: "coding",
              sourceId: `practice:${attempt.challengeId}`,
            });
        return touchActivity({
          ...current,
          xp: current.xp + (firstCorrect ? 60 : 0),
          learnedMinutes: current.learnedMinutes + 5,
          practiceAttempts: [
            ...current.practiceAttempts,
            { ...attempt, attemptedAt: new Date().toISOString() },
          ].slice(-100),
          reviewSchedule,
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

  const updateKnowledge = useCallback(
    (id: string, changes: Partial<Omit<KnowledgeEntry, "id" | "createdAt">>) =>
      setState((current) =>
        touchActivity({
          ...current,
          knowledge: current.knowledge.map((entry) =>
            entry.id === id
              ? { ...entry, ...changes, updatedAt: new Date().toISOString() }
              : entry,
          ),
        }),
      ),
    [touchActivity],
  );

  const addKnowledgeToReview = useCallback(
    (id: string, kind: "flashcard" | "concept" = "concept") =>
      setState((current) => {
        const entry = current.knowledge.find((item) => item.id === id);
        if (!entry) return current;
        return touchActivity({
          ...current,
          reviewSchedule: queueReview(current.reviewSchedule, {
            topic: entry.title,
            kind,
            sourceId: `knowledge:${kind}:${entry.id}`,
          }),
        });
      }),
    [touchActivity],
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
      setState((current) => {
        const saved = {
          ...result,
          id: newId(),
          createdAt: new Date().toISOString(),
        };
        const reviewSchedule =
          result.score < 70
            ? queueReview(current.reviewSchedule, {
                topic: result.topic ?? result.question,
                kind: "interview",
                sourceId: `interview:${result.questionId ?? result.question}`,
              })
            : current.reviewSchedule;
        return touchActivity({
          ...current,
          xp: current.xp + Math.round(result.score / 4),
          learnedMinutes: current.learnedMinutes + 5,
          interviewResults: [...current.interviewResults, saved].slice(-500),
          reviewSchedule,
        });
      }),
    [touchActivity],
  );

  const saveQuiz = useCallback(
    (result: Omit<QuizResult, "id" | "completedAt">) =>
      setState((current) => {
        const reviewSchedule = result.weakTopics.reduce(
          (records, topic) =>
            queueReview(records, {
              topic,
              kind: "concept",
              sourceId: `quiz:${result.quizId}:${topic}`,
            }),
          current.reviewSchedule,
        );
        return touchActivity({
          ...current,
          xp: current.xp + (result.score >= 80 ? 150 : 25),
          learnedMinutes: current.learnedMinutes + 15,
          quizResults: [
            ...current.quizResults,
            { ...result, id: newId(), completedAt: new Date().toISOString() },
          ].slice(-50),
          reviewSchedule,
        });
      }),
    [touchActivity],
  );

  const earnCertificate = useCallback(
    (record: Omit<CertificateRecord, "id" | "issuedAt">) =>
      setState((current) => {
        if (
          current.certificates.some(
            (item) => item.certificateId === record.certificateId,
          )
        )
          return current;
        return touchActivity({
          ...current,
          xp: current.xp + 300,
          certificates: [
            ...current.certificates,
            { ...record, id: newId(), issuedAt: new Date().toISOString() },
          ],
        });
      }),
    [touchActivity],
  );

  const saveMasteryArtifact = useCallback(
    (artifact: Omit<MasteryArtifact, "id" | "updatedAt">) =>
      setState((current) => {
        const existing = current.masteryArtifacts.find(
          (item) =>
            item.lessonId === artifact.lessonId &&
            item.level === artifact.level,
        );
        const nextArtifact: MasteryArtifact = {
          ...artifact,
          id: existing?.id ?? newId(),
          updatedAt: new Date().toISOString(),
        };
        return touchActivity({
          ...current,
          xp: current.xp + (existing ? 0 : 20),
          learnedMinutes: current.learnedMinutes + (existing ? 2 : 8),
          masteryArtifacts: [
            ...current.masteryArtifacts.filter(
              (item) =>
                item.lessonId !== artifact.lessonId ||
                item.level !== artifact.level,
            ),
            nextArtifact,
          ].slice(-500),
        });
      }),
    [touchActivity],
  );

  const rateReview = useCallback(
    (id: string, rating: ReviewRating) =>
      setState((current) => {
        const now = new Date();
        const multipliers: Record<ReviewRating, number> = {
          again: 0,
          hard: 1,
          good: 2,
          easy: 4,
        };
        return touchActivity({
          ...current,
          xp: current.xp + (rating === "again" ? 0 : 15),
          learnedMinutes: current.learnedMinutes + 4,
          reviewSchedule: current.reviewSchedule.map((record) => {
            if (record.id !== id) return record;
            const intervalDays =
              rating === "again"
                ? 0
                : Math.max(1, (record.intervalDays || 1) * multipliers[rating]);
            const next = new Date(now);
            if (rating === "again") next.setMinutes(next.getMinutes() + 10);
            else next.setDate(next.getDate() + intervalDays);
            return {
              ...record,
              intervalDays,
              streak: rating === "again" ? 0 : record.streak + 1,
              lastRating: rating,
              nextReviewAt: next.toISOString(),
              updatedAt: now.toISOString(),
            };
          }),
        });
      }),
    [touchActivity],
  );

  const saveLabArtifact = useCallback(
    (artifact: Omit<LabArtifact, "id" | "updatedAt">) =>
      setState((current) => {
        const existing = current.labArtifacts.find(
          (item) =>
            item.lab === artifact.lab &&
            item.exerciseId === artifact.exerciseId,
        );
        return touchActivity({
          ...current,
          xp: current.xp + (existing ? 0 : 40),
          learnedMinutes: current.learnedMinutes + (existing ? 3 : 12),
          labArtifacts: [
            ...current.labArtifacts.filter(
              (item) =>
                item.lab !== artifact.lab ||
                item.exerciseId !== artifact.exerciseId,
            ),
            {
              ...artifact,
              id: existing?.id ?? newId(),
              updatedAt: new Date().toISOString(),
            },
          ].slice(-200),
        });
      }),
    [touchActivity],
  );

  const saveTopicPracticeArtifact = useCallback(
    (artifact: Omit<TopicPracticeArtifact, "id" | "updatedAt">) =>
      setState((current) => {
        const existing = current.topicPracticeArtifacts.find(
          (item) =>
            item.lessonId === artifact.lessonId &&
            item.difficulty === artifact.difficulty,
        );
        const nextArtifact: TopicPracticeArtifact = {
          ...artifact,
          id: existing?.id ?? newId(),
          updatedAt: new Date().toISOString(),
        };
        return touchActivity({
          ...current,
          xp: current.xp + (existing ? 0 : 15),
          learnedMinutes: current.learnedMinutes + (existing ? 2 : 10),
          topicPracticeArtifacts: [
            ...current.topicPracticeArtifacts.filter(
              (item) =>
                item.lessonId !== artifact.lessonId ||
                item.difficulty !== artifact.difficulty,
            ),
            nextArtifact,
          ].slice(-2052),
        });
      }),
    [touchActivity],
  );

  const saveExampleLabRecord = useCallback(
    (record: Omit<ExampleLabRecord, "id" | "updatedAt">) =>
      setState((current) => {
        const existing = current.exampleLabRecords.find(
          (item) =>
            item.lessonId === record.lessonId && item.caseId === record.caseId,
        );
        const nextRecord: ExampleLabRecord = {
          ...record,
          id: existing?.id ?? newId(),
          updatedAt: new Date().toISOString(),
        };
        return touchActivity({
          ...current,
          xp: current.xp + (existing ? 0 : 10),
          learnedMinutes: current.learnedMinutes + (existing ? 1 : 4),
          exampleLabRecords: [
            ...current.exampleLabRecords.filter(
              (item) =>
                item.lessonId !== record.lessonId ||
                item.caseId !== record.caseId,
            ),
            nextRecord,
          ].slice(-2052),
        });
      }),
    [touchActivity],
  );

  const setFrontendFrameworkPath = useCallback(
    (path: "react" | "angular" | "both") =>
      setState((current) =>
        touchActivity({
          ...current,
          frontendFrameworkPath: path,
        }),
      ),
    [touchActivity],
  );

  const resetProgress = useCallback(() => setState(createInitialState()), []);

  const replaceState = useCallback((nextState: ForgeState) => {
    if (nextState.version === 1)
      setState({
        ...createInitialState(),
        ...nextState,
        reviewSchedule: Array.isArray(nextState.reviewSchedule)
          ? nextState.reviewSchedule
          : [],
        labArtifacts: Array.isArray(nextState.labArtifacts)
          ? nextState.labArtifacts
          : [],
      });
  }, []);

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
    const evidence = masteryEvidence(state);
    const mastery = evidenceProgress(evidence);
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
      masteryState: masteryState(evidence),
      masteryEvidence: evidence,
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
    updateKnowledge,
    addKnowledgeToReview,
    toggleProjectTask,
    saveInterview,
    saveQuiz,
    earnCertificate,
    saveMasteryArtifact,
    rateReview,
    saveLabArtifact,
    saveTopicPracticeArtifact,
    saveExampleLabRecord,
    setFrontendFrameworkPath,
    setLearningPosition,
    resetProgress,
    replaceState,
  };
}

export { LEGACY_STORAGE_KEY };

export type ForgeStore = ReturnType<typeof useForgeStore>;
