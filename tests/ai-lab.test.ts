import { describe, expect, it, vi, afterEach } from "vitest";
import { aiLabExercises } from "../src/domain/aiLab";
import {
  chunkSource,
  cosine,
  executeLabTool,
  lexicalEvaluation,
  labSource,
} from "../src/domain/aiExperiments";
import { runAiExperiment } from "../src/services/aiExperiments";
import { forgeApi } from "../src/services/forgeApi";
import {
  validateEmbeddingInput,
  validateEmbeddingOutput,
} from "../worker/routes/embeddings";

afterEach(() => vi.restoreAllMocks());
describe("real AI experiments", () => {
  it("keeps all nine lab modes", () => {
    expect(aiLabExercises).toHaveLength(9);
  });
  it("chunks actual input and enforces size", () => {
    const input = "words ".repeat(120);
    const chunks = chunkSource(input, 300);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 300)).toBe(true);
    expect(chunks.join(" ").replace(/\s+/g, " ").trim()).toBe(input.trim());
    expect(() => chunkSource("x".repeat(4801))).toThrow();
  });
  it("uses real cosine and explicit lexical metrics", () => {
    expect(cosine([1, 0], [1, 0])).toBe(1);
    expect(cosine([1, 0], [0, 1])).toBe(0);
    expect(() => cosine([1], [1, 2])).toThrow();
    expect(lexicalEvaluation("cats sleep", "cats sleep").f1).toBe(1);
    expect(lexicalEvaluation("cats sleep", "dogs bark").f1).toBe(0);
  });
  it("validates tool calls and searches only supplied source", () => {
    expect(
      executeLabTool(
        '{"tool":"search_source","arguments":{"query":"reviews","limit":1}}',
        labSource,
      ),
    ).toHaveLength(1);
    expect(
      executeLabTool(
        '{"tool":"search_source","arguments":{"query":"unrelated","limit":1}}',
        labSource,
      ),
    ).toHaveLength(0);
    expect(() =>
      executeLabTool('{"tool":"delete_all","arguments":{}}', labSource),
    ).toThrow();
    expect(() =>
      executeLabTool(
        '{"tool":"search_source","arguments":{"query":"reviews","limit":100}}',
        labSource,
      ),
    ).toThrow();
  });
  it("validates provider input/output before exposing vectors", () => {
    expect(validateEmbeddingInput(["hello"])).toEqual(["hello"]);
    expect(() => validateEmbeddingInput(Array(18).fill("hello"))).toThrow();
    expect(() => validateEmbeddingOutput({ data: [[NaN]] }, 1)).toThrow();
    expect(
      validateEmbeddingOutput({ data: [Array(384).fill(0.1)] }, 1),
    ).toHaveLength(1);
  });
  it("computes local results without calling a provider", async () => {
    const mock = vi.spyOn(forgeApi, "embedTexts");
    const result = await runAiExperiment(
      aiLabExercises[2],
      "First source. Second source.",
      labSource,
      2,
      300,
      new AbortController().signal,
    );
    expect(result.output).toContain("First source");
    expect(result.modelCostUsd).toBe(0);
    expect(result.evaluationScore).toBeNull();
    expect(mock).not.toHaveBeenCalled();
  });
  it("uses provider vectors to rank and real generation for RAG", async () => {
    vi.spyOn(forgeApi, "embedTexts").mockResolvedValue({
      vectors: [
        [1, 0],
        [1, 0],
      ],
      model: "test-embedding",
      latencyMs: 1,
    });
    const generate = vi
      .spyOn(forgeApi, "askAi")
      .mockResolvedValue({
        response: "Answer from source [1]",
        model: "test-model",
        provider: "test",
        conversationId: "test",
        contextIncluded: ["note"],
        actions: [],
      });
    const result = await runAiExperiment(
      aiLabExercises[5],
      "How does Forge teach?",
      labSource,
      2,
      300,
      new AbortController().signal,
    );
    expect(result.output).toContain("Answer from source [1]");
    expect(result.retrievalQuality).toBe(1);
    expect(result.modelCostUsd).toBeNull();
    expect(generate.mock.calls[0][0].context.note).toContain("[1]");
  });
});
