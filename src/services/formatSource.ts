import type { Plugin } from "prettier";

export function canFormat(path: string) {
  return /\.(?:[cm]?jsx?|tsx?|json|html|css)$/.test(path);
}

// Parser-backed formatting preserves semantics. Unsupported files are never rewritten.
export async function formatSource(
  source: string,
  path: string,
): Promise<string> {
  if (!canFormat(path))
    throw new Error(
      "Formatting is available for JavaScript, TypeScript, JSON, HTML, and CSS.",
    );
  const { format } = await import("prettier/standalone");
  let parser: string;
  let plugins: Plugin[];
  if (path.endsWith(".html")) {
    parser = "html";
    plugins = [await import("prettier/plugins/html")];
  } else if (path.endsWith(".css")) {
    parser = "css";
    plugins = [await import("prettier/plugins/postcss")];
  } else {
    parser = /\.tsx?$/.test(path)
      ? "typescript"
      : path.endsWith(".json")
        ? "json"
        : "babel";
    plugins = [
      await import("prettier/plugins/estree"),
      parser === "typescript"
        ? await import("prettier/plugins/typescript")
        : await import("prettier/plugins/babel"),
    ];
  }
  return format(source, {
    parser,
    plugins,
    embeddedLanguageFormatting: "off",
    tabWidth: 2,
  });
}
