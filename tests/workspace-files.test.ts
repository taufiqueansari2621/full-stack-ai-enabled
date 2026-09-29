import { describe, expect, it } from "vitest";
import {
  addWorkspaceFile,
  moveWorkspacePath,
  removeWorkspaceFile,
  validateWorkspaceFiles,
  validateWorkspacePath,
} from "../src/domain/workspaceFiles";

describe("workspace file operations", () => {
  const original = {
    "src/index.js": "keep",
    "src/lib/util.js": "utility",
    "README.md": "notes",
  };
  it("creates nested files without mutating or overwriting existing work", () => {
    const next = addWorkspaceFile(original, "tests/new.test.ts", "test");
    expect(next["tests/new.test.ts"]).toBe("test");
    expect(original).not.toHaveProperty("tests/new.test.ts");
    expect(() => addWorkspaceFile(original, "README.md")).toThrow(
      /already exists/,
    );
  });
  it("moves complete folders atomically and supplies tab mappings", () => {
    const moved = moveWorkspacePath(original, "src", "app");
    expect(moved.files).toEqual({
      "app/index.js": "keep",
      "app/lib/util.js": "utility",
      "README.md": "notes",
    });
    expect(moved.paths["src/lib/util.js"]).toBe("app/lib/util.js");
    expect(original["src/index.js"]).toBe("keep");
    expect(() => moveWorkspacePath(original, "src", "src/child")).toThrow(
      /inside itself/,
    );
    expect(() =>
      moveWorkspacePath(original, "src/index.js", "README.md"),
    ).toThrow(/already exists/);
    expect(() => moveWorkspacePath(original, "src", "README.md/child")).toThrow(
      /file and a folder/,
    );
    expect(() => moveWorkspacePath(original, "README.md", "src")).toThrow(
      /already exists/,
    );
  });
  it("rejects invalid, unsafe, and oversized paths", () => {
    for (const path of [
      "../bad",
      "/absolute",
      "src//bad",
      "src/",
      "./a",
      "__proto__",
      "src/constructor",
      "a".repeat(81),
    ])
      expect(() => validateWorkspacePath(path)).toThrow();
    expect(() => addWorkspaceFile(original, "src/index.js/nested")).toThrow(
      /file and a folder/,
    );
  });
  it("enforces API file count, content and serialized byte limits", () => {
    const full = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => [`${index}.js`, ""]),
    );
    expect(() => addWorkspaceFile(full, "more.js")).toThrow(/1–12/);
    expect(() =>
      addWorkspaceFile(original, "huge.js", "x".repeat(120_001)),
    ).toThrow(/120 KB/);
    expect(() =>
      validateWorkspaceFiles({
        a: "界".repeat(100_000),
        b: "界".repeat(100_000),
      }),
    ).toThrow(/512 KB/);
  });
  it("deletes and restores without overwriting subsequent edits", () => {
    const next = removeWorkspaceFile(original, "src/index.js");
    expect(next).not.toHaveProperty("src/index.js");
    expect(
      addWorkspaceFile(next, "src/index.js", original["src/index.js"]),
    ).toEqual(original);
    expect(() =>
      addWorkspaceFile(
        { ...next, "src/index.js": "new work" },
        "src/index.js",
        "old",
      ),
    ).toThrow(/already exists/);
    expect(() => removeWorkspaceFile({ "only.js": "" }, "only.js")).toThrow(
      /1–12/,
    );
  });
  it("handles inherited object member names as ordinary owned file paths", () => {
    const moved = moveWorkspacePath(
      { toString: "keep", "a.js": "move" },
      "a.js",
      "b.js",
    );
    expect(moved.files.toString).toBe("keep");
    expect(moved.files["b.js"]).toBe("move");
  });
});
