import assert from "node:assert/strict";
import test from "node:test";
import {
  RemoteSandboxRunner,
  TypeScriptRunner,
  detectRunnerLanguage,
  runnerFor,
} from "../src/services/codeRunner.ts";

test("runner language detection follows the workspace files", () => {
  assert.equal(
    detectRunnerLanguage(
      { "main.py": "", "src/exercise.ts": "" },
      "src/exercise.ts",
    ),
    "typescript",
  );
  assert.equal(
    detectRunnerLanguage({ "src/index.js": "" }, "src/index.js"),
    "javascript",
  );
  assert.equal(detectRunnerLanguage({ "main.py": "" }, "main.py"), "python");
  assert.equal(
    detectRunnerLanguage({ "src/app.ts": "" }, "src/app.ts"),
    "typescript",
  );
  assert.equal(
    detectRunnerLanguage(
      { "package.json": "{}", "src/index.js": "" },
      "src/index.js",
    ),
    "node",
  );
});

test("unsupported backend languages use an honest remote-sandbox boundary", async () => {
  assert.ok(runnerFor("typescript") instanceof TypeScriptRunner);
  for (const language of ["python", "node"]) {
    const runner = runnerFor(language);
    assert.ok(runner instanceof RemoteSandboxRunner);
    const result = await runner.run({
      language,
      entryPath: language === "python" ? "main.py" : "src/index.ts",
      files: {},
    });
    assert.match(result.error ?? "", /not configured/);
    assert.match(result.error ?? "", /will not pretend/);
    assert.equal(result.executionMs, 0);
  }
});
