import type { AiLabExercise } from "../domain/aiLab";
import {
  chunkSource,
  cosine,
  executeLabTool,
  lexicalEvaluation,
} from "../domain/aiExperiments";
import { forgeApi } from "./forgeApi";

export type AiLabResult = {
  output: string;
  latencyMs: number;
  tokenUsage: number;
  retrievalQuality: number | null;
  contextSize: number;
  modelCostUsd: number | null;
  evaluationScore: number | null;
  method: string;
};
export const needsModel = (id: string, localOnly = false) =>
  id !== "chunking" &&
  !(localOnly && ["tool-calling", "evaluation"].includes(id));

export async function runAiExperiment(
  exercise: AiLabExercise,
  input: string,
  source: string,
  topK: number,
  chunkSize: number,
  signal: AbortSignal,
  localOnly = false,
): Promise<AiLabResult> {
  signal.throwIfAborted();
  if (!source.trim() || source.length > 4800)
    throw new Error("Source must contain 1–4,800 characters.");
  if (input.trim().length < 12 || input.length > 800)
    throw new Error("Input must contain 12–800 characters.");
  if (!Number.isInteger(topK) || topK < 1 || topK > 5)
    throw new Error("Top-k must be 1–5.");
  const start = performance.now();
  let output: string,
    method: string,
    similarity: number | null = null,
    score: number | null = null;
  let context = source;
  if (exercise.id === "chunking") {
    const chunks = chunkSource(input, chunkSize);
    output = JSON.stringify(
      chunks.map((text, index) => ({
        id: index + 1,
        characters: text.length,
        text,
      })),
      null,
      2,
    );
    method = "Local bounded text chunking";
    context = input;
  } else if (localOnly && exercise.id === "tool-calling") {
    output = JSON.stringify(executeLabTool(input, source), null, 2);
    method =
      "Local explicit JSON search_source call; no model selection or cloud request.";
  } else if (localOnly && exercise.id === "evaluation") {
    output = JSON.stringify(lexicalEvaluation(input, source), null, 2);
    method =
      "Local lexical precision/recall/F1 baseline only; no claim review or factual correctness score.";
  } else if (["tool-calling", "agent-workflow"].includes(exercise.id)) {
    const planned = await forgeApi.labInference("plan", input, source, signal);
    signal.throwIfAborted();
    if (!planned.plan) throw new Error("The planner returned no decision.");
    const plan = planned.plan;
    const trace: unknown[] = [
      { step: "model plan", model: planned.model, ...plan },
    ];
    if (plan.action === "stop") {
      trace.push({ step: "stop", reason: plan.reason, toolsExecuted: 0 });
    } else {
      const call = {
        tool: "search_source",
        arguments: { query: plan.query, limit: Math.min(topK, plan.limit) },
      };
      const found = executeLabTool(JSON.stringify(call), source);
      trace.push({ step: "validated read-only tool", call, result: found });
      if (exercise.id === "agent-workflow" && found.length) {
        context = found.map((item) => `[${item.id}] ${item.text}`).join("\n");
        signal.throwIfAborted();
        const answer = await forgeApi.labInference(
          "answer",
          input,
          context,
          signal,
        );
        signal.throwIfAborted();
        if (!answer.answer) throw new Error("The workflow returned no answer.");
        trace.push({
          step: "answer from observed passages",
          answer: answer.answer,
          model: answer.model,
        });
      }
      trace.push({
        step: "stop",
        reason: found.length
          ? "One-tool execution budget reached."
          : "No source evidence found; abstained without generating an answer.",
      });
    }
    output = JSON.stringify(trace, null, 2);
    method =
      "Model-selected search/stop with a validated read-only tool and explicit one-tool budget. No file, network, or account-data actions.";
  } else if (exercise.id === "evaluation") {
    const metrics = lexicalEvaluation(input, source);
    const review = await forgeApi.labInference(
      "evaluate",
      input,
      source,
      signal,
    );
    signal.throwIfAborted();
    if (!review.evaluation)
      throw new Error("The model returned no claim review.");
    score = review.evaluation.supportedPercent;
    output = JSON.stringify(
      { lexicalBaseline: metrics, claimReview: review.evaluation },
      null,
      2,
    );
    method = `Model-assisted groundedness review: ${review.model}. Exact quote presence is checked; claim judgments remain fallible. Lexical F1 is a separate baseline.`;
  } else if (exercise.id === "prompt") {
    const answer = await forgeApi.askAi(
      {
        mode: "explain",
        message: input,
        level: 5,
        context: { lesson: "Prompt experiment" },
      },
      signal,
    );
    output = answer.response;
    method = `Live generation: ${answer.model}`;
    context = "";
  } else {
    const chunks = chunkSource(source, chunkSize);
    const embedded = await forgeApi.embedTexts([input, ...chunks], signal);
    const [queryVector, ...vectors] = embedded.vectors;
    const ranked = chunks
      .map((text, index) => ({
        id: index + 1,
        text,
        similarity: cosine(queryVector, vectors[index]),
      }))
      .sort((a, b) => b.similarity - a.similarity);
    const selected = ranked.slice(0, topK);
    similarity = selected[0]?.similarity ?? null;
    context = selected.map((item) => `[${item.id}] ${item.text}`).join("\n");
    method = `Learned embeddings: ${embedded.model}; exact cosine ranking over this source only`;
    if (exercise.id === "embedding")
      output = JSON.stringify(
        {
          dimensions: queryVector.length,
          preview: queryVector.slice(0, 16),
          ranked,
        },
        null,
        2,
      );
    else if (exercise.id === "rag") {
      signal.throwIfAborted();
      const answer = await forgeApi.labInference(
        "answer",
        input,
        context,
        signal,
      );
      signal.throwIfAborted();
      if (!answer.answer)
        throw new Error("The model returned no grounded answer.");
      const review = await forgeApi.labInference(
        "evaluate",
        answer.answer,
        context,
        signal,
      );
      signal.throwIfAborted();
      if (!review.evaluation)
        throw new Error("The model returned no claim review.");
      score = review.evaluation.supportedPercent;
      output = `${answer.answer}\n\nRetrieved passages:\n${context}\n\nClaim review:\n${JSON.stringify(review.evaluation, null, 2)}`;
      method += `; live generation: ${answer.model}; model-assisted claim review with quote checks. Citations and judgments are not verified truth.`;
    } else output = JSON.stringify(selected, null, 2);
  }
  return {
    output,
    latencyMs: performance.now() - start,
    tokenUsage: Math.ceil((input.length + context.length + output.length) / 4),
    retrievalQuality: similarity,
    contextSize: context.length,
    modelCostUsd: needsModel(exercise.id, localOnly) ? null : 0,
    evaluationScore: score,
    method,
  };
}
