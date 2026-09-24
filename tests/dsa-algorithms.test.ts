import { describe, expect, it } from "vitest";
import { dsaAlgorithms } from "../src/domain/dsaAlgorithms";

describe("DSA visualizer catalog", () => {
  it("covers every structure and algorithm required by the product brief", () => {
    expect(Object.keys(dsaAlgorithms)).toEqual([
      "arrays",
      "linked-list",
      "stack",
      "queue",
      "hash-map",
      "tree",
      "graph",
      "sorting",
      "binary-search",
      "recursion",
      "bfs",
      "dfs",
      "dynamic-programming",
    ]);
  });

  it("keeps every trace explainable at each step", () => {
    for (const algorithm of Object.values(dsaAlgorithms)) {
      expect(algorithm.steps.length).toBeGreaterThanOrEqual(4);
      expect(algorithm.time).toMatch(/O\(/);
      expect(algorithm.space).toMatch(/O\(/);
      for (const step of algorithm.steps) {
        expect(step.state.length).toBeGreaterThan(0);
        expect(step.operation.length).toBeGreaterThan(0);
        expect(step.variables.length).toBeGreaterThan(0);
        expect(step.callStack.length).toBeGreaterThan(0);
      }
    }
  });
});
