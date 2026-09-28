export function formatInWorker(source: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/formatter.worker.ts", import.meta.url),
      { type: "module" },
    );
    const finish = () => {
      window.clearTimeout(timer);
      worker.terminate();
    };
    const timer = window.setTimeout(() => {
      finish();
      reject(new Error("Formatting timed out. Your file is unchanged."));
    }, 10_000);
    worker.onmessage = (
      event: MessageEvent<{ source?: string; error?: string }>,
    ) => {
      finish();
      if (typeof event.data.source === "string") resolve(event.data.source);
      else
        reject(new Error(event.data.error ?? "Formatter returned no result."));
    };
    worker.onerror = () => {
      finish();
      reject(new Error("Formatter could not load. Retry when connected."));
    };
    worker.postMessage({ source, path });
  });
}
