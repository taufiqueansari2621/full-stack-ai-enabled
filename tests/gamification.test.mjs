import test from "node:test";
import assert from "node:assert/strict";
import {
  badgesForState,
  buildGamification,
  evidenceXp,
  levelForXp,
} from "../src/domain/gamification.ts";

const state = (changes = {}) => ({
  version: 1,
  xp: 999_999,
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
    module: "Basics",
    lesson: "Computers",
    section: "Start",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  ...changes,
});

test("derived XP ignores a mutable legacy aggregate and repeated solves", () => {
  const learner = state({
    practiceAttempts: [
      {
        challengeId: "event-loop",
        correct: true,
        answer: "A",
        attemptedAt: "2026-09-24T00:00:00.000Z",
      },
      {
        challengeId: "event-loop",
        correct: true,
        answer: "A",
        attemptedAt: "2026-09-24T00:01:00.000Z",
      },
    ],
  });
  assert.equal(evidenceXp(learner), 60);
});

test("debugger badge requires failure followed by a correct solution", () => {
  const learner = state({
    practiceAttempts: [
      {
        challengeId: "closure",
        correct: false,
        answer: "wrong",
        attemptedAt: "2026-09-24T00:00:00.000Z",
      },
      {
        challengeId: "closure",
        correct: true,
        answer: "correct",
        attemptedAt: "2026-09-24T00:01:00.000Z",
      },
    ],
  });
  const badges = badgesForState(learner);
  assert.equal(
    badges.find((badge) => badge.id === "first-solve")?.unlocked,
    true,
  );
  assert.equal(badges.find((badge) => badge.id === "debugger")?.unlocked, true);
});

test("project steps from different projects remain distinct evidence", () => {
  const learner = state({
    projectTasks: { p1: ["design"], p2: ["design"] },
  });
  assert.equal(evidenceXp(learner), 40);
});

test("level boundaries and next milestone are deterministic", () => {
  assert.deepEqual(
    { number: levelForXp(499).number, name: levelForXp(499).name },
    { number: 1, name: "Apprentice" },
  );
  assert.deepEqual(
    { number: levelForXp(500).number, name: levelForXp(500).name },
    { number: 2, name: "Builder" },
  );
  const result = buildGamification(state());
  assert.equal(result.nextMilestone, "Solve a practice challenge correctly.");
  assert.equal(result.unlockedBadges, 0);
});
