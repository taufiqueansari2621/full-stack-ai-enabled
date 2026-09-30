import ts from "typescript";
import {
  FRAMEWORK_PACKAGES,
  resolveWorkspacePath,
  type PreviewBuild,
} from "../domain/frameworkPreview";

export function compileFramework(
  files: Record<string, string>,
  framework: "react" | "angular",
): PreviewBuild {
  const result: PreviewBuild = {
    entry: "",
    modules: Object.create(null),
    imports: Object.create(null),
    styles: "",
    diagnostics: [],
  };
  if (
    Object.keys(files).length > 12 ||
    Object.values(files).some((text) => typeof text !== "string") ||
    new TextEncoder().encode(JSON.stringify(files)).length > 512_000
  ) {
    result.diagnostics.push("Preview supports up to 12 files and 512 KB.");
    return result;
  }
  result.entry =
    (framework === "react"
      ? ["src/main.tsx", "src/main.jsx", "src/index.tsx", "src/index.jsx"]
      : ["src/main.ts"]
    ).find((path) => Object.hasOwn(files, path)) ?? "";
  if (!result.entry) {
    result.diagnostics.push(
      `Missing ${framework === "react" ? "src/main.jsx or src/main.tsx" : "src/main.ts"} entry.`,
    );
    return result;
  }
  const visitModule = (path: string) => {
    if (Object.hasOwn(result.modules, path)) return;
    result.modules[path] = "";
    result.imports[path] = Object.create(null);
    if (path.endsWith(".css")) {
      result.styles += files[path] + "\n";
      return;
    }
    if (!/\.[jt]sx?$/.test(path)) {
      result.diagnostics.push(`Unsupported module: ${path}`);
      return;
    }
    const source = ts.createSourceFile(
      path,
      files[path],
      ts.ScriptTarget.ES2022,
      true,
      /x$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const register = (name: string) => {
      if (
        FRAMEWORK_PACKAGES.includes(name) &&
        (framework === "react"
          ? name.startsWith("react")
          : !name.startsWith("react"))
      ) {
        result.imports[path][name] = name;
        return;
      }
      const resolved = resolveWorkspacePath(path, name, files);
      if (!resolved) {
        result.diagnostics.push(
          `${path}: import '${name}' is missing or not in the preview package allowlist.`,
        );
        return;
      }
      result.imports[path][name] = resolved;
      visitModule(resolved);
    };
    const inspect = (node: ts.Node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        if (
          !(ts.isImportDeclaration(node) && node.importClause?.isTypeOnly) &&
          !(ts.isExportDeclaration(node) && node.isTypeOnly)
        )
          register(node.moduleSpecifier.text);
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      )
        result.diagnostics.push(
          `${path}: use static import declarations; dynamic imports and require are not supported.`,
        );
      ts.forEachChild(node, inspect);
    };
    inspect(source);
    if (framework === "react")
      result.imports[path]["react/jsx-runtime"] = "react/jsx-runtime";
    const inlineTemplates: ts.TransformerFactory<ts.SourceFile> =
      (context) => (root) => {
        const visit: ts.Visitor = (node) => {
          if (
            framework === "angular" &&
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name)
          ) {
            if (
              node.name.text === "templateUrl" &&
              ts.isStringLiteral(node.initializer)
            ) {
              const target = resolveWorkspacePath(
                path,
                node.initializer.text,
                files,
              );
              if (!target)
                result.diagnostics.push(
                  `${path}: template '${node.initializer.text}' is missing.`,
                );
              return ts.factory.createPropertyAssignment(
                "template",
                ts.factory.createStringLiteral(target ? files[target] : ""),
              );
            }
            if (
              node.name.text === "styleUrls" &&
              ts.isArrayLiteralExpression(node.initializer)
            ) {
              const styles = node.initializer.elements.map((item) => {
                const target = ts.isStringLiteral(item)
                  ? resolveWorkspacePath(path, item.text, files)
                  : null;
                if (!target)
                  result.diagnostics.push(
                    `${path}: styleUrls must name existing local files.`,
                  );
                return ts.factory.createStringLiteral(
                  target ? files[target] : "",
                );
              });
              return ts.factory.createPropertyAssignment(
                "styles",
                ts.factory.createArrayLiteralExpression(styles),
              );
            }
          }
          return ts.visitEachChild(node, visit, context);
        };
        return ts.visitNode(root, visit) as ts.SourceFile;
      };
    const output = ts.transpileModule(files[path], {
      fileName: path,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
      transformers: { before: [inlineTemplates] },
    });
    result.modules[path] = output.outputText;
    for (const diagnostic of output.diagnostics ?? [])
      result.diagnostics.push(
        `${path}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`,
      );
  };
  visitModule(result.entry);
  result.diagnostics = result.diagnostics.slice(0, 30);
  return result;
}
