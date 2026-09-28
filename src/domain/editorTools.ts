export type SyntaxTokenKind =
  "plain" | "keyword" | "string" | "number" | "comment" | "tag";
export type SyntaxToken = { text: string; kind: SyntaxTokenKind };

const keywordPattern =
  /^(?:const|let|var|function|return|if|else|for|while|class|new|import|export|from|async|await|interface|type|extends|implements|public|private|readonly|try|catch|throw|true|false|null|undefined)$/;

export function tokenizeSource(source: string, path: string): SyntaxToken[] {
  const pattern = path.endsWith(".html")
    ? /(<!--[^]*?-->|<\/?[A-Za-z][^>]*>|"[^"\n]*"|'[^'\n]*'|\b\d+(?:\.\d+)?\b)/g
    : /(\/\/[^\n]*|\/\*[^]*?\*\/|`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  return source
    .split(pattern)
    .filter(Boolean)
    .map((text) => ({
      text,
      kind:
        text.startsWith("//") ||
        text.startsWith("/*") ||
        text.startsWith("<!--")
          ? "comment"
          : text.startsWith("<")
            ? "tag"
            : /^["'`]/.test(text)
              ? "string"
              : /^\d/.test(text)
                ? "number"
                : keywordPattern.test(text)
                  ? "keyword"
                  : "plain",
    }));
}

export function editorCompletions(path: string): string[] {
  if (path.endsWith(".html"))
    return [
      "<main></main>",
      '<button type="button"></button>',
      '<section aria-labelledby=""></section>',
    ];
  if (path.endsWith(".css"))
    return [
      "display: grid;",
      "color: var(--text);",
      "@media (max-width: 768px) {}",
    ];
  if (path.endsWith(".ts") || path.endsWith(".tsx"))
    return [
      "interface Name {}",
      'const value: string = "";',
      "export function name(): void {}",
    ];
  if (/\.[cm]?jsx?$/.test(path))
    return [
      "console.log();",
      "function name() {}",
      "const value = [];",
      "try {} catch (error) {}",
    ];
  if (path.endsWith(".py")) return ["print()", "def main():\n    pass"];
  return [];
}
