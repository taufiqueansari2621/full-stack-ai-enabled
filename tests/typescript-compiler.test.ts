// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { compileTypeScript } from "../src/services/typescriptCompiler";
import { analyzeEditorSource } from "../src/services/editorIntelligence";

const libPath = dirname(createRequire(import.meta.url).resolve("typescript"));
const libraries = Object.fromEntries(
  readdirSync(libPath)
    .filter((name) => /^lib\.(es|decorators).*\.d\.ts$/.test(name))
    .map((name) => [name, readFileSync(join(libPath, name), "utf8")]),
);
describe("standalone TypeScript compiler", () => {
  it("suggests actual inferred object members at the cursor", () => {
    const source = 'const learner = { name: "Ada", score: 42 }; learner.sc';
    const result = analyzeEditorSource(
      source,
      "src/example.ts",
      source.length,
      libraries,
    );
    expect(result.suggestions.map((item) => item.name)).toContain("score");
    expect(result.suggestions.map((item) => item.name)).not.toContain("name");
    const item = result.suggestions.find((entry) => entry.name === "score")!;
    expect(
      source.slice(0, item.start) +
        item.insertText +
        source.slice(item.start + item.length),
    ).toBe(source + "ore");
  });
  it("checks JavaScript and TypeScript without execution or package access", () => {
    const source = 'const value: number = "wrong";';
    expect(
      analyzeEditorSource(
        source,
        "a.ts",
        source.length,
        libraries,
      ).diagnostics.join(" "),
    ).toContain("TS2322");
    const js = "const items = [1, 2]; items.ma";
    expect(
      analyzeEditorSource(js, "a.js", js.length, libraries).suggestions.map(
        (item) => item.name,
      ),
    ).toContain("map");
    expect(() => analyzeEditorSource(js, "a.py", 0, libraries)).toThrow();
    expect(() => analyzeEditorSource(js, "a.js", -1, libraries)).toThrow();
  });
  it("type-checks and emits real JavaScript", () => {
    const result = compileTypeScript(
      "function sum(numbers: number[]): number { return numbers.reduce((a,b)=>a+b,0); } console.log(sum([2,3]));",
      libraries,
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.javascript).toContain("function sum(numbers)");
    expect(result.javascript).not.toContain("number[]");
  });
  it("blocks semantic and syntax errors before execution", () => {
    for (const source of [
      'const value: number = "wrong";',
      "function (",
      "console.log(missingName);",
    ]) {
      const result = compileTypeScript(source, libraries);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.javascript).toBe("");
    }
  });
  it("rejects package modules and bounds source", () => {
    expect(
      compileTypeScript('import x from "package";', libraries).diagnostics[0],
    ).toContain("standalone");
    expect(
      compileTypeScript('const x = import("package");', libraries)
        .diagnostics[0],
    ).toContain("standalone");
    expect(
      compileTypeScript(" ".repeat(120001), libraries).diagnostics[0],
    ).toContain("120,000");
  });
});
