import { describe, expect, it } from "vitest";
import {
  challengeDefinitions,
  challengeLifecycle,
} from "../src/domain/challengeSystem";

describe("challenge system", () => {
  it("includes the complete authored challenge contract", () => {
    expect(challengeDefinitions.index).toBeDefined();
    for (const challenge of Object.values(challengeDefinitions)) {
      expect(challenge.difficulty).toBeTruthy();
      expect(challenge.skills.length).toBeGreaterThan(0);
      expect(challenge.prerequisites.length).toBeGreaterThan(0);
      expect(challenge.expectedBehavior).toBeTruthy();
      expect(challenge.visibleTests.length).toBeGreaterThan(0);
      expect(challenge.constraints.length).toBeGreaterThan(0);
      expect(challenge.relatedLessons.length).toBeGreaterThan(0);
      expect(challenge.projectRelevance).toBeTruthy();
      expect(challenge.interviewRelevance).toBeTruthy();
    }
  });

  it("derives the complete evidence lifecycle", () => {
    expect(challengeLifecycle([])).toBe("Not Started");
    expect(challengeLifecycle([], { attempted: true })).toBe("Attempted");
    expect(challengeLifecycle([{ correct: false }])).toBe("Tests Failing");
    expect(challengeLifecycle([{ correct: true }])).toBe("Tests Passing");
    const evidence = {
      explanation:
        "The synchronous stack finishes before queued callbacks, then microtasks run before timers.",
    };
    expect(challengeLifecycle([{ correct: true }], evidence)).toBe("Explained");
    expect(
      challengeLifecycle([{ correct: true }, { correct: true }], evidence),
    ).toBe("Explained");
    expect(
      challengeLifecycle([{ correct: true }, { correct: false }], evidence),
    ).toBe("Tests Failing");
    expect(
      challengeLifecycle([{ correct: true }], {
        ...evidence,
        retained: true,
        applied: true,
      }),
    ).toBe("Mastered");
  });
});
