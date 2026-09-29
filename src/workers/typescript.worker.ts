import { compileTypeScript } from "../services/typescriptCompiler";
import { analyzeEditorSource } from "../services/editorIntelligence";

const libraryModules = import.meta.glob<string>(
  [
    "/node_modules/typescript/lib/lib.es*.d.ts",
    "/node_modules/typescript/lib/lib.decorators*.d.ts",
  ],
  { query: "?raw", import: "default", eager: true },
);
const libraries = Object.fromEntries(
  Object.entries(libraryModules).map(([path, text]) => [
    path.split("/").at(-1)!,
    text,
  ]),
);
self.onmessage = (
  event: MessageEvent<{
    source: string;
    mode?: "analyze";
    path?: string;
    position?: number;
  }>,
) => {
  try {
    self.postMessage(
      event.data.mode === "analyze"
        ? analyzeEditorSource(
            event.data.source,
            event.data.path ?? "",
            event.data.position ?? -1,
            libraries,
          )
        : compileTypeScript(event.data.source, libraries),
    );
  } catch (error) {
    self.postMessage({
      javascript: "",
      suggestions: [],
      diagnostics: [
        error instanceof Error
          ? error.message
          : "TypeScript compilation failed.",
      ],
    });
  }
};
