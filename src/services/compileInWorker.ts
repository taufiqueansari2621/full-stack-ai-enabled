import type { TypeScriptCompilation } from "./typescriptCompiler";
import type { EditorAnalysis } from "./editorIntelligence";

export function analyzeInWorker(
  source: string,
  path: string,
  position: number,
): Promise<EditorAnalysis> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/typescript.worker.ts", import.meta.url),
      { type: "module" },
    );
    const timer = setTimeout(() => {
      worker.terminate();
      reject(
        new Error(
          "Editor analysis exceeded ten seconds. Retry or simplify the file.",
        ),
      );
    }, 10_000);
    const cleanup = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    worker.onmessage = (event: MessageEvent<EditorAnalysis>) => {
      cleanup();
      resolve(event.data);
    };
    worker.onerror = () => {
      cleanup();
      reject(
        new Error("Editor analysis could not load. Retry when connected."),
      );
    };
    worker.postMessage({ mode: "analyze", source, path, position });
  });
}

export function compileInWorker(
  source: string,
): Promise<TypeScriptCompilation> {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL("../workers/typescript.worker.ts", import.meta.url),
      { type: "module" },
    );
    const finish = (result: TypeScriptCompilation) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };
    const timer = setTimeout(
      () =>
        finish({
          javascript: "",
          diagnostics: [
            "TypeScript compilation exceeded ten seconds, including loading. Retry when connected or simplify the script.",
          ],
        }),
      10000,
    );
    worker.onmessage = (event: MessageEvent<TypeScriptCompilation>) =>
      finish(event.data);
    worker.onerror = () =>
      finish({
        javascript: "",
        diagnostics: [
          "TypeScript compiler could not load. Retry when connected.",
        ],
      });
    worker.postMessage({ source });
  });
}
