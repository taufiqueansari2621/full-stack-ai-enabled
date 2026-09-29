import ts from "typescript";

export type TypeScriptCompilation = {
  javascript: string;
  diagnostics: string[];
};

export function compileTypeScript(
  source: string,
  libraries: Record<string, string>,
): TypeScriptCompilation {
  if (source.length > 120_000)
    return {
      javascript: "",
      diagnostics: ["TypeScript source exceeds 120,000 characters."],
    };
  const fileName = "exercise.ts";
  const parsed = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ES2022,
    true,
  );
  let hasImport = false;
  const visit = (node: ts.Node) => {
    if (node.kind === ts.SyntaxKind.ImportKeyword || ts.isImportTypeNode(node))
      hasImport = true;
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  if (ts.isExternalModule(parsed) || hasImport)
    return {
      javascript: "",
      diagnostics: [
        "This playground runs standalone TypeScript scripts. Package imports, exports, and framework modules need the separate preview sandbox.",
      ],
    };
  const files: Record<string, string> = {
    ...libraries,
    [fileName]: source,
    "forge-console.d.ts":
      "declare const console: { log(...values: unknown[]): void };",
  };
  const normalize = (path: string) => path.replace(/^\//, "");
  let javascript = "";
  const options: ts.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    skipLibCheck: true,
    noEmitOnError: true,
    types: [],
    lib: ["lib.es2022.d.ts"],
  };
  const host: ts.CompilerHost = {
    getSourceFile: (name, target) => {
      const text = files[normalize(name)];
      return text === undefined
        ? undefined
        : ts.createSourceFile(name, text, target, true);
    },
    getDefaultLibFileName: () => "lib.es2022.d.ts",
    writeFile: (name, text) => {
      if (name.endsWith("exercise.js")) javascript = text;
    },
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    fileExists: (name) => Object.hasOwn(files, normalize(name)),
    readFile: (name) => files[normalize(name)],
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
  };
  const program = ts.createProgram(
    [fileName, "forge-console.d.ts"],
    options,
    host,
  );
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .slice(0, 30)
    .map((item) => {
      const position =
        item.file && item.start !== undefined
          ? item.file.getLineAndCharacterOfPosition(item.start)
          : undefined;
      return `${position ? `${item.file!.fileName}:${position.line + 1}:${position.character + 1} ` : ""}TS${item.code}: ${ts.flattenDiagnosticMessageText(item.messageText, "\n")}`;
    });
  if (!diagnostics.length) program.emit();
  return { javascript, diagnostics };
}
