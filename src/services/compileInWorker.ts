import type { TypeScriptCompilation } from "./typescriptCompiler";

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
