// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { compileTypeScript } from "../src/services/typescriptCompiler";

const libPath = dirname(createRequire(import.meta.url).resolve("typescript"));
const libraries = Object.fromEntries(
  readdirSync(libPath)
    .filter((name) => /^lib\.(es|decorators).*\.d\.ts$/.test(name))
    .map((name) => [name, readFileSync(join(libPath, name), "utf8")]),
);
describe("standalone TypeScript compiler", () => {
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
