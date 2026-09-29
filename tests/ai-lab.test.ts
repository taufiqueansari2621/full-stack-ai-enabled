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
import { parseLabPlan, parseLabEvaluation } from "../src/domain/aiLabProtocol";
import {
  validateLabRequest,
  validateLabModelOutput,
  aiLabRoutes,
} from "../worker/routes/aiLab";
import {
  validateEmbeddingInput,
  validateEmbeddingOutput,
} from "../worker/routes/embeddings";

afterEach(() => vi.restoreAllMocks());
describe("real AI experiments", () => {
  it("rejects unsafe planner actions and invalid requests", () => {
    expect(() =>
      parseLabPlan({ action: "execute", query: "rm", limit: 1, reason: "bad" }),
    ).toThrow();
    expect(() =>
      parseLabPlan({
        action: "search",
        query: "reviews",
        limit: 99,
        reason: "bad",
      }),
    ).toThrow();
    expect(
      parseLabPlan({ action: "stop", reason: "No authorized tool." }).action,
    ).toBe("stop");
    expect(() =>
      validateLabRequest({
        action: "shell",
        input: "hello",
        source: labSource,
      }),
    ).toThrow();
    expect(() =>
      validateLabRequest({
        action: "plan",
        input: "x".repeat(4001),
        source: labSource,
      }),
    ).toThrow();
    expect(aiLabRoutes[0].auth).toBe(true);
    expect(() =>
      validateLabModelOutput({ response: "not json" }, "plan", labSource),
    ).toThrow();
  });
  it("does not credit invented supporting quotes", () => {
    const evaluation = parseLabEvaluation(
      {
        claims: [
          {
            claim: "Practice creates evidence",
            verdict: "supported",
            quote: "Deliberate practice creates evidence of understanding.",
            reason: "Direct statement",
          },
          {
            claim: "Guaranteed mastery",
            verdict: "supported",
            quote: "Guaranteed mastery",
            reason: "Invented quote",
          },
        ],
      },
      labSource,
    );
    expect(evaluation.supportedPercent).toBe(50);
    expect(evaluation.claims[1].quoteVerified).toBe(false);
    expect(() => parseLabEvaluation({ claims: [] }, labSource)).toThrow();
  });
  it("stops a model workflow without running unauthorized tools or generating", async () => {
    const infer = vi.spyOn(forgeApi, "labInference").mockResolvedValue({
      plan: {
        action: "stop",
        query: "",
        limit: 1,
        reason: "No network or writes allowed",
      },
      model: "test",
      latencyMs: 1,
    });
    const result = await runAiExperiment(
      aiLabExercises[7],
      "Delete account records now",
      labSource,
      2,
      300,
      new AbortController().signal,
    );
    expect(infer).toHaveBeenCalledTimes(1);
    expect(result.output).toContain('"toolsExecuted": 0');
  });
  it("searches model-selected terms and abstains on empty evidence", async () => {
    const infer = vi.spyOn(forgeApi, "labInference").mockResolvedValue({
      plan: {
        action: "search",
        query: "unrelated-zebra",
        limit: 1,
        reason: "Search entered source",
      },
      model: "test",
      latencyMs: 1,
    });
    const result = await runAiExperiment(
      aiLabExercises[7],
      "Find zebra behavior",
      labSource,
      2,
      300,
      new AbortController().signal,
    );
    expect(result.output).toContain("No source evidence found");
    expect(infer).toHaveBeenCalledTimes(1);
  });
  it("does not continue a workflow after cancellation", async () => {
    const controller = new AbortController();
    const infer = vi
      .spyOn(forgeApi, "labInference")
      .mockImplementation(async () => {
        controller.abort();
        return {
          plan: {
            action: "search",
            query: "reviews",
            limit: 1,
            reason: "search",
          },
          model: "test",
          latencyMs: 1,
        };
      });
    await expect(
      runAiExperiment(
        aiLabExercises[7],
        "Find how reviews help",
        labSource,
        2,
        300,
        controller.signal,
      ),
    ).rejects.toThrow();
    expect(infer).toHaveBeenCalledTimes(1);
  });
  it("keeps all nine lab modes", () => {
    expect(aiLabExercises).toHaveLength(9);
  });
  it("preserves explicit tool and lexical baselines without model calls", async () => {
    const inference = vi.spyOn(forgeApi, "labInference");
    const controller = new AbortController();
    const tool = await runAiExperiment(
      aiLabExercises[6],
      '{"tool":"search_source","arguments":{"query":"reviews","limit":1}}',
      labSource,
      2,
      300,
      controller.signal,
      true,
    );
    const evaluation = await runAiExperiment(
      aiLabExercises[8],
      "Reviews strengthen recall",
      labSource,
      2,
      300,
      controller.signal,
      true,
    );
    expect(tool.modelCostUsd).toBe(0);
    expect(evaluation.output).toContain('"f1"');
    expect(evaluation.evaluationScore).toBeNull();
    expect(inference).not.toHaveBeenCalled();
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
      .spyOn(forgeApi, "labInference")
      .mockResolvedValueOnce({
        answer: "Answer from source [1]",
        model: "test-model",
        latencyMs: 1,
      })
      .mockResolvedValueOnce({
        evaluation: parseLabEvaluation(
          {
            claims: [
              {
                claim: "Answer",
                verdict: "unsupported",
                quote: "",
                reason: "Not established",
              },
            ],
          },
          labSource,
        ),
        model: "test-model",
        latencyMs: 1,
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
    expect(generate.mock.calls[0][2]).toContain("[1]");
    expect(generate.mock.calls[1][0]).toBe("evaluate");
    expect(result.output).toContain("Claim review:");
  });
});
