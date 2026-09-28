import { describe, expect, it } from "vitest";
import { editorCompletions, tokenizeSource } from "../src/domain/editorTools";
import { canFormat, formatSource } from "../src/services/formatSource";

describe("workspace editor tools", () => {
  it("classifies syntax without executing learner code", () => {
    const tokens = tokenizeSource("const answer = 42; // result", "main.ts");
    expect(
      tokens.some(
        (token) => token.text === "const" && token.kind === "keyword",
      ),
    ).toBe(true);
    expect(
      tokens.some((token) => token.text === "42" && token.kind === "number"),
    ).toBe(true);
    expect(tokens.some((token) => token.kind === "comment")).toBe(true);
  });

  it("formats syntax while preserving string and template contents", async () => {
    expect(await formatSource('{"ok":true}', "data.json")).toBe(
      '{ "ok": true }\n',
    );
    expect(
      await formatSource("function x() {\nreturn 1;\n}", "x.js"),
    ).toContain("  return 1;");
    const text = "const x = `first\n    indented\nlast`;";
    expect(await formatSource(text, "x.js")).toContain(
      "`first\n    indented\nlast`",
    );
    expect(await formatSource("const x:number=2", "x.ts")).toContain(
      "const x: number = 2;",
    );
  });

  it("rejects malformed or unsupported source instead of rewriting it", async () => {
    await expect(formatSource('{"broken":', "x.json")).rejects.toThrow();
    await expect(formatSource("function (", "x.js")).rejects.toThrow();
    const python = "def main():\n    return 1\n";
    expect(canFormat("x.py")).toBe(false);
    await expect(formatSource(python, "x.py")).rejects.toThrow(
      "Formatting is available",
    );
  });

  it("preserves source bytes through tokenization including special HTML characters", () => {
    const code = 'const x = "<script>&hello</script>";\n// hi\n';
    expect(
      tokenizeSource(code, "x.js")
        .map((token) => token.text)
        .join(""),
    ).toBe(code);
  });

  it("offers context-aware completions", () => {
    expect(editorCompletions("app.ts")).toContain('const value: string = "";');
    expect(editorCompletions("index.html")).toContain("<main></main>");
  });
});
