import { describe, expect, it } from "vitest";
import { dynamicFeatureStateMatrix } from "../src/domain/dynamicFeatureStates";

describe("dynamic feature state coverage", () => {
  it("keeps every state decision explicit and evidence-backed", () => {
    const ids = new Set<string>();
    expect(dynamicFeatureStateMatrix.length).toBeGreaterThanOrEqual(9);

    for (const feature of dynamicFeatureStateMatrix) {
      expect(ids.has(feature.id)).toBe(false);
      ids.add(feature.id);
      for (const state of ["loading", "empty", "error", "retry", "offline"] as const) {
        expect(feature[state].mode.length).toBeGreaterThan(0);
        expect(feature[state].evidence.length).toBeGreaterThan(12);
      }
    }
  });

  it("never leaves a remote feature without visible failure and retry states", () => {
    for (const id of [
      "account",
      "onboarding",
      "progress-sync",
      "workspace",
      "portfolio",
      "certificates",
    ]) {
      const feature = dynamicFeatureStateMatrix.find((item) => item.id === id);
      expect(feature?.error.mode).toBe("visible");
      expect(feature?.retry.mode).toBe("visible");
      expect(feature?.offline.mode).toBe("visible");
    }
  });
});
