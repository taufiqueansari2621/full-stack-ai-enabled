import {
  assertSameOrigin,
  HttpError,
  json,
  readJsonObject,
  type Route,
} from "../http";
import { enforceRateLimit } from "../rateLimit";

export function validateEmbeddingInput(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 17 ||
    value.some(
      (text) => typeof text !== "string" || !text.trim() || text.length > 800,
    ) ||
    value.join("").length > 9000
  )
    throw new HttpError(
      400,
      "INVALID_EMBEDDING_INPUT",
      "Send 1–17 texts, each 1–800 characters, up to 9,000 characters total.",
    );
  return value;
}

export function validateEmbeddingOutput(
  value: unknown,
  count: number,
): number[][] {
  const data =
    value && typeof value === "object" && "data" in value ? value.data : null;
  if (
    !Array.isArray(data) ||
    data.length !== count ||
    data.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== 384 ||
        row.some((n) => typeof n !== "number" || !Number.isFinite(n)),
    )
  )
    throw new HttpError(
      502,
      "INVALID_EMBEDDING_OUTPUT",
      "The embedding provider returned invalid vectors.",
    );
  return data;
}

export const embeddingRoutes: Route[] = [
  {
    method: "POST",
    pattern: "/api/ai/embeddings",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 40000);
      const texts = validateEmbeddingInput(body.texts);
      await enforceRateLimit(env, request, "ai", user!.id, 20, 3600);
      const model = "@cf/baai/bge-small-en-v1.5";
      const started = Date.now();
      let deadline: ReturnType<typeof setTimeout> | undefined;
      let vectors: number[][];
      try {
        const output = await Promise.race([
          env.AI.run(model, { text: texts }),
          new Promise<never>((_, reject) => {
            deadline = setTimeout(
              () =>
                reject(
                  new HttpError(
                    504,
                    "EMBEDDING_TIMEOUT",
                    "Embedding request timed out. Provider processing may continue.",
                  ),
                ),
              30000,
            );
          }),
        ]);
        vectors = validateEmbeddingOutput(output, texts.length);
      } finally {
        clearTimeout(deadline);
      }
      const latencyMs = Date.now() - started;
      await env.DB.prepare(
        "INSERT INTO ai_usage (id, user_id, model, mode, input_characters, output_characters, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          crypto.randomUUID(),
          user!.id,
          model,
          "lab-embeddings",
          texts.join("").length,
          JSON.stringify(vectors).length,
          latencyMs,
          new Date().toISOString(),
        )
        .run();
      return json({ vectors, model, latencyMs });
    },
  },
];
