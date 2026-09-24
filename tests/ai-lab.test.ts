import { describe, expect, it } from "vitest";
import { aiLabExercises, runAiLab } from "../src/domain/aiLab";

describe("AI engineering labs", () => {
  it("covers every lab example in the Forge brief", () => {
    expect(aiLabExercises.map((item) => item.title)).toEqual([
      "Prompt Lab",
      "Embedding Explorer",
      "Chunking Lab",
      "Semantic Search",
      "Vector Retrieval",
      "RAG Pipeline",
      "Tool Calling",
      "Agent Workflow",
      "Evaluation Lab",
    ]);
  });

  it("returns all inspectable engineering metrics", () => {
    const result = runAiLab(aiLabExercises[5], aiLabExercises[5].defaultInput);
    expect(result).not.toHaveProperty("error");
    expect(result).toMatchObject({ retrievalQuality: 92, evaluationScore: 94 });
    if (!("error" in result)) {
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.tokenUsage).toBeGreaterThan(0);
      expect(result.contextSize).toBeGreaterThan(0);
      expect(result.modelCostUsd).toBeGreaterThan(0);
    }
  });

  it("rejects input too small to teach from", () => {
    expect(runAiLab(aiLabExercises[0], "short")).toEqual({
      error: "Add at least 12 characters so the experiment has meaningful input.",
    });
  });
});
