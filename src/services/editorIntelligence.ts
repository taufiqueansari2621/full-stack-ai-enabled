import ts from "typescript";

export type EditorSuggestion = {
  name: string;
  start: number;
  length: number;
  insertText: string;
};
export type EditorAnalysis = {
  suggestions: EditorSuggestion[];
  diagnostics: string[];
};

// In-memory language service: no disk, network, dependency loading, or execution.
export function analyzeEditorSource(
  source: string,
  path: string,
  position: number,
  libraries: Record<string, string>,
): EditorAnalysis {
  if (
    source.length > 120_000 ||
    !Number.isInteger(position) ||
    position < 0 ||
    position > source.length
  )
    throw new Error(
      "Editor analysis requires bounded source and a valid cursor position.",
    );
  if (!/\.(js|ts)$/.test(path))
    throw new Error(
      "Semantic suggestions support JavaScript and TypeScript files.",
    );
  const name = path.endsWith(".ts") ? "exercise.ts" : "exercise.js";
  const files = {
    ...libraries,
    [name]: source,
    "forge-console.d.ts":
      "declare const console: { log(...values: unknown[]): void };",
  };
  const normalize = (value: string) => value.replace(/^\//, "");
  const read = (value: string) =>
    Object.hasOwn(files, normalize(value))
      ? files[normalize(value)]
      : undefined;
  const service = ts.createLanguageService({
    getCompilationSettings: () => ({
      strict: true,
      allowJs: true,
      checkJs: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      types: [],
      lib: ["lib.es2022.d.ts"],
      skipLibCheck: true,
      noEmit: true,
    }),
    getScriptFileNames: () => [name, "forge-console.d.ts"],
    getScriptVersion: () => "1",
    getScriptSnapshot: (file) => {
      const text = read(file);
      return text === undefined
        ? undefined
        : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => "",
    getDefaultLibFileName: () => "lib.es2022.d.ts",
    fileExists: (file) => read(file) !== undefined,
    readFile: read,
    readDirectory: () => [],
  });
  try {
    const prefix =
      source.slice(0, position).match(/[a-zA-Z0-9_$]*$/)?.[0] ?? "";
    const info = service.getCompletionsAtPosition(name, position, {
      includeCompletionsForModuleExports: false,
      includeCompletionsWithInsertText: false,
    });
    const suggestions = (info?.entries ?? [])
      .filter(
        (entry) =>
          entry.name.startsWith(prefix) &&
          !entry.source &&
          /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(entry.name),
      )
      .slice(0, 40)
      .map((entry) => ({
        name: entry.name,
        insertText: entry.name,
        start: entry.replacementSpan?.start ?? position - prefix.length,
        length: entry.replacementSpan?.length ?? prefix.length,
      }));
    const diagnostics = [
      ...service.getSyntacticDiagnostics(name),
      ...service.getSemanticDiagnostics(name),
    ]
      .slice(0, 30)
      .map((item) => {
        const location =
          item.file && item.start !== undefined
            ? item.file.getLineAndCharacterOfPosition(item.start)
            : undefined;
        return `${path}${location ? `:${location.line + 1}:${location.character + 1}` : ""} TS${item.code}: ${ts.flattenDiagnosticMessageText(item.messageText, "\n")}`;
      });
    return { suggestions, diagnostics };
  } finally {
    service.dispose();
  }
}
