import { compileTypeScript } from "../services/typescriptCompiler";

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
self.onmessage = (event: MessageEvent<{ source: string }>) => {
  try {
    self.postMessage(compileTypeScript(event.data.source, libraries));
  } catch (error) {
    self.postMessage({
      javascript: "",
      diagnostics: [
        error instanceof Error
          ? error.message
          : "TypeScript compilation failed.",
      ],
    });
  }
};
