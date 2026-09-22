import type { Env } from "../types";
import type { AiProvider, TutorAnswer, TutorRequest } from "./provider";

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function teachingInstruction(level: number) {
  return [
    "Ask one guiding question. Do not reveal implementation details.",
    "Give a conceptual hint and one principle to recall.",
    "Point to the likely location and type of mistake without writing the fix.",
    "Show language-neutral pseudocode, not a copyable implementation.",
    "Show only the smallest partial implementation needed, leaving meaningful work for the learner.",
  ][Math.max(1, Math.min(5, level)) - 1];
}

function contextText(context: TutorRequest["context"]) {
  const sections: string[] = [];
  if (context.learnerLevel)
    sections.push(`Learner level: ${context.learnerLevel}`);
  if (context.lesson) sections.push(`Current lesson: ${context.lesson}`);
  if (context.challenge) sections.push(`Challenge: ${context.challenge}`);
  if (context.error) sections.push(`Observed error: ${context.error}`);
  if (context.activeFile)
    sections.push(
      `Active file (${context.activeFile.path}):\n${context.activeFile.content}`,
    );
  return sections.join("\n\n");
}

export class WorkersAiProvider implements AiProvider {
  constructor(private readonly ai: Env["AI"]) {}

  async generate(request: TutorRequest): Promise<TutorAnswer> {
    const response = (await this.ai.run(
      MODEL,
      {
        messages: [
          {
            role: "system",
            content: `You are Forge AI, a careful engineering tutor. Teach rather than completing work for the learner. ${teachingInstruction(request.level)} Be concise, technically accurate, and mention verification or trade-offs when useful. Never claim code ran unless an execution result is present.`,
          },
          {
            role: "user",
            content: `Mode: ${request.mode}\n\nShared context:\n${contextText(request.context) || "No optional context shared."}\n\nLearner request:\n${request.message}`,
          },
        ],
        max_tokens: 700,
        temperature: 0.25,
      },
      { gateway: { id: "default", skipCache: true } },
    )) as { response?: unknown };
    if (typeof response.response !== "string" || !response.response.trim())
      throw new Error("AI provider returned no text response");
    return {
      text: response.response.trim(),
      model: MODEL,
      provider: "cloudflare-workers-ai",
    };
  }
}
