export type ChallengeLifecycle =
  | "Not Started"
  | "Attempted"
  | "Tests Failing"
  | "Tests Passing"
  | "Explained"
  | "Mastered";

export type ChallengeDefinition = {
  difficulty: "Easy" | "Medium" | "Hard";
  skills: string[];
  prerequisites: string[];
  starterFiles: string[];
  expectedBehavior: string;
  visibleTests: string[];
  hiddenTests: string[];
  constraints: string[];
  relatedLessons: string[];
  projectRelevance: string;
  interviewRelevance: string;
};

export const challengeDefinitions: Record<string, ChallengeDefinition> = {
  "event-order": {
    difficulty: "Medium",
    skills: ["Event loop", "Async JavaScript"],
    prerequisites: ["Call stack", "Promises"],
    starterFiles: ["src/index.js"],
    expectedBehavior: "Predict A → D → C → B and explain queue priority.",
    visibleTests: [
      "Synchronous logs retain source order",
      "Microtask runs before timer",
    ],
    hiddenTests: ["Explanation names both microtask and task queues"],
    constraints: ["Predict before executing", "Do not reorder source code"],
    relatedLessons: ["JavaScript · Event loop"],
    projectRelevance: "Prevents stale UI and async race bugs.",
    interviewRelevance: "Common JavaScript runtime reasoning question.",
  },
  closure: {
    difficulty: "Easy",
    skills: ["Closures", "Scope"],
    prerequisites: ["Functions", "Lexical scope"],
    starterFiles: [],
    expectedBehavior: "Identify retained lexical access precisely.",
    visibleTests: ["Answer distinguishes closure from callback"],
    hiddenTests: [],
    constraints: ["Choose the most precise definition"],
    relatedLessons: ["JavaScript · Closures"],
    projectRelevance: "Supports factories, encapsulation, and event handlers.",
    interviewRelevance: "Tests the lexical environment mental model.",
  },
  mutation: {
    difficulty: "Medium",
    skills: ["React state", "Immutability"],
    prerequisites: ["Arrays", "React state updates"],
    starterFiles: ["src/App.jsx"],
    expectedBehavior: "Create a new array and pass it to the setter.",
    visibleTests: [
      "Previous state reference remains unchanged",
      "New item is rendered",
    ],
    hiddenTests: ["Multiple additions preserve all items"],
    constraints: ["Do not mutate the existing array"],
    relatedLessons: ["React · State updates"],
    projectRelevance: "Makes UI updates predictable and debuggable.",
    interviewRelevance: "Demonstrates React rendering and reference semantics.",
  },
  index: {
    difficulty: "Medium",
    skills: ["SQL", "Composite indexes"],
    prerequisites: ["WHERE", "ORDER BY"],
    starterFiles: [],
    expectedBehavior:
      "Choose tenant_id, status, created_at DESC in that order.",
    visibleTests: [
      "Equality predicates lead the index",
      "The ordering column follows the equality prefix",
    ],
    hiddenTests: [],
    constraints: ["Choose one composite index for the supplied query"],
    relatedLessons: ["Databases · Indexes"],
    projectRelevance: "Supports efficient tenant-scoped queries.",
    interviewRelevance:
      "Explain the read, write, and storage trade-offs of indexing.",
  },
};

export function challengeLifecycle(
  attempts: { correct: boolean }[],
  evidence: {
    attempted?: boolean;
    explanation?: string;
    retained?: boolean;
    applied?: boolean;
  } = {},
): ChallengeLifecycle {
  if (!attempts.length) return evidence.attempted ? "Attempted" : "Not Started";
  // The latest result matters: a regression cannot remain marked as passing.
  if (!attempts.at(-1)?.correct) return "Tests Failing";
  const explained = (evidence.explanation?.trim().length ?? 0) >= 40;
  if (explained && evidence.retained && evidence.applied) return "Mastered";
  return explained ? "Explained" : "Tests Passing";
}
