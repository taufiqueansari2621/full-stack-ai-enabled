import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { parseRunnerMessage } from "../src/services/codeRunner.ts";
const runner = readFileSync(
  new URL("../public/runner-worker.js", import.meta.url),
  "utf8",
);
// Only authored test fixtures run in this Node VM, never production learner code.
function run(code) {
  let message;
  const self = {
    postMessage: (value) => {
      message = value;
    },
  };
  runInNewContext(
    `${runner}\nself.onmessage({data: {code: fixture}});`,
    {
      self,
      fixture: code,
      performance,
      console: { log() {} },
    },
    { timeout: 500 },
  );
  return parseRunnerMessage(message);
}
test("real public cases carry expected/actual feedback and derived pass counts", () => {
  const result = run(
    "function sum(values) { return values.reduce((total, value) => total + value, 0); }",
  );
  assert.equal(result.passed, 3);
  assert.equal(result.failed, 0);
  assert.deepEqual(
    result.tests.map((test) => test.actual),
    ["9", "2", "0"],
  );
  assert.ok(result.tests.every((test) => test.status === "passed"));
});
test("wrong cases report their actual values without hiding passing cases", () => {
  const result = run("function sum() { return 9; }");
  assert.equal(result.passed, 1);
  assert.equal(result.failed, 2);
  assert.equal(result.tests[1].expected, "2");
  assert.equal(result.tests[1].actual, "9");
});
test("missing function and thrown cases produce individual bounded diagnostics", () => {
  const missing = run("const value = 9;");
  assert.equal(missing.failed, 3);
  assert.match(missing.tests[0].detail, /Define a function named sum/);
  const thrown = run("function sum() { throw new Error('x'.repeat(10000)); }");
  assert.equal(thrown.failed, 3);
  assert.equal(thrown.tests[0].detail.length, 2000);
});
test("syntax errors mark every case not run rather than successful or failed", () => {
  const result = run("function sum( { ");
  assert.match(result.error, /SyntaxError/);
  assert.equal(result.failed, 0);
  assert.equal(result.passed, 0);
  assert.ok(result.tests.every((test) => test.status === "not-run"));
});
test("untrusted malformed and oversized worker messages never enter UI state", () => {
  for (const value of [
    null,
    {},
    { logs: Array(81).fill("x"), results: [], error: null, executionMs: 1 },
    { logs: [], results: [], error: "x".repeat(2001), executionMs: 1 },
    { logs: [], results: [], error: null, executionMs: NaN },
    { logs: [], results: [{ passed: true }], error: null, executionMs: 1 },
  ]) {
    const result = parseRunnerMessage(value);
    assert.match(result.error, /invalid or oversized/);
    assert.equal(result.passed, 0);
  }
});
test("large actual values are bounded and string results are not mistaken for numeric equality", () => {
  const large = run("function sum() { return 'x'.repeat(10000); }");
  assert.equal(large.tests[0].actual.length, 2000);
  const typed = run("function sum() { return '9'; }");
  assert.equal(typed.failed, 3);
  assert.equal(typed.passed, 0);
});
