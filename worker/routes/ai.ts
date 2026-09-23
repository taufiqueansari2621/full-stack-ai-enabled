import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";
import { WorkersAiProvider } from "../ai/workersAiProvider";
import { enforceRateLimit } from "../rateLimit";
import type { TutorRequest } from "../ai/provider";

const modes = new Set([
  "explain",
  "hint",
  "debug",
  "review-code",
  "quiz-me",
  "interview-me",
  "explain-error",
  "explain-simply",
  "explain-deeply",
  "generate-practice",
]);

function optionalText(value: unknown, maximum: number) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.length > maximum)
    throw new HttpError(
      400,
      "INVALID_AI_CONTEXT",
      "Shared AI context is invalid or too large.",
    );
  return value;
}

export const aiRoutes: Route[] = [
  {
    method: "POST",
    pattern: "/api/ai",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      await enforceRateLimit(env, request, "ai", user!.id, 20, 60 * 60);
      const body = await readJsonObject(request, 24_000);
      const mode = typeof body.mode === "string" ? body.mode : "";
      const message =
        typeof body.message === "string" ? body.message.trim() : "";
      const level = Number(body.level);
      if (!modes.has(mode))
        throw new HttpError(
          400,
          "INVALID_AI_MODE",
          "Choose a supported Forge AI mode.",
        );
      if (message.length < 2 || message.length > 2_000)
        throw new HttpError(
          400,
          "INVALID_AI_MESSAGE",
          "Ask a question between 2 and 2,000 characters.",
        );
      if (!Number.isInteger(level) || level < 1 || level > 5)
        throw new HttpError(
          400,
          "INVALID_HINT_LEVEL",
          "Hint level must be between 1 and 5.",
        );
      const rawContext = body.context;
      if (
        !rawContext ||
        typeof rawContext !== "object" ||
        Array.isArray(rawContext)
      )
        throw new HttpError(
          400,
          "INVALID_AI_CONTEXT",
          "Context must be an object.",
        );
      const source = rawContext as Record<string, unknown>;
      const activeFileValue = source.activeFile;
      let activeFile: TutorRequest["context"]["activeFile"];
      if (activeFileValue !== undefined) {
        if (
          !activeFileValue ||
          typeof activeFileValue !== "object" ||
          Array.isArray(activeFileValue)
        )
          throw new HttpError(
            400,
            "INVALID_AI_CONTEXT",
            "Active-file context is invalid.",
          );
        const file = activeFileValue as Record<string, unknown>;
        const path = optionalText(file.path, 80);
        const content = optionalText(file.content, 8_000);
        if (!path || content === undefined)
          throw new HttpError(
            400,
            "INVALID_AI_CONTEXT",
            "Active-file context is incomplete.",
          );
        activeFile = { path, content };
      }
      const context: TutorRequest["context"] = {
        lesson: optionalText(source.lesson, 200),
        challenge: optionalText(source.challenge, 1_000),
        error: optionalText(source.error, 2_000),
        learnerLevel: optionalText(source.learnerLevel, 80),
        note: optionalText(source.note, 4_000),
        activeFile,
      };
      const included = Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key);
      const tutorRequest: TutorRequest = { mode, message, level, context };
      const started = Date.now();
      const answer = await new WorkersAiProvider(env.AI).generate(tutorRequest);
      const now = new Date().toISOString();
      const conversationId = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO ai_conversations (id, user_id, title, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind(conversationId, user!.id, message.slice(0, 100), mode, now, now)
        .run();
      await env.DB.prepare(
        "INSERT INTO ai_messages (id, conversation_id, role, content, context_json, created_at) VALUES (?, ?, 'user', ?, ?, ?)",
      )
        .bind(
          crypto.randomUUID(),
          conversationId,
          message,
          JSON.stringify({ included }),
          now,
        )
        .run();
      await env.DB.prepare(
        "INSERT INTO ai_messages (id, conversation_id, role, content, created_at) VALUES (?, ?, 'assistant', ?, ?)",
      )
        .bind(crypto.randomUUID(), conversationId, answer.text, now)
        .run();
      await env.DB.prepare(
        "INSERT INTO ai_usage (id, user_id, model, mode, input_characters, output_characters, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          crypto.randomUUID(),
          user!.id,
          answer.model,
          mode,
          message.length + JSON.stringify(context).length,
          answer.text.length,
          Date.now() - started,
          now,
        )
        .run();
      return json({
        conversationId,
        response: answer.text,
        provider: answer.provider,
        model: answer.model,
        contextIncluded: included,
        actions: [
          "explain-simply",
          "explain-deeply",
          "quiz-me",
          "generate-practice",
        ],
      });
    },
  },
];
