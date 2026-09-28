import { formatSource } from "../services/formatSource";

self.onmessage = async (
  event: MessageEvent<{ source: string; path: string }>,
) => {
  try {
    if (
      typeof event.data.source !== "string" ||
      event.data.source.length > 120_000
    )
      throw new Error("File exceeds the formatter's 120 KB limit.");
    self.postMessage({
      source: await formatSource(event.data.source, event.data.path),
    });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "Could not format this file.",
    });
  }
};
