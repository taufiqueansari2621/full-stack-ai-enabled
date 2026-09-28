import type { SqlExecution } from "./sqlEngine";

export function runSql(
  query: string,
  signal: AbortSignal,
): Promise<SqlExecution> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("SQL run cancelled."));
      return;
    }
    const worker = new Worker(
      new URL("../workers/sql.worker.ts", import.meta.url),
      { type: "module" },
    );
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      worker.terminate();
    };
    const cancel = () => {
      finish();
      reject(new Error("SQL run cancelled."));
    };
    const timer = setTimeout(() => {
      finish();
      reject(
        new Error(
          "SQL exceeded the 5-second limit (including runtime loading). Simplify the query or retry when connected.",
        ),
      );
    }, 5000);
    signal.addEventListener("abort", cancel, { once: true });
    worker.onmessage = (
      event: MessageEvent<{ result?: SqlExecution; error?: string }>,
    ) => {
      finish();
      if (event.data.result) resolve(event.data.result);
      else reject(new Error(event.data.error ?? "SQL execution failed."));
    };
    worker.onerror = () => {
      finish();
      reject(new Error("SQL runtime could not load. Retry when connected."));
    };
    worker.postMessage({ query });
  });
}
