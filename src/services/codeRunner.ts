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
  tests: CodeTestResult[];
};

export type CodeTestResult = {
  name: string;
  status: "passed" | "failed" | "not-run";
  input: string;
  expected: string;
  actual: string;
  detail: string | null;
};
const publicCases = [
  { name: "adds positive numbers", input: "[2,3,4]", expected: "9" },
  { name: "supports negative numbers", input: "[-2,5,-1]", expected: "2" },
  { name: "handles an empty array", input: "[]", expected: "0" },
];
function stoppedResult(error: string, executionMs = 0): CodeRunResult {
  return {
    logs: [],
    error,
    passed: 0,
    failed: 0,
    executionMs,
    tests: publicCases.map((test) => ({
      ...test,
      status: "not-run",
      actual: "Not run",
      detail: error,
    })),
  };
}
export function parseRunnerMessage(value: unknown): CodeRunResult {
  const invalid = () =>
    stoppedResult(
      "Execution returned invalid or oversized test data. Run again.",
    );
  if (!value || typeof value !== "object") return invalid();
  const data = value as Record<string, unknown>;
  const boundedText = (text: unknown, max = 2000): text is string =>
    typeof text === "string" && text.length <= max;
  if (
    !Array.isArray(data.logs) ||
    data.logs.length > 80 ||
    !data.logs.every((line) => boundedText(line)) ||
    !(data.error === null || boundedText(data.error)) ||
    typeof data.executionMs !== "number" ||
    !Number.isFinite(data.executionMs) ||
    data.executionMs < 0 ||
    data.executionMs > 60000 ||
    !Array.isArray(data.results)
  )
    return invalid();
  if (data.error !== null) {
    if (data.results.length) return invalid();
    return { ...stoppedResult(data.error, data.executionMs), logs: data.logs };
  }
  if (data.results.length !== publicCases.length) return invalid();
  const tests: CodeTestResult[] = [];
  for (const [index, value] of data.results.entries()) {
    if (!value || typeof value !== "object") return invalid();
    const result = value as Record<string, unknown>;
    const spec = publicCases[index];
    if (
      result.name !== spec.name ||
      result.input !== spec.input ||
      result.expected !== spec.expected ||
      typeof result.passed !== "boolean" ||
      !boundedText(result.actual) ||
      !(result.detail === null || boundedText(result.detail))
    )
      return invalid();
    tests.push({
      ...spec,
      status: result.passed ? "passed" : "failed",
      actual: result.actual,
      detail: result.detail,
    });
  }
  return {
    logs: data.logs,
    error: null,
    tests,
    passed: tests.filter((test) => test.status === "passed").length,
    failed: tests.filter((test) => test.status === "failed").length,
    executionMs: Math.round(data.executionMs * 100) / 100,
  };
}

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
    // Keep stale service-worker cache entries from crossing protocol versions.
    const worker = new Worker("/runner-worker.js?protocol=2");
    const timeoutMs = Math.min(
      Math.max(request.timeoutMs ?? 1_500, 250),
      1_500,
    );
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        worker.terminate();
        resolve(
          stoppedResult(
            `Execution stopped after ${timeoutMs / 1_000} seconds.`,
            timeoutMs,
          ),
        );
      }, timeoutMs);
      worker.onmessage = (event: MessageEvent<unknown>) => {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve(parseRunnerMessage(event.data));
      };
      worker.onerror = (event) => {
        window.clearTimeout(timeout);
        worker.terminate();
        resolve(stoppedResult(event.message.slice(0, 2000)));
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
      tests: [],
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
        return stoppedResult(compiled.diagnostics.join("\n").slice(0, 2000));
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
      return stoppedResult(
        error instanceof Error
          ? error.message.slice(0, 2000)
          : "TypeScript failed to start.",
      );
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
