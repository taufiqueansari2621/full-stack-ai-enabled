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
export const needsModel = (id: string) =>
  !["chunking", "tool-calling", "evaluation"].includes(id);

export async function runAiExperiment(
  exercise: AiLabExercise,
  input: string,
  source: string,
  topK: number,
  chunkSize: number,
  signal: AbortSignal,
): Promise<AiLabResult> {
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
  } else if (exercise.id === "tool-calling") {
    output = JSON.stringify(executeLabTool(input, source), null, 2);
    method =
      "Validated read-only search_source tool; explicit JSON call, not model-selected";
  } else if (exercise.id === "evaluation") {
    const metrics = lexicalEvaluation(input, source);
    score = metrics.f1 * 100;
    output = JSON.stringify(metrics, null, 2);
    method =
      "Lexical precision/recall/F1 against source; NOT factual correctness or model quality";
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
    else if (["rag", "agent-workflow"].includes(exercise.id)) {
      const answer = await forgeApi.askAi(
        {
          mode: "explain",
          level: 5,
          message: `${input}\nUse only the supplied source passages. Cite passage IDs and say when evidence is missing.`,
          context: {
            lesson: "Grounded lab experiment",
            note: context.slice(0, 4000),
          },
        },
        signal,
      );
      output = `${exercise.id === "agent-workflow" ? "Executed bounded workflow: embed → retrieve → generate → stop. No file mutations.\n\n" : ""}${answer.response}\n\nRetrieved passages:\n${context}`;
      method += `; live generation: ${answer.model}. Citations are model output, not verified truth.`;
    } else output = JSON.stringify(selected, null, 2);
  }
  return {
    output,
    latencyMs: performance.now() - start,
    tokenUsage: Math.ceil((input.length + context.length + output.length) / 4),
    retrievalQuality: similarity,
    contextSize: context.length,
    modelCostUsd: needsModel(exercise.id) ? null : 0,
    evaluationScore: score,
    method,
  };
}
