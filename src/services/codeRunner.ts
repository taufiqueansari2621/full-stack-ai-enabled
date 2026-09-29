export type RunnerLanguage = "javascript" | "typescript" | "node" | "python";

export type CodeRunRequest = {
  language: RunnerLanguage;
  entryPath: string;
  files: Record<string, string>;
  timeoutMs?: number;
};

export type CodeRunResult = {
  logs: string[];
  error: string | null;
  passed: number;
  failed: number;
  executionMs: number;
};

export interface CodeRunner {
  readonly id: string;
  supports(language: RunnerLanguage): boolean;
  run(request: CodeRunRequest): Promise<CodeRunResult>;
}

export class BrowserRunner implements CodeRunner {
  readonly id = "browser-worker";

  supports(language: RunnerLanguage) {
    return language === "javascript";
  }

  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    const worker = new Worker("/runner-worker.js");
    const timeoutMs = Math.min(
      Math.max(request.timeoutMs ?? 1_500, 250),
      1_500,
    );
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        worker.terminate();
        resolve({
          logs: [],
          error: `Execution stopped after ${timeoutMs / 1_000} seconds.`,
          passed: 0,
          failed: 3,
          executionMs: timeoutMs,
        });
      }, timeoutMs);
      worker.onmessage = (
        event: MessageEvent<{
          logs: string[];
          results: { passed: boolean }[];
          error: string | null;
          executionMs: number;
        }>,
      ) => {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve({
          logs: event.data.logs,
          error: event.data.error,
          passed: event.data.results.filter((test) => test.passed).length,
          failed: event.data.results.filter((test) => !test.passed).length,
          executionMs: Math.round(event.data.executionMs * 100) / 100,
        });
      };
      worker.onerror = (event) => {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve({
          logs: [],
          error: event.message,
          passed: 0,
          failed: 3,
          executionMs: 0,
        });
      };
      worker.postMessage({ code: request.files[request.entryPath] ?? "" });
    });
  }
}

export class RemoteSandboxRunner implements CodeRunner {
  readonly id = "remote-sandbox";

  supports(language: RunnerLanguage) {
    return ["node", "python"].includes(language);
  }

  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    return {
      logs: [],
      error: `Secure ${request.language} execution is not configured. Your files are saved and exportable; Forge will not pretend to run them inside the application Worker.`,
      passed: 0,
      failed: 0,
      executionMs: 0,
    };
  }
}

const browserRunner = new BrowserRunner();
export class TypeScriptRunner implements CodeRunner {
  readonly id = "typescript-browser-worker";
  supports(language: RunnerLanguage) {
    return language === "typescript";
  }
  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    try {
      const { compileInWorker } = await import("./compileInWorker");
      const compiled = await compileInWorker(
        request.files[request.entryPath] ?? "",
      );
      if (compiled.diagnostics.length)
        return {
          logs: [],
          error: compiled.diagnostics.join("\n"),
          passed: 0,
          failed: 0,
          executionMs: 0,
        };
      const result = await browserRunner.run({
        ...request,
        language: "javascript",
        files: { [request.entryPath]: compiled.javascript },
      });
      return {
        ...result,
        logs: [
          "TypeScript type-check passed; running compiled JavaScript.",
          ...result.logs,
        ],
      };
    } catch (error) {
      return {
        logs: [],
        error:
          error instanceof Error
            ? error.message
            : "TypeScript failed to start.",
        passed: 0,
        failed: 0,
        executionMs: 0,
      };
    }
  }
}
const typescriptRunner = new TypeScriptRunner();
const remoteSandboxRunner = new RemoteSandboxRunner();

export function detectRunnerLanguage(
  files: Record<string, string>,
  activePath: string,
): RunnerLanguage {
  if (/\.tsx?$/.test(activePath)) return "typescript";
  if (activePath.endsWith(".py") || Object.hasOwn(files, "main.py"))
    return "python";
  if (
    Object.hasOwn(files, "package.json") &&
    !Object.hasOwn(files, "web/index.html")
  )
    return "node";
  return "javascript";
}

export function runnerFor(language: RunnerLanguage): CodeRunner {
  if (typescriptRunner.supports(language)) return typescriptRunner;
  return browserRunner.supports(language) ? browserRunner : remoteSandboxRunner;
}
